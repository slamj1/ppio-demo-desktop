import Task from './Task'
import {
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  DL_TASK,
  UL_TASK,
} from '../../constants/store'
import {
  startUpload,
  cancelUpload,
  getProgress as getUploadProgress,
} from '../../services/upload'
import {
  startDownload,
  cancelDownload,
  getProgress as getDownloadProgress,
} from '../../services/download'
import File from '../File'

export default class TaskStore {
  constructor(storeType) {
    // maintain the task queue
    this.state = {
      taskQueue: [],
    }

    // assign keys and sdk methods by store type
    let STORE_KEYS, taskType, startTask, cancelTask, getTaskProgress
    if (storeType === 'upload') {
      STORE_KEYS = UL_TASK
      taskType = TASK_TYPE_UPLOAD
      startTask = startUpload
      cancelTask = cancelUpload
      getTaskProgress = getUploadProgress
    }
    if (storeType === 'download') {
      STORE_KEYS = DL_TASK
      taskType = TASK_TYPE_DOWNLOAD
      startTask = startDownload
      cancelTask = cancelDownload
      getTaskProgress = getDownloadProgress
    }

    // mutation methods
    const m_addTask = (state, data) => {
      state.taskQueue.unshift(
        new Task({
          type: taskType,
          id: data.taskId,
          file: data.file,
        }).start(),
      )
    }

    const m_removeTask = (state, index) => {
      console.log('removing task ', index)
      state.taskQueue[index].cancel()
      state.taskQueue.splice(index, 1)
    }

    const m_setTaskStatus = (state, statusArr) => {
      console.log(statusArr)
      statusArr.map((status, idx) => {
        if (status && state.taskQueue[idx]) {
          state.taskQueue[idx].setStatus(status)
        }
      })
    }

    // action methods
    const a_createTask = (context, fileHash) => {
      console.log('create task')
      return startTask(fileHash)
        .then(res => {
          console.log('task started')
          return context.commit(STORE_KEYS.MUT_ADD_TASK, {
            taskId: res.taskId,
            file: new File(res.file),
          })
        })
        .catch(err => {
          console.log(err)
          return Promise.reject(new Error(err))
        })
    }

    const a_cancelTask = (context, idx) =>
      cancelTask(context.state.taskQueue[idx].id).then(() => {
        console.log('res ', idx)
        return context.commit(STORE_KEYS.MUT_REMOVE_TASK, idx)
      })

    const a_getTaskStatus = (context, taskIds) =>
      Promise.all(
        taskIds.map(async taskId => {
          try {
            const progressRes = await getTaskProgress(taskId)
            console.log(progressRes)
            return progressRes
          } catch (err) {
            console.error(err)
            return Promise.resolve()
          }
        }),
      ).then(statusArr => context.commit(STORE_KEYS.MUT_SET_STATUS, statusArr))

    // define store data
    const getters = {
      [STORE_KEYS.GET_TASK_COUNT]: state => state.taskQueue.length,
    }
    const mutations = {
      [STORE_KEYS.MUT_ADD_TASK]: m_addTask,
      [STORE_KEYS.MUT_REMOVE_TASK]: m_removeTask,
      [STORE_KEYS.MUT_SET_STATUS]: m_setTaskStatus,
    }
    const actions = {
      [STORE_KEYS.ACT_CREATE_TASK]: a_createTask,
      [STORE_KEYS.ACT_CANCEL_TASK]: a_cancelTask,
      [STORE_KEYS.ACT_GET_STATUS]: a_getTaskStatus,
    }

    this.getters = getters
    this.mutations = mutations
    this.actions = actions
  }
}
