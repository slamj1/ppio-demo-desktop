import TaskStore from './TaskStore_new'
import { DL_TASK } from '../../constants/store'
import { startDownload, cancelDownload, exportObject } from '../../services/download'
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
      const statusGetters = context.state.taskQueue.map(async task => {
        // if finished/failed, resolve empty
        if (task.status.finished || task.status.failed) {
          return Promise.resolve()
        }
        // get task status
        return getProgress(task.id).catch(err => {
          // if error, resolve it
          console.error(err)
          return Promise.resolve({ error: err })
        })
      })
      // TODO: need refractor
      return Promise.all(statusGetters).then(resArr => {
        const justFinishedTaskIdxArr = []
        const statusArr = resArr.map((res, index) => {
          if (!res) {
            return undefined
          }
          let status = {}
          if (res[0] && res[0].ContractStatus === 'US_DEAL') {
            console.log(`task ${index} finished !`)
            status.transferringData = false
            status.transferProgress = 100
            justFinishedTaskIdxArr.push(index)
          } else if (
            res.error &&
            res.error.message !== 'failed to get miner-segments-info'
          ) {
            console.log(`task ${index} failed !`)
            status.transferringData = false
            status.transferProgress = 0
            status.failed = true
            status.failMsg = res.error.message
          }
          return status
        })

        // Returns if no task is active, in which case all items in statusArr are undefined
        if (statusArr.filter(status => !!status).length === 0) {
          return
        }

        // set task status
        context.commit(DL_TASK.MUT_SET_STATUS, statusArr)
        // work after finished
        // TODO: This will block the next update action, move code below to component's watchers?
        if (justFinishedTaskIdxArr.length > 0) {
          return Promise.all(
            justFinishedTaskIdxArr.map(idx => {
              // export object when download finished
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
                .catch(err => {
                  console.error('exporting object failed')
                  console.error(err)
                  return Promise.resolve({ idx, error: err })
                })
            }),
          ).then(resultArr => {
            resultArr.forEach(result => {
              statusArr[result.idx].finished = true
              statusArr[result.idx].addingFileIndex = false
              statusArr[result.idx].exportingFile = false
              console.log('task result :')
              console.log(result)
              if (result.error) {
                statusArr[result.idx].succeeded = false
                statusArr[result.idx].failed = true
                statusArr[result.idx].failMsg = result.error.message.toString()
              } else {
                statusArr[result.idx].succeeded = true
                statusArr[result.idx].failed = false
                statusArr[result.idx].failMsg = ''
              }
            })

            context.commit(DL_TASK.MUT_SET_STATUS, statusArr)
            return statusArr
          })
        }
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
