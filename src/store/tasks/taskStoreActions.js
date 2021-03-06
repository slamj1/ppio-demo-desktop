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
import * as GA_EVENTS from '../../constants/ga'
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
  TASK_STATUS_STARTING,
} from '../../constants/task'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'

const visitor = remote.getGlobal('gaVisitor')

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
    if (context.state.taskQueue.length === 5) {
      let action = ''
      if (taskType === TASK_TYPE_UPLOAD) {
        action = 'upload'
      } else if (taskType === TASK_TYPE_DOWNLOAD) {
        action = 'download'
      }
      return Promise.reject(
        new Error(`You can only ${action} up to 5 files simultaneously.`),
      )
    }
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
            return deleteFile(payload.file.key)
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
    const oriStatus = taskToPause.status
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, { idx, status: TASK_STATUS_PAUSING })
    return pauseTask(taskToPause.id)
      .then(() => {
        console.log('task paused ', taskToPause.id)
        return context.commit(STORE_KEYS.MUT_PAUSE_TASK, idx)
      })
      .catch(err => {
        context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
          idx,
          status: oriStatus,
        })
        return Promise.reject(err)
      })
  }
  const a_resumeTask = (context, idx) => {
    console.log('resuming task')
    const taskToResume = context.state.taskQueue[idx]
    if (!taskToResume) {
      return Promise.reject(new Error('task not exist!'))
    }
    const oriStatus = taskToResume.status
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, { idx, status: TASK_STATUS_RESUMING })
    return resumeTask(taskToResume.id)
      .then(() => {
        console.log('task resumed ', taskToResume.id)
        return context.commit(STORE_KEYS.MUT_RESUME_TASK, idx)
      })
      .catch(err => {
        context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
          idx,
          status: oriStatus,
        })
        return Promise.reject(err)
      })
  }
  const a_recoverTask = (context, idx) => {
    console.log('recovering task')
    const taskToRecover = context.state.finishedQueue[idx]
    if (!taskToRecover) {
      return Promise.reject(new Error('task not exist!'))
    }
    const oriStatus = taskToRecover.status
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
      idx,
      status: TASK_STATUS_RESUMING,
      isFinished: true,
    })
    return resumeTask(taskToRecover.id)
      .then(() => {
        console.log('task resumed ', taskToRecover.id)
        return context.commit(STORE_KEYS.MUT_RECOVER_TASK, idx)
      })
      .catch(err => {
        context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
          idx,
          status: oriStatus,
          isFinished: true,
        })
        return Promise.reject(err)
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
    if (taskToCancel.status === TASK_STATUS_PAUSED) {
      pauseFunc = () => Promise.resolve()
    } else {
      pauseFunc = () => pauseTask(taskToCancel.id)
    }
    const oriStatus = taskToCancel.status
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
          err.message.match('task not found') ||
          err.message.match('this account has not put this chunk yet')
        ) {
          return context.commit(STORE_KEYS.MUT_CANCEL_TASK, idx)
        }
        context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
          idx,
          status: oriStatus,
        })
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
    const oriStatus = taskToDelete.status
    context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
      idx,
      status: TASK_STATUS_DELETING,
      isFinished: true,
    })
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
        if (err.message.match('task not found')) {
          return context.commit(STORE_KEYS.MUT_REMOVE_TASK, idx)
        }
        context.commit(STORE_KEYS.MUT_SET_TASK_STATUS, {
          idx,
          status: oriStatus,
          isFinished: true,
        })
        return Promise.reject(err)
      })
  }
  const a_getTaskProgress = context => {
    const failNotif = task => {
      console.log('show fail notification')
      console.log(task)
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
      if (task.status === TASK_STATUS_STARTING || task.status === TASK_STATUS_RUNNING) {
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
      // TODO: refactor
      const statusArr = resArr.map((res, index) => {
        let status = {}
        if (res.suspended || res.status === 'Pending') {
          status.suspended = true
        } else if (res.error) {
          console.log(`task ${index} failed !`)
          status.failed = true
          status.failMsg = res.error.message || 'task failed'
        } else if (res.status === 'Error') {
          console.log(`task ${index} failed !`)
          status.failed = true
          status.failMsg = res.errMsg || 'task failed'
        } else if (res.status === 'Finished') {
          console.log(`task ${index} finished !`)
          status.finished = true
          status.transferredData = res.transferred
          status.wholeDataLength = res.total
        } else if (res.status === 'Running') {
          status.running = true
          status.transferredData = res.transferred
          status.wholeDataLength = res.total
        } else if (res.status === 'Paused') {
          status.paused = true
          status.transferredData = res.transferred
          status.wholeDataLength = res.total
        } else {
          status.suspended = true
          console.error('get a unknown state job')
        }
        return status
      })

      statusArr.forEach((status, idx) => {
        if (status.finished) {
          // context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
          succNotif(context.state.taskQueue[idx])
          if (taskType === TASK_TYPE_UPLOAD) {
            visitor.event(GA_EVENTS.EVENT_UPLOAD_DONE).send()
          } else if (taskType === TASK_TYPE_DOWNLOAD) {
            visitor.event(GA_EVENTS.EVENT_DOWNLOAD_DONE).send()
          }
          return context.commit(STORE_KEYS.MUT_FINISH_TASK, idx)
        }
        if (status.failed) {
          failNotif(context.state.taskQueue[idx])
          if (taskType === TASK_TYPE_UPLOAD) {
            visitor.event(GA_EVENTS.EVENT_UPLOAD_FAIL).send()
          } else if (taskType === TASK_TYPE_DOWNLOAD) {
            visitor.event(GA_EVENTS.EVENT_DOWNLOAD_FAIL).send()
          }
          return context.commit(STORE_KEYS.MUT_FAIL_TASK, { idx, msg: status.failMsg })
        }
        if (status.running) {
          context.commit(STORE_KEYS.MUT_START_TASK, idx)
          return context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
        }
        if (status.paused) {
          context.commit(STORE_KEYS.MUT_PAUSE_TASK, idx)
          return context.commit(STORE_KEYS.MUT_SET_PROGRESS, { idx, ...status })
        }
        if (status.suspended) {
          console.log('found a suspended task')
          return true
        }
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

  const a_startTasksPolling = ({ state, dispatch, commit }) => {
    if (taskType === TASK_TYPE_UPLOAD && state.updateUploadTaskTimer) {
      console.log('upload task polling timer exists')
      return
    }
    if (taskType === TASK_TYPE_DOWNLOAD && state.updateDownloadTaskTimer) {
      console.log('download task polling timer exists')
      return
    }
    const updateTasks = () => {
      dispatch(STORE_KEYS.ACT_GET_PROGRESS).catch(err => {
        console.error(err)
      })
      const timer = setTimeout(updateTasks, TASK_GET_PROGRESS_INTERVAL)
      commit(STORE_KEYS.MUT_SET_POLLING_TASK_TIMER, timer)
    }
    updateTasks()
  }

  return {
    [STORE_KEYS.ACT_CREATE_TASK]: a_createTask,
    [STORE_KEYS.ACT_PAUSE_TASK]: a_pauseTask,
    [STORE_KEYS.ACT_RESUME_TASK]: a_resumeTask,
    [STORE_KEYS.ACT_RECOVER_TASK]: a_recoverTask,
    [STORE_KEYS.ACT_CANCEL_TASK]: a_cancelTask,
    [STORE_KEYS.ACT_DELETE_TASK]: a_deleteTask,
    [STORE_KEYS.ACT_GET_PROGRESS]: a_getTaskProgress,
    [ACT_RESTORE_BG_TASKS]: a_syncTasks,
    [ACT_START_POLLING_TASK_PROGRESS]: a_startTasksPolling,
  }
}
