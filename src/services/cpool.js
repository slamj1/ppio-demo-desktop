import { remote } from 'electron'

const poss = remote.getGlobal('poss')

export const initCpoolData = () => {
  if (process.env.IS_CPOOL === 'true') {
    // init cpool services
    return poss
      .initCpoolServices([
        {
          host: 'http://api.ppool.pp.io',
          site: 'http://ppool.pp.io',
        },
      ])
      .then(res => {
        console.log(res)
        return res
      })
  }
  return Promise.resolve()
}

export const iterateCpools = address => {
  console.log('iterating cpools')
  console.log(poss.cpoolServices)
  return Promise.all(
    Object.keys(poss.cpoolServices).map(host => {
      const cpoolService = poss.getCpoolService(host)
      return getCpoolSubscriptionInfo(host, address)
        .then(res => {
          console.log(res)
          return {
            host,
            site: cpoolService.site,
            address: res.account_id,
            binded: true,
          }
        })
        .catch(() =>
          Promise.resolve({
            host,
            site: cpoolService.site,
            address: '',
            binded: false,
          }),
        )
    }),
  )
}

export const getCpoolSubscriptionInfo = (cpoolHost, address) => {
  console.log('getting binded cpool ', cpoolHost, address)
  console.log(poss.getCpoolService(cpoolHost))
  return poss.getCpoolService(cpoolHost).getSubscriptionInfo(address)
  // const reqBody = {
  //   url: `${cpoolHost}/api/plan/subscribe_info`,
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json',
  //   },
  //   data: {
  //     account_id: address,
  //   },
  // }
  // console.log(reqBody)
  // return axios(reqBody)
  // {"url":"http://api.ppool.pp.io/api/plan/subscribe_info","method":"POST","headers":{"Content-Type":"application/json","Accept":"application/json"},"data":"account_id=ppio1StYYLZDBh7FUw2WedqtvT1HUw43iojzxp"}
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
