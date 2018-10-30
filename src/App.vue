<template>
  <div id="app">
    <el-row class="app-titlebar">PPIO - demo</el-row>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {}
  },
}
</script>

<style lang="scss">
@import './assets/css/_base.scss';

#app {
  height: 100%;
  position: relative;
}
.app-titlebar {
  height: $titleHeight;
  line-height: $titleHeight;
  -webkit-app-region: drag;
  text-align: center;
  user-select: none;
}
</style>
