import Task from './Task'
import {
  ACT_METADATA_ADD_FILE,
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
  if (status.finished) {
    task.transferringData = false
    task.finished = true
    task.transferProgress = 100
  } else if (status.transferEnded) {
    task.transferringData = false
    task.transferProgress = 100
    task.copying = true
  } else {
    task.transferSpeed = status.speed
    task.transferProgress = status.progress
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
          if (status.finished) {
            state.finishedQueue.unshift(task)
            state.taskQueue.splice(idx, 1)
          }
        }
      })
    }

    // action methods
    const a_createTask = (context, payload) => {
      console.log('create task')
      return serviceStartTask(payload)
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

    const a_getTaskStatus = context => {
      // const unfinishedTasks = context.state.taskQueue.filter(task => !task.finished)
      // TODO: divide task queue into two parts by finish status
      const statusGetters = context.state.taskQueue.map(async task => {
        // if finished, resolve empty
        if (task.finished) {
          return Promise.resolve()
        }
        try {
          // get task status
          const progressRes = await serviceGetTaskProgress(task.id)
          return progressRes
        } catch (err) {
          // if error, resolve it
          console.error(err)
          return Promise.resolve(err)
        }
      })
      return Promise.all(statusGetters).then(resArr => {
        const statusArr = resArr.map((res, index) => {
          console.log(res)
          let status = {
            finished: false,
            transferEnded: false,
            speed: 0,
            progress: 0,
          }
          // TODO: transferEnded?
          if (res && res[0].ContractStatus === 'US_DEAL') {
            console.log(`task ${index} finished !`)
            status.finished = true
            // mutate meta data
            if (taskType === TASK_TYPE_UPLOAD) {
              context.dispatch(ACT_METADATA_ADD_FILE, context.state.taskQueue[index].file)
            }
          }
          return status
        })
        if (statusArr.length > 0) {
          return context.commit(STORE_KEYS.MUT_SET_STATUS, statusArr)
        }
        return false
      })
    }
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

    this.state = {
      taskQueue: [], // maintains the task queue
      finishedQueue: [], // maintains finished task queue
    }
    this.getters = getters
    this.mutations = mutations
    this.actions = actions
  }
}
