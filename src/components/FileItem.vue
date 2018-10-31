<template>
  <div class="file-item"
       :class="{'secure': file.isSecure,
                'public': file.isPublic}">
    <div class="file-icon-wrap">
      <span class="file-icon"><span class="file-icon-status"></span></span>
    </div>
    <p class="filename">{{file.filename}}</p>
  </div>
</template>
<script>
export default {
  name: 'fileitem',
  props: ['file'],
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/_var.scss";

.file-item {
  flex: 0 0 100px;
  margin: 14px 20px;
  text-align: center;
  cursor: pointer;

  .file-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    background-color: transparent;
  }

  .file-icon {
    position: relative;
    display: inline-block;
    width: 62px;
    height: 74px;
    border-radius: 8px;
    background-image: url(~@/assets/img/file.png);
    @include general-bg;
    overflow: hidden;
  }

  &.secure,
  &.public {
    .file-icon::after {
      content: '';
      position: absolute;
      display: inline-block;
      background-color: #243243;
      width: 44px;
      height: 44px;
      bottom: -22px;
      right: -22px;
      transform: rotateZ(45deg);
      z-index: 1;
    }
  }

  .file-icon-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    bottom: 4px;
    right: 4px;
    position: absolute;
    @include general-bg;
    z-index: 2;
  }

  &.secure .file-icon-status {
    background-image: url(~@/assets/img/secure.png);
  }
  &.public .file-icon-status {
    background-image: url(~@/assets/img/icon-share_active.png);
  }
}
</style>
