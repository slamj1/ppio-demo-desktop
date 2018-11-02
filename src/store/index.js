import Vue from 'vue'
import Vuex from 'vuex'

import userStore from './user'
import fileListStore from './fileList'
// import uploadTaskStore from './tasks/upload'
// import downloadTaskStore from './tasks/download'
import TaskStore from './tasks/TaskStore'

Vue.config.devtools = true
Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    curPage: '',
    appVersion: '1.0',
  },
  modules: {
    user: userStore,
    file: fileListStore,
    uploadTask: new TaskStore('upload'),
    downloadTask: new TaskStore('download'),
  },
})
