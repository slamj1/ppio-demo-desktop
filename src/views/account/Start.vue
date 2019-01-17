<template>
  <div class="start">
    <choose-coin-pool v-if="showChooseCpool" :account="curAccount" @bindCpool="f_bindCpool" @close="f_cancelCpool"></choose-coin-pool>
    <div class="left-content">
      <img src="@/assets/img/back.png" class="logo-img" alt="logo">
      <p class="name">PPDISK-demo</p>
    </div>
    <div class="right-content">
      <router-view @startApp="f_startApp" @setAccount="f_setAccount" @setDatadir="f_setDatadir" :starting-app="startingApp || initializing" :cur-account="curAccount"></router-view>
    </div>
  </div>
</template>
<script>
import ChooseCoinPool from './ChooseCoinPool'
import { iterateCpools } from '../../services/cpool'
import { init as initApp } from '../../services/daemon'

export default {
  name: 'Start',
  data: () => ({
    name: 'test',
    initConfig: {},
    curAccount: null,
    datadir: '',
    bindedCpool: {
      host: '',
      address: '',
    },
    showChooseCpool: false,
    initializing: false,
  }),
  props: ['startingApp'],
  components: {
    ChooseCoinPool,
  },
  methods: {
    f_checkCpool() {
      if (!this.$isCpoolPackage) {
        return Promise.resolve()
      }
      console.log(this.bindedCpool.host)
      if (this.bindedCpool.host.length > 0) {
        return Promise.resolve()
      }
      return iterateCpools(this.curAccount.getAddressString()).then(res => {
        for (let i = 0; i < res.length; i++) {
          if (res[i].binded === true) {
            this.bindedCpool.host = res[i].host
            this.bindedCpool.address = res[i].address
            break
          }
        }
        return res
      })
    },
    f_startApp(payload) {
      this.initializing = true
      console.log(this.bindedCpool)
      console.log(this.showChooseCpool)
      this.f_checkCpool()
        .then(() => {
          console.log('starting app')
          console.log(this.curAccount)
          this.initConfig = {
            datadir: this.datadir,
            privateKey: this.curAccount.getPrivateKeyString(),
            passphrase: payload.passphrase,
          }
          if (!this.$isCpoolPackage || this.bindedCpool.host.length > 0) {
            this.initConfig.cpoolHost = this.$isCpoolPackage
              ? this.bindedCpool.host
              : undefined
            this.initConfig.cpoolAddress = this.$isCpoolPackage
              ? this.bindedCpool.address
              : undefined
            if (payload.isInit) {
              return initApp(this.initConfig)
                .then(() => {
                  console.log('daemon inited')
                  this.initializing = false
                  return this.$emit('startApp', this.initConfig)
                })
                .catch(err => {
                  this.initializing = false
                  console.error(err)
                })
            }
            this.initializing = false
            return this.$emit('startApp', this.initConfig)
          }
          this.initializing = false
          this.showChooseCpool = true
          return false
        })
        .catch(err => {
          console.error(err)
          this.initializing = false
          // this.showChooseCpool = true
        })
    },
    f_setAccount(account) {
      this.curAccount = account
    },
    f_setDatadir(datadir) {
      this.datadir = datadir
    },
    f_cancelCpool() {
      this.showChooseCpool = false
      this.initializing = false
      this.bindedCpool = {
        host: '',
        address: '',
      }
    },
    f_bindCpool(cpoolData) {
      console.log(cpoolData)
      this.bindedCpool.host = cpoolData.host
      this.bindedCpool.address = cpoolData.address
      this.showChooseCpool = false
      this.f_startApp(true, this.initConfig.passphrase)
    },
  },
}
</script>
<style lang="scss" scoped>
.start {
  height: 100%;
  position: relative;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  .left-content {
    width: 60%;
    text-align: center;
    padding-top: 100px;
    background: url('../../assets/img/background.png') no-repeat no-repeat;
    background-size: cover;
    .logo-img {
      width: 350px;
    }
    .name {
      margin-top: 60px;
      font-size: 18px;
      color: #c0c4cc;
      text-align: center;
    }
  }
  .right-content {
    width: 40%;
    background-color: #fff;
    padding: 80px 40px 0 40px;
  }
}
</style>
