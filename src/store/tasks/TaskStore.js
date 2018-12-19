import taskMutations from './taskStoreMutations'
import taskActions from './taskStoreActions'
import {
  DL_TASK,
  UL_TASK,
  MUT_CLEAR_TASK_DATA,
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
} from '../../constants/store'

export default class TaskStore {
  constructor(storeType) {
    let TASK_TYPE, STORE_KEYS
    if (storeType === 'upload') {
      TASK_TYPE = TASK_TYPE_UPLOAD
      STORE_KEYS = UL_TASK
    }
    if (storeType === 'download') {
      TASK_TYPE = TASK_TYPE_DOWNLOAD
      STORE_KEYS = DL_TASK
    }
    // define store data
    const initialState = () => ({
      taskQueue: [],
      finishedQueue: [],
    })

    this.state = initialState

    this.getters = {
      // task count getter
      [STORE_KEYS.GET_TASK_COUNT]: state => state.taskQueue.length,
    }

    this.mutations = taskMutations(TASK_TYPE)
    this.mutations[MUT_CLEAR_TASK_DATA] = state => {
      const initState = initialState()
      Object.keys(initState).forEach(key => {
        state[key] = initState[key]
      })
    }
    this.actions = taskActions(TASK_TYPE)
  }
}
