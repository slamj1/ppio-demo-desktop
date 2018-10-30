<template>
  <div class="start">

  </div>
</template>
<script>
export default {
  name: 'Start',
  data: () => ({
    name: 'test',
  }),
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_base.scss';
.start {
  height: 100%;
  position: relative;
  -webkit-app-region: drag;
}
</style>
