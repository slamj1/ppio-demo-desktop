import {
  MUT_SET_FILE_LIST,
  MUT_REMOVE_FILE,
  ACT_GET_FILE_LIST,
  ACT_REFRESH_FILE_LIST,
  ACT_REMOVE_FILE,
  ACT_RENAME_FILE,
  USAGE_STORAGE_GETTER,
  MUT_CLEAR_FILE_DATA,
  MUT_REPLACE_STATE_HOOK,
} from '../constants/store'
import { deleteFile, getObjectList, renameFile } from '../services/file'
import { HomeListFile } from './PPFile'

const initialState = () => ({
  fileList: [],
})

const store = {
  state: initialState,
  getters: {
    [USAGE_STORAGE_GETTER]: state => {
      return state.fileList.reduce((acc, cur) => acc + cur.size, 0)
    },
  },
  mutations: {
    [MUT_REPLACE_STATE_HOOK]: state => {
      console.log('replace state hook fired for file list')
      const fileConverter = file => new HomeListFile(file)
      state.fileList = state.fileList.map(fileConverter)
    },
    [MUT_SET_FILE_LIST](state, fileList) {
      state.fileList = fileList.map(file => new HomeListFile(file))
    },
    [MUT_REMOVE_FILE](state, idx) {
      state.fileList.splice(idx, 1)
    },
    // [MUT_RENAME_FILE](state, payload) {
    //   state.fileList[payload.idx].filename = payload.name
    // },
    [MUT_CLEAR_FILE_DATA](state) {
      const initState = initialState()
      Object.keys(initState).forEach(key => {
        state[key] = initState[key]
      })
    },
  },
  actions: {
    /**
     * get file list: listObject -> objectStatus -> headObject
     * @param context
     * @commits Array<File>
     */
    [ACT_GET_FILE_LIST](context) {
      return getObjectList()
        .then(fileList => {
          console.log(fileList)
          return context.commit(MUT_SET_FILE_LIST, fileList)
        })
        .catch(err => {
          console.log('set file list error')
          console.log(err)
          return Promise.reject(err)
        })
    },
    /**
     * Refresh file names from metadata. Triggered after getting index data.
     * @param context
     */
    [ACT_REFRESH_FILE_LIST](context) {
      console.log('refreshing file list')
      const indexData = context.rootState.user.metadata
      const newList = context.state.fileList.map(file => {
        const newFileInfo = indexData.fileListData[file.key]
        console.log(newFileInfo)
        if (newFileInfo && newFileInfo.metadata && newFileInfo.metadata.filename) {
          file.filename = newFileInfo.metadata.filename
          console.log('new file name: ', file.filename)
        }
        return file
      })
      return context.commit(MUT_SET_FILE_LIST, newList)
    },
    /**
     * delete file
     * @param context
     * @param payload
     * @param payload.file {PPFile} file to be deleted
     * @param payload.fileIndex {Number} file index
     * @returns {PromiseLike<T | never> | Promise<T | never>}
     */
    [ACT_REMOVE_FILE](context, payload) {
      return deleteFile(payload.file.key).then(
        () => context.commit(MUT_REMOVE_FILE, payload.fileIndex),
        err => {
          console.error(err)
          return Promise.reject(err)
        },
      )
    },
    /**
     * rename file
     * @param context
     * @param payload
     * @returns {*|void|Promise<any>}
     */
    [ACT_RENAME_FILE](context, payload) {
      console.log('renaming file ', payload.filename)
      return renameFile(payload.oriKey, payload.newKey)
        .then(() => {
          console.log('renaming file success')
          return true
        })
        .catch(err => {
          console.error('renaming file failed')
          console.error(err)
          throw err
        })
    },
  },
}

export default store
