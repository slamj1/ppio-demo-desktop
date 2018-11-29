<template>
  <div class="file-item"
       :class="{'secure': file.isSecure,
                'public': file.isPublic,
                'getting': isGetting,
                'failed': getFailed,
                'selected': selected}">
    <div class="file-icon-wrap">
      <span class="file-icon"><span class="file-icon-status"></span></span>
    </div>
    <p class="filename">
      {{file.filename}}
      <template v-if="isGetting">
        <br>{{getFailed ? 'get failed' : 'getting file...'}}
        <svg @click="f_delete" viewBox="0 0 1024 1024" class="file-delete" version="1.1" width="10" height="10">
          <path d="M521.693867 449.297067L111.4112 39.0144a51.2 51.2 0 1 0-72.430933 72.362667l410.282666 410.3168-410.282666 410.3168a51.2 51.2 0 1 0 72.3968 72.3968l410.3168-410.282667 410.3168 410.282667a51.2 51.2 0 1 0 72.3968-72.362667l-410.282667-410.350933 410.282667-410.282667a51.2 51.2 0 1 0-72.3968-72.3968l-410.282667 410.282667z"></path>
        </svg>
      </template>
    </p>
    <p class="days-left" v-if="!isGetting && !getFailed">{{file.daysLeft}} days left</p>
  </div>
</template>
<script>
export default {
  name: 'fileitem',
  props: ['file', 'selected', 'isGetting', 'getFailed'],
  methods: {
    f_delete() {
      this.$emit('delete')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../assets/css/_var.scss';

$file-item-width: 105px;

.file-item {
  flex: 0 0 $file-item-width;
  margin: 14px 20px;
  text-align: center;
  cursor: pointer;

  &.getting {
    opacity: 0.6;
  }

  &.failed {
    .filename {
      color: #ccc;
    }
  }

  .file-delete {
    fill: $text-color;
    cursor: pointer;
    &:hover {
      fill: #333;
    }
    z-index: 1;
  }

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

  .days-left {
    color: #bfbfbf;
    font-size: 12px;
  }
}
</style>
