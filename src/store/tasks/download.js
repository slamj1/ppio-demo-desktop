import Task from './Task'
import { TASK_TYPE_DOWNLOAD } from '@/constants/store'

import {
  MUT_ADD_DL_TASK,
  MUT_RM_DL_TASK,
  MUT_SET_TASK_DATA,
} from '@/constants/store'

const store = {
  state: {
    taskQueue: [],
    curTask: {},
  },
  mutations: {
    [MUT_ADD_DL_TASK](mode) {
      this.taskQueue.unshift(new Task({ type: TASK_TYPE_DOWNLOAD, mode: mode }))
      this.curTask = this.taskQueue[0]
    },
    [MUT_RM_DL_TASK](taskId) {
      this.taskQueue = this.taskQueue.filter(task => task.id !== taskId)
    },
    [MUT_SET_TASK_DATA](data) {
      this.curTask.setTaskData(data)
    },
  },
}

export default store
