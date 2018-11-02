<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Log in</p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>The Encryption Key is VERY IMPORTANT. Once it's lost, so are your files. Please keep it safe and secret!</p>
      </div>
    </div>
    <div class="form-wrap">
      <p class="title">Enter your Encryption Key</p>
      <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your Encryption Key" v-model="seedPhrase" class="seed-phrase-input"> </el-input>
      <el-alert v-show="errorMsg != ''" :title="errorMsg" type="error" :closable="false"></el-alert>
      <el-button :loading="logingLoading" class="login-button" type="primary" @click="f_go_home">Confirm</el-button>
      <p>Don't have an Encryption Key? <router-link :to="{ name: 'account/create'}">Generate it</router-link> </p>
    </div>
  </div>
</template>
<script>
import { login } from '@/services/user'

export default {
  name: 'AccountImport',
  data: () => ({
    seedPhrase: '',
    errorMsg: '',
    logingLoading: false,
  }),
  methods: {
    f_go_home() {
      this.logingLoading = true
      login(this.seedPhrase)
        .then(
          data => {
            this.$router.replace('/home')
            return console.log(data)
          },
          err => {
            this.errorMsg = err.toString()
            return console.log(err)
          },
        )
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
</style>
