import portScanner from 'portscanner'

export default () => {
  console.log('getting RPC port')
  return portScanner
    .findAPortNotInUse(18000, 20000)
    .then(port => {
      console.log(`rpc port found: ${port}`)
      return port
    })
    .catch(err => {
      console.error(new Error('cannot find port'))
      return Promise.reject(err)
    })
}
