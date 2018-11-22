import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import userStore from './user'
import fileListStore from './fileList'
import TaskStore from './tasks/TaskStore'
import statePersistence from './plugins/persistence'
import { MUT_SET_APP_MODE } from '../constants/store'
import { APP_MODE_NON_COINPOOL } from '../constants/constants'

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

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [statePersistence, logger],
  state: {
    appMode: APP_MODE_NON_COINPOOL, // TODO: add app mode switch (coinpool/non-coinpool)
    curPage: '',
    appVersion: '1.0',
  },
  mutations: {
    [MUT_SET_APP_MODE](state, mode) {
      state.appMode = mode
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
