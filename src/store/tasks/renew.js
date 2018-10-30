import Task from './Task'
import {
  TASK_TYPE_RENEW,
  MUT_CREATE_TASK,
  MUT_REMOVE_TASK,
  MUT_SET_TASK_DATA,
} from '@/constants/store'

const store = {
  state: {
    curTask: null,
  },
  mutations: {
    [MUT_CREATE_TASK](mode) {
      this.curTask = new Task({ type: TASK_TYPE_RENEW, mode: mode })
    },
    [MUT_REMOVE_TASK]() {
      this.curTask = null
    },
    [MUT_SET_TASK_DATA](data) {
      this.curTask.setTaskData(data)
    },
  },
}

export default store
