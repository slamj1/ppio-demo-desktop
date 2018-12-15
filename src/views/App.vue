<template>
  <div id="app">
    <div class="app-global-loading" v-if="initializing">
      <p>Initializing....</p>
    </div>
    <router-view @startApp="f_startApp"></router-view>
  </div>
</template>

<script>
import fs from 'fs'
import { remote } from 'electron'
import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../constants/constants'
import {
  MUT_REPLACE_STATE_HOOK,
  ACT_GET_USER_DATA,
  MUT_SET_PRIV_KEY,
  MUT_SET_RPC_PORT,
  ACT_LOGOUT,
} from '../constants/store'
import { startDaemon } from '../services/daemon'
import ppwallet from 'ppwallet'

export default {
  name: 'app',
  data() {
    return {
      initializing: true,
    }
  },
  mounted() {
    // get persisted state from storage
    console.log('getting app state from storage')
    storage
      .getItem(APP_STATE_PERSIST_KEY)
      .then(val => {
        console.log('init app state')
        console.log(val)
        if (val) {
          if (val.dataDir.length > 0 && val.address.length > 0) {
            this.$store.replaceState(val)
            this.$store.commit(MUT_REPLACE_STATE_HOOK)
            return val
          }
        }
        return Promise.reject(new Error('not login'))
      })
      .then(persistedState => {
        if (persistedState.privateKey.length > 0) {
          console.log(persistedState.privateKey)
          return this.f_startApp(persistedState.privateKey)
        }
        return Promise.reject(new Error('not login'))
      })
      .catch(err => {
        console.log('data init failed.')
        console.error(err)
        this.initializing = false
        this.$store
          .dispatch(ACT_LOGOUT)
          .then(() => {
            remote.getCurrentWindow().setSize(1000, 670, true)
            return this.$router.push({ name: 'account/import' })
          })
          .catch(() => {})
      })
  },
  methods: {
    f_startApp(account) {
      try {
        fs.readdirSync(this.$store.state.dataDir)
      } catch (err) {
        return Promise.reject(err)
      }
      let privKey = ''
      let address = ''
      if (typeof account === 'string') {
        // account is private key
        privKey = account
        const ppAccount = new ppwallet.Account(account)
        address = ppAccount.getAddressString()
      } else if (account.getPrivateKeyString) {
        privKey = account.getPrivateKeyString()
        address = account.getAddressString()
      }
      console.log(
        `starting app at ${this.$store.state.dataDir}, with private key: ${privKey}`,
      )
      return startDaemon(this.$store.state.dataDir, privKey, address)
        .then(port => {
          this.$store.commit(MUT_SET_RPC_PORT, port)
          this.$store.commit(MUT_SET_PRIV_KEY, privKey)
          return this.$store.dispatch(ACT_GET_USER_DATA)
        })
        .then(() => {
          console.log('data init finished')
          this.initializing = false
          remote.getCurrentWindow().setSize(1000, 670, true)
          if (this.$store.state.address.length > 0) {
            return this.$router.push({ name: 'files' })
          }
          console.log('get user data failed, redirecting to import account page')
          return this.$store
            .dispatch(ACT_LOGOUT)
            .then(() => this.$router.push({ name: 'account/import' }))
        })
    },
  },
}
</script>

<style lang="scss">
@import '../assets/css/_base.scss';

#app {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.app-global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  color: #ccc;
  font-weight: bold;
  font-size: 40px;
}
</style>
