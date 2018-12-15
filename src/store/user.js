import {
  login,
  getAccountDetails,
  getBillingRecords,
  getWalletAddress,
  getIndexData,
  flushIndexdata,
} from '../services/user'
import { stopDaemon } from '../services/daemon'
import { getCpool } from '../services/cpool'
import { checkDefaultBucket } from '../services/bucket'
import {
  MUT_SET_USER_DATA,
  ACT_GET_USER_DATA,
  ACT_GET_ACCOUNT_DETAILS,
  ACT_GET_USER_CPOOL,
  MUT_SET_USER_CPOOL,
  MUT_WRITE_USER_INDEX_DATA,
  ACT_GET_USER_INDEX_DATA,
  ACT_FLUSH_USER_INDEX_DATA,
  ACT_LOGIN,
  MUT_SET_USER_ADDRESS,
  ACT_LOGOUT,
  MUT_SET_BILLING_RECORDS,
  ACT_GET_BILLING_RECORDS,
  ACT_REFRESH_FILE_LIST,
  MUT_CLEAR_USER_DATA,
  ACT_CLEAR_DATA,
} from '../constants/store'
import { APP_BUCKET_NAME } from '../constants/constants'

const initialState = () => ({
  uid: '',
  nickname: '',
  balance: 0,
  funds: 0,
  billingRecords: [],
  bucket: '',
  avatar: require('@/assets/img/avatar.png'),
  address: '',
  cpoolData: {
    cpoolId: '',
    cpoolName: '',
    planName: '',
    usage: 0,
    capacity: 0,
    expires: 0, // timestamp
  },
  metadata: {
    pubkey: '',
    buckets: [],
    fileListData: {},
  },
})

const store = {
  state: initialState,
  mutations: {
    [MUT_SET_USER_DATA](state, data) {
      console.log('setting user data', data)
      state = Object.assign(state, data)
      state.address = state.uid
      console.log(state)
    },
    [MUT_SET_USER_CPOOL](state, cpoolData) {
      console.log('setting user cpool ')
      console.log(cpoolData)
      if (cpoolData) {
        state.cpoolData.cpoolId = cpoolData.cpoolId
        state.cpoolData.usage = cpoolData.usage
        state.cpoolData.capacity = cpoolData.capacity
        state.cpoolData.expires = cpoolData.expires
      } else {
        state.cpoolData = {
          cpoolId: '',
          cpoolName: '',
          planName: '',
          usage: 0,
          capacity: 0,
          expires: 0,
        }
      }
    },
    [MUT_WRITE_USER_INDEX_DATA](state, data) {
      console.log('set meta data', data)
      console.log(state)
      if (data === null) {
        console.error('not passing metadata')
        return
      }
      if (!data.fileListData) {
        data.fileListData = {}
      }
      console.log(data)
      state.metadata = data
    },
    [MUT_SET_BILLING_RECORDS](state, records) {
      if (!records) {
        console.error('not passing billing records')
        return
      }
      state.billingRecords = records || []
    },
    [MUT_CLEAR_USER_DATA](state) {
      console.log('clearing user data')
      const initState = initialState()
      Object.keys(initState).forEach(key => {
        state[key] = initState[key]
      })
    },
  },
  actions: {
    [ACT_LOGIN](context, mnemonic) {
      return login(mnemonic).then(
        account => {
          const address = account.getAddressString()
          context.commit(MUT_SET_USER_ADDRESS, address)
          return account
        },
        err => {
          console.log('login error')
          console.log(err)
          return Promise.reject(err)
        },
      )
    },
    [ACT_GET_USER_DATA](context) {
      console.log('init user data')
      // wrap sdk calls with catch-resolve to prevent errors from interrupting Promise.all()
      return getWalletAddress()
        .then(address => {
          context.commit(MUT_SET_USER_DATA, {
            uid: address,
          })
          return context.dispatch(ACT_GET_USER_CPOOL)
        })
        .then(res => {
          if (!res) {
            return context.dispatch(ACT_GET_ACCOUNT_DETAILS)
          }
          return true
        })
        .then(() => context.dispatch(ACT_GET_USER_INDEX_DATA))
        .then(() => checkDefaultBucket())
        .then(() => context.commit(MUT_SET_USER_DATA, { bucket: APP_BUCKET_NAME }))
        .catch(err => {
          console.error(err)
          return Promise.reject(err)
        })
    },
    /**
     * Get user balance and funds if it is not bound to a coin pool
     * @param context
     * @returns {Promise<((T | string)[] | string)[] | never>}
     */
    [ACT_GET_ACCOUNT_DETAILS](context) {
      // get balance and funds
      return getAccountDetails(context.state.uid).then(res => {
        console.log('balance and funds got: ')
        console.log(res)
        // TODO: handle unlogin case
        return context.commit(MUT_SET_USER_DATA, {
          balance: res.balance,
          funds: res.funds,
        })
      })
    },
    /**
     * Get user's coin pool data
     * @param context
     * @returns {Promise<T | never>}
     */
    [ACT_GET_USER_CPOOL](context) {
      return getCpool(context.state.address).then(res => {
        if (res) {
          context.commit(MUT_SET_USER_CPOOL, res)
          return res
        }
        context.commit(MUT_SET_USER_CPOOL, null)
        return null
      })
    },
    /**
     * Get user metadata
     * @param context
     * @returns {Promise<T | never>}
     */
    [ACT_GET_USER_INDEX_DATA](context) {
      return getIndexData()
        .then(res => {
          console.log('metadata got')
          console.log(res)
          context.dispatch(ACT_REFRESH_FILE_LIST)
          return context.commit(MUT_WRITE_USER_INDEX_DATA, res)
        })
        .catch(err => {
          console.log('get metadata failed')
          console.error(err)
          if (err.error && err.error.message === 'user is not exists') {
            return context.dispatch(ACT_FLUSH_USER_INDEX_DATA, context.state.metadata)
          }
          context.commit(MUT_WRITE_USER_INDEX_DATA, null)
          return Promise.resolve()
        })
    },
    /**
     * Set user metadata
     * @todo: api not provided
     * @param context
     * @param data
     * @returns {Promise<T | never>}
     */
    [ACT_FLUSH_USER_INDEX_DATA](context) {
      console.log('action set user metadata dispatched')
      return flushIndexdata().catch(err => {
        console.log('set metadata failed')
        console.error(err)
        return Promise.reject(err)
      })
    },
    /**
     * Get all billing records
     * @param context
     * @returns {PromiseLike<T | never> | Promise<T | never>}
     */
    [ACT_GET_BILLING_RECORDS](context) {
      return getBillingRecords(context.state.uid).then(
        res => context.commit(MUT_SET_BILLING_RECORDS, res),
        err => {
          console.log('get billing records error')
          console.log(err)
          return Promise.reject(err)
        },
      )
    },
    /**
     * Logout
     * @param context
     * @returns {PromiseLike<T | void> | Promise<T | void>}
     */
    [ACT_LOGOUT](context) {
      return stopDaemon().then(
        () => context.dispatch(ACT_CLEAR_DATA),
        err => {
          console.log('logout error')
          console.log(err)
          return Promise.resolve()
        },
      )
    },
  },
}

export default store
