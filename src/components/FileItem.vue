<template>
  <div class="file-item"
       :title="file.filename"
       :class="{'end': file.status === FILE_STATUS_END,
                'broken': file.status === FILE_STATUS_BROKEN,
                'selected': selected}">
    <div class="file-icon-wrap">
      <span class="file-icon"></span><span class="file-icon-status"></span>
    </div>
    <p class="filename">
      {{file.filename}}
    </p>
    <p v-if="!isCpoolMode" class="days-left">{{daysLeftStr}}</p>
  </div>
</template>
<script>
import * as FILE_STATUS from '../constants/file'
import { APP_MODE_COINPOOL } from '../constants/constants'

export default {
  name: 'fileitem',
  data() {
    return {
      ...FILE_STATUS,
    }
  },
  props: ['file', 'selected'],
  computed: {
    isCpoolMode: function() {
      return this.$isCpoolPackage
    },
    daysLeftStr: function() {
      if (this.file.status === this.FILE_STATUS_END) {
        return 'Expired'
      } else if (this.file.status === this.FILE_STATUS_BROKEN) {
        return 'Pending or lost'
      } else {
        return `${this.file.daysLeft} days left`
      }
    },
  },
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

  &.broken,
  &.end {
    .file-icon {
      opacity: 0.6;
    }
    .filename {
      opacity: 0.6;
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
    position: relative;
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
    right: 18px;
    bottom: 13px;
    position: absolute;
    @include general-bg;
    z-index: 2;
    opacity: 1;
  }

  &.end .file-icon-status {
    background-image: url(~@/assets/img/icon-lost.png);
    background-size: 22px 22px;
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
