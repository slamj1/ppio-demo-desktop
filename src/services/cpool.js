import { remote } from 'electron'
// import { AVAILABLE_CPOOLS } from '../constants/constants'

const poss = remote.getGlobal('poss')

export const initCpoolData = () => {
  if (process.env.IS_CPOOL === 'true') {
    // init cpool services
    return poss.initCpoolServices().then(res => {
      console.log(res)
      return res
    })
  }
  return Promise.resolve()
}

export const iterateCpools = address => {
  console.log('iterating cpools')
  return Promise.all(
    poss.cpoolList.map(cpool =>
      getCpoolSubscriptionInfo(cpool.host, address)
        .then(res => {
          console.log(res)
          return {
            host: cpool.host,
            site: cpool.site,
            address: res.account_id,
            binded: true,
          }
        })
        .catch(() =>
          Promise.resolve({
            host: cpool.host,
            site: cpool.site,
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
