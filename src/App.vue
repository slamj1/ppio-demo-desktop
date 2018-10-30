<template>
  <div id="app">
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
</style>
