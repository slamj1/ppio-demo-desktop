'use strict'
import fs from 'fs'
import path from 'path'
// import portscanner from 'portscanner'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import ppioUser, { setRpcPort } from './background/ppiosdk'
import { RPC_PORT, GATEWAY_HOST } from './constants/ports'

// const genPort = () => portscanner.findAPortNotInUse(18000, 19000)
const genPort = () => Promise.resolve(RPC_PORT)

global.ppioUser = ppioUser

// TODO: Support multi-user
global.runningRPCPort = 0

global.initDaemon = (dataDir, privateKey) =>
  // TODO: dynamically allocation rpcport
  ppioUser.initDatadir({ datadir: dataDir }).then(async configFilePath => {
    try {
      const ppioConfig = JSON.parse(fs.readFileSync(configFilePath))
      const newRPCPort = await genPort()
      ppioConfig.RPCPort = newRPCPort
      ppioConfig.Net.TCPPort = ppioConfig.Net.UDPPort = parseInt(
        newRPCPort.toString().slice(1),
      )
      ppioConfig.Bootstrap.IP = GATEWAY_HOST
      console.log('new config generated')
      console.log(ppioConfig)
      fs.writeFileSync(configFilePath, JSON.stringify(ppioConfig))
    } catch (err) {
      console.log('init daemon failed')
      console.err(err)
      return Promise.reject(err)
    }
    return true
  })

global.startDaemon = params => {
  if (global.runningRPCPort !== 0) {
    console.log('daemon already started')
    return Promise.resolve(global.runningRPCPort)
  }

  return ppioUser.daemonStart(Object.assign(params, { bindip: '0.0.0.0' })).then(() => {
    const datadirFiles = fs.readdirSync(params.datadir)
    if (datadirFiles.length > 0 && datadirFiles.indexOf('poss.conf') > -1) {
      const configFilePath = path.join(params.datadir, './poss.conf')
      const ppioConfig = JSON.parse(fs.readFileSync(configFilePath))
      let rpcPort = ppioConfig.RPCPort
      global.runningRPCPort = rpcPort
      setRpcPort(rpcPort)
      console.log('Daemon restarted on port: ', rpcPort)
      return rpcPort
    }
    global.runningRPCPort = 0
    return Promise.reject(new Error('config file not found, daemon start failed!'))
  })
}

global.stopDaemon = () => {
  if (global.runningRPCPort === 0) {
    console.log('No daemon running!')
    return Promise.resolve()
  }
  console.log('stopping daemon for ', global.runningRPCPort)
  return ppioUser
    .daemonStop({ rpcport: global.runningRPCPort })
    .then(() => {
      global.runningRPCPort = 0
      return Promise.resolve()
    })
    .catch(() => {
      global.runningRPCPort = 0
      return Promise.resolve()
    })
}

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
