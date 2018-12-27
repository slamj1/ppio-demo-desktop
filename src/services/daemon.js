import { remote } from 'electron'

const poss = remote.getGlobal('poss')

/**
 * init poss.conf in datadir
 * @param {string} datadir - data directory
 * @param {object} params - init configuration
 * @param {string} [params.privateKey] - user's private key
 * @param {string} [params.cpoolUrl] - coin pool's url
 * @param {string} [params.cpoolAddress] - coin pool's address
 */
export const init = params => {
  console.log('initing daemon ', params.datadir)
  console.log(params)
  console.log(poss)
  return poss
    .initDaemon({
      datadir: params.datadir,
      walletKey: params.privateKey ? `0x${params.privateKey}` : undefined,
      cpoolUrl: params.cpoolHost || undefined,
      cpoolAddress: params.cpoolAddress || undefined,
    })
    .catch(err => {
      console.error('daemon init failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const startDaemon = (datadir, privateKey) => {
  console.log('starting daemon service')
  return remote
    .getGlobal('startDaemon')({
      datadir: datadir,
      walletKey: privateKey ? `0x${privateKey}` : undefined,
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
