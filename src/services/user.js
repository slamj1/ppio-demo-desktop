import { remote } from 'electron'
import ppwallet from 'ppwallet'
import bip39 from 'bip39'

const poss = remote.getGlobal('poss')

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
      const account = new ppwallet.Account(privKey)
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

export const generateSeedPhrase = () => {
  console.log('calling generateSeedPhrase method')
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
  poss.walletAccount().then(res => {
    console.log(res)
    return res
  })

export const getAccountDetails = walletId => {
  console.log('getting account details for', walletId)
  return poss.accountDetails({ walletId }).then(res => {
    console.log('account detail got')
    return {
      balance: res.Balance,
      funds: res.LockedBalance,
      spent: res.SpentBalance,
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
  poss.purchaseRecords({ walletId }).then(res => {
    console.log('purchase records got: ')
    console.log(res)
    return res.map(item => ({
      timestamp: new Date(item.Timestamp).getTime(),
      product: `${item.Memo || ''} - ${item.Type}`,
      transaction: `${item.Amount}PPCoin`,
    }))
  })

// TODO: what is the unit of chi price? kwei? gwei?
export const getChiPrice = () =>
  poss.chiPrice().then(res => ({
    storage: parseInt(res.StorageChiPrice),
    download: parseInt(res.DownloadChiPrice),
  }))
