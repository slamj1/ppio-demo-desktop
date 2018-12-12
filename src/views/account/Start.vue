<template>
  <div class="start">
    <choose-coin-pool v-if="showChooseCpool" @confirm="f_bindCpool" @close="f_cancelCpool"></choose-coin-pool>
    <div class="left-content">
      <img src="@/assets/img/back.png" class="logo-img" alt="logo">
      <p class="name">PPDISK-demo</p>
    </div>
    <div class="right-content">
      <router-view @startApp="f_startApp" @setAccount="f_setAccount" :starting-app="startingApp"></router-view>
    </div>
  </div>
</template>
<script>
import ChooseCoinPool from '../../components/ChooseCoinPool'

export default {
  name: 'Start',
  data: () => ({
    name: 'test',
    curAccount: null,
    cpoolBinded: false, // TODO: use api instead
    showChooseCpool: false,
    startingApp: false,
  }),
  components: {
    ChooseCoinPool,
  },
  mounted() {
    console.log('test', this.$remote.getGlobal('shareObject'))
  },
  methods: {
    f_startApp() {
      this.startingApp = true
      console.log(this.cpoolBinded)
      console.log(this.showChooseCpool)
      if (this.cpoolBinded) {
        console.log('starting app')
        console.log(this.curAccount)
        this.startingApp = true
        this.$emit('startApp', this.curAccount)
      } else {
        this.showChooseCpool = true
        this.startingApp = false
      }
    },
    f_setAccount(account) {
      this.curAccount = account
      console.log(this.curAccount)
    },
    f_cancelCpool() {
      this.showChooseCpool = false
      this.cpoolBinded = false
      this.startingApp = false
    },
    f_bindCpool() {
      this.cpoolBinded = true
      this.showChooseCpool = false
      this.f_startApp()
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
