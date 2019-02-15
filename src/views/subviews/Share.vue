<template>
  <div class="share-page">
    <popup class="popup" @close="f_close">
      <span slot="header">Share File</span>
      <div class="content" slot="content">
        <span class="file-icon" :class="'file-icon_' + fileType"></span>
        <p class="file-name">{{ file && file.filename }}</p>
        <p class="share-hint">
          Anyone who gets the share code can access it. The only way to stop sharing is to
          delete the file.
        </p>
        <div class="code-wrap" v-if="shareCode">
          <label class="share-code-label">Share Code:</label>
          <p class="share-code-container">{{ shareCode }}</p>
        </div>
      </div>
      <template slot="footer">
        <el-button class="button" @click="f_copy" size="mini" type="primary"
          >Copy Code</el-button
        >
      </template>
    </popup>
  </div>
</template>
<script>
import Popup from '../../components/Popup'
import { getShareCode } from '../../services/file'
import getFileType from '../../utils/getFileType'

const { clipboard } = require('electron')

export default {
  name: 'share',
  data: () => ({
    shareCode: null,
  }),
  props: ['file', 'fileIndex'], // file is a /store/PPFilele.js object
  computed: {
    fileType() {
      if (this.file) {
        return getFileType(this.file.filename)
      }
      return 'plain'
    },
  },
  components: {
    Popup,
  },
  mounted() {
    this.f_genShareCode()
  },
  methods: {
    f_genShareCode() {
      console.log('getting share code, ', this.file.key)
      getShareCode(this.file.key)
        .then(shareCode => {
          this.shareCode = shareCode
          return shareCode
        })
        .catch(() => {
          this.$message.error('get share code failed')
        })
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_SHARE_FILE)
    },
    f_copy() {
      clipboard.writeText(this.shareCode)
      this.$message.success('Share code copied.')
    },
  },
}
</script>
<style lang="scss" scoped>
.popup {
  text-align: left;
  .content {
    text-align: center;
    padding: 40px 60px;
    .file-icon {
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
    }
    .file-name {
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .code-wrap {
      margin-top: 10px;
      text-align: left;
      padding-left: 90px;
      position: relative;
      .share-code-label {
        position: absolute;
        top: 0;
        height: 40px;
        line-height: 40px;
        left: 0;
        display: inline-block;
      }
      .share-code-container {
        max-height: 140px;
        overflow: auto;
        padding: 5px 10px;
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        user-select: text;
      }
    }
  }
  .button {
    margin-right: 15px;
  }
}
</style>
