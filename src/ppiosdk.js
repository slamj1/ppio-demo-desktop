const path = require('path')
const user = require('ppio_sdk_npm')

/* -------------sdk----------- */
console.log('ppio sdk start')

console.log(user.ppioExe)
user.setRpcPort(18066)
if (process.env.NODE_ENV === 'production') {
  user.ppioExe = user.ppioExe.replace(
    'app.asar',
    'app.asar.unpacked/node_modules/ppio_sdk_npm/dist',
  )
} else {
  user.ppioExe = path.join(process.cwd(), './node_modules/ppio_sdk_npm/dist/bin/ppio')
}
console.log(user.ppioExe)

const baseParams = {
  datadir: '/Volumes/ExtCard/user6',
  bindip: '0.0.0.0',
}

const proxyUser = {}
for (let key in user) {
  if (user.hasOwnProperty(key)) {
    if (typeof user[key] === 'function') {
      proxyUser[key] = params =>
        new Promise((resolve, reject) => {
          user[key](Object.assign({}, params, baseParams), (err, data) => {
            if (err) {
              console.log('ppioCallback err=', err, err.stack) // an error occurred
              reject(err)
            } else {
              console.log('ppioCallback data=', data) // successful response
              resolve(data)
            }
          })
        })
    } else {
      proxyUser[key] = user[key]
    }
  }
}

module.exports = proxyUser
