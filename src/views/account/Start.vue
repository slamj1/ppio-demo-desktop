<template>
  <div class="start">
    <div class="header">
      <span>Account Setting</span>
    </div>
    <div class="content-wrap">
      <div class="left-content">
        <img src="@/assets/img/logo_square.png" class="logo" alt="PPIO Logo">
        <br>
        <el-button class="button" type="text" v-on:click="goPath('/account/import')">Import Account</el-button>
        <br>
        <el-button class="button" type="text" v-on:click="goPath('/account/create')">Create Account</el-button>
      </div>
      <div class="right-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Start',
  data: () => ({
    name: 'test',
  }),
  methods: {
    goPath(path) {
      this.$router.replace(path)
    },
  },
}
</script>
<style lang="scss" scoped>
.start {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .header {
    height: 24px;
    line-height: 24px;
    background-color: #eee;
    border-bottom: 1px solid #ddd;
    text-align: center;
    -webkit-app-region: drag;
  }
  .content-wrap {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  }
  .left-content {
    width: 40%;
    padding-top: 80px;
    text-align: center;
    background-color: #fff;
    border-right: 1px solid #ddd;
    .logo {
      width: 150px;
    }
    .button {
      margin-top: 20px;
      width: 150px;
      margin-right: 5px;
    }
  }
  .right-content {
    width: 60%;
  }
}
</style>
