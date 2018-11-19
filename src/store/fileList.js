import filesize from 'filesize'
import {
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  MUT_RENAME_FILE,
  MUT_SECURE_FILE,
  MUT_SHARE_FILE,
  MUT_GET_FILE,
  ACT_GET_FILE_LIST,
  ACT_REMOVE_FILE,
  ACT_RENAME_FILE,
  // ACT_SECURE_FILE,
  // ACT_SHARE_FILE,
  ACT_GET_FILE,
  USAGE_PERCENT_GETTER,
  USAGE_STORAGE_GETTER,
} from '../constants/store'
import { APP_MODE_COINPOOL } from '../constants/constants'
import getFileList from '../services/getFileList'
import { getFile, deleteFile, renameFile } from '../services/file'
import File from './File'

const store = {
  state: {
    fileList: [],
    usedStorage: 0,
    capacity: 0,
  },
  getters: {
    [USAGE_PERCENT_GETTER]: (state, getters, rootState) => {
      if (rootState.appMode === APP_MODE_COINPOOL) {
        return (state.usedStorage / state.capacity) * 100
      }
      return 0
    },
    [USAGE_STORAGE_GETTER]: state => filesize(state.usedStorage),
  },
  mutations: {
    [MUT_SET_FILE_LIST](state, list) {
      state.fileList = list.map(item => new File(item))
      const usage = list.reduce((acc, cur) => acc + cur.size, 0)
      console.log(usage)
      state.usedStorage = usage
    },
    [MUT_REMOVE_FILE](state, idx) {
      state.fileList.splice(idx, 1)
    },
    [MUT_RENAME_FILE](state, payload) {
      state.fileList[payload.idx].filename = payload.name
    },
    [MUT_SECURE_FILE](state, payload) {
      state.fileList[payload.idx].isSecure = payload.secure
    },
    [MUT_SHARE_FILE](state, payload) {
      state.fileList[payload.idx].isPublic = payload.toshare
    },
    [MUT_GET_FILE](state, payload) {
      state.fileList.push(new File(payload))
    },
  },
  actions: {
    [ACT_GET_FILE_LIST](context) {
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
    [ACT_REMOVE_FILE](context, payload) {
      return deleteFile(payload.file.id).then(
        () => {
          context.commit(MUT_REMOVE_FILE, payload.fileIndex)
          return true
        },
        err => console.error(err),
      )
    },
    [ACT_RENAME_FILE](context, payload) {
      return renameFile(payload.file.id, payload.filename).then(
        () => {
          context.commit(MUT_RENAME_FILE, {
            idx: payload.fileindex,
            name: payload.filename,
          })
          return true
        },
        err => console.error(err),
      )
    },
  },
}

export default store
