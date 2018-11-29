import path from 'path'
import user from 'ppio_sdk_npm'
import { GATEWAY_HOST } from './constants/ports'

/* -------------sdk----------- */
console.log('ppio sdk start')

if (process.env.NODE_ENV === 'production') {
  console.log('production ppio bin path: ', user.ppioExe)
  user.ppioExe = user.ppioExe.replace(
    'app.asar',
    'app.asar.unpacked/node_modules/ppio_sdk_npm/dist',
  )
} else {
  user.ppioExe = path.join(process.cwd(), './node_modules/ppio_sdk_npm/dist/bin/ppio')
}

console.log(user.ppioExe)

const baseParams = {
  bindip: '0.0.0.0',
  gatewayrpchost: GATEWAY_HOST,
}

export function setRpcPort(port) {
  console.log('setting rpc port: ', port)
  return user.setRpcPort(port)
}

const proxyUser = {}
for (let key in user) {
  if (user.hasOwnProperty(key)) {
    if (typeof user[key] === 'function') {
      proxyUser[key] = params =>
        new Promise((resolve, reject) => {
          const completeParams = Object.assign({}, baseParams, params)
          if (key === 'daemonStart' || key === 'daemonStop') {
            delete completeParams.gatewayrpchost
          }
          if (key === 'daemonStart') {
            console.log('daemon starting log from ppiosdk')
            console.log(completeParams)
          }
          user[key](completeParams, (err, data) => {
            if (err) {
              console.log('ppioCallback err=', err, err.stack) // an error occurred
              reject(err)
            } else {
              console.log(JSON.stringify(data)) // successful response
              resolve(data)
            }
          })
        })
    } else {
      proxyUser[key] = user[key]
    }
  }
}

export default proxyUser
