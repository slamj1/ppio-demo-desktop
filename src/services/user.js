import { remote } from 'electron'
import ppwallet from 'ppwallet'
import bip39 from 'bip39'
import safeBuffer from 'safe-buffer'

const ppioUser = remote.getGlobal('ppioUser')

export const login = seedPhrase => {
  console.log('calling login method')
  return new Promise((resolve, reject) => {
    try {
      const oriKey = bip39.mnemonicToSeedHex(seedPhrase)
      console.log(oriKey)
      const privKey = oriKey
        .split('')
        .filter((char, idx) => !!(idx % 2))
        .join('')
      console.log(privKey)
      const account = new ppwallet.Account(safeBuffer.Buffer.from(privKey, 'hex'))
      console.log(account)
      console.log(account.getPrivateKeyString())
      resolve(account)
    } catch (err) {
      console.error('login failed')
      console.error(err)
      reject(err)
    }
  })
}

export const generatePhraseSeed = () => {
  console.log('calling generatePhraseSeed method')
  const mnemonic = bip39.generateMnemonic()
  console.log(mnemonic)
  const oriKey = bip39.mnemonicToSeedHex(mnemonic)
  console.log(oriKey)
  const privKey = oriKey
    .split('')
    .filter((char, idx) => !!(idx % 2))
    .join('')
  console.log(privKey)

  const account = ppwallet.Account.NewAccount(privKey)
  console.log(account)
  const address = account.getAddress()
  console.log(address)
  account.getPrivateKey()
  account.mnemonic = mnemonic
  return account
}

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

export const getIndexData = () =>
  ppioUser.getIndexData().then(res => {
    console.log('user index data got')
    console.log(res)
    if (res.length > 0) {
      let indexData
      try {
        indexData = JSON.parse(res)
        // index data must be an object
        if (typeof indexData !== 'object') {
          return null
        }
        return indexData
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

// TODO: what is the unit of chi price? kwei? gwei?
export const getChiPrice = () => ppioUser.chiPrice().then(res => parseInt(res))
