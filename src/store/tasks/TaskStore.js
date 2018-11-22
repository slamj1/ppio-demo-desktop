import { Task, TaskStatus } from './Task'
import {
  ACT_METADATA_ADD_FILE,
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_GET,
  DL_TASK,
  UL_TASK,
  GET_TASK,
} from '../../constants/store'
import { startUpload, cancelUpload } from '../../services/upload'
import { startDownload, cancelDownload, exportObject } from '../../services/download'
import { getFile as startGet, cancelGet } from '../../services/getFile'
import { getObjectStatus as getProgress } from '../../services/file'
import File from '../File'

function cancelTask(task) {}

export default class TaskStore {
  constructor(storeType) {
    // assign keys and sdk methods by store type
    let STORE_KEYS, taskType, serviceStartTask, serviceCancelTask, serviceGetTaskProgress
    if (storeType === 'upload') {
      STORE_KEYS = UL_TASK
      taskType = TASK_TYPE_UPLOAD
      serviceStartTask = startUpload
      serviceCancelTask = cancelUpload
      serviceGetTaskProgress = getProgress
    }
    if (storeType === 'download') {
      STORE_KEYS = DL_TASK
      taskType = TASK_TYPE_DOWNLOAD
      serviceStartTask = startDownload
      serviceCancelTask = cancelDownload
      serviceGetTaskProgress = getProgress
    }

    if (storeType === 'get') {
      STORE_KEYS = GET_TASK
      taskType = TASK_TYPE_GET
      serviceStartTask = startGet
      serviceCancelTask = cancelGet
      serviceGetTaskProgress = getProgress
    }

    // mutation methods
    const m_addTask = (state, data) => {
      console.log('adding new task')
      const newTask = new Task({
        type: taskType,
        ...data,
      })
      newTask.status.transferringData = true
      newTask.status.finished = false
      newTask.status.transferProgress = 0
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
          task.status = Object.assign(task.status, status)
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
          const newTask = {
            id: res.taskId,
            file: new File(payload.file),
          }
          if (taskType === TASK_TYPE_UPLOAD) {
            newTask.localPath = payload.localPath
          }
          if (taskType === TASK_TYPE_DOWNLOAD) {
            newTask.exportPath = payload.exportPath
          }
          return context.commit(STORE_KEYS.MUT_ADD_TASK, newTask)
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
      // TODO: Handle window closed case. Need to open app to finish task?
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
        const justFinishedTaskIdxArr = []
        const statusArr = resArr.map((res, index) => {
          console.log(res)
          let status = new TaskStatus()
          if (res && res[0].ContractStatus === 'US_DEAL') {
            console.log(`task ${index} finished !`)
            status.transferringData = false
            status.transferProgress = 100
            justFinishedTaskIdxArr.push(index)
          }
          return status
        })

        if (statusArr.length === 0) {
          return
        }
        // set task status
        context.commit(STORE_KEYS.MUT_SET_STATUS, statusArr)
        // work after finished
        // TODO: This will block the next update action, move work below to watchers in components
        if (justFinishedTaskIdxArr.length > 0) {
          return Promise.all(
            justFinishedTaskIdxArr.map(idx => {
              // mutate meta data when upload/get finished
              if (taskType === TASK_TYPE_UPLOAD || taskType === TASK_TYPE_GET) {
                console.log(`upload/get task ${idx} adding file index`)
                statusArr[idx].addingFileIndex = true
                return context
                  .dispatch(ACT_METADATA_ADD_FILE, context.state.taskQueue[idx].file)
                  .then(res => ({ idx, res }))
                  .catch(err => Promise.resolve({ idx, error: err }))
              }
              // export object when download finished
              if (taskType === TASK_TYPE_DOWNLOAD) {
                console.log(`download task ${idx} exporting file`)
                statusArr[idx].exportingFile = true
                const task = context.state.taskQueue[idx]
                console.log(task)
                return exportObject({
                  objectHash: task.file.id,
                  exportPath: task.exportPath,
                  isSecure: task.file.isSecure,
                })
                  .then(res => ({ idx, res }))
                  .catch(err => Promise.resolve({ idx, error: err }))
              }
            }),
          ).then(resultArr => {
            resultArr.forEach(result => {
              statusArr[result.idx].finished = true
              statusArr[result.idx].addingFileIndex = false
              statusArr[result.idx].exportingFile = false
              if (result.error) {
                statusArr[result.idx].failed = true
                statusArr[result.idx].failMsg = result.error.toString()
              } else {
                statusArr[result.idx].failed = false
                statusArr[result.idx].failMsg = ''
              }
            })

            context.commit(STORE_KEYS.MUT_SET_STATUS, statusArr)
            return statusArr
          })
        }
        context.commit(STORE_KEYS.MUT_SET_STATUS, statusArr)
        return statusArr
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
