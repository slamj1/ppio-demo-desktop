import { remote } from 'electron'
import { randomStr } from '../utils/functions'

const ppioUser = remote.getGlobal('ppioUser')

export const login = seedPhrase => {
  console.log('calling login method')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (seedPhrase === 'success') {
        resolve('success')
      } else {
        reject(new Error('fail'))
      }
    }, 1000)
  })
}

export const generatePhraseSeed = () => {
  console.log('calling generatePhraseSeed method')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(randomStr())
    }, 1000)
  })
}

export const logout = () => {}

export const getUserData = () => {}

export const getWalletAddress = () =>
  ppioUser.walletId().then(res => {
    console.log(res)
    return res
  })

export const getBalance = () => Promise.resolve()

export const getFund = () => Promise.resolve()

export const getMetadata = () =>
  ppioUser.metadataGet().then(res => {
    console.log('metadata got')
    console.log(res)
    if (res.length > 0) {
      return JSON.parse(res)
    }
    return {}
  })

export const setMetadata = data => {
  console.log('setting metadata')
  console.log(data)
  return ppioUser.metadataPut(JSON.stringify(data)).then(res => {
    console.log('metadata set')
    console.log(res)
    return res
  })
}

export const getBillingRecords = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          timestamp: 1541141825775,
          product: 'Storage fee - 12.00G - 1000Days',
          transaction: '-100.00PPCoin',
        },
        {
          timestamp: 1541132025775,
          product: 'Download fee - 4M',
          transaction: '-10.00PPCoin',
        },
        {
          timestamp: 1541131825775,
          product: 'Storage fee - 100.00G - 50Days',
          transaction: '-500.00PPCoin',
        },
        {
          timestamp: 1541111525775,
          product: 'Storage fee - 1.00G - 1000Days',
          transaction: '-50.00PPCoin',
        },
      ])
    }, 1000)
  })
