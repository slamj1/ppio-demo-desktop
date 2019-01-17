<template>
  <div id="app" @dragover="f_onDragover">
    <el-dialog
        class="passphrase-dialog"
        title="Need passphrase"
        :visible.sync="needPassphrase"
        width="50%"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="handlePassphraseClose">
      <el-input class="passphrase-input" type="password" v-model="passphrase" @keyup.native.enter="f_startAppWithPassphrase"></el-input>
      <el-alert class="passphrase-alert" v-show="passphraseErrMsg.length > 0" type="error" :closable="false">{{passphraseErrMsg}}</el-alert>
      <span slot="footer" class="dialog-footer">
        <el-button @click="f_goImport">Re-import</el-button>
        <el-button type="primary" @click="f_startAppWithPassphrase" :loading="initializing">OK</el-button>
      </span>
    </el-dialog>
    <router-view @startApp="f_startApp" :startingApp="initializing"></router-view>
  </div>
</template>

<script>
import fs from 'fs'
import path from 'path'
import { remote } from 'electron'
import storage from '../utils/storage'
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
import { getAccountFromKeystore } from '../services/user'

const poss = remote.getGlobal('poss')

export default {
  name: 'app',
  data() {
    return {
      initializing: false, // not used
      needPassphrase: false,
      passphrase: '',
      startDaemonConfig: null,
      passphraseErrMsg: '',
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
          .then(() => this.$router.push({ name: 'account/import' }))
          .catch(() => {})
      })
  },
  methods: {
    handlePassphraseClose() {
      return false
    },
    f_onDragover(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'none'
    },
    f_setCpool(params) {
      console.log('setting cpool')
      if (!this.$isCpoolPackage) {
        return clearCpoolConfig(params.datadir)
      }
      if (!params.cpoolHost || !params.cpoolAddress) {
        throw new Error('no cpool data')
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
    f_goImport() {
      this.$router.push({ name: 'account/import' })
    },
    /**
     * start daemon with account
     * @param {object | string} account
     * @returns {Promise}
     */
    f_startAppWithPassphrase() {
      console.log(this.passphrase)
      if (this.passphrase.length === 0) {
        this.passphraseErrMsg = 'Passphrase required.'
        return null
      }
      this.f_startApp(
        Object.assign({}, this.startDaemonConfig, { passphrase: this.passphrase }),
      )
    },
    f_startApp(initConfig) {
      if (!fs.existsSync(initConfig.datadir)) {
        throw new Error('Data dir does not exist')
      }
      console.log('test passphrase')
      this.initializing = true
      if (poss.runningDaemonPort === 0 && !initConfig.passphrase) {
        console.log('no passphrase')
        this.startDaemonConfig = initConfig
        this.needPassphrase = true
        this.initializing = false
        return null
      }
      if (poss.runningDaemonPort === 0 && !initConfig.privateKey) {
        // check whether password and keystore file is valid
        try {
          const keystorePath = path.resolve(initConfig.datadir, 'wallet/keystore.dat')
          const keystoreStr = fs.readFileSync(keystorePath)
          const keystoreJson = JSON.parse(keystoreStr)
          console.log(keystoreJson)
          getAccountFromKeystore(keystoreJson, initConfig.passphrase)
          // passphrase valid
          this.needPassphrase = false
          this.passphrase = ''
          this.passphraseErrMsg = ''
        } catch (err) {
          this.initializing = false
          if (err.message.match('wrong passphrase')) {
            this.passphraseErrMsg = 'Wrong passphrase.'
            this.needPassphrase = true
            this.passphrase = ''
            return null
          }
          throw err
        }
      }
      console.log(
        `starting app at ${initConfig.datadir}, with passphrase: ${
          initConfig.passphrase
        }, and private key: ${initConfig.privateKey}`,
      )
      console.log(initConfig)
      return this.f_setCpool(initConfig)
        .then(() => {
          console.log('starting daemon')
          return startDaemon(
            initConfig.datadir,
            initConfig.passphrase,
            initConfig.privateKey,
          )
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
          console.log('get user data success')
          this.$vueBus.$emit(this.$events.APP_INIT_FINISHED)
          // restore tasks from background task manager
          this.$store.dispatch(ACT_RESTORE_BG_TASKS)
          // sync task status from poss
          this.$store.dispatch(ACT_SYNC_POSS_TASKS)
          // start polling task status
          this.$store.dispatch(ACT_START_POLLING_TASK_PROGRESS)
          this.initializing = false
          if (!this.$route.path.match('home')) {
            // jumpt to file page if not at home/xx route
            return this.$router.push({ name: 'files' })
          }
          return true
        })
        .catch(err => {
          console.error('get user data failed, redirecting to import account page')
          console.error(err)
          this.$message.error('App start failed.')
          this.initializing = false
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
.passphrase-dialog {
  -webkit-app-region: no-drag;
}
.passphrase-input {
  margin-bottom: 20px;
}
</style>
