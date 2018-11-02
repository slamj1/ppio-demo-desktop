import Vue from 'vue'

import {
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  MUT_RENAME_FILE,
  MUT_SECURE_FILE,
  MUT_SHARE_FILE,
  MUT_GET_FILE,
  ACT_SET_FILE_LIST,
  // ACT_REMOVE_FILE,
  // ACT_RENAME_FILE,
  // ACT_SECURE_FILE,
  // ACT_SHARE_FILE,
  ACT_GET_FILE,
} from '../constants/store'
import getFileList from '../services/getFileList'
import { getFile } from '@/services/file'
import File from './File'

const store = {
  state: {
    fileList: {},
  },
  mutations: {
    [MUT_SET_FILE_LIST](state, list) {
      state.fileList = {}
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
    [MUT_GET_FILE](state, payload) {
      Vue.set(state.fileList, payload.id, new File(payload))
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
    [ACT_GET_FILE](context, file) {
      return getFile(file.id).then(
        () => {
          context.commit(MUT_GET_FILE, file)
          return true
        },
        err => {
          console.error(err)
          return err
        },
      )
    },
  },
}

export default store
