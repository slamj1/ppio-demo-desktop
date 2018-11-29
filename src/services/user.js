import { remote } from 'electron'
import { randomStr } from '../utils/functions'

const ppioUser = remote.getGlobal('ppioUser')

export const login = seedPhrase => {
  console.log('calling login method')
  // TODO: get user id by seedPhrase/privateKey
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (seedPhrase.length > 0) {
        resolve(seedPhrase.replace(' ', ''))
      } else {
        reject(new Error('fail'))
      }
    }, 1000)
  })
}

export const generatePhraseSeed = () => {
  console.log('calling generatePhraseSeed method')
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(randomStr())
    }, 1000)
  })
}

export const getUserData = () => {}

export const getWalletAddress = () =>
  ppioUser.walletId().then(res => {
    console.log(res)
    return res
  })

export const getBalance = walletId => {
  console.log('getting balance for ', walletId)
  return ppioUser.walletBalance({ walletId }).then(res => parseInt(res))
}

export const getFunds = walletId => {
  console.log('getting funds for ', walletId)
  return ppioUser.walletFunds({ walletId }).then(res => parseInt(res))
}

export const getMetadata = () =>
  ppioUser.metadataGet().then(res => {
    console.log('metadata got')
    console.log(res)
    if (res.length > 0) {
      let metadata
      try {
        metadata = JSON.parse(res)
        // metadata must be an object
        if (typeof metadata !== 'object') {
          return null
        }
        return metadata
      } catch (err) {
        console.log(err)
        return null
      }
    }
    return null
  })

export const setMetadata = data => {
  console.log('setting metadata')
  console.log(data)
  console.log(JSON.stringify(data))
  return ppioUser.metadataPut({ metadata: JSON.stringify(data) }).then(res => {
    console.log('metadata set')
    console.log(res)
    return res
  })
}

export const getBillingRecords = walletId =>
  //   Timestamp: '2018-11-23T21:36:35+08:00',
  //   Type: 'deposit',
  //   From:
  //   '00250802122102416bc64849b47a4ce3689a4b8da2273794a287c50189cd58753cfc767b3149c9',
  //     To:
  //   '002508021221036e583cb64b75cb6fd7d8ea6f8f952c65813177fa4d69f05a881b57963a4538b5',
  //     Amount: 1000000000,
  //   Gain: true,
  //   Memo: ''
  ppioUser.purchaseRecords({ walletId }).then(res => {
    console.log('purchase records got: ')
    console.log(res)
    return res.map(item => ({
      timestamp: new Date(item.Timestamp).getTime(),
      product: `${item.Memo || ''} - ${item.Type}`,
      transaction: `${item.Amount}PPCoin`,
    }))
  })

export const getChiPrice = () => ppioUser.chiPrice().then(res => parseInt(res))
