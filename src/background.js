'use strict'
import { app, protocol, Menu } from 'electron'
import poss from './background/ppiosdk'
import TaskManager from './background/taskManager'
import windowManager from './background/windowManager'

const menuTemplate = [
  {
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          app.quit()
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
    ],
  },
]

global.poss = poss

global.startDaemon = params =>
  poss
    .startDaemon({
      datadir: params.dataDir,
      'wallet-key': params.privateKey || undefined,
    })
    .then(() => {
      console.log('daemon started')
      return true
    })

global.stopDaemon = () => {
  console.log('stopping daemon')
  return poss
    .stopDaemon()
    .then(port => {
      console.log('stopped daemon on port ', port)
      return port
    })
    .catch(err => {
      console.error('daemon stop failed')
      console.error(err)
      return Promise.resolve()
    })
}

global.uploadTaskManager = new TaskManager({ type: 'upload' })
global.downloadTaskManager = new TaskManager({ type: 'download' })

console.log(global.uploadTaskManager.getTasks())

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log('app is activated')
  windowManager.createWindow()
  global.uploadTaskManager.stopUpdating()
  global.downloadTaskManager.stopUpdating()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('app is ready')
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  return windowManager.createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  process.on('message', data => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}
