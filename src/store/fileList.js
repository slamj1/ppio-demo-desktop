import filesize from 'filesize'
import {
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  MUT_RENAME_FILE,
  MUT_SECURE_FILE,
  MUT_SHARE_FILE,
  MUT_GET_FILE,
  ACT_GET_FILE_LIST,
  ACT_REFRESH_FILE_LIST,
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
    [MUT_SET_FILE_LIST](state, fileList) {
      state.fileList = fileList
      const usage = fileList.reduce((acc, cur) => acc + cur.size, 0)
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
      console.log('adding gotten file')
      state.fileList.unshift(new File(payload))
    },
  },
  actions: {
    [ACT_GET_FILE_LIST](context) {
      return getFileList().then(
        res => {
          const fileList = res.map(item => {
            let metadataFile, filename, isSecure
            // TODO: Unstable. Sometimes cannot get filename
            if ((metadataFile = context.rootState.user.metadata.fileList[item.id])) {
              filename = metadataFile.filename
              isSecure = metadataFile.isSecure
            } else {
              filename = item.id
              isSecure = item.isSecure // false
            }
            const fileInfo = {
              id: item.id,
              filename,
              size: item.size,
              type: item.type || 'file',
              isSecure,
              isPublic: item.isPublic,
            }
            return new File(fileInfo)
          })
          console.log(fileList)
          return context.commit(MUT_SET_FILE_LIST, fileList)
        },
        err => {
          console.log('set file list error')
          console.log(err)
        },
      )
    },
    /**
     * refresh file list when metadata changes
     * @param context
     */
    [ACT_REFRESH_FILE_LIST](context) {
      console.log('refreshing file list')
      const metaData = context.rootState.user.metadata
      const newList = context.state.fileList.map(file => {
        const newFileInfo = metaData.fileList[file.id]
        console.log(newFileInfo)
        if (newFileInfo) {
          return Object.assign({}, file, {
            filename: newFileInfo.filename,
            isSecure: newFileInfo.isSecure,
          })
        }
        return file
      })
      return context.commit(MUT_SET_FILE_LIST, newList)
    },
    [ACT_GET_FILE](context, fileInfo) {
      console.log('get file', fileInfo)
      return getFile(fileInfo).then(
        data => {
          console.log('commit', data)
          context.commit(MUT_GET_FILE, fileInfo)
          return 1
        },
        err => {
          console.error(err)
          if (err.error.code === -1) {
            return Promise.reject(err.error.message)
          } else {
            return Promise.reject(new Error('Unknown Error'))
          }
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
