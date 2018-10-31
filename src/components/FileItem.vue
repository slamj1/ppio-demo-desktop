<template>
  <div class="file-item"
       :class="{'secure': file.isSecure,
                'public': file.isPublic,
                'selected': selected}">
    <div class="file-icon-wrap">
      <span class="file-icon"><span class="file-icon-status"></span></span>
    </div>
    <p class="filename">{{file.filename}}</p>
  </div>
</template>
<script>
export default {
  name: 'fileitem',
  props: ['file', 'selected'],
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/_var.scss';

$file-item-width: 105px;

.file-item {
  flex: 0 0 $file-item-width;
  margin: 14px 20px;
  text-align: center;
  cursor: pointer;

  .file-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: $file-item-width;
    height: 100px;
    margin-bottom: 10px;
    background-color: transparent;
    border-radius: 8px;
  }

  &.selected .file-icon-wrap {
    background-color: #f0f2f5;
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
    width: 14px;
    height: 14px;
    bottom: 2px;
    right: 2px;
    position: absolute;
    @include general-bg;
    z-index: 2;
  }

  &.secure .file-icon-status {
    background-image: url(~@/assets/img/secure.png);
    background-size: 12px 12px;
  }
  &.public .file-icon-status {
    background-image: url(~@/assets/img/icon-share_active.png);
    background-size: 10px 10px;
  }

  .filename {
    width: $file-item-width;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.selected .filename {
    color: $primary-color;
  }
}
</style>
