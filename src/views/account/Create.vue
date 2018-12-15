<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Sign up</p>
      <div class="attention-wrap">
        <p>The Encryption Key is VERY IMPORTANT. Once it's lost, so are your files. Please keep it safe and secret!</p>
      </div>
    </div>
    <div class="form-wrap">
      <template v-if="step === 1">
        <p class="title">Step1. Generate your Encryption Key!</p>
        <code>{{privateKey}}</code>
        <div class="button-wrap">
          <el-button-group class="button-group">
            <el-button size="mini" @click="f_generatePhraseSeed">ReGenarate</el-button>
            <el-button size="mini" @click="f_copy">Copy</el-button>
          </el-button-group>
          <el-button type="primary" class="button confirm-button" @click="f_go_step(2)">I have written my Encryption key!</el-button>
        </div>
      </template>
      <template v-else>
        <p class="title">Step2.Repeat Your Encryption Key</p>
        <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your Encryption Key" v-model="repeatPrivateKey" class="seed-phrase-input"> </el-input>
        <el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>
        <div class="button-wrap" style="text-align: left;">
          <el-button type="primary" class="back-button" plain @click="f_go_step(1)">Back</el-button>
          <el-button :loading="confirmLoading" type="primary" class="repeat-button" @click="f_confirm">Confirm</el-button>
        </div>
      </template>
      <p>Already have an Encryption Key? <router-link :to="{ name: 'account/import' }">Log in</router-link></p>
    </div>
  </div>
</template>
<script>
import fs from 'fs'
import { clipboard, remote } from 'electron'
import { ACT_LOGIN } from '../../constants/store'
import storage from 'localforage'

import { USER_STATE_PERSIST_KEY } from '../../constants/constants'
import { generateSeedPhrase } from '../../services/user'

const dialog = remote.dialog

export default {
  name: 'create-account',
  data: () => ({
    account: {},
    privateKey: '',
    repeatPrivateKey: '',
    step: 1,
    errorMsg: '',
    confirmLoading: false,
  }),
  mounted() {
    this.f_generatePhraseSeed()
  },
  methods: {
    f_copy() {
      clipboard.writeText(this.privateKey)
      this.$notify.success({
        title: 'Copy Encryption Key success!',
        duration: 2000,
      })
    },
    f_save() {
      dialog.showSaveDialog(this.$remote.getCurrentWindow(), {}, filename => {
        if (filename !== undefined) {
          fs.writeFile(filename, this.privateKey, err => {
            if (err) {
              console.log(err)
            } else {
              this.$notify.success({
                title: 'Save Encryption Key success!',
                duration: 2000,
              })
            }
          })
        }
      })
    },
    f_generatePhraseSeed() {
      const newAccount = generateSeedPhrase()
      this.account = newAccount
      this.privateKey = newAccount.getPrivateKeyString()
    },
    f_go_step(step) {
      this.step = step
      this.errorMsg = ''
    },
    f_confirm() {
      if (this.repeatPrivateKey === this.privateKey) {
        this.confirmLoading = true
        this.$store
          .dispatch(ACT_LOGIN, this.privateKey)
          .then(account => {
            const address = account.getAddressString()
            console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
            return storage.getItem(`${USER_STATE_PERSIST_KEY}_${address}`)
          })
          .then(val => {
            console.log('restore app state')
            console.log(val)
            if (val) {
              if (val.dataDir.length > 0 && val.address.length > 0) {
                this.$store.replaceState(val)
                return this.$emit('startApp')
              }
            }
            console.log('init user')
            return this.$router.push({ name: 'account/choose-dir' })
          })
          .finally(() => {
            this.confirmLoading = false
          })
          .catch(err => {
            this.errorMsg = err.toString()
            console.log(err)
          })
      } else {
        this.errorMsg = 'Repeat Error'
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';
</style>
