<template>
  <div class="share-page">
    <popup class="popup" :button-title="'Copy Code'" v-on:close="f_close" v-on:confirm="f_confirm">
      <span slot="header">Share File</span>
      <div class="content" slot="content">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file && file.filename">
        <p class="file-name">{{file && file.filename}}</p>
        <div class="code-wrap">
          <label class="share-code-label">Share Code:</label>
          <el-input class="share-code-input" v-model="shareCode" :disabled="true"></el-input>
        </div>
      </div>

      <el-button slot="footer" class="button" size="mini" v-on:click="f_unshare">Unshare</el-button>
    </popup>
  </div>
</template>
<script>
import Popup from '@/components/Popup'

const { clipboard } = require('electron')

export default {
  name: 'share',
  data: () => ({
    shareCode: '',
  }),
  mounted() {
    if (this.file) {
      this.shareCode = this.file.filename
    }
  },
  props: ['file'],
  components: {
    Popup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit('share-close')
    },
    f_confirm() {
      clipboard.writeText(this.shareCode)
      this.$notify.success({ title: 'Copy share code success', duration: 2000 })
      this.$vueBus.$emit('share-copy')
    },
    f_unshare() {
      this.$notify.info({
        title: 'The sharing file have been canceled',
        duration: 2000,
      })
      this.$vueBus.$emit('unshare')
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
      width: 60px;
    }
    .file-name {
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .code-wrap {
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
    }
  }
  .button {
    margin-right: 15px;
  }
}
</style>
