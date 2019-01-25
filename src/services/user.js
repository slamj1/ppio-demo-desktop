import { remote } from 'electron'
import ppwallet from 'ppwallet'
import bip39 from 'bip39'
import safeBuffer from 'safe-buffer'
import axios from 'axios'
import { queryAccount, getTransferRecords, getRecChiprice } from './indexerApi'
import { VERSION_CHECK } from '../constants/urls'

const poss = remote.getGlobal('poss')

export const login = () => {}

// export const getAccount = (seedphrase, password) => {
//   console.log('calling login method')
//   console.log(seedphrase, password)
//   try {
//     const oriKey = bip39.mnemonicToSeedHex(seedphrase, password)
//     console.log('orikey:', oriKey)
//     const privKey = oriKey
//       .split('')
//       .filter((char, idx) => !!(idx % 2))
//       .join('')
//     console.log('privkey:', privKey)
//     const account = new ppwallet.Account(safeBuffer.Buffer.from(privKey, 'hex'))
//     console.log(account.getPrivateKeyString())
//     console.log('address:', account.getAddressString())
//     return account
//   } catch (err) {
//     console.error('login failed')
//     console.error(err)
//     throw err
//   }
// }

export const getAccountFromKeystore = (keyStoreJson, password) => {
  console.log('getting account from keystore')
  console.log(keyStoreJson)

  try {
    const account = ppwallet.Account.fromAddress(keyStoreJson.address)
    account.fromKey(keyStoreJson, password)
    console.log('address:', account.getAddressString())
    return account
  } catch (err) {
    console.error('get account failed')
    console.error(err)
    throw err
  }
}

export const getAccountFromPrivatekey = privateKey => {
  console.log('calling loginWithKeystore method')

  try {
    const account = new ppwallet.Account(safeBuffer.Buffer.from(privateKey, 'hex'))
    console.log(account.getAddressString())
    return account
  } catch (err) {
    console.error('get account failed')
    console.error(err)
    throw err
  }
}

export const generateNewAccount = password => {
  console.log('calling generateSeedPhrase method')
  const mnemonic = bip39.generateMnemonic()
  const oriKey = bip39.mnemonicToSeedHex(mnemonic, password)
  const privKey = oriKey
    .split('')
    .filter((char, idx) => !!(idx % 2))
    .join('')

  const account = new ppwallet.Account(safeBuffer.Buffer.from(privKey, 'hex'))
  const address = account.getAddressString()
  console.log(address)
  account.mnemonic = mnemonic
  return account
}

export const getWalletAddress = () =>
  poss.callMethod('WalletAccount').then(res => {
    console.log(res)
    return res
  })

export const getAccountDetails = address => {
  console.log('getting account details for', address)
  return queryAccount(address)
    .then(res => {
      console.log('account detail got')
      return {
        balance: res.Balance,
        funds: res.LockedBalance,
        spent: res.SpentBalance,
      }
    })
    .catch(err => {
      if (err.message.match('account not exists')) {
        return Promise.resolve({
          balance: 0,
          funds: 0,
          spent: 0,
        })
      } else {
        return Promise.reject(err)
      }
    })
}

export const getIndexData = () => {
  console.log('getting user index data')
  return poss.callMethod('ExportIndexdata').then(res => {
    console.log('user index data got ', typeof res)
    console.log(res)
    console.log(res['poss_index'])
    return {
      pubkey: res.pubkey,
      buckets: res.buckets,
      fileListData: res['poss_index'],
    }
  })
}

export const flushIndexdata = () => {
  console.log('flushing index data')
  return Promise.resolve()
}

export const getBillingRecords = walletId => {
  console.log('getting billing records')
  return getTransferRecords(walletId)
    .then(res => {
      console.log('purchase records got: ')
      console.log(res)
      return res.map(item => ({
        time: item.Time,
        comment: item.Comment,
        amount: parseInt(item.Amount),
      }))
    })
    .catch(err => {
      console.error('get billing records failed')
      console.error(err)
      return Promise.reject(err)
    })
}

// TODO: what is the unit of chi price? kwei? gwei?
export const getChiPrice = () =>
  getRecChiprice().then(res => ({
    storage: parseInt(res.StorageChiPrice),
    download: parseInt(res.DownloadChiPrice),
  }))

export const checkUpdate = () => {
  console.log('checking update')
  return axios({
    url: VERSION_CHECK,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).then(res => res.data.demo)
}
