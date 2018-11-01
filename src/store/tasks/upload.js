import Task from './Task'
import File from '../File'
import {
  TASK_TYPE_UPLOAD,
  MUT_ADD_UL_TASK,
  ACT_CREATE_UL_TASK,
  MUT_REMOVE_UL_TASK,
  ACT_CANCEL_UL_TASK,
  MUT_SET_UL_STATUS,
  ACT_GET_UL_STATUS,
} from '../../constants/store'
import { startUpload, cancelUpload, getProgress } from '../../services/upload'

const store = {
  state: {
    uploadQueue: [],
  },
  getters: {
    uploadTaskCount: state => state.uploadQueue.length,
  },
  mutations: {
    [MUT_ADD_UL_TASK](state, data) {
      state.uploadQueue.unshift(
        new Task({
          type: TASK_TYPE_UPLOAD,
          id: data.taskId,
          file: data.file,
        }).start(),
      )
    },
    [MUT_REMOVE_UL_TASK](state, index) {
      console.log('removing task ', index)
      state.uploadQueue[index].cancel()
      state.uploadQueue.splice(index, 1)
    },
    [MUT_SET_UL_STATUS](state, statusArr) {
      console.log(statusArr)
      statusArr.map((status, idx) => {
        if (status && state.uploadQueue[idx]) {
          state.uploadQueue[idx].setStatus(status)
        }
      })
    },
  },
  actions: {
    [ACT_CREATE_UL_TASK](context, fileHash) {
      console.log('create upload')
      return startUpload(fileHash)
        .then(res => {
          console.log('upload started')
          return context.commit(MUT_ADD_UL_TASK, {
            taskId: res.taskId,
            file: new File(res.file),
          })
        })
        .catch(err => {
          console.log(err)
          return Promise.reject(new Error(err))
        })
    },
    [ACT_CANCEL_UL_TASK](context, idx) {
      return cancelUpload(context.state.uploadQueue[idx].id).then(() => {
        console.log('res ', idx)
        return context.commit(MUT_REMOVE_UL_TASK, idx)
      })
    },
    [ACT_GET_UL_STATUS](context, taskIds) {
      return Promise.all(
        taskIds.map(taskId =>
          getProgress(taskId)
            .then(res => {
              console.log(res)
              return res
            })
            .catch(err => {
              console.log(err)
              return Promise.resolve()
            }),
        ),
      ).then(statusArr => context.commit(MUT_SET_UL_STATUS, statusArr))
    },
  },
}

export default store
