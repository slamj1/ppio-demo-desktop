'use strict'
import { app, protocol, Menu, Tray, nativeImage, shell } from 'electron'
import path from 'path'
import ua from 'universal-analytics'
import poss from './background/ppiosdk'
import TaskManager from './background/taskManager'
import windowManager from './background/windowManager'
import { HOW_TO_USE, DOWNLOAD_PAGE } from './constants/urls'
import { version } from '../package.json'
import { APP_SCHEME } from './constants/constants'

global.gaVisitor = ua('UA-128641089-5')

const isDevelopment = process.env.NODE_ENV !== 'production'

const menuTemplate = [
  {
    label: 'Application',
    submenu: [
      { label: 'About PPIO-Demo', role: 'about' },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', role: 'quit' },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
    ],
  },
  {
    label: 'Window',
    role: 'windowMenu',
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

// if (isDevelopment) {
menuTemplate[0].submenu.push({
  label: 'Devtools',
  accelerator: 'CmdOrCtrl+Alt+I',
  role: 'toggledevtools',
})
// }

global.poss = poss

global.uploadTaskManager = new TaskManager({ type: 'upload' })
global.downloadTaskManager = new TaskManager({ type: 'download' })

let tray = null

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes([APP_SCHEME], { secure: true })

app.removeAsDefaultProtocolClient(APP_SCHEME)
if (process.defaultApp) {
  console.log('process argvs')
  console.log(process.argv)
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_SCHEME, process.execPath, [
      path.resolve(process.argv[1]),
    ])
  }
} else {
  app.setAsDefaultProtocolClient(APP_SCHEME)
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    console.log('second-instance fired')
    console.log(argv)
    if (windowManager.window) {
      if (windowManager.window.isMinimized()) {
        windowManager.window.restore()
      }
      windowManager.window.focus()
    } else if (process.platform === 'win32') {
      windowManager.focusWindow()
    }
    if (process.platform === 'win32' && argv[1]) {
      if (argv[1].match('open-page')) {
        jumpToPage(argv[1])
      }
    }
  })

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

  app.on('browser-window-focus', () => {
    console.log('app browser window focused')
    windowManager.createWindow()
    global.uploadTaskManager.stopUpdating()
    global.downloadTaskManager.stopUpdating()
  })

  app.on('ready', () => {
    console.log('app is ready')
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

    if (process.platform === 'win32') {
      const trayIconPath = isDevelopment
        ? path.resolve('src/assets/tray-icon.png')
        : path.join(path.dirname(__dirname), 'extraResources/tray-icon.png')
      const icon = nativeImage.createFromPath(trayIconPath)
      console.log('tray icon path:', trayIconPath)
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
    }

    app.on('open-url', (e, url) => {
      console.log('open-url fired')
      console.log(e)
      console.log(url)
      if (url.match('open-page')) {
        jumpToPage(url)
      }
    })

    return windowManager.createWindow()
  })
}

function jumpToPage(url) {
  console.log('jumping to page', url)
  const routePath = url.split(`${APP_SCHEME}://open-page`)[1].split('=')[1]
  console.log('sending jump to page to renderer, ', routePath)
  windowManager.createWindow().webContents.send('jump-to-route', routePath)
  // if (isDevelopment) {
  //   windowManager.window.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/${routePath}`)
  // } else {
  //   windowManager.window.loadFile('index.html', { hash: `#${routePath}` })
  // }
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  process.on('message', data => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}
