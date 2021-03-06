<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Sign up</p>
      <div class="attention-wrap">
        <p>
          Your seed phrase and password are VERY IMPORTANT. Once lost, all your data will
          be in danger. Please keep them carefully!
        </p>
      </div>
    </div>
    <div class="form-wrap">
      <template v-if="step === 1">
        <p class="title">Step1. Generate new account</p>
        <el-input
          class="password-input"
          type="password"
          placeholder="Enter your password"
          required
          v-model="password"
        ></el-input>
        <code class="mnemonic-container">{{ mnemonic }}</code>
        <div class="button-wrap">
          <el-button-group class="button-group">
            <el-button size="mini" @click="f_generateAccount">{{
              mnemonic.length > 0 ? 'Regenerate' : 'Generate'
            }}</el-button>
            <el-button size="mini" @click="f_copy">Copy</el-button>
          </el-button-group>
          <el-button type="primary" class="button confirm-button" @click="f_goStep(2)"
            >I have written my seed phrase!</el-button
          >
        </div>
      </template>
      <template v-else>
        <p class="title">Step2.Repeat your seed phrase and password</p>
        <el-input
          class="password-input"
          type="password"
          placeholder="Enter your password"
          required
          v-model="repeatPassword"
        ></el-input>
        <el-input
          type="textarea"
          :autofocus="true"
          :rows="4"
          resize="none"
          placeholder="enter your seed phrase"
          v-model="repeatMnemonic"
          class="seed-phrase-input"
        >
        </el-input>
        <el-alert
          v-show="errorMsg !== ''"
          :title="errorMsg"
          type="error"
          :closable="false"
        ></el-alert>
        <div class="button-wrap" style="text-align: left;">
          <el-button type="primary" class="back-button" plain @click="f_goStep(1)"
            >Back</el-button
          >
          <el-button
            :loading="confirmLoading || startingApp"
            type="primary"
            class="repeat-button"
            @click="f_confirm"
            >Confirm</el-button
          >
        </div>
      </template>
      <p>
        Already have an account?
        <router-link :to="{ name: 'account/import' }">Log in</router-link>
      </p>
    </div>
  </div>
</template>
<script>
import fs from 'fs'
import bip39 from 'bip39'
import { clipboard, remote } from 'electron'
import { login, generateNewAccount } from '../../services/user'
import createUserDir from '../../utils/createUserDir'

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
  props: ['startingApp'],
  methods: {
    f_copy() {
      clipboard.writeText(this.mnemonic)
      this.$message.success({
        message: 'Copy seed phrase success!',
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
              this.$message.success('Save seed phrase success!')
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
      this.confirmLoading = true
      login({ seedphrase: this.repeatMnemonic, password: this.repeatPassword })
        .then(account => {
          const address = account.getAddressString()
          this.confirmLoading = false
          if (this.account.getAddressString() === address) {
            this.$emit('setAccount', account)
            const datadir = createUserDir(address)
            if (datadir) {
              this.$emit('setDatadir', datadir)
              return this.$emit('startApp', true)
            }
            return this.$message.error('Create data directory failed.')
          }
          this.errorMsg = 'Seed phrase or password is wrong'
          return false
        })
        .catch(err => {
          console.error(err)
          this.confirmLoading = false
          this.errorMsg = err.toString()
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';
</style>
