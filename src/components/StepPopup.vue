<template>
  <transition name="slide">
    <div class="step-popup-mask">
      <div class="step-popup-wrap">
        <svg v-on:click="f_close" viewBox="0 0 1024 1024" class="popup-close" version="1.1" width="128" height="128">
          <path d="M521.693867 449.297067L111.4112 39.0144a51.2 51.2 0 1 0-72.430933 72.362667l410.282666 410.3168-410.282666 410.3168a51.2 51.2 0 1 0 72.3968 72.3968l410.3168-410.282667 410.3168 410.282667a51.2 51.2 0 1 0 72.3968-72.362667l-410.282667-410.350933 410.282667-410.282667a51.2 51.2 0 1 0-72.3968-72.3968l-410.282667 410.282667z"></path>
        </svg>
        <div class="step-popup-header">
          <slot name="header"></slot>
        </div>
        <div class="step-popup-stepper">
          <el-steps :active="curStep" class="popup-steps" simple>
            <el-step v-for="(item,index) in steps" v-bind:key="index" :title="item"></el-step>
          </el-steps>
        </div>
        <div class="step-popup-content">
          <div v-if="curStep==0" class="step-slot-wrap">
            <slot name="step-0"></slot>
          </div>
          <div v-if="curStep==1" class="step-slot-wrap">
            <slot name="step-1"></slot>
          </div>
          <div v-if="curStep==2" class="step-slot-wrap">
            <slot name="step-2"></slot>
          </div>
          <div v-if="curStep==3" class="step-slot-wrap">
            <slot name="step-3"></slot>
          </div>
        </div>
        <div class="step-popup-footer">
          <slot class="footer"></slot>
          <el-button class="button" v-if="curStep > 0" v-on:click="f_prev" size="mini">Prev</el-button>
          <el-button class="button" v-if="curStep < steps.length-1" v-on:click="f_next" size="mini" type="primary">Next</el-button>
          <el-button class="button" v-if="curStep >= steps.length-1" v-on:click="f_confirm" size="mini" type="primary">{{ButtonTitle?ButtonTitle:'Confirm'}}</el-button>
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
  props: ['steps', 'ButtonTitle'],
  methods: {
    f_close() {
      this.$emit('close')
    },
    f_confirm() {
      this.$emit('confirm')
    },
    f_prev() {
      this.curStep--
    },
    f_next() {
      this.curStep++
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';
.step-popup-mask.slide-enter-active {
  transition: opacity 0.3s ease;
}
.step-popup-mask.slide-leave-active {
  transition: opacity 0.5s ease;
}
.step-popup-mask.slide-enter,
.step-popup-mask.slide-leave-to {
  opacity: 0;
}

.step-popup-mask.slide-enter-to,
.step-popup-mask.slide-leave {
  opacity: 1;
}
.step-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  .step-popup-wrap {
    width: 720px;
    left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    padding-bottom: 56px;
    padding-top: 72px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
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
    z-index: 1;
  }
  .step-popup-header {
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
  .step-popup-stepper {
    height: 36px;
    text-align: center;
    color: $text-color;
    font-weight: bold;
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    .popup-steps {
      padding-top: 8px;
      padding-bottom: 8px;
      font-size: 14px !important;
      background-color: #eee;
      border-bottom: 1px solid #ddd;
      border-top: 1px solid #ddd;
      border-radius: 0;
    }
  }
  .step-popup-footer {
    height: 36px;
    line-height: 34px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    text-align: center;
    .button {
      margin-right: 10px;
      &:last-child {
        margin-right: 0px;
      }
    }
  }
  .step-popup-content {
    max-height: 360px;
  }
}
</style>
