import { remote } from 'electron'
import getPorts from '../background/getPorts'

const poss = remote.getGlobal('poss')

/**
 * init poss.conf in datadir
 * @param {object} params - init configuration
 * @param {string} params.datadir - data directory
 * @param {string} params.keystorePath - keystore path
 * @param {string} params.passphrase - user passphrase
 * @param {string} [params.cpoolUrl] - coin pool's url, only works in cpool mode
 * @param {string} [params.cpoolAddress] - coin pool's address, only works in cpool mode
 */
export const init = params => {
  console.log('initing daemon')
  console.log(params)
  const initParams = {
    datadir: params.datadir,
    keystore: params.keystorePath,
    'key-passphrase': params.passphrase,
  }
  if (process.env.IS_CPOOL === 'true') {
    initParams['cpool-url'] = params.cpoolHost
    initParams['cpool-account'] = params.cpoolAddress
  }
  return poss.initDaemon(initParams).catch(err => {
    console.error('daemon init failed')
    console.error(err)
    return Promise.reject(err)
  })
}

/**
 * init poss.conf in datadir
 * @param {object} params - init configuration
 * @param {string} params.datadir - data directory
 * @param {string} params.keystorePath - keystore path
 * @param {string} params.passphrase - user passphrase
 */
export const startDaemon = params => {
  console.log('starting daemon service')
  console.log(params)
  const startParams = {
    datadir: params.datadir,
  }
  if (params.keystorePath) {
    startParams.keystore = params.keystorePath
  }
  if (params.passphrase) {
    startParams['key-passphrase'] = params.passphrase
  }
  return getPorts()
    .then(ports => {
      startParams.rpcport = ports.rpcport
      startParams.tcpport = ports.tcpport
      startParams.udpport = ports.tcpport
      return poss.startDaemon(startParams)
    })
    .then(rpcport => {
      poss.setRPCPort(rpcport)
      return rpcport
    })
    .catch(err => {
      console.error('daemon start failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const stopDaemon = () => {
  console.log('stopping daemon service')
  return poss
    .callMethod('StopDaemon')
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
