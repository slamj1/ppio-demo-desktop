<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Sign up</p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>The Encryption Key is VERY IMPORTANT. Once it's lost, so are your files. Please keep it safe and secret!</p>
      </div>
    </div>
    <div class="form-wrap">
      <template v-if="step==1">
        <p class="title">Step1.Generate your Encryption Key!</p>
        <code>{{seedPhrase}}</code>
        <div class="button-wrap">
          <el-button-group class="button-group">
            <el-button size="mini" @click="f_generate_phrase_seed">ReGenarate Key</el-button>
            <el-button size="mini" @click="f_save">Download</el-button>
            <el-button size="mini" @click="f_copy">Copy</el-button>
          </el-button-group>
          <el-button type="primary" class="button confirm-button" @click="f_go_step(2)">I have written my Encryption key!</el-button>
        </div>
      </template>
      <template v-else>
        <p class="title">Step2.Repeat Your Encryption Key</p>
        <el-input type="textarea" :autofocus="true" :rows="4" resize="none" placeholder="enter your Encryption Key" v-model="repeatSeedPhrase" class="seed-phrase-input"> </el-input>
        <el-alert v-show="errorMsg != ''" :title="errorMsg" type="error" :closable="false"></el-alert>
        <div class="button-wrap" style="text-align: left;">
          <el-button type="primary" class="back-button" plain @click="f_go_step(1)">Back</el-button>
          <el-button :loading="confirmLoading" type="primary" class="repeat-button" @click="f_confirm">Confirm</el-button>
        </div>
      </template>
      <p>Already have an Encryption Key? <router-link :to="{ name: 'account/import'}">Log in</router-link> </p>
    </div>
  </div>
</template>
<script>
import { generatePhraseSeed, login } from '@/services/user'

const { clipboard } = require('electron')
const { dialog } = require('electron').remote
const fs = require('fs')

export default {
  name: 'AccountCreate',
  data: () => ({
    seedPhrase: '',
    repeatSeedPhrase: '',
    step: 1,
    errorMsg: '',
    confirmLoading: false,
  }),
  mounted() {
    this.f_generate_phrase_seed()
  },
  methods: {
    f_copy() {
      clipboard.writeText(this.seedPhrase)
      this.$notify.success({
        title: 'Copy Encryption Key success!',
        duration: 2000,
      })
    },
    f_save() {
      dialog.showSaveDialog(this.$remote.getCurrentWindow(), {}, filename => {
        fs.writeFile(filename, this.seedPhrase, err => {
          if (err) {
            console.log(err)
          } else {
            this.$notify.success({
              title: 'Save Encryption Key success!',
              duration: 2000,
            })
          }
        })
      })
    },
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
      this.errorMsg = ''
    },
    f_confirm() {
      if (this.repeatSeedPhrase === this.seedPhrase) {
        this.confirmLoading = true
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
