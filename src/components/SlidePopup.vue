<template>
  <transition name="slide">
    <div class="slide-popup-mask">
      <div class="slide-popup-wrap">
        <div class="slide-popup-header">
          <slot name="header"></slot>
        </div>
        <div class="slide-popup-content">
          <slot name="content"></slot>
        </div>
        <div class="slide-popup-footer">
          <el-button class="button cancel-button" v-on:click="cancel" size="mini">Cancel</el-button>
          <slot class="footer"></slot>
          <el-button class="button" v-on:click="confirm" size="mini" type="primary">{{ButtonTitle?ButtonTitle:'Confirm' }}</el-button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'slide-popup',
  data: () => ({}),
  props: ['ButtonTitle'],
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    confirm() {
      this.$emit('confirm')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
.slide-popup-mask.slide-enter-active {
  transition: top 0.3s ease;
}
.slide-popup-mask.slide-leave-active {
  transition: top 0.5s ease;
}
.slide-popup-mask.slide-enter,
.slide-popup-mask.slide-leave-to {
  top: -100%;
}

.slide-popup-mask.slide-enter-to,
.slide-popup-mask.slide-leave {
  top: 0;
}
.slide-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  .slide-popup-wrap {
    width: 700px;
    left: 0;
    right: 0;
    top: 0;
    height: 450px;
    padding-bottom: 36px;
    padding-top: 36px;
    margin-left: auto;
    margin-right: auto;
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    border-top: none;
    -webkit-app-region: no-drag;
    box-shadow: rgba(39, 44, 49, 0.06) 2px 4px 8px, rgba(39, 44, 49, 0.06) -2px -4px 8px;
  }
  .slide-popup-header {
    height: 36px;
    line-height: 36px;
    text-align: center;
    color: $text-color;
    font-weight: bold;
    background-color: #eee;
    border-bottom: 1px solid #ddd;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .slide-popup-footer {
    height: 36px;
    line-height: 34px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #eee;
    border-top: 1px solid #ddd;
    text-align: right;
    padding-right: 10px;
    .button {
      padding-top: 5px;
      padding-bottom: 5px;
      margin-right: 6px;
    }
    .cancel-button {
      position: absolute;
      top: 6px;
      left: 10px;
    }
  }
  .slide-popup-content {
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    bottom: 36px;
  }
}
</style>
