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
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input>
            <span>chi</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Limit:</label>
            <span>{{chiLimit}}</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{estimatedCost}} PPCOIN</span>
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

export default {
  name: 'download',
  data: () => ({
    type: '1',
    curStep: 0,
    steps: ['Settings', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    estimatedCost: 123,
    chiPrice: 100,
    chiLimit: 12332,
    downloadCost: 12,
    preparingDownload: false,
  }),
  props: ['file'], // file is a /store/File.js object
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    fileSizeStr() {
      return filesize(this.file.size)
    },
    paymentData() {
      return {
        list: [
          {
            product: `Download: ${this.fileSizeStr}`,
            fee: `${this.downloadCost} PPCoin`,
          },
        ],
        totalCost: this.downloadCost,
      }
    },
  },
  mounted() {
    this.preparingDownload = false
  },
  methods: {
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
    }
  }
}
</style>
