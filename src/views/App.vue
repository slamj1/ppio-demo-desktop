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
  ACT_START_POLLING_TASK_PROGRESS,
  ACT_RESTORE_BG_TASKS,
  ACT_SYNC_POSS_TASKS,
  ACT_GET_USER_DATA,
  MUT_SET_USER_CPOOL,
  ACT_LOGOUT,
  MUT_SET_DATA_DIR,
} from '../constants/store'
import { startDaemon } from '../services/daemon'

export default {
  name: 'app',
  data() {
    return {
      initializing: false,
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
          if (val.dataDir.length > 0 && val.user.uid.length > 0) {
            this.$store.replaceState(val)
            this.$store.commit(MUT_REPLACE_STATE_HOOK)
            return this.f_startApp({ datadir: val.dataDir })
          }
        }
        throw new Error('not login')
      })
      .catch(err => {
        console.log('data init failed.')
        console.error(err)
        this.initializing = false
        this.$store
          .dispatch(ACT_LOGOUT)
          .then(() => {
            remote.getCurrentWindow().setSize(1000, 670, false)
            return this.$router.push({ name: 'account/import' })
          })
          .catch(() => {})
      })
  },
  methods: {
    /**
     * start daemon with account
     * @param {object | string} account
     * @returns {Promise}
     */
    f_startApp(initConfig) {
      try {
        fs.readdirSync(initConfig.datadir)
      } catch (err) {
        return Promise.reject(err)
      }
      console.log(
        `starting app at ${initConfig.datadir}, with private key: ${
          initConfig.privateKey
        }`,
      )
      return startDaemon(initConfig.datadir, initConfig.privateKey)
        .then(port => {
          this.$store.commit(MUT_SET_DATA_DIR, initConfig.datadir)
          if (initConfig.cpoolHost && initConfig.cpoolAddress) {
            this.$store.commit(MUT_SET_USER_CPOOL, {
              cpoolHost: initConfig.cpoolHost,
              cpoolAddress: initConfig.cpoolAddress,
            })
          }
          return this.$store.dispatch(ACT_GET_USER_DATA)
        })
        .then(() => {
          console.log('data init finished')
          this.initializing = false
          remote.getCurrentWindow().setSize(1000, 670, false)
          if (this.$store.state.user.uid.length > 0) {
            console.log('get user data success')
            this.$vueBus.$emit(this.$events.APP_INIT_FINISHED)
            this.$store.dispatch(ACT_RESTORE_BG_TASKS)
            this.$store.dispatch(ACT_SYNC_POSS_TASKS)
            this.$store.dispatch(ACT_START_POLLING_TASK_PROGRESS)
            if (!this.$route.path.match('home')) {
              return this.$router.push({ name: 'files' })
            }
            return true
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
