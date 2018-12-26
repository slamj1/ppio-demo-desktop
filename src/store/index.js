import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import storage from 'localforage'

import userStore from './user'
import fileListStore from './fileList'
import TaskStore from './tasks/TaskStore'
import statePersistence from './plugins/persistence'
import taskSync from './plugins/taskSync'
import {
  ACT_CLEAR_DATA,
  MUT_CLEAR_DATA,
  MUT_CLEAR_TASK_DATA,
  MUT_CLEAR_USER_DATA,
  MUT_CLEAR_FILE_DATA,
  MUT_SET_DATA_DIR,
  MUT_SET_RPC_PORT,
  MUT_SET_USER_ADDRESS,
  MUT_SET_CHI_PRICE,
  ACT_START_POLLING_CHI_PRICE,
  MUT_SET_PRIV_KEY,
  ACT_SYNC_POSS_TASKS,
  UL_TASK,
  DL_TASK,
} from '../constants/store'
import {
  APP_MODE_COINPOOL,
  APP_MODE_NON_COINPOOL,
  USER_STATE_PERSIST_KEY,
} from '../constants/constants'
import { getChiPrice } from '../services/user'
import { listTasks } from '../services/task'
import {
  TASK_STATUS_SUCC,
  TASK_STATUS_PAUSED,
  TASK_STATUS_RUNNING,
  TASK_STATUS_FAIL,
} from '../constants/task'

Vue.config.devtools = true
Vue.use(Vuex)

const logger = createLogger({
  collapsed: false,
  transformer(state) {
    return state
  },
  mutationTransformer(mutation) {
    return mutation
  },
  logger: console,
})

const initialState = () => ({
  address: '',
  curPage: '',
  appVersion: '1.0',
  dataDir: '', // directory to store objects
  privateKey: '', // account private key
  rpcPort: 0,
  phrase: '',
  recChiPrice: { storage: 100, download: 100 },
})

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [statePersistence, taskSync, logger],
  state: initialState,
  modules: {
    user: userStore,
    file: fileListStore,
    uploadTask: new TaskStore('upload'),
    downloadTask: new TaskStore('download'),
  },
  getters: {
    appMode: state =>
      state.user.cpoolData.cpoolId.length > 0 ? APP_MODE_COINPOOL : APP_MODE_NON_COINPOOL,
  },
  mutations: {
    [MUT_CLEAR_DATA](state) {
      console.log('clearing app data')
      const initState = initialState()
      Object.keys(initState).forEach(key => {
        state[key] = initState[key]
      })
    },
    [MUT_SET_DATA_DIR](state, dataDir) {
      state.dataDir = dataDir
    },
    [MUT_SET_PRIV_KEY](state, privateKey) {
      state.privateKey = privateKey
    },
    [MUT_SET_RPC_PORT](state, port) {
      state.rpcPort = port
    },
    [MUT_SET_USER_ADDRESS](state, address) {
      // used for local storage key
      state.address = address
    },
    [MUT_SET_CHI_PRICE](state, chiPrice) {
      console.log('setting chi price')
      console.log(chiPrice)
      console.log(state.recChiPrice)
      state.recChiPrice.storage = chiPrice.storage
      state.recChiPrice.download = chiPrice.download
    },
  },
  actions: {
    [ACT_CLEAR_DATA](context) {
      storage
        .setItem(`${USER_STATE_PERSIST_KEY}_${context.state.address}`, context.state)
        .then(() => {
          context.commit(MUT_CLEAR_DATA)
          context.commit(MUT_CLEAR_USER_DATA)
          context.commit(MUT_CLEAR_FILE_DATA)
          context.commit(MUT_CLEAR_TASK_DATA)
          return true
        })
        .catch(err => {
          console.error(err)
          return Promise.reject(err)
        })
    },
    [ACT_START_POLLING_CHI_PRICE]({ commit }) {
      console.log('start polling chi price')
      const chiPricePolling = () => {
        console.log('refreshing chi price')
        getChiPrice()
          .then(prices => {
            console.log('current chi price: ')
            console.log(prices)
            commit(MUT_SET_CHI_PRICE, prices)
            setTimeout(chiPricePolling, 1000 * 30)
            return prices
          })
          .catch(err => {
            console.log('get chi price failed')
            console.error(err)
            setTimeout(chiPricePolling, 1000 * 30)
          })
      }
      chiPricePolling()
    },
    [ACT_SYNC_POSS_TASKS]({ state, commit }) {
      console.log('syncing task list from poss')
      return listTasks().then(res => {
        console.log(res)
        res.map(task => {
          let taskQueue, finishedQueue
          let matchedLocalTask = null
          let matchedLocalTaskIdx = -1
          if (task.type === 'Put') {
            taskQueue = state.uploadTask.taskQueue
            finishedQueue = state.uploadTask.finishedQueue
          }
          if (task.type === 'Get') {
            taskQueue = state.downloadTask.taskQueue
            finishedQueue = state.downloadTask.finishedQueue
          }
          for (let i = 0; i < taskQueue.length; i++) {
            if (taskQueue[i].id === task.id) {
              matchedLocalTaskIdx = i
              matchedLocalTask = taskQueue[i]
            }
          }
          if (!matchedLocalTask) {
            for (let i = 0; i < finishedQueue.length; i++) {
              if (finishedQueue[i].id === task.id) {
                matchedLocalTaskIdx = i
                matchedLocalTask = finishedQueue[i]
              }
            }
          }
          if (matchedLocalTaskIdx > -1) {
            console.log('syncing single task from poss ')
            console.log(task)
            console.log(matchedLocalTask)
            let STORE_KEY
            if (task.type === 'Put') {
              STORE_KEY = UL_TASK
            } else if (task.type === 'Get') {
              STORE_KEY = DL_TASK
            }
            if (!matchedLocalTask.finished) {
              commit(STORE_KEY.MUT_SET_PROGRESS, {
                idx: matchedLocalTaskIdx,
                transferredData: task.finished,
                wholeDataLength: task.total,
              })
            }
            if (
              (task.state === 'Running' || task.state === 'Pending') &&
              matchedLocalTask.status !== TASK_STATUS_RUNNING
            ) {
              commit(STORE_KEY.MUT_RESUME_TASK, matchedLocalTaskIdx)
            } else if (
              task.state === 'Paused' &&
              matchedLocalTask.status !== TASK_STATUS_PAUSED
            ) {
              commit(STORE_KEY.MUT_PAUSE_TASK, matchedLocalTaskIdx)
            } else if (
              task.state === 'Finished' &&
              matchedLocalTask.status !== TASK_STATUS_SUCC
            ) {
              commit(STORE_KEY.MUT_FINISH_TASK, matchedLocalTaskIdx)
            } else if (
              task.state === 'Error' &&
              matchedLocalTask.status !== TASK_STATUS_FAIL
            ) {
              console.log('got error task')
              commit(STORE_KEY.MUT_FAIL_TASK, matchedLocalTaskIdx)
            }
          }
        })
        return res
      })
    },
  },
})
