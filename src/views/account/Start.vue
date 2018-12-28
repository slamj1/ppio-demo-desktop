<template>
  <div class="start">
    <choose-coin-pool v-if="showChooseCpool" :account="curAccount" @bindCpool="f_bindCpool" @close="f_cancelCpool"></choose-coin-pool>
    <div class="left-content">
      <img src="@/assets/img/back.png" class="logo-img" alt="logo">
      <p class="name">PPDISK-demo</p>
    </div>
    <div class="right-content">
      <router-view @startApp="f_startApp" @setAccount="f_setAccount" @setDatadir="f_setDatadir" :starting-app="startingApp" :cur-account="curAccount"></router-view>
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
    curAccount: null,
    datadir: '',
    bindedCpool: {
      host: '',
      address: '',
    },
    showChooseCpool: false,
    startingApp: false,
  }),
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
    f_startApp(isInit) {
      this.startingApp = true
      console.log(this.bindedCpool)
      console.log(this.showChooseCpool)
      this.f_checkCpool()
        .then(() => {
          if (!this.$isCpoolPackage || this.bindedCpool.host.length > 0) {
            console.log('starting app')
            console.log(this.curAccount)
            const initConfig = {
              datadir: this.datadir,
              privateKey: this.curAccount.getPrivateKeyString(),
            }
            initConfig.cpoolHost = this.bindedCpool.host
            initConfig.cpoolAddress = this.bindedCpool.address
            if (isInit) {
              return initApp(initConfig)
                .then(() => {
                  console.log('daemon inited')
                  return this.$emit('startApp', initConfig)
                })
                .catch(err => {
                  this.startingApp = false
                  console.error(err)
                })
            }
            return this.$emit('startApp', initConfig)
          }
          this.showChooseCpool = true
          return false
        })
        .catch(err => {
          console.error(err)
          this.startingApp = false
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
      this.startingApp = false
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
      this.f_startApp(true)
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
