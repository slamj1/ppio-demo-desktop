<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Log in</p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>DO NOT share this phrase to anyone! These words can be used to steal your account! You need these phrase words to log in your account. So SAVE them somewhere secret and safe.</p>
      </div>
    </div>
    <div class="form-wrap">
      <p class="title">Enter your Seed Phrase</p>
      <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your seed phrase" v-model="seedPhrase" class="seed-phrase-input"> </el-input>
      <el-alert v-show="errorMsg != ''" :title="errorMsg" type="error" :closable="false"></el-alert>
      <el-button class="login-button" type="primary" v-on:click="f_go_home">Confirm</el-button>
      <p>Don't have an account? <router-link :to="{ name: 'account/create'}">Sign up</router-link> </p>
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
  }),
  methods: {
    f_go_home() {
      login(this.seedPhrase)
        .then(
          data => {
            this.$router.replace('/home')
            return console.log(data)
          },
          err => {
            this.errorMsg = err
            return console.log(err)
          },
        )
        .catch(err => {
          console.log(err)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';
</style>
