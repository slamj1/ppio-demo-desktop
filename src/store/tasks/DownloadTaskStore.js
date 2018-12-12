import TaskStore from './TaskStore_new'
import { DownloadTask } from './Task'
import { DL_TASK, UL_TASK } from '../../constants/store'
import {
  startDownload,
  cancelDownload,
  pauseDownload,
  resumeDownload,
} from '../../services/download'
import { getTaskProgress } from '../../services/file'
import File from '../File'

export default class DownloadTaskStore extends TaskStore {
  constructor() {
    super('download')

    // add new task to queue
    this.mutations[DL_TASK.MUT_ADD_TASK] = (state, data) => {
      console.log('adding new download task')
      console.log(data)
      const newTask = new DownloadTask(data)
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
            file: new File(payload.file),
            exportPath: payload.exportPath,
          }
          return context.commit(DL_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          return Promise.reject(err)
        })
    }
    this.actions[DL_TASK.ACT_PAUSE_TASK] = (context, taskId) => {
      console.log('pausing task')
      return pauseDownload(taskId).then(() => {
        console.log('task paused ', taskId)
        return context.commit(DL_TASK.MUT_PAUSE_TASK, taskId)
      })
    }
    this.actions[DL_TASK.ACT_RESUME_TASK] = (context, taskId) => {
      console.log('resuming task')
      return resumeDownload(taskId).then(() => {
        console.log('task resumed ', taskId)
        return context.commit(DL_TASK.MUT_RESUME_TASK, taskId)
      })
    }
    this.actions[DL_TASK.ACT_CANCEL_TASK] = (context, taskId) => {
      console.log('caceling download task')
      return cancelDownload(taskId).then(() => {
        console.log('cancelled task ', taskId)
        return context.commit(DL_TASK.MUT_CANCEL_TASK, taskId)
      })
    }
    this.actions[DL_TASK.ACT_GET_PROGRESS] = context => {
      // TODO: Handle window closed case. Need to open app to finish task?
      console.log('refreshing all download task status')
      console.log(context.state.taskQueue)
      const statusGetters = context.state.taskQueue.map(task =>
        // get task status
        getTaskProgress(task.id).catch(err => {
          console.error(err)
          return Promise.resolve({ error: err })
        }),
      )
      // TODO: need refractor
      return Promise.all(statusGetters).then(resArr => {
        console.log('all download task progress got: ')
        console.log(resArr)
        const statusArr = resArr.map((res, index) => {
          const status = {}
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
