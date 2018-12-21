import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import storage from 'localforage'

import userStore from './user'
import fileListStore from './fileList'
import TaskStore from './tasks/TaskStore'
import statePersistence from './plugins/persistence'
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
} from '../constants/store'
import {
  APP_MODE_COINPOOL,
  APP_MODE_NON_COINPOOL,
  USER_STATE_PERSIST_KEY,
} from '../constants/constants'
import { getChiPrice } from '../services/user'

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
  plugins: [statePersistence, logger],
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
  },
})
