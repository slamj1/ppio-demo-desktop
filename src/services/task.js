import { remote } from 'electron'

const poss = remote.getGlobal('poss')

export const listTasks = () => {
  console.log('list all task')
  return poss.listTasks()
}

export const getTask = taskId => {
  console.log('getting task')
  console.log(taskId)
  return poss.getTask({ taskId })
}

export const pauseTask = taskId => {
  console.log('pausing task')
  console.log(taskId)
  return poss.pauseTask({ taskId })
}

export const resumeTask = taskId => {
  console.log('resuming task')
  console.log(taskId)
  return poss.resumeTask({ taskId })
}

export const deleteTask = taskId => {
  console.log('deleting task')
  console.log(taskId)
  return poss.deleteTask({ taskId })
}

export const getTaskProgress = taskId => {
  console.log('getting task progress for ', taskId)
  return poss
    .getJobProgress({ taskId })
    .then(res => {
      console.log('task progress got')
      console.log(res)
      return {
        transferred: res.FinishedBytes,
        total: res.TotalBytes,
      }
    })
    .catch(err => {
      console.error('get task progress error ', taskId)
      console.error(err)
      return Promise.reject(err)
    })
}
