import { remote } from 'electron'

const poss = remote.getGlobal('poss')

export const listTasks = () => {
  console.log('list all tasks')
  return poss.callMethod('ListTasks')
}

export const pauseTask = taskId => {
  console.log('pausing task')
  console.log(taskId)
  return poss.callMethod('PauseTask', { taskid: taskId })
}

export const resumeTask = taskId => {
  console.log('resuming task')
  console.log(taskId)
  return poss.callMethod('ResumeTask', { taskid: taskId })
}

export const deleteTask = taskId => {
  console.log('deleting task')
  console.log(taskId)
  return poss.callMethod('DeleteTaskSync', { taskid: taskId })
}

export const getTaskProgress = taskId =>
  poss
    .callMethod('GetJobProgress', { task: taskId })
    .then(res => {
      console.log('task progress got', taskId)
      console.log(res)
      return {
        status: res.JobState, // Pending, Running, Paused, Finished, Error
        transferred: res.FinishedBytes,
        total: res.TotalBytes,
        errMsg: res.Err,
      }
    })
    .catch(err => {
      console.error('get task progress error ', taskId)
      console.error(err)
      return Promise.reject(err)
    })
