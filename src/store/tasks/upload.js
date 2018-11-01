import Task from './Task'
import {
  TASK_TYPE_UPLOAD,
  MUT_SET_TASK_DATA,
  MUT_ADD_UL_TASK,
  MUT_REMOVE_UL_TASK,
} from '@/constants/store'

const store = {
  state: {
    uploadQueue: {},
    curTask: null,
  },
  mutations: {
    [MUT_ADD_UL_TASK](state) {
      state.downloadQueue.unshift(new Task({ type: TASK_TYPE_UPLOAD }))
    },
    [MUT_REMOVE_UL_TASK](state, index) {
      state.downloadQueue.splice(index, 1)
    },
    [MUT_SET_TASK_DATA](state, data) {
      state.curTask.setTaskData(data)
    },
  },
}

export default store
