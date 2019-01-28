import Vue from 'vue'
import {
  MUT_SET_FILE_LIST,
  MUT_MODIFY_FILE,
  MUT_REMOVE_FILE,
  ACT_GET_FILE_LIST,
  ACT_GET_FILE_LIST_DETAILS,
  ACT_REFRESH_FILE_LIST,
  ACT_REMOVE_FILE,
  ACT_RENAME_FILE,
  USAGE_STORAGE_GETTER,
  MUT_CLEAR_FILE_DATA,
  MUT_REPLACE_STATE_HOOK,
  UL_TASK,
} from '../constants/store'
import { getObjectList, getObjectStatus } from '../services/file'
import { HomeListFile } from './PPFile'

const initialState = () => ({
  fileList: [],
})

const store = {
  state: initialState,
  getters: {
    [USAGE_STORAGE_GETTER]: state =>
      state.fileList.reduce((acc, cur) => acc + cur.size, 0),
  },
  mutations: {
    [MUT_REPLACE_STATE_HOOK]: state => {
      console.log('replace state hook fired for file list')
      const fileConverter = file => new HomeListFile(file)
      state.fileList = state.fileList.map(fileConverter)
    },
    [MUT_SET_FILE_LIST](state, fileList) {
      console.log('setting file list to store')
      console.log(fileList)
      state.fileList = fileList.map(file => new HomeListFile(file))
    },
    [MUT_MODIFY_FILE](state, payload) {
      console.log('modifying file ', payload.idx)
      console.log(payload.file)
      const newFile = new HomeListFile(payload.file)
      console.log(newFile)
      Vue.set(state.fileList, payload.idx, newFile)
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
          console.log('get file list done')
          console.log(fileList)
          context.commit(MUT_SET_FILE_LIST, fileList)
          context.dispatch(ACT_GET_FILE_LIST_DETAILS)
          return fileList
        })
        .catch(err => {
          console.log('set file list error')
          console.log(err)
          return Promise.reject(err)
        })
    },
    [ACT_GET_FILE_LIST_DETAILS](context) {
      console.log('getting object details')
      const getDetailsReqArr = context.state.fileList.map((file, idx) =>
        getObjectStatus(file.key)
          .then(res => {
            const newFile = Object.assign({}, file, { expireTime: res.expireTime })
            return context.commit(MUT_MODIFY_FILE, { idx, file: newFile })
          })
          .catch(err => {
            console.log('get object details error')
            console.error(err)
            return Promise.resolve(file)
          }),
      )
      // return Promise.all(getDetailsReqArr).then(detailedFileList => {
      //   console.log(detailedFileList)
      //   return context.commit(MUT_SET_FILE_LIST, detailedFileList)
      // })
      return Promise.all(getDetailsReqArr)
    },
    /**
     * @deprecated Renaming a file has been deprecated for IndexData cannot be synced automatically
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
      context.commit(MUT_REMOVE_FILE, payload.fileIndex)
      const uploadTasks = context.rootState.uploadTask.taskQueue
      const tasksToCancel = []
      uploadTasks.forEach((task, index) => {
        if (task.file.key === payload.file.key) {
          tasksToCancel.push(index)
        }
      })
      const cancelQueue = tasksToCancel.map(taskIdx =>
        context
          .dispatch(UL_TASK.ACT_CANCEL_TASK, taskIdx)
          .then(() => ({ idx: taskIdx, canceled: true }))
          .catch(err => {
            console.error(
              `cancel task from deleting ${payload.file.key} failed for ${taskIdx}`,
            )
            console.error(err)
            return Promise.resolve({ idx: taskIdx, canceled: false })
          }),
      )
      return Promise.all(cancelQueue).then(resArr => {
        console.log(`all upload tasks of ${payload.file.key} canceled`)
        return resArr
      })
    },
    /**
     * @deprecated
     * rename file
     * @param context
     * @param payload
     * @returns {*|void|Promise<any>}
     */
    [ACT_RENAME_FILE](context, payload) {
      console.log('renaming file not supported')
    },
  },
}

export default store
