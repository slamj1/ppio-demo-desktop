import Vue from 'vue'
import Vuex from 'vuex'

import userStore from './user'
import fileListStore from './fileList'
import getTaskStore from './tasks/get'
import renewTaskStore from './tasks/renew'
import shareTaskStore from './tasks/share'
import uploadTaskStore from './tasks/upload'
import downloadTaskStore from './tasks/download'

Vue.config.devtools = true
Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    curPage: '',
  },
  modules: {
    user: userStore,
    file: fileListStore,
    getTask: getTaskStore,
    renewTask: renewTaskStore,
    shareTask: shareTaskStore,
    uploadTask: uploadTaskStore,
    downloadTask: downloadTaskStore,
  },
})
