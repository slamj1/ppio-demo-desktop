<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Sign up</p>
      <div class="attention-wrap">
        <p>Your seed phrase and password are VERY IMPORTANT. Once lost, all your data will be in danger. Please keep them carefully!</p>
      </div>
    </div>
    <div class="form-wrap">
      <template v-if="step === 1">
        <p class="title">Step1. Generate new account</p>
        <el-input class="password-input" type="password" placeholder="Enter your password" required v-model="password" ></el-input>
        <code class="mnemonic-container">{{mnemonic}}</code>
        <div class="button-wrap">
          <el-button-group class="button-group">
            <el-button size="mini" @click="f_generateAccount">{{mnemonic.length > 0 ? 'Regenerate' : 'Generate'}}</el-button>
            <el-button size="mini" @click="f_copy">Copy</el-button>
          </el-button-group>
          <el-button type="primary" class="button confirm-button" @click="f_goStep(2)">I have written my seed phrase!</el-button>
        </div>
      </template>
      <template v-else>
        <p class="title">Step2.Repeat your seed phrase and password</p>
        <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your seed phrase" v-model="repeatMnemonic" class="seed-phrase-input"> </el-input>
        <el-input class="password-input" type="password" placeholder="Enter your password" required v-model="repeatPassword" ></el-input>
        <el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>
        <div class="button-wrap" style="text-align: left;">
          <el-button type="primary" class="back-button" plain @click="f_goStep(1)">Back</el-button>
          <el-button :loading="confirmLoading" type="primary" class="repeat-button" @click="f_confirm">Confirm</el-button>
        </div>
      </template>
      <p>Already have an account? <router-link :to="{ name: 'account/import' }">Log in</router-link></p>
    </div>
  </div>
</template>
<script>
import fs from 'fs'
import bip39 from 'bip39'
import { clipboard, remote } from 'electron'
import { ACT_LOGIN } from '../../constants/store'
import storage from 'localforage'
import { login } from '../../services/user'

import { USER_STATE_PERSIST_KEY } from '../../constants/constants'
import { generateNewAccount } from '../../services/user'

const dialog = remote.dialog

export default {
  name: 'create-account',
  data: () => ({
    account: {},
    password: '',
    mnemonic: '',
    repeatMnemonic: '',
    repeatPassword: '',
    step: 1,
    errorMsg: '',
    confirmLoading: false,
  }),
  props: ['curAccount'],
  methods: {
    f_copy() {
      clipboard.writeText(this.mnemonic)
      this.$notify.success({
        title: 'Copy seed phrase success!',
        duration: 2000,
      })
    },
    f_save() {
      dialog.showSaveDialog(this.$remote.getCurrentWindow(), {}, filename => {
        if (filename !== undefined) {
          fs.writeFile(filename, this.mnemonic, err => {
            if (err) {
              console.log(err)
            } else {
              this.$notify.success('Save seed phrase success!')
            }
          })
        }
      })
    },
    f_generateAccount() {
      if (this.password.length === 0) {
        return this.$message.error('Please input your password')
      }
      const newAccount = generateNewAccount(this.password)
      this.account = newAccount
      console.log(this.account.getAddressString())
      this.mnemonic = newAccount.mnemonic
    },
    f_goStep(step) {
      this.step = step
      this.errorMsg = ''
      this.repeatMnemonic = ''
      this.repeatPassword = ''
    },
    f_confirm() {
      if (!bip39.validateMnemonic(this.mnemonic)) {
        this.errorMsg = 'Seed phrase invalid!'
        return
      }
      if (this.password.length === 0) {
        this.errorMsg = 'Password is empty!'
        return
      }
      login({ seedphrase: this.repeatMnemonic, password: this.repeatPassword })
        .then(account => {
          console.log(this.account.getPrivateKeyString())
          console.log(account.getPrivateKeyString())
          console.log(this.account.getAddressString())
          console.log(account.getAddressString())
          if (this.account.getAddressString() === account.getAddressString()) {
            this.confirmLoading = true
            this.$store
              .dispatch(ACT_LOGIN, { seedphrase: this.mnemonic, password: this.password })
              .then(account => {
                const address = account.getAddressString()
                console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
                this.$emit('setAccount', account)
                return storage.getItem(`${USER_STATE_PERSIST_KEY}_${address}`)
              })
              .then(val => {
                console.log('restore app state')
                console.log(val)
                if (val) {
                  if (val.dataDir.length > 0 && val.address.length > 0) {
                    this.$store.replaceState(val)
                    return this.$emit('startApp', this.curAccount)
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
            this.errorMsg = 'Seed phrase or password is wrong'
          }
        })
        .catch(err => {
          this.errorMsg = 'Validation failed.'
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';
</style>
