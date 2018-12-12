import TaskStore from './TaskStore_new'
import { UploadTask } from './Task'
import { UL_TASK } from '../../constants/store'
import {
  startUpload,
  cancelUpload,
  pauseUpload,
  resumeUpload,
} from '../../services/upload'
import { getTaskProgress } from '../../services/file'
import File from '../File'

export default class UploadTaskStore extends TaskStore {
  constructor() {
    super('upload')

    // add new task to queue
    this.mutations[UL_TASK.MUT_ADD_TASK] = (state, data) => {
      console.log('adding new upload task')
      console.log(data)
      const newTask = new UploadTask(data)
      state.taskQueue.unshift(newTask)
    }

    this.actions[UL_TASK.ACT_CREATE_TASK] = (context, payload) => {
      console.log('create task')
      return startUpload(payload)
        .then(res => {
          console.log('task started')
          const newTask = {
            id: res.taskId,
            file: new File(payload.file),
            localPath: payload.localPath,
          }
          return context.commit(UL_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[UL_TASK.ACT_PAUSE_TASK] = (context, taskId) => {
      console.log('pausing task')
      return pauseUpload(taskId).then(() => {
        console.log('task paused ', taskId)
        return context.commit(UL_TASK.MUT_PAUSE_TASK, taskId)
      })
    }
    this.actions[UL_TASK.ACT_RESUME_TASK] = (context, taskId) => {
      console.log('resuming task')
      return resumeUpload(taskId).then(() => {
        console.log('res ', taskId)
        return context.commit(UL_TASK.MUT_RESUME_TASK, taskId)
      })
    }
    this.actions[UL_TASK.ACT_CANCEL_TASK] = (context, taskId) => {
      console.log('canceling task')
      return cancelUpload(taskId).then(() => {
        console.log('res ', taskId)
        return context.commit(UL_TASK.MUT_CANCEL_TASK, taskId)
      })
    }
    this.actions[UL_TASK.ACT_GET_PROGRESS] = context => {
      // TODO: Handle window closed case. Need to open app to finish task?
      const statusGetters = context.state.taskQueue.map(task =>
        // get task status
        getTaskProgress(task.id).catch(err => {
          console.error(err)
          return Promise.resolve({ error: err })
        }),
      )
      return Promise.all(statusGetters).then(resArr => {
        console.log('all upload task progress got: ')
        console.log(resArr)
        const statusArr = resArr.map((res, index) => {
          let status = {}
          if (res.error) {
            console.log(`task ${index} failed !`)
            status.failed = true
            status.failMsg = res.error.message
          } else if (res.transferred === res.whole) {
            console.log(`task ${index} finished !`)
            status.finished = true
          } else {
            status.transferredData = res.transferred
            status.wholeDataLenth = res.whole
          }
          return status
        })

        statusArr.forEach((status, idx) => {
          if (status.finished) {
            return context.commit(UL_TASK.MUT_FINISH_TASK, idx)
          }
          if (status.failed) {
            return context.commit(UL_TASK.MUT_FAIL_TASK, { idx, msg: status.failMsg })
          }
          return context.commit(UL_TASK.MUT_SET_PROGRESS, { idx, ...status })
        })
        return statusArr
      })
    }
  }
}
