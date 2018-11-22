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
          <el-alert v-show="errorMsg!=''" :title="errorMsg" show-icon class="error-msg" type="error" :closable="false"> </el-alert>
        </div>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="fileinfo-wrap">
            <img src="@/assets/img/file.png" class="file-icon" :alt="fileInfo && fileInfo.filename">
            <p class="file-name">{{fileInfo && fileInfo.filename}}</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Storage Time:</label>
            <el-radio-group class="radio-group" v-model="radio">
              <el-radio :label="1">1 Year(365 days)</el-radio> <br>
              <el-radio :label="2">1 Month(30 days)</el-radio> <br>
              <el-radio :label="3" @change="$refs.customStorageDaysInput.focus()">
                <el-input class="storage-day-input" ref="customStorageDaysInput" type="number" size="mini" v-model="customStorageDays" @focus="radio = 3"></el-input>  <span>Days</span>
              </el-radio>
            </el-radio-group>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input class="copy-input" v-model="copyCount" size="mini"></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" v-model="chiPrice" size="mini"></el-input>
            <span>chi</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Limit:</label>
            <span>{{chiLimit}}</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{chiPrice}} * {{totalChi}} = {{totalChi*chiPrice}} PPCoin</span>
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
        <el-button class="button" v-if="curStep >= steps.length - 1" v-on:click="f_confirm" size="mini" type="primary">Pay</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import StepPopup from '@/components/StepPopup'
import PaymentTable from '@/components/PaymentTable'
import { getFileInfoByShareCode } from '../../services/getFile'
import { GET_TASK } from '../../constants/store'

export default {
  name: 'get-file',
  data: () => ({
    shareCode: '',
    errorMsg: '',
    fileInfo: null,
    curStep: 0,
    steps: ['Share Code', 'Storage Setting', 'Payment'],
    radio: 1,
    customStorageDays: 30,
    chiPrice: 100,
    chiLimit: 12332,
    totalChi: 343,
    getCost: 12,
    storageCost: 123,
    copyCount: 1,
    gettingFile: false,
  }),
  computed: {
    paymentData: function() {
      return {
        list: [
          {
            product: `Create copy: ${this.fileSizeStr}`,
            fee: `${this.getCost} PPCoin`,
          },
          {
            product: `Storage: ${this.fileSizeStr}/${this.storageTimeStr}`,
            fee: `${this.storageCost} PPCoin(Fund)`,
          },
        ],
        totalCost: this.storageCost + this.getCost,
      }
    },
    fileSizeStr() {
      return this.fileInfo ? filesize(this.fileInfo.size) : ''
    },
    storageDays() {
      let days = 0
      switch (this.radio) {
        case 1:
          days = 365
          break
        case 2:
          days = 30
          break
        case 3:
          days = parseInt(this.customStorageDays)
          break
      }
      return days
    },
    storageTimeStr() {
      if (this.storageDays === 365) {
        return '1 Year'
      } else if (this.storageDays === 30) {
        return '1 Month'
      } else {
        return `${this.storageDays} Days`
      }
    },
    taskOptions() {
      return {
        isSecure: this.fileInfo.isSecure,
        storageTime: this.storageDays * 24 * 3600,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
  },
  components: {
    StepPopup,
    PaymentTable,
  },
  mounted() {
    this.gettingFile = false
  },
  methods: {
    f_prev() {
      this.curStep -= 1
    },
    async f_next() {
      if (this.curStep === 0) {
        if (this.shareCode === '') {
          // TODO: validate sharecode
          this.$message.error('share code can not be empty')
        } else {
          this.errorMsg = ''
          getFileInfoByShareCode(this.shareCode)
            .then(res => {
              console.log('got file info by share code', res.result)
              this.fileInfo = {
                id: res.result.hashCode,
                filename: res.result.filename,
                size: res.result.size,
                type: res.result.fileType || 'file',
                isSecure: res.result.isSecure,
                isPublic: true,
                ownerId: res.result.ownerId,
              }
              return this.curStep++
            })
            .catch(err => {
              console.error(err)
              this.$message.error('failed to get file')
            })
        }
      } else if (this.curStep === 1) {
        const options = this.taskOptions
        if (options.storageTime > 0 && options.chiPrice > 0 && options.copyCount > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_GET_FILE)
    },
    f_confirm() {
      if (this.gettingFile) {
        return
      }
      this.gettingFile = true
      this.$store
        .dispatch(GET_TASK.ACT_CREATE_TASK, {
          copies: this.taskOptions.copyCount,
          duration: this.taskOptions.storageTime,
          chiPrice: this.taskOptions.chiPrice,
          acl: 'private',
          objectHash: this.fileInfo.id,
          ownerId: this.fileInfo.ownerId,
          file: this.fileInfo,
        })
        .then(() => {
          this.gettingFile = false
          return this.$vueBus.$emit(this.$events.GET_FILE_DONE)
        })
        .catch(err => {
          this.$notify.error({ title: err.toString(), duration: 2000 })
          console.error(err.toString())
        })
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
