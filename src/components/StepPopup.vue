<template>
  <transition name="slide">
    <div class="step-popup-mask">
      <div class="step-popup-wrap">
        <div class="step-popup-header">
          <el-steps :active="curStep" class="popup-steps" simple>
            <el-step v-for="(item,index) in steps" v-bind:key="index" :title="item"></el-step>
          </el-steps>
        </div>
        <div class="step-popup-content">
          <slot name="step-1"></slot>
          <slot name="step-2"></slot>
          <slot name="step-3"></slot>
          <slot name="step-4"></slot>
        </div>
        <div class="step-popup-footer">
          <slot class="footer"></slot>
          <el-button class="button" v-if="curStep > 0" v-on:click="prev" size="mini">Prev</el-button>
          <el-button class="button" v-if="curStep < steps.length-1" v-on:click="next" size="mini" type="primary">Next</el-button>
          <el-button class="button" v-if="curStep >= steps.length-1" v-on:click="confirm" size="mini" type="primary">Confirm</el-button>
          <el-button class="button cancel-button" v-on:click="cancel" size="mini">Cancel</el-button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'step-popup',
  data: () => ({
    curStep: 0,
  }),
  props: ['steps'],
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    confirm() {
      this.$emit('confirm')
    },
    prev() {
      this.curStep--
    },
    next() {
      this.curStep++
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
.step-popup-mask.slide-enter-active {
  transition: top 0.3s ease;
}
.step-popup-mask.slide-leave-active {
  transition: top 0.5s ease;
}
.step-popup-mask.slide-enter,
.step-popup-mask.slide-leave-to {
  top: -100%;
}

.step-popup-mask.slide-enter-to,
.step-popup-mask.slide-leave {
  top: 0;
}
.step-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  .step-popup-wrap {
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
  .step-popup-header {
    height: 36px;
    text-align: center;
    color: $text-color;
    font-weight: bold;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    .popup-steps {
      padding-top: 8px;
      padding-bottom: 8px;
      font-size: 14px !important;
      background-color: #eee;
      border-bottom: 1px solid #ddd;
      border-radius: 0;
    }
  }
  .step-popup-footer {
    height: 36px;
    line-height: 34px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #eee;
    border-top: 1px solid #ddd;
    padding-right: 10px;
    text-align: right;
    .button {
      padding-top: 5px;
      padding-bottom: 5px;
      margin-right: 10px;
      min-width: 80px;
      &:last-child {
        margin-right: 0px;
      }
    }
    .cancel-button {
      position: absolute;
      top: 6px;
      left: 10px;
    }
  }
  .step-popup-content {
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    bottom: 36px;
  }
}
</style>
