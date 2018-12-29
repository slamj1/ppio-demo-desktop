import { remote } from 'electron'
import { AVAILABLE_CPOOLS } from '../constants/constants'

const poss = remote.getGlobal('poss')

export const initCpoolData = () => {
  if (process.env.IS_CPOOL === 'true') {
    // init cpool services
    poss.initCpoolServices()
  }
  return Promise.resolve()
}

export const iterateCpools = address => {
  console.log('iterating cpools')
  return Promise.all(
    AVAILABLE_CPOOLS.map(cpoolHost =>
      getCpoolSubscriptionInfo(cpoolHost, address)
        .then(res => {
          console.log(res)
          return {
            host: cpoolHost,
            address: res.account_id,
            binded: true,
          }
        })
        .catch(() =>
          Promise.resolve({
            host: cpoolHost,
            address: '',
            binded: false,
          }),
        ),
    ),
  )
}

export const getCpoolSubscriptionInfo = (cpoolHost, address) => {
  console.log('getting binded cpool ', cpoolHost, address)
  return poss.getCpoolService(cpoolHost).getSubscriptionInfo(address)
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
