import { login, logout, getUserData, getBillingRecords } from '../services/user'

import {
  MUT_SET_USER_DATA,
  ACT_LOGIN,
  MUT_LOGIN,
  ACT_LOGOUT,
  MUT_LOGOUT,
  ACT_REFRESH_USER,
  MUT_SET_JOURNAL,
  ACT_GET_JOURNAL,
} from '../constants/store'

const store = {
  state: {
    uid: '',
    isLogin: true,
    nickname: '',
    balance: 0,
    billingRecords: [],
  },
  mutations: {
    [MUT_SET_USER_DATA](state, data) {
      console.log('refresh user', data)
      state.uid = data.uid
      state.nickname = data.nickname
      state.balance = data.balance
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
    [MUT_SET_JOURNAL](state, journal) {
      state.billingRecords = journal
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
    [ACT_LOGOUT](context) {
      return logout().then(
        () => context.commit(MUT_LOGOUT),
        err => {
          console.log('logout error')
          console.log(err)
        },
      )
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
    [ACT_GET_JOURNAL](context) {
      return getBillingRecords().then(
        res => context.commit(MUT_SET_JOURNAL, res),
        err => {
          console.log('get billing records error')
          console.log(err)
        },
      )
    },
  },
}

export default store
