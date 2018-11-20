'use strict'
const { app, protocol, BrowserWindow } = require('electron')
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib')

global.shareObject = {
  test: 'Hello world!',
}

global.ppioUser = require('./ppiosdk')

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let splashWin, win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
protocol.registerStandardSchemes(['splash'], { secure: true })

function createSplash() {
  splashWin = new BrowserWindow({
    width: 300,
    height: 400,
    titleBarStyle: 'hidden',
  })
  if (isDevelopment) {
    splashWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/splash.html`)
    if (!process.env.IS_TEST) splashWin.webContents.openDevTools()
  } else {
    createProtocol('splash')
    splashWin.loadFile('splash.html')
  }

  splashWin.on('closed', () => {
    splashWin = null
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 670,
    minHeight: 670,
    minWidth: 1000,
    titleBarStyle: 'hidden',
  })

  if (isDevelopment) {
    win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/`)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadFile('index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

function startPpioDaemon() {
  const timer = new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })

  const startDaemon = global.ppioUser.daemonStart().then(res => {
    console.log('daemon started ')
    console.log(res)
    return true
  })
  return Promise.all([timer, startDaemon])
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createSplash()
    startPpioDaemon()
      .then(() => {
        console.log('daemon started')
        splashWin.close()
        return createWindow()
      })
      .catch(err => {
        console.error(err)
      })
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
  createSplash()
  startPpioDaemon()
    .then(() => {
      console.log('daemon started')
      splashWin.close()
      return createWindow()
    })
    .catch(err => {
      console.error(err)
    })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  process.on('message', data => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}
