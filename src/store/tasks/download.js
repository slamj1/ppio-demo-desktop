import Task from './Task'
import File from '../File'
import {
  TASK_TYPE_DOWNLOAD,
  MUT_REMOVE_DL_TASK,
  MUT_ADD_DL_TASK,
  ACT_CREATE_DL_TASK,
  ACT_CANCEL_DL_TASK,
  MUT_SET_DL_STATUS,
  ACT_GET_DL_STATUS,
} from '@/constants/store'
import { startDownload, cancelDownload, getProgress } from '@/services/download'

const store = {
  state: {
    downloadQueue: [],
  },
  getters: {
    taskCount: state => state.downloadQueue.length,
  },
  mutations: {
    [MUT_ADD_DL_TASK](state, data) {
      state.downloadQueue.unshift(
        new Task({
          type: TASK_TYPE_DOWNLOAD,
          id: data.taskId,
          file: data.file,
        }).start(),
      )
    },
    [MUT_REMOVE_DL_TASK](state, index) {
      state.downloadQueue.splice(index, 1)
    },
    [MUT_SET_DL_STATUS](state, status) {
      console.log(status)
      state.downloadQueue[status.idx].setStatus(status.status)
    },
  },
  actions: {
    [ACT_CREATE_DL_TASK](context, fileHash) {
      console.log('create download')
      return startDownload(fileHash)
        .then(res => {
          console.log('download started')
          return context.commit(MUT_ADD_DL_TASK, {
            taskId: res.taskId,
            file: new File(res.file),
          })
        })
        .catch(err => {
          console.log(err)
          return Promise.reject(new Error(err))
        })
    },
    [ACT_CANCEL_DL_TASK](context, taskId) {
      return cancelDownload(taskId).then(() => context.commit(MUT_ADD_DL_TASK))
    },
    [ACT_GET_DL_STATUS](context, taskIds) {
      return Promise.all(
        taskIds.map((taskId, idx) =>
          getProgress(taskId)
            .then(res => {
              console.log(res)
              return context.commit(MUT_SET_DL_STATUS, { idx, status: res })
            })
            .catch(err => {
              console.log(err)
              return Promise.resolve()
            }),
        ),
      )
    },
  },
}

export default store
