import {
  login,
  logout,
  getUserData,
  getBalance,
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
  MUT_METADATA_ADD_FILE,
  ACT_METADATA_ADD_FILE,
  MUT_METADATA_REMOVE_FILE,
  ACT_METADATA_REMOVE_FILE,
  MUT_METADATA_MODIFY_FILE,
  ACT_METADATA_MODIFY_FILE,
  ACT_LOGIN,
  MUT_LOGIN,
  ACT_LOGOUT,
  MUT_LOGOUT,
  ACT_REFRESH_USER,
  MUT_SET_BILLING_RECORDS,
  ACT_GET_BILLING_RECORDS,
  ACT_REFRESH_FILE_LIST,
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
    metadata: { fileList: {} },
  },

  mutations: {
    [MUT_SET_USER_DATA](state, data) {
      console.log('refresh user', data)
      state.uid = data.uid
      state.nickname = data.nickname
      state.balance = data.balance
      state.address = data.uid
    },
    [MUT_SET_USER_META_DATA](state, data) {
      console.log('set meta data', data)
      console.log(state)
      if (data === null) {
        return
      }
      if (!data.fileList) {
        data.fileList = {}
      }
      console.log(data)
      state.metadata = data
    },
    [MUT_METADATA_ADD_FILE](state, file) {
      // add a file and its info to metadata
      console.log(state)
      state.metadata.fileList[file.id] = {
        filename: file.filename,
        size: file.size,
        type: file.type,
        isSecure: file.isSecure,
        isPublic: file.isPublic,
      }
    },
    [MUT_METADATA_REMOVE_FILE](state, fileId) {
      delete state.metadata.fileList[fileId]
    },
    /**
     * modify file info in metadata
     * @param state
     * @param payload.fileId {String} id(objectHash) of file
     * @param payload.data {Object} file info to modify
     */
    [MUT_METADATA_MODIFY_FILE](state, payload) {
      const fileState = state.metadata.fileList[payload.fileId]
      state.metadata.fileList[payload.fileId] = Object.assign({}, fileState, payload.data)
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
      console.log('init user data')
      // wrap sdk calls with catch-resolve to prevent errors from interrupting Promise.all()
      const dataGetters = [getWalletAddress, getBalance, getFund].map(func =>
        func()
          .then(res => res)
          .catch(err => {
            console.error(err)
            return Promise.resolve('')
          }),
      )
      return Promise.all(dataGetters)
        .then(values => {
          console.log(values)
          // TODO: handle unlogin case
          return context.commit(MUT_SET_USER_DATA, {
            uid: values[0],
            balance: values[1],
            fund: values[2],
          })
        })
        .then(() => context.dispatch(ACT_GET_USER_META_DATA))
        .catch(err => {
          console.error(err)
          return Promise.reject(err)
        })
    },
    [ACT_GET_USER_META_DATA](context) {
      return getMetadata()
        .then(res => {
          context.commit(MUT_SET_USER_META_DATA, res)
          // refresh file list
          return context.dispatch(ACT_REFRESH_FILE_LIST)
        })
        .catch(err => {
          console.log('get metadata failed')
          console.error(err)
          context.commit(MUT_SET_USER_META_DATA, null)
          return Promise.resolve()
        })
    },
    [ACT_SET_USER_META_DATA](context) {
      console.log('action set user metadata dispatched')
      console.log(context.state.metadata)
      return setMetadata(context.state.metadata).catch(err => {
        console.log('set metadata failed')
        console.error(err)
      })
    },
    [ACT_METADATA_ADD_FILE](context, file) {
      console.log('adding new file to metadata')
      console.log(file)
      context.commit(MUT_METADATA_ADD_FILE, file)
      return context.dispatch(ACT_SET_USER_META_DATA)
    },
    [ACT_METADATA_REMOVE_FILE](context, fileId) {
      context.commit(MUT_METADATA_REMOVE_FILE, fileId)
      return context.dispatch(ACT_SET_USER_META_DATA)
    },
    [ACT_METADATA_MODIFY_FILE](context, payload) {
      context.commit(MUT_METADATA_MODIFY_FILE, payload)
      return context.dispatch(ACT_SET_USER_META_DATA)
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
    [ACT_LOGOUT](context) {
      return logout().then(
        () => context.commit(MUT_LOGOUT),
        err => {
          console.log('logout error')
          console.log(err)
        },
      )
    },
  },
}

export default store
