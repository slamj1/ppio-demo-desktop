import { remote } from 'electron'
import ppwallet from 'ppwallet'
import bip39 from 'bip39'
import safeBuffer from 'safe-buffer'

const poss = remote.getGlobal('poss')

export const login = (seedphrase, password) => {
  console.log('calling login method')
  console.log(seedphrase, password)
  return new Promise((resolve, reject) => {
    try {
      const oriKey = bip39.mnemonicToSeedHex(seedphrase, password)
      console.log('orikey:', oriKey)
      const privKey = oriKey
        .split('')
        .filter((char, idx) => !!(idx % 2))
        .join('')
      console.log('privkey:', privKey)
      const account = new ppwallet.Account(safeBuffer.Buffer.from(privKey, 'hex'))
      console.log(account.getPrivateKeyString())
      console.log('address:', account.getAddressString())
      resolve(account)
    } catch (err) {
      console.error('login failed')
      console.error(err)
      reject(err)
    }
  })
}

export const loginWithKeystore = (keyStoreJson, password) => {
  console.log('calling loginWithKeystore method')
  console.log(keyStoreJson)
  console.log(password)
  return new Promise((resolve, reject) => {
    try {
      const account = ppwallet.Account.fromAddress(keyStoreJson.address)
      account.fromKey(keyStoreJson, password)
      console.log(account.getPrivateKeyString())
      console.log('address:', account.getAddressString())
      resolve(account)
    } catch (err) {
      console.error('login failed')
      console.error(err)
      reject(err)
    }
  })
}

export const generateNewAccount = password => {
  console.log('calling generateSeedPhrase method')
  console.log(password)
  const mnemonic = bip39.generateMnemonic()
  console.log(mnemonic)
  const oriKey = bip39.mnemonicToSeedHex(mnemonic, password)
  console.log(oriKey)
  const privKey = oriKey
    .split('')
    .filter((char, idx) => !!(idx % 2))
    .join('')
  console.log(privKey)

  const account = new ppwallet.Account(safeBuffer.Buffer.from(privKey, 'hex'))
  console.log(account.getPrivateKeyString())
  const address = account.getAddressString()
  console.log(address)
  account.mnemonic = mnemonic
  return account
}

export const getWalletAddress = () =>
  poss.walletAccount().then(res => {
    console.log(res)
    return res
  })

export const getAccountDetails = walletId => {
  console.log('getting account details for', walletId)
  return poss
    .accountDetails({ walletId })
    .then(res => {
      console.log('account detail got')
      return {
        balance: res.Balance,
        funds: res.LockedBalance,
        spent: res.SpentBalance,
      }
    })
    .catch(err => {
      if (err.message === 'account not exists') {
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
  return poss.getIndexData().then(res => {
    console.log('user index data got ', typeof res)
    console.log(res)
    /*
    {
      "bucket": "ppio-demo",
      "vpath": "aria1232222-1.34.0.tar.gz",
      "object": "301b47a13c7c4b08579f6e2fdd7d903cabd9da8e9cfdb93a76f7e6dfb0cbe97a",
      "length": 3786225,
      "metadata": "",
      "put_id": "64715dae-930d-4dc9-96eb-1355287ee2f1",
      "ctime": "2018-12-13T05:18:51.919884Z",
      "mtime": "2018-12-13T05:18:51.919884Z",
      "base_index": {
        "object": "301b47a13c7c4b08579f6e2fdd7d903cabd9da8e9cfdb93a76f7e6dfb0cbe97a",
        "length": 3786225,
        "chunks": [
          "301b47a13c7c4b08579f6e2fdd7d903cabd9da8e9cfdb93a76f7e6dfb0cbe97a"
        ]
      }
    }
     */
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
  return poss
    .purchaseRecords({ walletId, start: 0, limit: 50 })
    .then(res => {
      /**
       *
       Amount: "1628400"
       Comment: "lock amount of contract's funds"
       FromAccountID: "ppio1Ykquh4LpQ1k8emVbx29vrCmq4uz5K6zwS"
       Time: 1545279012
       ToAccountID: "ppio1Ykquh4LpQ1k8emVbx29vrCmq4uz5K6zwS"
       */
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
  poss.chiPrice().then(res => ({
    storage: parseInt(res.StorageChiPrice),
    download: parseInt(res.DownloadChiPrice),
  }))
