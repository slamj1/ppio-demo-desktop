'use strict'
import {
  app,
  protocol,
  Menu,
  globalShortcut,
  BrowserWindow,
  Tray,
  nativeImage,
  shell,
} from 'electron'
import path from 'path'
import poss from './background/ppiosdk'
import TaskManager from './background/taskManager'
import windowManager from './background/windowManager'
import { HOW_TO_USE, DOWNLOAD_PAGE } from './constants/urls'
import { version } from '../package.json'
import { APP_SCHEME } from './constants/constants'

const menuTemplate = [
  {
    label: 'Application',
    submenu: [
      { label: 'About PPIO-Demo', selector: 'orderFrontStandardAboutPanel:' },
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
  {
    label: 'Help',
    submenu: [
      {
        label: 'How to use?',
        click: function() {
          shell.openExternal(HOW_TO_USE)
        },
      },
      {
        label: `Check update (v${version})`,
        click: function() {
          shell.openExternal(DOWNLOAD_PAGE)
        },
      },
    ],
  },
]

global.poss = poss

global.uploadTaskManager = new TaskManager({ type: 'upload' })
global.downloadTaskManager = new TaskManager({ type: 'download' })

const isDevelopment = process.env.NODE_ENV !== 'production'

let tray = null

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes([APP_SCHEME], { secure: true })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && process.platform !== 'win32') {
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

  const trayIconPath = isDevelopment
    ? path.resolve('src/assets/tray-icon.png')
    : path.resolve('extraResources/tray-icon.png')
  const icon = nativeImage.createFromPath(trayIconPath)
  console.log(trayIconPath)
  tray = new Tray(icon)
  tray.setToolTip('PPIO-Demo')
  tray.setHighlightMode('always')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    windowManager.focusWindow()
  })

  globalShortcut.register('CommandOrControl+Alt+I', () => {
    console.log('open devtools')
    let focusWin = BrowserWindow.getFocusedWindow()
    focusWin && focusWin.toggleDevTools()
  })
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
