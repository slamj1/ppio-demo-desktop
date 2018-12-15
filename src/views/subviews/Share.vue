<template>
  <div class="share-page">
    <popup class="popup" @close="f_close">
      <span slot="header">Share File</span>
      <div class="content" slot="content">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file && file.filename">
        <p class="file-name">{{file && file.filename}}</p>
        <p class="share-hint">Sharing a file means everyone who knows the file's share code can access it. And you can not recall this action unless you delete this file.</p>
        <div class="code-wrap" v-if="shareCode">
          <label class="share-code-label">Share Code:</label>
          <el-input class="share-code-input" v-model="shareCode" :disabled="true"></el-input>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" @click="f_copy" size="mini" type="primary">Copy Code</el-button>
      </template>
    </popup>
  </div>
</template>
<script>
import Popup from '../../components/Popup'
import StepPopup from '../../components/StepPopup'
import { getShareCode } from '../../services/file'

const { clipboard } = require('electron')

export default {
  name: 'share',
  data: () => ({
    shareCode: null,
  }),
  props: ['file', 'fileIndex'], // file is a /store/PPFilele.js object
  components: {
    Popup,
    StepPopup,
  },
  mounted() {
    this.f_genShareCode()
  },
  methods: {
    f_genShareCode() {
      getShareCode()
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
.step-content {
  text-align: center;
  padding: 20px 20px 0;
  .inner-wrap {
    display: inline-block;
    text-align: left;
  }
  &.step-0 {
    .inner-wrap {
      text-align: center;
    }
    .file-icon {
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
    }
    .share-hint {
      width: 300px;
      margin-top: 20px;
      font-size: 12px;
      text-align: left;
      margin-left: auto;
      margin-right: auto;
    }
    .select {
      width: 120px;
      margin-bottom: 10px;
    }
    .alert-msg {
      width: 280px;
      margin: auto;
      text-align: center;
    }
  }
}

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
