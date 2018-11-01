<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Sign up</p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>DO NOT share this phrase to anyone! These words can be used to steal your account! You need these phrase words to log in your account. So SAVE them somewhere secret and safe.</p>
      </div>
    </div>
    <div class="form-wrap">
      <template v-if="step==1">
        <p class="title">Generate Your Seed Phrase!</p>
        <code>{{seedPhrase}}</code>
        <div class="button-wrap">
          <el-button type="primary" class="button plain-button" plain v-on:click="f_generate_phrase_seed">Refresh Phrase</el-button>
          <el-button type="primary" class="button confirm-button" v-on:click="f_go_step(2)">Next</el-button>
        </div>
      </template>
      <template v-else>
        <p class="title">Repeat Your Seed Phrase</p>
        <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your seed phrase" v-model="repeatSeedPhrase" class="seed-phrase-input"> </el-input>
        <el-alert v-show="errorMsg != ''" :title="errorMsg" type="error" :closable="false"></el-alert>
        <div class="button-wrap">
          <el-button type="primary" class="button plain-button" plain v-on:click="f_go_step(1)">Back</el-button>
          <el-button type="primary" class="button confirm-button" v-on:click="f_confirm">Confirm</el-button>
        </div>
      </template>
      <p>Don't have an account? <router-link :to="{ name: 'account/import'}">Login up</router-link> </p>
    </div>
  </div>
</template>
<script>
import { generatePhraseSeed } from '@/services/user'

export default {
  name: 'AccountCreate',
  data: () => ({
    seedPhrase: '',
    repeatSeedPhrase: '',
    step: 1,
    errorMsg: '',
  }),
  mounted() {
    this.f_generate_phrase_seed()
  },
  methods: {
    f_generate_phrase_seed() {
      generatePhraseSeed()
        .then(
          data => {
            console.log(data)
            return (this.seedPhrase = data)
          },
          err => console.log(err),
        )
        .catch(err => {
          console.log(err)
        })
    },
    f_go_step(step) {
      this.step = step
    },
    f_confirm() {
      if (this.repeatSeedPhrase === this.seedPhrase) {
        this.$router.replace('/home')
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
