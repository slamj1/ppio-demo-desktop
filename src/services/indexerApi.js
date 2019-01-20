import axios from 'axios'

import { remote } from 'electron'

const poss = remote.getGlobal('poss')

const resHandler = res => {
  console.log(typeof res.data)
  let resObj = {}
  if (typeof res.data === 'string') {
    try {
      resObj = JSON.parse(res.data)
    } catch (err) {
      console.log(err)
      resObj = res.data
    }
  } else {
    resObj = res.data
  }
  if (resObj.error) {
    console.error('get ppdisk data failed')
    console.error(resObj.error)
    return Promise.reject(resObj.error)
  }
  if (resObj.result && resObj.result.error) {
    console.error('ppdisk RPC method failed')
    console.error(resObj.result.error)
    return Promise.reject(resObj.result.error)
  }
  console.log('execRPC succeed')
  console.log(resObj.result)
  return resObj.result
}

const req = reqBody => {
  const options = {
    url: reqBody.url,
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    data: JSON.stringify({
      jsonrpc: '2.0',
      method: reqBody.method,
      params: reqBody.params,
      id: 1,
    }),
  }
  console.log(options)
  return axios(options)
}

export const queryAccount = address => {
  console.log('getting ppdisk account details')
  console.log(address)
  return req({
    url: poss.baseParams.indexerUrl,
    method: 'QueryAccount',
    params: [address],
  }).then(resHandler)
}

export const getTransferRecords = address => {
  console.log('getting ppdisk account transfer records')
  console.log(address)
  return req({
    url: poss.baseParams.indexerUrl,
    method: 'TransferRecord',
    params: [
      {
        accountID: address,
        start: 0,
        limit: 50,
      },
    ],
  }).then(resHandler)
}

export const getRecChiprice = () =>
  req({
    url: poss.baseParams.indexerUrl,
    method: 'OracleChiPrice',
    params: [],
  }).then(resHandler)
