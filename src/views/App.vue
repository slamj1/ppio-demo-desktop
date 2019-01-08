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
import { initCpoolData, saveCpoolConfig, clearCpoolConfig } from '../services/cpool'

export default {
  name: 'app',
  data() {
    return {
      initializing: false, // not used
    }
  },
  mounted() {
    console.log('is cpool package: ', this.$isCpoolPackage)
    console.log('getting app state from storage')
    // TODO: do not put cpool initing here
    initCpoolData()
      .then(() => storage.getItem(APP_STATE_PERSIST_KEY))
      .then(val => {
        console.log('init app state')
        console.log(val)
        if (val && val.dataDir.length > 0 && val.user.uid.length > 0) {
          const initConfig = { datadir: val.dataDir }
          if (this.$isCpoolPackage) {
            if (
              val.user.cpoolData.cpoolHost.length > 0 &&
              val.user.cpoolData.cpoolAddress.length > 0
            ) {
              initConfig.cpoolHost = val.user.cpoolData.cpoolHost
              initConfig.cpoolAddress = val.user.cpoolData.cpoolAddress
            } else {
              throw new Error('Cpool not subscribed')
            }
          }
          this.$store.replaceState(val)
          this.$store.commit(MUT_REPLACE_STATE_HOOK)
          return this.f_startApp(initConfig)
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
    f_setCpool(params) {
      console.log('setting cpool')
      if (!this.$isCpoolPackage) {
        return clearCpoolConfig(params.datadir)
      }
      if (!params.cpoolHost || !params.cpoolAddress) {
        return Promise.reject(new Error('no cpool data'))
      }
      console.log('saving cpool data to config file')
      console.log(params.cpoolHost, params.cpoolAddress)
      return saveCpoolConfig({
        datadir: params.datadir,
        host: params.cpoolHost,
        address: params.cpoolAddress,
      }).then(() => {
        console.log('cpool config saved')
        this.$store.commit(MUT_SET_USER_CPOOL, {
          cpoolHost: params.cpoolHost,
          cpoolAddress: params.cpoolAddress,
          cpoolSite: params.cpoolSite,
        })
        return true
      })
    },
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
      console.log(initConfig)
      return this.f_setCpool(initConfig)
        .then(() => {
          console.log('starting daemon')
          return startDaemon(initConfig.datadir, initConfig.privateKey)
        })
        .then(port => {
          console.log('daemon started at port ', port)
          // set data dir to app store
          this.$store.commit(MUT_SET_DATA_DIR, initConfig.datadir)
          // get user account data
          return this.$store.dispatch(ACT_GET_USER_DATA)
        })
        .then(() => {
          console.log('data init finished')
          this.initializing = false
          remote.getCurrentWindow().setSize(1000, 670, false)
          console.log('get user data success')
          this.$vueBus.$emit(this.$events.APP_INIT_FINISHED)
          // restore tasks from background task manager
          this.$store.dispatch(ACT_RESTORE_BG_TASKS)
          // sync task status from poss
          this.$store.dispatch(ACT_SYNC_POSS_TASKS)
          // start polling task status
          this.$store.dispatch(ACT_START_POLLING_TASK_PROGRESS)
          if (!this.$route.path.match('home')) {
            // jumpt to file page if not at home/xx route
            return this.$router.push({ name: 'files' })
          }
          return true
        })
        .catch(err => {
          console.error('get user data failed, redirecting to import account page')
          console.error(err)
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
