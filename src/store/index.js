import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import storage from 'localforage'

import userStore from './user'
import fileListStore from './fileList'
import DownloadTaskStore from './tasks/DownloadTaskStore'
import UploadTaskStore from './tasks/UploadTaskStore'
import GetTaskStore from './tasks/GetTaskStore'
import statePersistence from './plugins/persistence'
import {
  MUT_SET_APP_MODE,
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
} from '../constants/store'
import { APP_MODE_NON_COINPOOL, USER_STATE_PERSIST_KEY } from '../constants/constants'
import { getChiPrice } from '../services/user'

Vue.config.devtools = true
Vue.use(Vuex)

const logger = createLogger({
  collapsed: false, // 自动展开记录的 mutation
  transformer(state) {
    // 在开始记录之前转换状态
    // 例如，只返回指定的子树
    return state
  },
  mutationTransformer(mutation) {
    // mutation 按照 { type, payload } 格式记录
    // 我们可以按任意方式格式化
    return mutation
  },
  logger: console, // 自定义 console 实现，默认为 `console`
})

const initialState = () => ({
  appMode: APP_MODE_NON_COINPOOL, // TODO: add app mode switch (coinpool/non-coinpool)
  curPage: '',
  appVersion: '1.0',
  dataDir: '', // directory to store objects
  rpcPort: 0,
  phrase: '',
  recChiPrice: 100,
})

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [statePersistence, logger],
  state: initialState,
  modules: {
    user: userStore,
    file: fileListStore,
    uploadTask: new UploadTaskStore(),
    downloadTask: new DownloadTaskStore(),
    getTask: new GetTaskStore(),
  },
  mutations: {
    [MUT_CLEAR_DATA](state) {
      console.log('clearing app data')
      const initState = initialState()
      Object.keys(initState).forEach(key => {
        state[key] = initState[key]
      })
    },
    [MUT_SET_APP_MODE](state, mode) {
      state.appMode = mode || APP_MODE_NON_COINPOOL
    },
    [MUT_SET_DATA_DIR](state, dataDir) {
      state.dataDir = dataDir
    },
    [MUT_SET_RPC_PORT](state, port) {
      state.rpcPort = port
    },
    [MUT_SET_USER_ADDRESS](state, address) {
      // used for local storage key
      state.address = address
    },
    [MUT_SET_CHI_PRICE](state, chiPrice) {
      state.recChiPrice = chiPrice
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
          .then(price => {
            console.log('current chi price: ', price)
            commit(MUT_SET_CHI_PRICE, price)
            setTimeout(chiPricePolling, 1000 * 30)
            return price
          })
          .catch(err => {
            console.log('get chi price failed')
            console.error(err)
            setTimeout(chiPricePolling, 1000 * 30)
          })
      }
      chiPricePolling()
    },
  },
})
