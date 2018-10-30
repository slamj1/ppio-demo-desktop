import Vue from 'vue'

import {
  ACT_SET_FILE_LIST,
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  MUT_RENAME_FILE,
  MUT_SECURE_FILE,
  MUT_SHARE_FILE,
} from '@/constants/store'
import getFileList from '@/services/getFileList'

const store = {
  state: {
    fileList: {},
  },
  mutations: {
    [MUT_SET_FILE_LIST](state, list) {
      list.map(item => {
        Vue.set(state.fileList, item.id, new File(item))
      })
    },
    [MUT_REMOVE_FILE](state, id) {
      Vue.delete(state.fileList, id)
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
}

export default store
