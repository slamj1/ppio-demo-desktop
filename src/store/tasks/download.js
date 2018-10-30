import Task from './Task'
import {
  TASK_TYPE_DOWNLOAD,
  MUT_CREATE_TASK,
  MUT_REMOVE_TASK,
  MUT_SET_TASK_DATA,
} from '@/constants/store'

const store = {
  state: {
    taskQueue: [],
    curTask: {},
  },
  mutations: {
    [MUT_CREATE_TASK](mode) {
      this.taskQueue.unshift(new Task({ type: TASK_TYPE_DOWNLOAD, mode: mode }))
      this.curTask = this.taskQueue[0]
    },
    [MUT_REMOVE_TASK](taskId) {
      this.taskQueue = this.taskQueue.filter(task => task.id !== taskId)
    },
    [MUT_SET_TASK_DATA](data) {
      this.curTask.setTaskData(data)
    },
  },
}

export default store
