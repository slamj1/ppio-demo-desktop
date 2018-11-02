<template>
  <transition name="slide">
    <div class="slide-popup-wrapper">
      <div class="slide-popup-mask" @click="close"></div>
      <div class="slide-popup-container">
        <div class="slide-popup-header">
          <slot name="header"></slot>
        </div>
        <div class="slide-popup-content">
          <slot name="content"></slot>
        </div>
        <div class="slide-popup-footer">
          <slot name="footer"></slot>
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
    close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';

/* animation not work, don't know why */
.slide-popup-wrapper.slide-enter-active,
.slide-popup-wrapper.slide-leave-active {
  .slide-popup-mask {
    transition: opacity 1s ease;
  }
  .slide-popup-container {
    transition: top 1s ease;
  }
}

.slide-popup-wrapper.slide-enter,
.slide-popup-wrapper.slide-leave-to {
  .slide-popup-mask {
    opacity: 0;
  }
  .slide-popup-container {
    top: -100%;
  }
}

.slide-popup-wrapper.slide-enter-to,
.slide-popup-wrapper.slide-leave {
  .slide-popup-mask {
    opacity: 1;
  }
  .slide-popup-container {
    top: 0;
  }
}

.slide-popup-wrapper {
  .slide-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .slide-popup-container {
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
    z-index: 10;
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
  /*.slide-popup-footer {*/
  /*height: 36px;*/
  /*line-height: 34px;*/
  /*position: absolute;*/
  /*left: 0;*/
  /*right: 0;*/
  /*bottom: 0;*/
  /*background-color: #eee;*/
  /*border-top: 1px solid #ddd;*/
  /*text-align: right;*/
  /*padding-right: 10px;*/
  /*.button {*/
  /*padding-top: 5px;*/
  /*padding-bottom: 5px;*/
  /*margin-right: 6px;*/
  /*}*/
  /*.cancel-button {*/
  /*position: absolute;*/
  /*top: 6px;*/
  /*left: 10px;*/
  /*}*/
  /*}*/
  .slide-popup-content {
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    bottom: 36px;
  }
}
</style>
