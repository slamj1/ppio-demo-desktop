import getUserData from '@/services/getUserData'
import getUserJournal from '@services/getUserJournal'

import {
  MUT_SET_USER_DATA,
  MUT_LOGIN,
  MUT_LOGOUT,
  ACT_REFRESH_USER,
  MUT_SET_JOURNAL,
  ACT_GET_JOURNAL,
} from '@/constants/store'

const store = {
  state: {
    uid: '',
    isLogin: true,
    nickname: '',
    balance: 0,
    journal: [],
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
      state.journal = []
    },
    [MUT_SET_JOURNAL](state, journal) {
      state.journal = journal
    },
  },
  actions: {
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
      return getUserJournal().then(
        res => context.commit(MUT_SET_JOURNAL, res),
        err => {
          console.log('get journal error')
          console.log(err)
        },
      )
    },
  },
}

export default store
