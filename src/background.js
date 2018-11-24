'use strict'
const { app, protocol, BrowserWindow } = require('electron')
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib')
const ppioUser = require('./ppiosdk')

global.shareObject = {
  test: 'Hello world!',
}

global.ppioUser = ppioUser

global.daemonStarted = false

global.startDaemon = params => {
  if (global.daemonStarted) {
    return Promise.resolve(true)
  }
  return ppioUser.daemonStart(params).then(() => {
    global.daemonStarted = true
    return false
  })
}

global.stopDaemon = params =>
  ppioUser.daemonStop(params).then(() => {
    global.daemonStarted = false
    return true
  })

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
protocol.registerStandardSchemes(['splash'], { secure: true })

function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 300,
    // frame: false,
    // width: 1000,
    // height: 670,
    titleBarStyle: 'hidden',
  })

  if (isDevelopment) {
    win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/splash`)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadFile('index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    return createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // await installVueDevtools()
  }
  return createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  process.on('message', data => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}
