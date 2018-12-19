import { remote } from 'electron'

export const startDaemon = (dataDir, privateKey, address) => {
  console.log('starting daemon service')
  return remote.getGlobal('startDaemon')({
    dataDir,
    privateKey: `0x${privateKey}`,
    address,
  })
  // return Promise.resolve(18000)
}

export const stopDaemon = () => {
  console.log('stopping daemon service')
  return remote.getGlobal('stopDaemon')()
}
