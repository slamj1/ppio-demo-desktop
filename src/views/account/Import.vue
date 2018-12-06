<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Log in</p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>Your Private Key is VERY IMPORTANT. Once lost, all your data will be in danger. Please keep it carefully!</p>
      </div>
    </div>
    <div class="form-wrap">
      <p class="title">Enter your Private Key</p>
      <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your Private Key" v-model="seedPhrase" class="seed-phrase-input"> </el-input>
      <el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>
      <el-button :loading="logingLoading" class="login-button" type="primary" @click="f_import">Confirm</el-button>
      <p>Don't have an Private Key? <router-link class="wallet-link" :to="{ name: 'account/create' }">Generate one</router-link></p>
    </div>
  </div>
</template>
<script>
import storage from 'localforage'
import { USER_STATE_PERSIST_KEY } from '../../constants/constants'
import { ACT_LOGIN } from '../../constants/store'

export default {
  name: 'import-account',
  data: () => ({
    seedPhrase: '',
    errorMsg: '',
    logingLoading: false,
  }),
  methods: {
    f_import() {
      this.logingLoading = true
      this.$store
        .dispatch(ACT_LOGIN, this.seedPhrase)
        .then(account => {
          const address = account.getAddressString()
          console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
          return storage.getItem(`${USER_STATE_PERSIST_KEY}_${address}`).then(val => {
            if (val && val.dataDir.length > 0 && val.address.length > 0) {
              this.$store.replaceState(val)
              return this.$emit('startApp', account)
            }
            console.log('init user')
            return this.$router.push({ name: 'account/choose-dir' })
          })
        })
        .finally(() => {
          this.logingLoading = false
        })
        .catch(err => {
          this.errorMsg = err.toString()
          console.log(err)
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
