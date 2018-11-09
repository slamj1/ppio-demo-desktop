'use strict'
const path = require('path')
const { app, protocol, BrowserWindow } = require('electron')
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib')
const user = require('./sdk/user')

global.shareObject = {
  test: 'Hello world!',
}

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 670,
    minHeight: 670,
    minWidth: 1000,
    titleBarStyle: 'hidden',
  })

  if (isDevelopment) {
    win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/home`)
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
    createWindow()
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
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  process.on('message', data => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}

/* -------------sdk----------- */
console.log('ppio sdk start')
console.log(process.cwd())
process.env.PPIO_HOME = path.join(process.cwd(), './ppio-binary')
console.log(process.env.PPIO_HOME)
const params = {
  datadir: '/Volumes/ExtCard/user6',
  bindip: '0.0.0.0',
}

const callback = (err, data) => {
  if (err) {
    console.log('ppioCallback err=', err, err.stack) // an error occurred
  } else {
    console.log('ppioCallback data=', data) // successful response
  }
}

user.daemonStart(params, callback)
// user.daemonStart(params);

// console.log("-----------------------------------------");
setTimeout(() => {
  user.walletId(params, callback)
}, 4000)

setTimeout(() => {
  user.walletBalance(params, callback)
}, 5000)

setTimeout(() => {
  user.configShow(params, callback)
}, 3000)

// console.log('user.AbortMultipartUpload=' + user.AbortMultipartUpload);
// console.log('user.objectPut=' + user.objectPut);
