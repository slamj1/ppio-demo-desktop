<template>
  <div class="download-page">
    <popup v-if="isCpoolMode" class="popup" @close="f_close">
      <span slot="header">Download File</span>
      <div v-if="!!file" class="content" slot="content">
        <div class="line-wrap file-container">
          <span class="file-icon" :class="'file-icon_' + fileType"></span>
          <p class="file-name">{{file.filename}}</p>
        </div>
      </div>
      <template slot="footer">
        <el-button class="button" :loading="preparingDownload" @click="f_confirm" size="mini" type="primary">Download</el-button>
      </template>
    </popup>
    <step-popup
        v-else
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Download File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <div v-if="!!file" class="line-wrap file-container">
            <span class="file-icon" :class="'file-icon_' + fileType"></span>
            <p class="file-name">{{file.filename}}</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input><span> {{$minimalUnit}}</span>
            <span class="recommend-chiprice" :class="{ 'too-low': chiPrice < recChiPrice, 'safe': chiPrice >= recChiPrice }">Recommended: {{recChiPrice}} {{$minimalUnit}}</span>
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
      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" v-if="curStep > 0" @click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" @click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" :loading="preparingDownload" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Download</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import { remote } from 'electron'
import Popup from '../../components/Popup'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { DL_TASK } from '../../constants/store'
import { getEstimateCost } from '../../services/download'
import { chiToPPCoin } from '../../utils/units'
import { TaskFile } from '../../store/PPFile'
import getFileType from '../../utils/getFileType'

export default {
  name: 'download',
  data: () => ({
    type: '1',
    curStep: 0,
    steps: ['Settings', 'Payment'],
    chiPrice: 100,
    totalChi: 0,
    downloadChi: 0,
    preparingDownload: false,
  }),
  props: ['file'],
  components: {
    Popup,
    StepPopup,
    PaymentTable,
  },
  computed: {
    fileType() {
      if (this.file) {
        return getFileType(this.file.filename)
      }
      return 'plain'
    },
    isCpoolMode() {
      return this.$isCpoolPackage
    },
    recChiPrice() {
      return this.$store.state.recChiPrice.download
    },
    fileSizeStr() {
      return filesize(this.file.size)
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
    file: function() {
      this.f_estimateCost()
    },
  },
  mounted() {
    this.preparingDownload = false
    this.f_estimateCost()
  },
  methods: {
    f_estimateCost() {
      if (!this.file) {
        return
      }
      return getEstimateCost({
        size: this.file.size,
        chiPrice: parseInt(this.chiPrice),
      }).then(res => {
        this.totalChi = res
        this.downloadChi = res
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
      if (this.preparingDownload) {
        return
      }
      if (this.curStep === 0) {
        if (this.chiPrice > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      if (this.preparingDownload) {
        return
      }
      this.$vueBus.$emit(this.$events.CLOSE_DOWNLOAD_FILE)
    },
    f_confirm() {
      if (this.preparingDownload) {
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
            this.preparingDownload = false
            return
          }
          const getParams = {
            file: new TaskFile(this.file),
            objectKey: this.file.key,
            chiPrice: parseInt(this.chiPrice),
            exportPath: filePath,
          }
          this.$store
            .dispatch(DL_TASK.ACT_CREATE_TASK, getParams)
            .then(() => {
              this.preparingDownload = false
              return this.$vueBus.$emit(this.$events.DOWNLOAD_FILE_DONE)
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
  padding: 20px 20px 0;
}

.inner-wrap {
  display: inline-block;
  text-align: left;
}

.line-wrap {
  position: relative;
  padding: 6px 0 6px 130px;

  &.file-container {
    margin-top: 10px;
    padding-left: 0;
    text-align: center;
  }

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

  .line-label {
    position: absolute;
    top: 6px;
    left: 0;
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
</style>
