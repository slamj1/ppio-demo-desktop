import axios from 'axios'
import { remote } from 'electron'
import { AVAILABLE_CPOOLS } from '../constants/constants'

const poss = remote.getGlobal('poss')

export const iterateCpools = address => {
  console.log('iterating cpools')
  return Promise.all(
    AVAILABLE_CPOOLS.map(cpoolHost =>
      getCpoolSubscriptionInfo(cpoolHost, address)
        .then(res => {
          console.log(res)
          if (res.err_code === 0) {
            return {
              host: cpoolHost,
              address: res.data.account_id,
              binded: true,
            }
          }
          return {
            host: cpoolHost,
            address: '',
            binded: false,
          }
        })
        .catch(() => Promise.resolve({ binded: false })),
    ),
  )
}

export const getCpoolSubscriptionInfo = (cpoolUrl, address) => {
  console.log('getting binded cpool ', cpoolUrl, address)
  const reqUrl =
    process.env.NODE_ENV === 'development'
      ? '/cpool/api/plan/subscribe_info'
      : `${cpoolUrl}/cpool/api/plan/subscribe_info`
  return axios({
    url: reqUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: {
      account_id: address,
    },
  }).then(res => res.data)
}

export const saveCpoolConfig = ({ datadir, host, address }) => {
  console.log('saving cpool data to config file')
  console.log(host, address)
  return poss.setCpool({ datadir, host, address })
}

export const clearCpoolConfig = datadir => {
  console.log('clearing cpool data for config file')
  return poss.clearCpool(datadir)
}
