import Vue from 'vue'
import Vuex from 'vuex'

import userStore from './user'
import fileListStore from './fileList'
import TaskStore from './tasks/TaskStore'
import statePersistence from './plugins/persistence'
import { MUT_SET_APP_MODE } from '../constants/store'
import { APP_MODE_NON_COINPOOL } from '../constants/constants'

Vue.config.devtools = true
Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [statePersistence],
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
  },
})
