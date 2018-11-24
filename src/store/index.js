import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import storage from 'localforage'

import userStore from './user'
import fileListStore from './fileList'
import TaskStore from './tasks/TaskStore'
import statePersistence from './plugins/persistence'
import {
  MUT_SET_APP_MODE,
  ACT_CLEAR_DATA,
  MUT_CLEAR_DATA,
  MUT_CLEAR_TASK_DATA,
  MUT_CLEAR_USER_DATA,
  MUT_CLEAR_FILE_DATA,
  MUT_SET_DATA_DIR,
} from '../constants/store'
import { APP_MODE_NON_COINPOOL, USER_STATE_PERSIST_KEY } from '../constants/constants'

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
})

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [statePersistence, logger],
  state: initialState,
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
    [MUT_SET_DATA_DIR](state, dir) {
      state.dataDir = dir || ''
    },
  },
  actions: {
    [ACT_CLEAR_DATA](context) {
      storage
        .setItem(`${USER_STATE_PERSIST_KEY}_${context.state.user.uid}`, context.state)
        .then(() => {
          context.commit(MUT_CLEAR_DATA)
          context.commit(MUT_CLEAR_USER_DATA)
          context.commit(MUT_CLEAR_FILE_DATA)
          context.commit(MUT_CLEAR_TASK_DATA)
          return true
        })
        .catch(err => {
          console.error(err)
        })
    },
  },
  modules: {
    user: userStore,
    file: fileListStore,
    uploadTask: new TaskStore('upload'),
    downloadTask: new TaskStore('download'),
    getTask: new TaskStore('get'),
  },
})
