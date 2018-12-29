<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Log in</p>
      <div class="attention-wrap">
        <p>Your seed phrase and password are VERY IMPORTANT. Once lost, all your data will be in danger. Please keep them carefully!</p>
      </div>
    </div>
    <div class="form-wrap">
      <p class="title">Enter your seed phrase and password</p>
      <el-input type="textarea" :autofocus="true" :rows="4" resize="none" required placeholder="Enter your seed phrase" v-model="mnemonic" class="seed-phrase-input"></el-input>
      <el-input type="password" placeholder="Enter your password" required v-model="password" class="password-input"></el-input>
      <el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>
      <el-button :loading="importing || startingApp" class="login-button" type="primary" @click="f_import">Confirm</el-button>
      <p>Don't have an account? <router-link class="wallet-link" :to="{ name: 'account/create' }">Generate one</router-link></p>
    </div>
  </div>
</template>
<script>
import storage from 'localforage'
import bip39 from 'bip39'
import fs from 'fs'
import path from 'path'
import { USER_STATE_PERSIST_KEY } from '../../constants/constants'
import { MUT_REPLACE_STATE_HOOK } from '../../constants/store'
import { login } from '../../services/user'

export default {
  name: 'import-account',
  data: () => ({
    password: '',
    mnemonic: '',
    errorMsg: '',
    importing: false,
  }),
  props: ['startingApp'],
  methods: {
    f_import() {
      if (!bip39.validateMnemonic(this.mnemonic)) {
        this.$message.error('Seed phrase invalid!')
        return
      }
      if (this.password.length === 0) {
        this.$message.error('Password is empty!')
        return
      }
      this.importing = true
      login({ seedphrase: this.mnemonic, password: this.password })
        .then(account => {
          const address = account.getAddressString()
          console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
          this.$emit('setAccount', account)
          return storage.getItem(`${USER_STATE_PERSIST_KEY}_${address}`).then(val => {
            this.importing = false
            console.log('persisted state got for import page')
            console.log(val)
            if (val && val.dataDir.length > 0 && val.user.uid.length > 0) {
              this.$store.replaceState(val)
              this.$store.commit(MUT_REPLACE_STATE_HOOK)
              this.$emit('setDatadir', val.dataDir)
              if (fs.existsSync(path.resolve(val.dataDir, './poss.conf'))) {
                console.log('user exists, starting app')
                return this.$emit('startApp')
              } else {
                console.log('config file does not exist, initing app')
                return this.$emit('startApp', true)
              }
            }
            console.log('choose data dir')
            return this.$router.push({ name: 'account/choose-dir' })
          })
        })
        .catch(err => {
          this.errorMsg = err.toString()
          console.error(err)
          this.importing = false
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';

.wallet-link {
  cursor: pointer;
}
</style>
