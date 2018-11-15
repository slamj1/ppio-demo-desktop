import {
  login,
  logout,
  getUserData,
  getBalance,
  getUsage,
  getFund,
  getBillingRecords,
  getWalletAddress,
  getMetadata,
  setMetadata,
} from '../services/user'

import {
  MUT_SET_USER_DATA,
  ACT_GET_USER_DATA,
  MUT_SET_USER_META_DATA,
  ACT_GET_USER_META_DATA,
  ACT_SET_USER_META_DATA,
  ACT_LOGIN,
  MUT_LOGIN,
  ACT_LOGOUT,
  MUT_LOGOUT,
  ACT_REFRESH_USER,
  MUT_SET_BILLING_RECORDS,
  ACT_GET_BILLING_RECORDS,
  USAGE_PERCENT_GETTER,
} from '../constants/store'

const store = {
  state: {
    uid: '',
    isLogin: true,
    nickname: '',
    balance: 30,
    fund: 20,
    billingRecords: [],
    avatar: require('@/assets/img/avatar.png'),
    address: '',
    dataDir: '/Volumes/ExtCard/user6',
    usedStorage: 520,
    capacity: 1000,
    metadata: {},
  },
  getters: {
    [USAGE_PERCENT_GETTER]: state => (state.usedStorage / state.capacity) * 100,
  },
  mutations: {
    [MUT_SET_USER_DATA](state, data) {
      console.log('refresh user', data)
      state.uid = data.uid
      state.nickname = data.nickname
      state.balance = data.balance
    },
    [MUT_SET_USER_META_DATA](state, data) {
      console.log('set meta data', data)
      console.log(state)
      state.metadata = data
    },
    [MUT_LOGIN](state) {
      state.isLogin = true
    },
    [MUT_LOGOUT](state) {
      state.isLogin = false
      state.nickname = ''
      state.balance = 0
      state.uid = ''
      state.billingRecords = []
    },
    [MUT_SET_BILLING_RECORDS](state, records) {
      state.billingRecords = records
    },
  },
  actions: {
    [ACT_LOGIN](context, loginData) {
      return login(loginData).then(
        res => {
          context.commit(MUT_LOGIN)
          return context.commit(MUT_SET_USER_DATA, res)
        },
        err => {
          console.log('login error')
          console.log(err)
        },
      )
    },
    [ACT_GET_USER_DATA](context) {
      return Promise.all([getWalletAddress, getBalance, getFund, getUsage])
        .then(values => {
          console.log(values)
          return context.commit(MUT_SET_USER_DATA, {
            uid: values[0],
            balance: values[1],
            fund: values[2],
            usage: values[3],
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    [ACT_LOGOUT](context) {
      return logout().then(
        () => context.commit(MUT_LOGOUT),
        err => {
          console.log('logout error')
          console.log(err)
        },
      )
    },
    [ACT_GET_USER_META_DATA](context) {
      return getMetadata()
        .then(res => context.commit(MUT_SET_USER_META_DATA, res))
        .catch(err => {
          console.log('get metadata failed')
          console.error(err)
        })
    },
    [ACT_SET_USER_META_DATA](context) {
      return setMetadata(context.state.metadata).catch(err => {
        console.log('set metadata failed')
        console.error(err)
      })
    },
    [ACT_REFRESH_USER](context) {
      return getUserData().then(
        res => {
          context.commit(MUT_LOGIN)
          return context.commit(MUT_SET_USER_DATA, res)
        },
        err => {
          console.log('refresh user error')
          console.log(err)
          context.commit(MUT_LOGOUT)
        },
      )
    },
    [ACT_GET_BILLING_RECORDS](context) {
      return getBillingRecords().then(
        res => context.commit(MUT_SET_BILLING_RECORDS, res),
        err => {
          console.log('get billing records error')
          console.log(err)
        },
      )
    },
  },
}

export default store
