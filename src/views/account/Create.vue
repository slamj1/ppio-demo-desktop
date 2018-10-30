<template>
  <div id="account-create">
    <div class="step-1" v-show="step==1">
      <p class="title">Seed Phrase</p>
      <code>this is a phrase word</code>
      <div class="attention-wrap">
        <p class="attention-title">Attention:</p>
        <p>1. DO NOT share this phrase to anyone! These words can be used to steal your account!</p>
        <p>2. You need these phrase words to log in your account. So SAVE them somewhere secret and safe.</p>
      </div>
      <el-button type="text" class="text-button" >Refresh Phrase</el-button>
      <el-button class="confirm-button" v-on:click="goStep(2)">Next</el-button>
    </div>
    <div class="step-2" v-show="step==2">
      <p class="title">Repeat Your Seed Phrase</p>
      <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your seed phrase" v-model="seedPhrase"> </el-input>
      <br>
      <el-button type="text" class="text-button" v-on:click="goStep(1)">back</el-button>
      <el-button class="confirm-button">Confirm</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AccountCreate',
  data: () => ({
    seedPhrase: '',
    step: 1,
  }),
  methods: {
    goStep(step) {
      this.step = step
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
#account-create {
  padding: 100px 80px 0;
  text-align: center;
  .step-2 {
    margin-top: 50px;
    .confirm-button {
      width: 150px;
      margin-top: 40px;
    }
  }
  .title {
    font-size: 18px;
    color: $primary-color;
    height: 60px;
    text-align: center;
    font-weight: bold;
  }
  code {
    display: block;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    min-height: 96px;
    user-select: none;
  }
  .attention-wrap {
    margin-top: 10px;
    text-align: left;
    background-color: #fdf6ec;
    border-radius: 4px;
    padding: 10px;
    color: #e6a23c;
    .attention-title {
      font-size: 16px;
      font-weight: bold;
      margin-top: 0;
    }
    p {
      margin-top: 5px;
    }
  }
  .text-button {
    width: 120px;
  }
  .confirm-button {
    width: 150px;
    margin-top: 10px;
  }
}
</style>
