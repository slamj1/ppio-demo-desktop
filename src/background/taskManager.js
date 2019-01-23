/**
 * background task manager
 */
import poss from './ppiosdk'
import { BG_TASK_GET_PROGRESS_INTERVAL } from '../constants/constants'
import { TASK_STATUS_PAUSED, TASK_STATUS_SUCC, TASK_STATUS_FAIL } from '../constants/task'
import { createTaskNotif } from './createNotif'

class TaskManager {
  constructor(initData) {
    this.taskType = initData.type
    this.taskQueue = initData.taskQueue || []
    this.finishedQueue = initData.finishedQueue || []
    this.updateTimer = null
  }
  setTasks(queues) {
    console.log('setting background task queues for ', this.taskType)
    console.log(queues)
    this.taskQueue = queues.taskQueue
    this.finishedQueue = queues.finishedQueue
  }
  getTasks() {
    console.log('getting task queues from background ', this.taskType)
    return { taskQueue: this.taskQueue, finishedQueue: this.finishedQueue }
  }
  setProgress(idx, payload) {
    this.taskQueue[idx].wholeDataLength = payload.wholeDataLength
    this.taskQueue[idx].transferredData = payload.transferredData
    this.taskQueue[idx].lastTransferredData = payload.transferredData
    this.taskQueue[idx].transferSpeed = 0
    this.taskQueue[idx].displayTransferSpeed = '0b/s'
  }
  updateTasks() {
    console.log('background update tasks on ', this.taskType)
    const statusGetters = this.taskQueue.map(task => {
      if (task.status === TASK_STATUS_PAUSED) {
        return Promise.resolve({ paused: true })
      }
      return poss
        .callMethod('GetJobProgress', { task: task.id })
        .then(res => {
          console.log('task progress got')
          console.log(res)
          return {
            transferred: res.FinishedBytes,
            total: res.TotalBytes,
          }
        })
        .catch(err => {
          console.error('get task progress failed')
          console.error(err)
          return Promise.resolve({ error: err })
        })
    })

    this.updateTimer = setTimeout(() => {
      this.updateTasks()
    }, BG_TASK_GET_PROGRESS_INTERVAL)

    return Promise.all(statusGetters).then(resArr => {
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
          this.setProgress(idx, status)
          const taskToFinish = this.taskQueue[idx]
          taskToFinish.finished = true
          taskToFinish.status = TASK_STATUS_SUCC
          this.finishedQueue.unshift(taskToFinish)
          this.taskQueue.splice(idx, 1)

          console.log('showing task finish notification')
          return createTaskNotif({
            type: this.taskType,
            filename: taskToFinish.file.filename,
          })
        }
        if (status.failed) {
          console.log('found a fail task')
          const taskToFail = this.taskQueue[idx]
          console.log('failing task')
          console.log(taskToFail)
          taskToFail.finished = true
          taskToFail.status = TASK_STATUS_FAIL
          taskToFail.failMsg = status.failMsg
          this.finishedQueue.unshift(taskToFail)
          this.taskQueue.splice(idx, 1)

          console.log('showing task fail notification')
          return createTaskNotif({
            type: this.taskType,
            filename: taskToFail.file.filename,
            failed: true,
          })
        }
        if (status.paused) {
          console.log('found a paused task')
          return true
        }

        return this.setProgress(idx, status)
      })
      return statusArr
    })
  }
  startUpdating() {
    console.log('background task manager start updating tasks ', this.taskType)
    console.log(this.taskQueue)
    console.log(this.finishedQueue)
    if (this.taskQueue.length > 0) {
      this.updateTasks()
    }
  }
  stopUpdating() {
    console.log('background task manager stop updating tasks ', this.taskType)
    clearTimeout(this.updateTimer)
  }
}

export default TaskManager
