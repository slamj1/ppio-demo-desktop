import Vue from 'vue'
import Vuex from 'vuex'

import {
  ACT_SET_FILE_LIST,
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  MUT_RENAME_FILE,
  MUT_SECURE_FILE,
  MUT_SHARE_FILE,
} from '@/constants/store'
import userStore from './user'
import getTaskStore from './tasks/get'
import renewTaskStore from './tasks/renew'
import shareTaskStore from './tasks/share'
import uploadTaskStore from './tasks/upload'
import downloadTaskStore from './tasks/download'
import getFileList from '@/services/getFileList'

Vue.use(Vuex)

class File {
  id = ''
  filename = ''
  size = 0
  type = 0
  isSecure = false
  isPublic = false

  constructor(fileData) {
    this.id = fileData.id
    this.filename = fileData.filename
    this.size = fileData.size
    this.type = fileData.type
    this.isSecure = fileData.isSecure
    this.isPublic = fileData.isPublic
  }

  rename(newname) {
    this.filename = newname
  }
  setSecure(isSecure) {
    this.isSecure = isSecure
  }
  setPublic(isPublic) {
    this.isPublic = isPublic
  }
}

export default new Vuex.Store({
  state: {
    curPage: '',
    fileList: {},
  },
  modules: {
    user: userStore,
    getTask: getTaskStore,
    renewTask: renewTaskStore,
    shareTask: shareTaskStore,
    uploadTask: uploadTaskStore,
    downloadTask: downloadTaskStore,
  },
  mutations: {
    [MUT_SET_FILE_LIST](state, list) {
      list.map(item => {
        state.fileList[item.id] = new File(item)
      })
    },
    [MUT_REMOVE_FILE](state, id) {
      delete state.fileList[id]
    },
    [MUT_RENAME_FILE](state, payload) {
      state.fileList[payload.fileId].rename(payload.name)
    },
    [MUT_SECURE_FILE](state, payload) {
      state.fileList[payload.fileId].setSecure(payload.secure)
    },
    [MUT_SHARE_FILE](state, payload) {
      state.fileList[payload.fileId].setPublic(payload.toshare)
    },
  },
  actions: {
    [ACT_SET_FILE_LIST](context) {
      return getFileList().then(
        res => context.commit(MUT_SET_FILE_LIST, res),
        err => {
          console.log('set file list error')
          console.log(err)
        },
      )
    },
  },
})
