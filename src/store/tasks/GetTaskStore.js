/**
 * @deprecated
 */

import TaskStore from './TaskStore_new'
import { GetTask } from './Task'
import { ACT_METADATA_ADD_FILE, GET_TASK } from '../../constants/store'
import { getFile as startGet, cancelGet } from '../../services/getFile'
import { getObjectStatus as getProgress } from '../../services/file'
import File from '../File'

export default class GetTaskStore extends TaskStore {
  constructor() {
    super('get')

    // add new task to queue
    this.mutations[GET_TASK.MUT_ADD_TASK] = (state, data) => {
      console.log('adding new get task')
      console.log(data)
      const newTask = new GetTask(data)
      state.taskQueue.unshift(newTask)
    }

    // action methods
    /**
     * create a new download task
     * @param context
     * @param payload
     * @returns {Promise<* | never>}
     */
    const a_createTask = (context, payload) => {
      console.log('create task')
      return startGet(payload)
        .then(res => {
          console.log('task started')
          const newTask = {
            id: res.taskId,
            file: new File(payload.file),
          }
          return context.commit(GET_TASK.MUT_ADD_TASK, newTask)
        })
        .catch(err => {
          console.error('create task error')
          console.error(err)
          return Promise.reject(err)
        })
    }

    const a_cancelTask = (context, taskId) =>
      cancelGet(taskId).then(() => {
        console.log('res ', taskId)
        return context.commit(GET_TASK.MUT_CANCEL_TASK, taskId)
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

        if (statusArr.filter(status => !!status).length === 0) {
          return
        }
        // set task status
        context.commit(GET_TASK.MUT_SET_STATUS, statusArr)
        // work after finished
        // TODO: This will block the next update action, move work below to watchers in components
        if (justFinishedTaskIdxArr.length > 0) {
          return Promise.all(
            justFinishedTaskIdxArr.map(idx => {
              // mutate meta data when upload/get task is finished
              console.log(`upload/get task ${idx} adding file index`)
              statusArr[idx].addingFileIndex = true
              return context
                .dispatch(ACT_METADATA_ADD_FILE, context.state.taskQueue[idx].file)
                .then(res => ({ idx, res }))
                .catch(err => Promise.resolve({ idx, error: err }))
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

            context.commit(GET_TASK.MUT_SET_STATUS, statusArr)
            return statusArr
          })
        }
        context.commit(GET_TASK.MUT_SET_STATUS, statusArr)
        return statusArr
      })
    }

    this.actions = {
      [GET_TASK.ACT_CREATE_TASK]: a_createTask,
      [GET_TASK.ACT_CANCEL_TASK]: a_cancelTask,
      [GET_TASK.ACT_GET_PROGRESS]: a_getTaskStatus,
    }
  }
}
