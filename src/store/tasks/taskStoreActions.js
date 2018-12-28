import { remote } from 'electron'
import appRouter from '../../index/router'
import {
  UL_TASK,
  DL_TASK,
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  ACT_RESTORE_BG_TASKS,
  ACT_START_POLLING_TASK_PROGRESS,
} from '../../constants/store'
import { startUpload } from '../../services/upload'
import { startDownload } from '../../services/download'
import { pauseTask, resumeTask, deleteTask, getTaskProgress } from '../../services/task'
import { deleteFile } from '../../services/file'
import { TaskFile } from '../PPFile'
import {
  TASK_STATUS_PAUSED,
  TASK_STATUS_FAIL,
  TASK_STATUS_PAUSING,
  TASK_STATUS_RESUMING,
  TASK_STATUS_DELETING,
  TASK_STATUS_RUNNING,
} from '../../constants/task'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'

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
        console.error(err)
        if (!err.taskId) {
          return Promise.reject(err)
        }
        return deleteTask(err.taskId)
          .then(() => {
            console.log('deleted task ', err.taskId)
            deleteFile(payload.file.key)
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
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, { idx, status: TASK_STATUS_PAUSING })
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
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, { idx, status: TASK_STATUS_RESUMING })
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
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, { idx, status: TASK_STATUS_DELETING })
    return pauseFunc()
      .then(() => deleteTask(taskToCancel.id))
      .then(() => {
        console.log('cancelled task ', taskToCancel.id)
        deleteFile(taskToCancel.file.key)
        return context.commit(STORE_KEYS.MUT_CANCEL_TASK, idx)
      })
      .catch(err => {
        console.log('cancelling task failed ', taskToCancel.id)
        console.error(err)
        if (
          err.message === 'task not found' ||
          err.message === 'this account has not put this chunk yet'
        ) {
          return context.commit(STORE_KEYS.MUT_CANCEL_TASK, idx)
        }
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
        if (taskToDelete.status === TASK_STATUS_FAIL) {
          deleteFile(taskToDelete.file.key)
        }
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
    const failNotif = task => {
      const notifContent =
        taskType === TASK_TYPE_UPLOAD ? 'Upload failed!' : 'Download failed!'
      const taskPageName = taskType === TASK_TYPE_UPLOAD ? 'upload-list' : 'download-list'
      let taskFailNotif = new Notification('ppio-demo task failed', {
        body: `${task.file.filename} ${notifContent}`,
        silent: true,
      })
      taskFailNotif.onclick = () => {
        console.log('notif clicked')
        appRouter.push({ name: taskPageName })
        taskFailNotif.close()
      }
    }

    const succNotif = task => {
      console.log('showing task finish notification')
      const notifContent =
        taskType === TASK_TYPE_UPLOAD ? 'Upload finished!' : 'Download finished!'
      const taskPageName = taskType === TASK_TYPE_UPLOAD ? 'upload-list' : 'download-list'
      let taskFinishNotif = new Notification('ppio-demo task finished', {
        body: `${task.file.filename} ${notifContent}`,
        silent: true,
      })
      console.log(taskFinishNotif)
      taskFinishNotif.onclick = () => {
        console.log('notif clicked')
        appRouter.push({ name: taskPageName })
        taskFinishNotif.close()
      }
    }

    const statusGetters = context.state.taskQueue.map(task => {
      // get task status
      if (task.status === TASK_STATUS_RUNNING) {
        return getTaskProgress(task.id).catch(err => {
          console.error('get task progress failed')
          console.error(err)
          return Promise.resolve({ error: err })
        })
      } else {
        return Promise.resolve({ suspended: true })
      }
    })
    return Promise.all(statusGetters).then(resArr => {
      // console.log('all upload task progress got: ')
      // console.log(resArr)
      const statusArr = resArr.map((res, index) => {
        let status = {}
        if (res.suspended) {
          status.suspended = true
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
          succNotif(context.state.taskQueue[idx])
          return context.commit(STORE_KEYS.MUT_FINISH_TASK, idx)
        }
        if (status.failed) {
          console.log('found a fail task')
          failNotif(context.state.taskQueue[idx])
          return context.commit(STORE_KEYS.MUT_FAIL_TASK, { idx, msg: status.failMsg })
        }
        if (status.suspended) {
          console.log('found a suspended task')
          return true
        }
        console.log('found a running task')
        return context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
      })
      return statusArr
    })
  }

  const a_syncTasks = ({ state, commit }) => {
    console.log('restoring tasks from background')
    let taskManager
    if (taskType === TASK_TYPE_UPLOAD) {
      taskManager = remote.getGlobal('uploadTaskManager')
    } else if (taskType === TASK_TYPE_DOWNLOAD) {
      taskManager = remote.getGlobal('downloadTaskManager')
    }
    const backgroundTasks = taskManager.getTasks()
    console.log(backgroundTasks)
    if (
      backgroundTasks.taskQueue.length > 0 ||
      backgroundTasks.finishedQueue.length > 0
    ) {
      return commit(STORE_KEYS.MUT_RESTORE_BG_TASKS, backgroundTasks)
    } else {
      console.log('nothing to restore, setting to background')
      taskManager.setTasks({
        taskQueue: state.taskQueue,
        finishedQueue: state.finishedQueue,
      })
    }
  }

  const a_startTasksPolling = ({ dispatch }) => {
    console.log('start polling tasks')
    const updateTasks = () => {
      dispatch(STORE_KEYS.ACT_GET_PROGRESS).catch(err => {
        console.error(err)
      })
      setTimeout(updateTasks, TASK_GET_PROGRESS_INTERVAL)
    }
    updateTasks()
  }

  return {
    [STORE_KEYS.ACT_CREATE_TASK]: a_createTask,
    [STORE_KEYS.ACT_PAUSE_TASK]: a_pauseTask,
    [STORE_KEYS.ACT_RESUME_TASK]: a_resumeTask,
    [STORE_KEYS.ACT_CANCEL_TASK]: a_cancelTask,
    [STORE_KEYS.ACT_DELETE_TASK]: a_deleteTask,
    [STORE_KEYS.ACT_GET_PROGRESS]: a_getTaskProgress,
    [ACT_RESTORE_BG_TASKS]: a_syncTasks,
    [ACT_START_POLLING_TASK_PROGRESS]: a_startTasksPolling,
  }
}
