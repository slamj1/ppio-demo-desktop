<template>
  <div class="start">
    <div class="left-content"></div>
    <div class="right-content">
      <router-view></router-view>
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
    goPath(path) {
      this.$router.replace(path)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
.start {
  height: 100%;
  position: relative;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  .left-content {
    width: 60%;
    text-align: center;
    background-color: $sidebar-color;
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
    width: 40%;
    background-color: #fff;
    padding: 80px 40px 0 40px;
  }
}
</style>
