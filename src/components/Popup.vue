<template>
  <transition name="slide">
    <div class="popup-mask">
      <div class="popup-wrap">
        <div class="popup-header">
          <slot name="header"></slot>
        </div>
        <div class="popup-content">
          <slot name="content"></slot>
        </div>
        <div class="popup-footer">
          <slot class="footer"></slot>
          <el-button class="button" v-on:click="cancel" size="mini">Cancel</el-button>
          <el-button class="button" v-on:click="confirm" size="mini" type="primary">Confirm</el-button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'popup',
  data: () => ({
    popup: '',
  }),
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
.popup-mask.slide-enter-active {
  transition: top 0.3s ease;
}
.popup-mask.slide-leave-active {
  transition: top 0.5s ease;
}
.popup-mask.slide-enter,
.popup-mask.slide-leave-to {
  top: -100%;
}

.popup-mask.slide-enter-to,
.popup-mask.slide-leave {
  top: 0;
}
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  .popup-wrap {
    width: 720px;
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
  .popup-header {
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
  .popup-footer {
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
  }
  .popup-content {
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    bottom: 36px;
  }
}
</style>
