import portScanner from 'portscanner'

export default () => {
  console.log('getting RPC port')
  let rpcport, tcpport
  return portScanner
    .findAPortNotInUse(18000, 20000)
    .then(port => {
      console.log(`rpc port found: ${port}`)
      rpcport = port
      return portScanner.findAPortNotInUse(8000, 10000)
    })
    .then(port => {
      console.log(`tcp port found: ${port}`)
      tcpport = port
      return {
        rpcport,
        tcpport,
      }
    })
    .catch(err => {
      console.error(new Error('cannot find port'))
      return Promise.reject(err)
    })
}
