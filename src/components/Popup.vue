<template>
  <transition name="fade">
    <div class="popup-mask">
      <div
        class="popup-wrap"
        :class="{ withFooter: !!$slots.footer }"
        :style="`width: ${width}px`"
      >
        <svg
          v-on:click="f_close"
          viewBox="0 0 1024 1024"
          class="popup-close"
          version="1.1"
          width="128"
          height="128"
        >
          <path
            d="M521.693867 449.297067L111.4112 39.0144a51.2 51.2 0 1 0-72.430933 72.362667l410.282666 410.3168-410.282666 410.3168a51.2 51.2 0 1 0 72.3968 72.3968l410.3168-410.282667 410.3168 410.282667a51.2 51.2 0 1 0 72.3968-72.362667l-410.282667-410.350933 410.282667-410.282667a51.2 51.2 0 1 0-72.3968-72.3968l-410.282667 410.282667z"
          ></path>
        </svg>
        <div class="popup-header">
          <slot name="header"></slot>
        </div>
        <div class="popup-content">
          <slot name="content"></slot>
        </div>
        <div class="popup-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'popup',
  props: ['width'],
  methods: {
    f_close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
.popup-mask.fade-enter-active {
  transition: opacity 0.2s ease;
}
.popup-mask.fade-leave-active {
  transition: opacity 0.2s ease;
}
.popup-mask.fade-enter,
.popup-mask.fade-leave-to {
  opacity: 0;
}

.popup-mask.fade-enter-to,
.popup-mask.fade-leave {
  opacity: 1;
}
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.7);
  -webkit-app-region: no-drag;
  .popup-wrap {
    left: 50%;
    top: 50%;
    margin: auto;
    transform: translate(-50%, -50%);
    width: 700px;
    padding-bottom: 26px;
    padding-top: 36px;
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    -webkit-app-region: no-drag;

    &.withFooter {
      padding-bottom: 46px;
    }
  }
  .popup-close {
    position: absolute;
    top: 10px;
    right: 16px;
    height: 16px;
    width: 16px;
    fill: #999;
    transition: all ease 0.3s;
    cursor: pointer;
    &:hover {
      fill: #333;
    }
    z-index: 2;
  }
  .popup-header {
    height: 36px;
    line-height: 36px;
    color: $text-color;
    font-weight: bold;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .popup-footer {
    height: 36px;
    line-height: 34px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    text-align: center;
    .button {
      margin-right: 15px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .popup-content {
    max-height: 360px;
    min-height: 100px;
    overflow: hidden;
  }
}
</style>
