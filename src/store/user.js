import {
  login,
  getBalance,
  getFund,
  getBillingRecords,
  getWalletAddress,
  getMetadata,
  setMetadata,
} from '../services/user'
import { stopDaemon } from '../services/daemon'

import {
  MUT_SET_USER_DATA,
  ACT_GET_USER_DATA,
  MUT_WRITE_USER_META_DATA,
  ACT_GET_USER_META_DATA,
  ACT_SET_USER_META_DATA,
  // MUT_METADATA_ADD_FILE,
  ACT_METADATA_ADD_FILE,
  // MUT_METADATA_REMOVE_FILE,
  ACT_METADATA_REMOVE_FILE,
  // MUT_METADATA_MODIFY_FILE,
  ACT_METADATA_MODIFY_FILE,
  ACT_LOGIN,
  ACT_LOGOUT,
  MUT_SET_BILLING_RECORDS,
  ACT_GET_BILLING_RECORDS,
  ACT_REFRESH_FILE_LIST,
  MUT_CLEAR_USER_DATA,
  ACT_CLEAR_DATA,
} from '../constants/store'

const initialState = () => ({
  uid: '',
  nickname: '',
  balance: 0,
  fund: 0,
  billingRecords: [],
  avatar: require('@/assets/img/avatar.png'),
  address: '',
  metadata: { fileList: {} },
})

const store = {
  state: initialState,
  mutations: {
    [MUT_SET_USER_DATA](state, data) {
      console.log('refresh user', data)
      state.uid = data.uid || ''
      state.nickname = data.nickname || ''
      state.balance = data.balance || 0
      state.address = data.uid || ''
    },
    [MUT_WRITE_USER_META_DATA](state, data) {
      console.log('set meta data', data)
      console.log(state)
      if (data === null) {
        console.error('not passing metadata')
        return
      }
      if (!data.fileList) {
        data.fileList = {}
      }
      console.log(data)
      state.metadata = data
    },
    // [MUT_METADATA_ADD_FILE](state, file) {
    //   // add a file and its info to metadata
    //   console.log(state)
    //   state.metadata.fileList[file.id] = {
    //     filename: file.filename,
    //     size: file.size,
    //     type: file.type,
    //     isSecure: file.isSecure,
    //   }
    // },
    // [MUT_METADATA_REMOVE_FILE](state, fileId) {
    //   delete state.metadata.fileList[fileId]
    // },
    /**
     * modify file info in metadata
     * @param state
     * @param payload.fileId {String} id(objectHash) of file
     * @param payload.data {Object} file info to modify
     */
    // [MUT_METADATA_MODIFY_FILE](state, payload) {
    //   console.log('mutation file metadata ', payload.fileId, payload.data)
    //   const fileMetadata = state.metadata.fileList[payload.fileId]
    //   state.metadata.fileList[payload.fileId] = Object.assign(
    //     {},
    //     fileMetadata,
    //     payload.data,
    //   )
    // },
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
    [ACT_LOGIN](context, loginData) {
      return login(loginData).then(
        res => context.commit(MUT_SET_USER_DATA, res),
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
          console.log('metadata got')
          console.log(res)
          context.commit(MUT_WRITE_USER_META_DATA, res)
          // refresh file list
          return context.dispatch(ACT_REFRESH_FILE_LIST)
        })
        .catch(err => {
          console.log('get metadata failed')
          console.error(err)
          if (err.error.message === 'user is not exists') {
            return context
              .dispatch(ACT_SET_USER_META_DATA, context.state.metadata)
              .then(() => context.dispatch(ACT_REFRESH_FILE_LIST))
          }
          context.commit(MUT_WRITE_USER_META_DATA, null)
          return Promise.resolve()
        })
    },
    [ACT_SET_USER_META_DATA](context, data) {
      console.log('action set user metadata dispatched')
      console.log(data)
      return setMetadata(data)
        .then(() => context.commit(MUT_WRITE_USER_META_DATA, data))
        .then(() => context.dispatch(ACT_REFRESH_FILE_LIST))
        .catch(err => {
          console.log('set metadata failed')
          console.error(err)
        })
    },
    [ACT_METADATA_ADD_FILE](context, file) {
      const newMetadata = JSON.parse(JSON.stringify(context.state.metadata)) // deep clone
      newMetadata.fileList[file.id] = {
        filename: file.filename,
        size: file.size,
        type: file.type,
        isSecure: file.isSecure,
      }
      return context.dispatch(ACT_SET_USER_META_DATA, newMetadata)
    },
    [ACT_METADATA_REMOVE_FILE](context, fileId) {
      const newMetadata = JSON.parse(JSON.stringify(context.state.metadata)) // deep clone
      delete newMetadata.fileList[fileId]
      return context.dispatch(ACT_SET_USER_META_DATA, newMetadata)
    },
    [ACT_METADATA_MODIFY_FILE](context, payload) {
      const newMetadata = JSON.parse(JSON.stringify(context.state.metadata)) // deep clone
      const oriFileMetadata = newMetadata.fileList[payload.fileId]
      newMetadata.fileList[payload.fileId] = Object.assign(
        {},
        oriFileMetadata,
        payload.data,
      )
      return context.dispatch(ACT_SET_USER_META_DATA, newMetadata)
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
