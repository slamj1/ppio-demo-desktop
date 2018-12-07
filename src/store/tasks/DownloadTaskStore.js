import TaskStore from './TaskStore_new'
import { DL_TASK } from '../../constants/store'
import { startDownload, cancelDownload } from '../../services/download'
import { getObjectStatus as getProgress } from '../../services/file'
import File from '../File'

export default class DownloadTaskStore extends TaskStore {
  constructor() {
    super('download')
    // action methods
    /**
     * create a new download task
     * @param context
     * @param payload
     * @returns {Promise<* | never>}
     */
    const a_createTask = (context, payload) => {
      console.log('create task')
      return startDownload(payload)
        .then(res => {
          console.log('task started')
          const newTask = {
            id: res.taskId,
            file: new File(payload.file),
          }
          newTask.exportPath = payload.exportPath
          return context.commit(DL_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          return Promise.reject(err)
        })
    }

    const a_cancelTask = (context, taskId) =>
      cancelDownload(taskId).then(() => {
        console.log('res ', taskId)
        return context.commit(DL_TASK.MUT_CANCEL_TASK, taskId)
      })

    const a_getTaskStatus = context => {
      // const unfinishedTasks = context.state.taskQueue.filter(task => !task.finished)
      // TODO: Handle window closed case. Need to open app to finish task?
      console.log('refreshing all download task status')
      console.log(context.state.taskQueue)
      const statusGetters = context.state.taskQueue.map((task, taskIdx) =>
        // get task status
        getProgress(task.id)
          .then(res => {
            const status = {}
            if (res[0] && res[0].ContractStatus === 'US_DEAL') {
              console.log(`task ${taskIdx} finished !`)
              status.finished = true
              status.transferringData = false
              status.transferProgress = 100
            } else if (
              res.error &&
              res.error.message !== 'failed to get miner-segments-info'
            ) {
              console.log(`task ${taskIdx} failed !`)
              status.transferringData = false
              status.transferProgress = 0
              status.failed = true
              status.failMsg = res.error.message
            } else {
              status.transferringData = true
              status.transferProgress = 0
            }
            return status
          })
          .catch(err => {
            // if error, resolve it
            console.error(err)
            return Promise.resolve({ error: err })
          }),
      )
      // TODO: need refractor
      return Promise.all(statusGetters).then(statusArr => {
        // set task status
        context.commit(DL_TASK.MUT_SET_STATUS, statusArr)
        return statusArr
      })
    }

    this.actions = {
      [DL_TASK.ACT_CREATE_TASK]: a_createTask,
      [DL_TASK.ACT_CANCEL_TASK]: a_cancelTask,
      [DL_TASK.ACT_GET_STATUS]: a_getTaskStatus,
    }
  }
}
