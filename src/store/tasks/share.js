import Task from './Task'
import {
  TASK_TYPE_SHARE,
  MUT_CREATE_TASK,
  MUT_REMOVE_TASK,
  MUT_SET_TASK_DATA,
} from '@/constants/store'

const store = {
  state: {
    curTask: null,
  },
  mutations: {
    [MUT_CREATE_TASK](state, mode) {
      state.curTask = new Task({ type: TASK_TYPE_SHARE, mode: mode })
    },
    [MUT_REMOVE_TASK](state) {
      state.curTask = null
    },
    [MUT_SET_TASK_DATA](state, data) {
      state.curTask.setTaskData(data)
    },
  },
}

export default store
