import TaskStore from './TaskStore_new'
import { UploadTask } from './Task'
import { UL_TASK } from '../../constants/store'
import { startUpload } from '../../services/upload'
import {
  pauseTask as pauseUpload,
  resumeTask as resumeUpload,
  deleteTask as deleteUpload,
  getTaskProgress,
} from '../../services/task'
import PPFile from '../PPFile'
import { TASK_STATUS_PAUSED } from '../../constants/task'

export default class UploadTaskStore extends TaskStore {
  constructor() {
    super('upload')

    // add new task to queue
    this.mutations[UL_TASK.MUT_ADD_TASK] = (state, data) => {
      console.log('adding new upload task')
      console.log(data)
      const newTask = new UploadTask(data)
      console.log('new upload task created')
      console.log(newTask)
      state.taskQueue.unshift(newTask)
    }

    this.actions[UL_TASK.ACT_CREATE_TASK] = (context, payload) => {
      console.log('create task')
      return startUpload(payload)
        .then(taskId => {
          console.log('task started')
          const newTask = {
            id: taskId,
            file: new PPFile(payload.file),
            localPath: payload.localPath,
          }
          return context.commit(UL_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          // TODO: delete task if failed
          // return context.dispatch(UL_TASK.ACT_CANCEL_TASK)
          return Promise.reject(err)
        })
    }
    this.actions[UL_TASK.ACT_PAUSE_TASK] = (context, idx) => {
      console.log('pausing task')
      const taskId = context.state.taskQueue[idx].id
      return pauseUpload(taskId).then(() => {
        console.log('task paused ', taskId)
        return context.commit(UL_TASK.MUT_PAUSE_TASK, idx)
      })
    }
    this.actions[UL_TASK.ACT_RESUME_TASK] = (context, idx) => {
      console.log('resuming task')
      const taskId = context.state.taskQueue[idx].id
      return resumeUpload(taskId).then(() => {
        console.log('task resumed ', taskId)
        return context.commit(UL_TASK.MUT_RESUME_TASK, idx)
      })
    }
    this.actions[UL_TASK.ACT_CANCEL_TASK] = (context, idx) => {
      console.log('canceling task ', idx)
      console.log(context.state.taskQueue[idx])
      const taskId = context.state.taskQueue[idx].id
      let pauser
      if (context.state.taskQueue[idx].status === TASK_STATUS_PAUSED) {
        pauser = () => Promise.resolve()
      } else {
        pauser = () => pauseUpload(taskId)
      }
      return pauser()
        .then(() => deleteUpload(taskId))
        .then(() => {
          console.log('cancelled task ', taskId)
          return context.commit(UL_TASK.MUT_CANCEL_TASK, idx)
        })
        .catch(err => {
          console.log('cancelling task failed ', taskId)
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[UL_TASK.ACT_DELETE_TASK] = (context, idx) => {
      console.log('deleting task ', idx)
      console.log(context.state.finishedQueue[idx])
      const taskId = context.state.finishedQueue[idx].id
      return deleteUpload(taskId)
        .then(() => {
          console.log('deleted task ', taskId)
          return context.commit(UL_TASK.MUT_REMOVE_TASK, idx)
        })
        .catch(err => {
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[UL_TASK.ACT_GET_PROGRESS] = context => {
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
        console.log('all upload task progress got: ')
        console.log(resArr)
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
            return context.commit(UL_TASK.MUT_FINISH_TASK, idx)
          }
          if (status.failed) {
            console.log('found a fail task')
            return context.commit(UL_TASK.MUT_FAIL_TASK, { idx, msg: status.failMsg })
          }
          if (status.paused) {
            console.log('found a paused task')
            return true
          }
          console.log('found a running task')
          return context.commit(UL_TASK.MUT_SET_PROGRESS, { idx, ...status })
        })
        return statusArr
      })
    }
  }
}
