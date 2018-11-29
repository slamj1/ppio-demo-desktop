import { remote } from 'electron'

export const startDaemon = dataDir => {
  console.log('starting daemon service')
  return remote.getGlobal('startDaemon')({ datadir: dataDir })
}

export const stopDaemon = () => {
  console.log('stopping daemon service')
  return remote.getGlobal('stopDaemon')()
}

export const initDaemon = dataDir => {
  console.log('initing daemon')
  return remote.getGlobal('initDaemon')(dataDir)
}
