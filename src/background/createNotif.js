import { Notification } from 'electron'
import windowManager from './windowManager'

const createNotif = options => {
  console.log('creating notification')
  if (Notification.isSupported()) {
    let notification = new Notification({
      title: options.title,
      body: options.body,
      silent: true,
    })
    notification.on('click', options.onClick)
    notification.show()
    return notification
  }
  return null
}

export default createNotif

export const createTaskNotif = options => {
  console.log('creating task notification')
  const notifContent =
    options.type === 'upload'
      ? `${options.filename} upload ${options.failed ? 'failed!' : 'finished!'}`
      : `${options.filename} download ${options.failed ? 'failed!' : 'finished!'}`
  const taskPageRoute =
    options.type === 'upload' ? '/home/upload-list' : '/home/download-list'
  const notif = createNotif({
    title: `ppio-demo task ${options.failed ? 'failed' : 'finished'}`,
    body: notifContent,
    onClick: () => {
      console.log('notif clicked')
      windowManager.createWindow({ routePath: taskPageRoute })
      // notif.close() // closing notification causes crash.
    },
  })
  return notif
}
