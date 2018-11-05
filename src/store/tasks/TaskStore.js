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

function setTaskStatus(task, status) {
  task.transferSpeed = status.speed
  task.transferProgress = status.progress
  if (status.finished) {
    task.transferringData = false
    task.finished = true
    task.transferProgress = 100
  }
}

function startTask(task) {
  task.transferringData = true
  task.finished = false
  task.transferProgress = 0
}

function cancelTask(task) {
  task.transferringData = false
  task.finished = false
}

export default class TaskStore {
  constructor(storeType) {
    // maintain the task queue
    this.state = {
      taskQueue: [],
    }

    // assign keys and sdk methods by store type
    let STORE_KEYS, taskType, serviceStartTask, serviceCancelTask, serviceGetTaskProgress
    if (storeType === 'upload') {
      STORE_KEYS = UL_TASK
      taskType = TASK_TYPE_UPLOAD
      serviceStartTask = startUpload
      serviceCancelTask = cancelUpload
      serviceGetTaskProgress = getUploadProgress
    }
    if (storeType === 'download') {
      STORE_KEYS = DL_TASK
      taskType = TASK_TYPE_DOWNLOAD
      serviceStartTask = startDownload
      serviceCancelTask = cancelDownload
      serviceGetTaskProgress = getDownloadProgress
    }

    // mutation methods
    const m_addTask = (state, data) => {
      const newTask = new Task({
        type: taskType,
        id: data.taskId,
        file: data.file,
      })
      startTask(newTask)
      state.taskQueue.unshift(newTask)
    }

    const m_removeTask = (state, index) => {
      console.log('removing task ', index)
      cancelTask(state.taskQueue[index])
      state.taskQueue.splice(index, 1)
    }

    const m_setTaskStatus = (state, statusArr) => {
      console.log(statusArr)
      statusArr.map((status, idx) => {
        if (status && state.taskQueue[idx]) {
          const task = state.taskQueue[idx]
          setTaskStatus(task, status)
        }
      })
    }

    // action methods
    const a_createTask = (context, fileHash) => {
      console.log('create task')
      return serviceStartTask(fileHash)
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
      serviceCancelTask(context.state.taskQueue[idx].id).then(() => {
        console.log('res ', idx)
        return context.commit(STORE_KEYS.MUT_REMOVE_TASK, idx)
      })

    const a_getTaskStatus = (context, taskIds) =>
      Promise.all(
        taskIds.map(async taskId => {
          try {
            const progressRes = await serviceGetTaskProgress(taskId)
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
