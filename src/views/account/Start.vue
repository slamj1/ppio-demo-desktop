<template>
  <div class="start">
    <div class="left-content">
      <img src="@/assets/img/back.png" class="logo-img" alt="logo">
      <p class="name">PPDISK-demo</p>
    </div>
    <div class="right-content">
      <router-view @startApp="f_startApp"></router-view>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Start',
  data: () => ({
    name: 'test',
  }),
  mounted() {
    console.log('test', this.$remote.getGlobal('shareObject'))
  },
  methods: {
    f_startApp(account) {
      this.$emit('startApp', account)
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
