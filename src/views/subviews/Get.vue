<template>
  <div class="get-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Get File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <el-input type="textarea" resize="none" :rows="4" v-model="shareCode" class="share-code-input" placeholder="Enter the share code"></el-input>
        </div>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="fileinfo-wrap">
            <img src="@/assets/img/file.png" class="file-icon" :alt="fileInfo && fileInfo.filename">
            <p class="file-name">{{fileInfo && fileInfo.filename}}</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" v-model="chiPrice" size="mini"></el-input> <span>chi</span>
            <span class="recommend-chiprice" :class="{ 'too-low': chiPrice < recChiPrice, 'safe': chiPrice >= recChiPrice }">Recommended: {{recChiPrice}} gchi</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Limit:</label>
            <span>{{totalChi}}</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{totalCost}} PPCoin</span>
          </div>
        </div>
      </div>

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" v-if="curStep > 0" v-on:click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" v-on:click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" v-if="curStep >= steps.length - 1" v-on:click="f_confirm" size="mini" type="primary">Download</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import { remote } from 'electron'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { getFileInfoByShareCode } from '../../services/getFile'
import { DL_TASK } from '../../constants/store'
import { getEstimateCost } from '../../services/download'
import { gchiToPPCoin } from '../../utils/units'

export default {
  name: 'get-file',
  data: () => ({
    shareCode: '',
    fileInfo: null,
    curStep: 0,
    steps: ['Share Code', 'Storage Setting', 'Payment'],
    radio: 1,
    chiPrice: 100,
    totalChi: 0,
    downloadChi: 0,
    gettingFileInfo: false,
    preparingDownload: false,
  }),
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    recChiPrice() {
      return this.$store.state.recChiPrice
    },
    fileSizeStr() {
      return this.fileInfo ? filesize(this.fileInfo.size) : ''
    },
    totalCost: function() {
      return gchiToPPCoin(this.totalChi * this.chiPrice).toFixed(4)
    },
    downloadCost: function() {
      return gchiToPPCoin(this.downloadChi * this.chiPrice).toFixed(4)
    },
    paymentData() {
      return {
        list: [
          {
            product: `Download: ${this.fileSizeStr}`,
            fee: `${this.downloadCost} PPCoin`,
          },
        ],
        totalCost: this.totalCost,
      }
    },
  },
  mounted() {
    this.preparingDownload = false
  },
  methods: {
    f_estimateCost() {
      if (!this.fileInfo) {
        return
      }
      return getEstimateCost({
        size: this.fileInfo.size,
      }).then(res => {
        this.totalChi = res.totalCost
        this.downloadChi = res.downloadCost
        return res
      })
    },
    f_prev() {
      if (this.preparingDownload) {
        return
      }
      this.curStep -= 1
    },
    f_next() {
      if (this.preparingDownload || this.gettingFileInfo) {
        return
      }
      if (this.curStep === 0) {
        if (this.shareCode === '') {
          // TODO: validate sharecode
          this.$message.error('share code can not be empty')
        } else {
          // TODO: need sdk support
          this.gettingFileInfo = true
          getFileInfoByShareCode(this.shareCode)
            .then(res => {
              console.log('got file info by share code', res.result)
              this.fileInfo = {
                id: res.result.hashCode,
                filename: res.result.filename,
                size: res.result.size,
                type: res.result.fileType || 'file',
                isSecure: res.result.isSecure,
                isPublic: false,
                ownerId: res.result.ownerId,
              }
              this.gettingFileInfo = false
              return this.curStep++
            })
            .catch(err => {
              console.error(err)
              this.gettingFileInfo = false
              this.$message.error('failed to get file info')
            })
        }
      } else if (this.curStep === 1) {
        if (this.chiPrice > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      if (this.preparingDownload || this.gettingFileInfo) {
        return
      }
      this.$vueBus.$emit(this.$events.CLOSE_GET_FILE)
    },
    f_confirm() {
      if (this.preparingDownload || this.gettingFileInfo) {
        return
      }
      this.preparingDownload = true
      console.log('download confirm')
      remote.dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          defaultPath: this.file.filename,
          message: 'Choose the location to download the file',
          properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
        },
        filePath => {
          console.log(filePath)
          if (!filePath) {
            return
          }
          const getParams = {
            file: this.file,
            objectKey: this.file.id,
            chiPrice: parseInt(this.chiPrice),
            exportPath: filePath,
          }
          this.$store
            .dispatch(DL_TASK.ACT_CREATE_TASK, getParams)
            .then(() => {
              this.preparingDownload = false
              return this.$vueBus.$emit(this.$events.GET_FILE_DONE)
            })
            .catch(err => {
              console.error(err)
              this.preparingDownload = false
              this.$notify.error({ title: err.message, duration: 2000 })
            })
        },
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.step-content {
  text-align: center;
  padding-top: 30px;
  padding-bottom: 20px;
  .inner-wrap {
    display: inline-block;
    text-align: left;
  }
  .share-code-input {
    width: 360px;
  }
  .error-msg {
    margin-top: 10px;
  }

  .fileinfo-wrap {
    text-align: center;
    .file-icon {
      width: 50px;
    }
    .file-name {
      height: 40px;
      line-height: 40px;
    }
  }
  .line-wrap {
    padding: 6px 0 6px 150px;
    position: relative;
    text-align: left;
    .line-label {
      position: absolute;
      top: 6px;
      left: 0;
      font-weight: bold;
    }
    .radio-group {
      label {
        margin-bottom: 10px;
      }
    }
    .storage-day-input,
    .price-input,
    .copy-input {
      width: 100px;
      margin-right: 8px;
    }
  }
  &.step-2 {
    .line-wrap {
      padding: 6px 0 6px 120px;
      position: relative;
    }
    .text-1 {
      display: inline-block;
      width: 150px;
    }
    .line {
      height: 1px;
      background-color: #eee;
      margin-top: 6px;
      margin-bottom: 6px;
    }
  }
}
</style>
