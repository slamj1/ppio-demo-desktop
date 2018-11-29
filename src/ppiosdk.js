import path from 'path'
import ppio from 'ppio-sdk'
import { GATEWAY_URL } from './constants/ports'

/* -------------sdk----------- */
if (process.env.NODE_ENV === 'production') {
  ppio.setPpioBinPath(
    ppio.ppioBin.replace('app.asar', 'app.asar.unpacked/node_modules/ppio_sdk_npm/dist'),
  )
} else {
  ppio.ppioBin = path.join(process.cwd(), './node_modules/ppio_sdk_npm/dist/bin/ppio')
}
console.log(ppio.ppioBin)

const baseParams = {
  gatewayUrl: GATEWAY_URL,
}

export function setRpcPort(port) {
  baseParams.rpcport = port
}

const proxySdk = {}
for (let key in ppio) {
  if (ppio.hasOwnProperty(key)) {
    if (typeof ppio[key] === 'function' && ppio.rpcMethods.indexOf(key) > -1) {
      proxySdk[key] = params => {
        const completeParams = Object.assign({}, baseParams, params)
        console.log(
          `calling sdk method ${key} with params: ${JSON.stringify(completeParams)}`,
        )
        return ppio[key](completeParams)
      }
    } else {
      proxySdk[key] = ppio[key]
    }
  }
}

export default proxySdk
