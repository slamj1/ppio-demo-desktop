<!-- @deprecated -->
<template>
  <div class="get-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Download file by share code</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <el-input type="textarea" resize="none" :rows="4" v-model="shareCode" class="share-code-input" placeholder="Enter the share code start with poss://"></el-input>
        </div>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="fileinfo-wrap">
            <span class="file-icon" :class="'file-icon_' + fileInfo.fileType"></span>
            <p class="file-name">{{fileInfo && fileInfo.filename}}</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" v-model="chiPrice" size="mini"></el-input> <span>chi</span>
            <span class="recommend-chiprice" :class="{ 'too-low': chiPrice < recChiPrice, 'safe': chiPrice >= recChiPrice }">Recommended: {{recChiPrice}} wei</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Total Chi:</label>
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
        <el-button class="button" :loading="preparingDownload" v-if="curStep >= steps.length - 1" v-on:click="f_confirm" size="mini" type="primary">Download</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import { remote } from 'electron'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { DL_TASK } from '../../constants/store'
import { getEstimateCost } from '../../services/download'
import { chiToPPCoin } from '../../utils/units'
import { TaskFile } from '../../store/PPFile'
import getFileType from '../../utils/getFileType'

export default {
  name: 'get-file',
  data: () => ({
    shareCode: '',
    fileInfo: {
      key: '',
      size: 0,
      filename: '',
      fileType: 'plain',
    },
    curStep: 0,
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
    steps() {
      if (this.$isCpoolPackage) {
        return ['Share Code', 'File Info']
      } else {
        return ['Share Code', 'File Info', 'Payment']
      }
    },
    recChiPrice() {
      return this.$store.state.recChiPrice.download
    },
    fileSizeStr() {
      return this.fileInfo ? filesize(this.fileInfo.size) : ''
    },
    totalCost: function() {
      return chiToPPCoin(this.totalChi * this.chiPrice).toFixed()
    },
    downloadCost: function() {
      return chiToPPCoin(this.downloadChi * this.chiPrice).toFixed()
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
  watch: {
    fileInfo: function() {
      this.f_estimateCost()
    },
  },
  mounted() {
    this.preparingDownload = false
  },
  methods: {
    f_getFileInfo(shareCode) {
      try {
        const objectInfo = JSON.parse(
          decodeURIComponent(escape(atob(shareCode.replace('poss://', '')))),
        )
        console.log(JSON.stringify(objectInfo))
        return {
          key: objectInfo.name,
          size: objectInfo.length,
        }
      } catch (err) {
        return null
      }
    },
    f_estimateCost() {
      if (!this.fileInfo) {
        return
      }
      return getEstimateCost({
        size: this.fileInfo.size,
      }).then(cost => {
        this.totalChi = cost
        this.downloadChi = cost
        return cost
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
          const fileInfo = this.f_getFileInfo(this.shareCode)
          console.log('got file info by share code', fileInfo)
          if (fileInfo === null || !fileInfo.key || !fileInfo.size) {
            return this.$message.error('invalid share code')
          }
          this.fileInfo = {
            key: fileInfo.key,
            size: fileInfo.size,
            filename: fileInfo.key.split('/').slice(-1)[0],
          }
          this.fileInfo.fileType = getFileType(this.fileInfo.filename)
          this.gettingFileInfo = false
          this.f_estimateCost()
          return this.curStep++
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
          defaultPath: this.fileInfo.key,
          message: 'Choose the location to download the file',
          properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
        },
        filePath => {
          console.log(filePath)
          if (!filePath) {
            this.preparingDownload = false
            return
          }
          const getParams = {
            file: new TaskFile({
              key: this.fileInfo.key,
              filename: this.fileInfo.filename,
              size: this.fileInfo.size,
            }),
            objectKey: '',
            bucket: '',
            chiPrice: parseInt(this.chiPrice),
            exportPath: filePath,
            shareCode: this.shareCode,
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
              this.$message.error({ message: err.message, duration: 2000 })
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
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
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

    .recommend-chiprice {
      margin-left: 10px;
      font-size: 12px;

      &.too-low {
        color: red;
      }
      &.safe {
        color: green;
      }
    }
  }
}
</style>
