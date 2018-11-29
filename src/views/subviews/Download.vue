<template>
  <div class="download-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Download File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input><span>gchi</span>
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
      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" v-if="curStep > 0" v-on:click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" v-on:click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" v-if="curStep >= steps.length - 1" v-on:click="f_confirm" size="mini" type="primary">Pay</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import { remote } from 'electron'
import filesize from 'filesize'
import StepPopup from '@/components/StepPopup'
import PaymentTable from '@/components/PaymentTable'
import { DL_TASK } from '../../constants/store'
import { getEstimateCost } from '../../services/download'
import { gchiToPPCoin } from '../../utils/units'

export default {
  name: 'download',
  data: () => ({
    type: '1',
    curStep: 0,
    steps: ['Settings', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    chiPrice: 100,
    totalChi: 0,
    downloadChi: 0,
    preparingDownload: false,
  }),
  props: ['file'], // file is a /store/File.js object
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    recChiPrice() {
      return this.$store.state.recChiPrice
    },
    fileSizeStr() {
      return filesize(this.file.size)
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
      }).then(costs => {
        this.totalChi = costs.reduce((acc, cur) => cur + acc, 0)
        this.downloadChi = costs.reduce((acc, cur) => cur + acc, 0)
        return costs
      })
    },
    f_prev() {
      this.curStep -= 1
    },
    f_next() {
      if (this.curStep === 0) {
        if (this.chiPrice > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
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
            return
          }
          const getParams = {
            file: this.file,
            objectHash: this.file.id,
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
              this.$notify.error({ title: JSON.stringify(err), duration: 2000 })
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
  .inner-wrap {
    display: inline-block;
    text-align: left;
  }
  &.step-0 {
    .line-wrap {
      position: relative;
      padding: 6px 0 6px 130px;
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
  }
}
</style>
