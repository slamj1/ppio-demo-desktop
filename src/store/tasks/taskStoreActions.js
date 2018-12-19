import {
  UL_TASK,
  DL_TASK,
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
} from '../../constants/store'
import { startUpload } from '../../services/upload'
import { startDownload } from '../../services/download'
import { pauseTask, resumeTask, deleteTask, getTaskProgress } from '../../services/task'
import { TaskFile } from '../PPFile'
import { TASK_STATUS_PAUSED } from '../../constants/task'

export default taskType => {
  let STORE_KEYS
  if (taskType === TASK_TYPE_UPLOAD) {
    STORE_KEYS = UL_TASK
  }
  if (taskType === TASK_TYPE_DOWNLOAD) {
    STORE_KEYS = DL_TASK
  }
  const a_createTask = (context, payload) => {
    console.log('create task')
    const startTask = taskType === TASK_TYPE_UPLOAD ? startUpload : startDownload
    return startTask(payload)
      .then(taskId => {
        console.log('task started')
        const newTask = {
          id: taskId,
          file: new TaskFile(payload.file),
        }
        if (taskType === TASK_TYPE_UPLOAD) {
          newTask.localPath = payload.localPath
        } else if (taskType === TASK_TYPE_DOWNLOAD) {
          newTask.exportPath = payload.exportPath
        }
        return context.commit(STORE_KEYS.MUT_ADD_TASK, newTask)
      })
      .catch(err => {
        console.error('create task error')
        console.error(err.error)
        if (!err.taskId) {
          return Promise.reject(err)
        }
        return deleteTask(err.taskId)
          .then(() => {
            console.log('deleted task ', err.taskId)
            return Promise.reject(err.error)
          })
          .catch(err => {
            console.error('delete task failed')
            console.error(err)
            return Promise.reject(err)
          })
      })
  }
  const a_pauseTask = (context, idx) => {
    console.log('pausing task')
    const taskToPause = context.state.taskQueue[idx]
    if (!taskToPause) {
      return Promise.reject(new Error('task not exist!'))
    }
    return pauseTask(taskToPause.id).then(() => {
      console.log('task paused ', taskToPause.id)
      return context.commit(STORE_KEYS.MUT_PAUSE_TASK, idx)
    })
  }
  const a_resumeTask = (context, idx) => {
    console.log('resuming task')
    const taskToResume = context.state.taskQueue[idx]
    if (!taskToResume) {
      return Promise.reject(new Error('task not exist!'))
    }
    return resumeTask(taskToResume.id).then(() => {
      console.log('task resumed ', taskToResume.id)
      return context.commit(STORE_KEYS.MUT_RESUME_TASK, idx)
    })
  }
  const a_cancelTask = (context, idx) => {
    console.log('canceling task ', idx)
    console.log(context.state.taskQueue[idx])
    const taskToCancel = context.state.taskQueue[idx]
    if (!taskToCancel) {
      return Promise.reject(new Error('task not exist!'))
    }
    let pauseFunc
    if (context.state.taskQueue[idx].status === TASK_STATUS_PAUSED) {
      pauseFunc = () => Promise.resolve()
    } else {
      pauseFunc = () => pauseTask(taskToCancel.id)
    }
    return pauseFunc()
      .then(() => deleteTask(taskToCancel.id))
      .then(() => {
        console.log('cancelled task ', taskToCancel.id)
        return context.commit(STORE_KEYS.MUT_CANCEL_TASK, idx)
      })
      .catch(err => {
        console.log('cancelling task failed ', taskToCancel.id)
        console.error(err)
        return Promise.reject(err)
      })
  }
  const a_deleteTask = (context, idx) => {
    console.log('deleting task ', idx)
    console.log(context.state.finishedQueue[idx])
    const taskToDelete = context.state.finishedQueue[idx]
    if (!taskToDelete) {
      return Promise.reject(new Error('task not exist!'))
    }
    return deleteTask(taskToDelete.id)
      .then(() => {
        console.log('deleted task ', taskToDelete.id)
        return context.commit(STORE_KEYS.MUT_REMOVE_TASK, idx)
      })
      .catch(err => {
        console.error('delete upload task failed')
        console.error(err.message)
        if (err.message === 'task not found') {
          return context.commit(STORE_KEYS.MUT_REMOVE_TASK, idx)
        }
        return Promise.reject(err)
      })
  }
  const a_getTaskProgress = context => {
    // TODO: Handle window closed case. Need to open app to finish task?
    const statusGetters = context.state.taskQueue.map(task => {
      // get task status
      if (task.status === TASK_STATUS_PAUSED) {
        return Promise.resolve({ paused: true })
      }
      return getTaskProgress(task.id).catch(err => {
        console.error('get task progress failed')
        console.error(err)
        return Promise.resolve({ error: err })
      })
    })
    return Promise.all(statusGetters).then(resArr => {
      // console.log('all upload task progress got: ')
      // console.log(resArr)
      const statusArr = resArr.map((res, index) => {
        let status = {}
        if (res.paused) {
          status.paused = true
        } else if (res.error) {
          console.log(`task ${index} failed !`)
          status.failed = true
          status.failMsg = res.error.message || 'task failed'
        } else if (res.transferred === res.total) {
          console.log(`task ${index} finished !`)
          status.transferredData = res.transferred
          status.wholeDataLength = res.total
          status.finished = true
        } else {
          status.transferredData = res.transferred
          status.wholeDataLength = res.total
        }
        return status
      })

      statusArr.forEach((status, idx) => {
        if (status.finished) {
          console.log('found a succ task')
          context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
          return context.commit(STORE_KEYS.MUT_FINISH_TASK, idx)
        }
        if (status.failed) {
          console.log('found a fail task')
          return context.commit(STORE_KEYS.MUT_FAIL_TASK, { idx, msg: status.failMsg })
        }
        if (status.paused) {
          console.log('found a paused task')
          return true
        }
        console.log('found a running task')
        return context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
      })
      return statusArr
    })
  }
  return {
    [STORE_KEYS.ACT_CREATE_TASK]: a_createTask,
    [STORE_KEYS.ACT_PAUSE_TASK]: a_pauseTask,
    [STORE_KEYS.ACT_RESUME_TASK]: a_resumeTask,
    [STORE_KEYS.ACT_CANCEL_TASK]: a_cancelTask,
    [STORE_KEYS.ACT_DELETE_TASK]: a_deleteTask,
    [STORE_KEYS.ACT_GET_PROGRESS]: a_getTaskProgress,
  }
}
