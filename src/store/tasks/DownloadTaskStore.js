import TaskStore from './TaskStore_new'
import { DownloadTask } from './Task'
import { DL_TASK } from '../../constants/store'
import { startDownload } from '../../services/download'
import {
  pauseTask as pauseDownload,
  resumeTask as resumeDownload,
  deleteTask as deleteDownload,
  getTaskProgress,
} from '../../services/task'
import PPFile from '../PPFile'
import { TASK_STATUS_PAUSED } from '../../constants/task'

export default class DownloadTaskStore extends TaskStore {
  constructor() {
    super('download')

    // add new task to queue
    this.mutations[DL_TASK.MUT_ADD_TASK] = (state, data) => {
      console.log('adding new download task')
      console.log(data)
      const newTask = new DownloadTask(data)
      console.log('new download task created')
      console.log(newTask)
      state.taskQueue.unshift(newTask)
    }
    /**
     * create a new download task
     * @param context
     * @param payload
     * @returns {Promise<* | never>}
     */
    this.actions[DL_TASK.ACT_CREATE_TASK] = (context, payload) => {
      console.log('create task')
      return startDownload(payload)
        .then(res => {
          console.log('task started')
          const newTask = {
            id: res.taskId,
            file: new PPFile(payload.file),
            exportPath: payload.exportPath,
          }
          return context.commit(DL_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          // TODO: delete task if failed
          return Promise.reject(err)
        })
    }
    this.actions[DL_TASK.ACT_PAUSE_TASK] = (context, idx) => {
      console.log('pausing task')
      const taskId = context.state.taskQueue[idx].id
      return pauseDownload(taskId).then(() => {
        console.log('task paused ', taskId)
        return context.commit(DL_TASK.MUT_PAUSE_TASK, taskId)
      })
    }
    this.actions[DL_TASK.ACT_RESUME_TASK] = (context, idx) => {
      console.log('resuming task')
      const taskId = context.state.taskQueue[idx].id
      return resumeDownload(taskId).then(() => {
        console.log('task resumed ', taskId)
        return context.commit(DL_TASK.MUT_RESUME_TASK, taskId)
      })
    }
    this.actions[DL_TASK.ACT_CANCEL_TASK] = (context, idx) => {
      console.log('canceling task ', idx)
      console.log(context.state.taskQueue[idx])
      const taskId = context.state.taskQueue[idx].id
      let pauser
      if (context.state.taskQueue[idx].status === TASK_STATUS_PAUSED) {
        pauser = () => Promise.resolve()
      } else {
        pauser = () => pauseDownload(taskId)
      }
      return pauser()
        .then(() => deleteDownload(taskId))
        .then(() => {
          console.log('cancelled task ', taskId)
          return context.commit(DL_TASK.MUT_CANCEL_TASK, idx)
        })
        .catch(err => {
          console.log('cancelling task failed ', taskId)
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[DL_TASK.ACT_DELETE_TASK] = (context, idx) => {
      console.log('deleting task ', idx)
      console.log(context.state.finishedQueue[idx])
      const taskId = context.state.finishedQueue[idx].id
      return deleteDownload(taskId)
        .then(() => {
          console.log('deleted task ', taskId)
          return context.commit(DL_TASK.MUT_REMOVE_TASK, idx)
        })
        .catch(err => {
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[DL_TASK.ACT_GET_PROGRESS] = context => {
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
      // TODO: need refractor
      return Promise.all(statusGetters).then(resArr => {
        console.log('all download task progress got: ')
        console.log(resArr)
        const statusArr = resArr.map((res, index) => {
          const status = {}
          if (res.paused) {
            status.paused = true
          } else if (res.error) {
            console.log(`task ${index} failed !`)
            status.failed = true
            status.failMsg = res.error.message
          } else if (res.transferred === res.total) {
            console.log(`task ${index} finished !`)
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
            return context.commit(DL_TASK.MUT_FINISH_TASK, idx)
          }
          if (status.failed) {
            console.log('found a fail task')
            return context.commit(DL_TASK.MUT_FAIL_TASK, { idx, msg: status.failMsg })
          }
          if (status.paused) {
            console.log('found a paused task')
            return true
          }
          console.log('found a running task')
          return context.commit(DL_TASK.MUT_SET_PROGRESS, { idx, ...status })
        })
        return statusArr
      })
    }
  }
}
