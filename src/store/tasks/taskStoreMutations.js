import {
  DL_TASK,
  MUT_REPLACE_STATE_HOOK,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_UPLOAD,
  UL_TASK,
} from '../../constants/store'
import { DownloadTask, UploadTask } from './Task'
import { TASK_STATUS_RUNNING } from '../../constants/task'

export default taskType => {
  let STORE_KEYS
  if (taskType === TASK_TYPE_UPLOAD) {
    STORE_KEYS = UL_TASK
  }
  if (taskType === TASK_TYPE_DOWNLOAD) {
    STORE_KEYS = DL_TASK
  }

  /**
   * convert plain task object (from background or local storage) to Task instance
   * @param {object} task
   * @returns {Task}
   */
  const taskConverter = task => {
    if (task.type === TASK_TYPE_UPLOAD) {
      return new UploadTask(task)
    } else if (task.type === TASK_TYPE_DOWNLOAD) {
      return new DownloadTask(task)
    }
  }

  const replaceHook = state => {
    console.log('replace state hook fired for task list')
    // if restored from local storage, all running tasks should be paused, for calling "GetJobProgress" on an already paused task will throw error
    const storageTaskConverter = task => {
      if (task.status === TASK_STATUS_RUNNING) {
        return taskConverter(task).pause()
      }
      return taskConverter(task)
    }
    state.taskQueue = state.taskQueue.map(storageTaskConverter)
    state.finishedQueue = state.finishedQueue.map(storageTaskConverter)
    state.updateTaskTimer = null
  }

  const restoreTasks = (state, payload) => {
    console.log('restoring task list from background')
    console.log(payload)
    state.taskQueue = payload.taskQueue.map(taskConverter)
    state.finishedQueue = payload.finishedQueue.map(taskConverter)
  }

  const m_addTask = (state, data) => {
    console.log('adding new task')
    console.log(data)
    const newTask =
      taskType === TASK_TYPE_UPLOAD ? new UploadTask(data) : new DownloadTask(data)
    console.log('new task created')
    console.log(newTask)
    state.taskQueue.unshift(newTask)
  }

  const m_setTaskStatus = (state, payload) => {
    console.log('setting task status ', payload.idx)
    console.log(state.taskQueue[payload.idx])
    state.taskQueue[payload.idx].setStatus(payload.status)
  }

  const m_setTaskProgress = (state, payload) => {
    console.log('setting task progress ', payload.idx)
    console.log(state.taskQueue[payload.idx])
    state.taskQueue[payload.idx].setProgress(payload)
  }

  const m_startTask = (state, idx) => {
    console.log('starting task ', idx)
    console.log(state.taskQueue[idx])
    state.taskQueue[idx].start()
  }

  const m_pauseTask = (state, idx) => {
    console.log('pausing task ', idx)
    console.log(state.taskQueue[idx])
    state.taskQueue[idx].pause()
  }

  const m_resumeTask = (state, idx) => {
    console.log('resuming task ', idx)
    console.log(state.taskQueue[idx])
    state.taskQueue[idx].resume()
  }

  const m_failTask = (state, payload) => {
    const taskToFail = state.taskQueue[payload.idx]
    console.log('failing task ', payload.idx)
    console.log(taskToFail)
    taskToFail.fail(payload.msg)
    state.finishedQueue.unshift(taskToFail)
    state.taskQueue.splice(payload.idx, 1)
  }

  const m_finishTask = (state, idx) => {
    console.log('finishing task ', idx)
    const taskToFinish = state.taskQueue[idx]
    taskToFinish.finish()
    state.finishedQueue.unshift(taskToFinish)
    state.taskQueue.splice(idx, 1)
  }

  const m_removeTask = (state, idx) => {
    console.log('removing task ', idx)
    state.finishedQueue.splice(idx, 1)
  }

  const m_cancelTask = (state, idx) => {
    console.log('canceling task', idx)
    state.taskQueue.splice(idx, 1)
  }

  return {
    [MUT_REPLACE_STATE_HOOK]: replaceHook,
    [STORE_KEYS.MUT_RESTORE_BG_TASKS]: restoreTasks,
    [STORE_KEYS.MUT_ADD_TASK]: m_addTask,
    [STORE_KEYS.MUT_SET_PROGRESS]: m_setTaskProgress,
    [STORE_KEYS.MUT_START_TASK]: m_startTask,
    [STORE_KEYS.MUT_PAUSE_TASK]: m_pauseTask,
    [STORE_KEYS.MUT_FINISH_TASK]: m_finishTask,
    [STORE_KEYS.MUT_FAIL_TASK]: m_failTask,
    [STORE_KEYS.MUT_RESUME_TASK]: m_resumeTask,
    [STORE_KEYS.MUT_REMOVE_TASK]: m_removeTask,
    [STORE_KEYS.MUT_CANCEL_TASK]: m_cancelTask,
    [STORE_KEYS.MUT_SET_TASK_STATUS]: m_setTaskStatus,
  }
}
