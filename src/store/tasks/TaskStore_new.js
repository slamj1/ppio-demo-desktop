import { Task } from './Task'
import {
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_GET,
  DL_TASK,
  UL_TASK,
  GET_TASK,
  MUT_CLEAR_TASK_DATA,
} from '../../constants/store'

export default class TaskStore {
  constructor(storeType) {
    // assign keys and sdk methods by store type
    let STORE_KEYS, taskType
    if (storeType === 'upload') {
      STORE_KEYS = UL_TASK
      taskType = TASK_TYPE_UPLOAD
    }
    if (storeType === 'download') {
      STORE_KEYS = DL_TASK
      taskType = TASK_TYPE_DOWNLOAD
    }

    if (storeType === 'get') {
      STORE_KEYS = GET_TASK
      taskType = TASK_TYPE_GET
    }

    // mutation methods
    const m_addTask = (state, data) => {
      console.log('adding new task ', taskType)
      console.log(data)
      const newTask = new Task({
        type: taskType,
        ...data,
      })
      newTask.status.transferringData = true
      newTask.status.finished = false
      newTask.status.transferProgress = 0
      state.taskQueue.unshift(newTask)
    }

    const m_removeTask = (state, idx) => {
      console.log('removing task ', idx)
      state.finishedQueue.splice(idx, 1)
    }

    const m_cancelTask = (state, idx) => {
      console.log('canceling task', idx)
      state.taskQueue.splice(idx, 1)
    }

    const m_setTaskStatus = (state, statusArr) => {
      console.log('mutate task status')
      console.log(statusArr)
      statusArr.map((status, idx) => {
        if (status && state.taskQueue[idx]) {
          const task = state.taskQueue[idx]
          task.status = Object.assign(task.status, status)
          if (status.finished || status.failed) {
            state.finishedQueue.unshift(task)
            state.taskQueue.splice(idx, 1)
          }
        }
      })
    }
    // define store data
    const initialState = () => ({
      taskQueue: [], // maintains the task queue
      finishedQueue: [], // maintains finished task queue
    })

    this.state = initialState
    this.getters = {
      [STORE_KEYS.GET_TASK_COUNT]: state => state.taskQueue.length,
    }
    this.mutations = {
      [STORE_KEYS.MUT_ADD_TASK]: m_addTask,
      [STORE_KEYS.MUT_REMOVE_TASK]: m_removeTask,
      [STORE_KEYS.MUT_CANCEL_TASK]: m_cancelTask,
      [STORE_KEYS.MUT_SET_STATUS]: m_setTaskStatus,
      [MUT_CLEAR_TASK_DATA](state) {
        const initState = initialState()
        Object.keys(initState).forEach(key => {
          state[key] = initState[key]
        })
      },
    }
  }
}
