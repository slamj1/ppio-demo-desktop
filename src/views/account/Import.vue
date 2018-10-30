<template>
  <div id="account-import">
    <p class="title">Import Account</p>
    <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your seed phrase" v-model="seedPhrase"> </el-input>
    <br>
    <el-button class="confirm-button" v-on:click="goToHome">Confirm</el-button>
    <step-popup :steps="steps"> </step-popup>
  </div>
</template>
<script>
import StepPopup from '@/components/StepPopup'

export default {
  name: 'AccountImport',
  data: () => ({
    seedPhrase: '',
    steps: ['step1', 'step2', 'step3'],
  }),
  methods: {
    goToHome() {
      this.$router.replace('/home')
    },
  },
  components: {
    StepPopup,
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
#account-import {
  padding: 150px 80px 0;
  text-align: center;
  .title {
    font-size: 18px;
    color: $primary-color;
    height: 60px;
    text-align: center;
    font-weight: bold;
  }
  .confirm-button {
    width: 150px;
    margin-top: 40px;
  }
}
</style>
