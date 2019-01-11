/**
 * sync task queue to background
 */
import { remote } from 'electron'
import { DL_TASK, UL_TASK } from '../../constants/store'

export default store => {
  store.subscribe((mutation, state) => {
    if (!!mutation.type.match('restore') || !!mutation.type.match('Progress')) {
      console.log('not sync task to background')
      return
    }
    if (
      Object.values(DL_TASK).indexOf(mutation.type) > -1 &&
      mutation.type !== DL_TASK.MUT_SET_POLLING_TASK_TIMER
    ) {
      console.log('syncing download task to background via mutation ', mutation.type)
      remote.getGlobal('downloadTaskManager').setTasks({
        taskQueue: state.downloadTask.taskQueue,
        finishedQueue: state.downloadTask.finishedQueue,
      })
    } else if (
      Object.values(UL_TASK).indexOf(mutation.type) > -1 &&
      mutation.type !== UL_TASK.MUT_SET_POLLING_TASK_TIMER
    ) {
      console.log('syncing upload task to background via mutation ', mutation.type)
      remote.getGlobal('uploadTaskManager').setTasks({
        taskQueue: state.uploadTask.taskQueue,
        finishedQueue: state.uploadTask.finishedQueue,
      })
    }
  })
}
