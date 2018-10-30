import Vue from 'vue'

import Task from './Task'
import {
  TASK_TYPE_UPLOAD,
  MUT_CREATE_TASK,
  MUT_REMOVE_TASK,
  MUT_SET_TASK_DATA,
  MUT_ADD_UL_TASK,
} from '@/constants/store'

const store = {
  state: {
    uploadQueue: {},
    curTask: null,
  },
  mutations: {
    [MUT_CREATE_TASK](state, mode) {
      state.curTask = new Task({ type: TASK_TYPE_UPLOAD, mode: mode })
    },
    [MUT_ADD_UL_TASK](state, id) {
      state.uploadQueue[id] = state.curTask
    },
    [MUT_REMOVE_TASK](state, taskId) {
      Vue.delete(state.uploadQueue, taskId)
    },
    [MUT_SET_TASK_DATA](state, data) {
      state.curTask.setTaskData(data)
    },
  },
}

export default store
