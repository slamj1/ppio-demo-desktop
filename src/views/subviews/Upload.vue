<template>
  <div class="upload-page">
    <step-popup
        :steps="steps"
        :cur-step="curStep"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Upload File</span>
      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/img/file.png" class="file-icon" :alt="filename">
        <el-input v-model="filename" class="file-name-input"></el-input>
        <!--<el-select v-model="securityOption" class="select" placeholder="Please Choose">-->
          <!--<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
        <!--</el-select>-->
        <!--<el-alert v-show="type === options[1].value" title="You can not share secured file." show-icon class="alert-msg" type="warning" :closable="false"> </el-alert>-->
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Storage Time:</label>
            <el-radio-group class="radio-group" v-model="radio">
              <el-radio :label="1">1 Year(365 days)</el-radio> <br>
              <el-radio :label="2">1 Month(30 days)</el-radio> <br>
              <el-radio :label="3" @change="$refs.customStorageDaysInput.focus()">
                <el-input class="storage-day-input" ref="customStorageDaysInput" type="number" size="mini" v-model="customStorageDays" @focus="radio = 3"></el-input> <span>Days</span>
              </el-radio>
            </el-radio-group>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input class="copy-input" type="number" v-model="copyCount" size="mini"></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input><span>gchi</span>
            <span class="recommend-chiprice" :class="{ 'too-low': chiPrice < recChiPrice, 'safe': chiPrice >= recChiPrice }">Recommended: {{recChiPrice}}</span>
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
        <el-button class="button" v-if="curStep > 0" @click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" @click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Pay</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import StepPopup from '@/components/StepPopup'
import PaymentTable from '@/components/PaymentTable'
import { UL_TASK } from '../../constants/store'
import { getEstimateCost } from '../../services/upload'
import { gchiToPPCoin } from '../../utils/units'
import { APP_MODE_COINPOOL } from '../../constants/constants'
import PPFile from '../../store/PPFile'

export default {
  name: 'upload',
  data: () => ({
    filename: 'PPIO upload filename',
    customStorageDays: '1',
    chiPrice: 100,
    curStep: 0,
    options: [{ value: 1, label: 'Normal' }, { value: 2, label: 'Secure' }],
    securityOption: 2,
    radio: 1,
    copyCount: 5,
    totalChi: 0,
    storageChi: 0,
    uploadChi: 0,
    preparingUpload: false,
  }),
  props: ['file'], // file is a HTML File object
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    steps() {
      if (this.$store.getters.appMode === APP_MODE_COINPOOL) {
        return ['Upload']
      } else {
        return ['Upload', 'Storage Settings', 'Payment']
      }
    },
    recChiPrice() {
      return this.$store.state.recChiPrice
    },
    totalCost: function() {
      return gchiToPPCoin(this.totalChi * this.chiPrice).toFixed(4)
    },
    storageCost: function() {
      return gchiToPPCoin(this.storageChi * this.chiPrice).toFixed(4)
    },
    uploadCost: function() {
      return gchiToPPCoin(this.uploadChi * this.chiPrice).toFixed(4)
    },
    fileSizeStr() {
      return filesize(this.file.size)
    },
    paymentData: function() {
      return {
        list: [
          {
            product: `Upload: ${this.fileSizeStr}`,
            fee: `${this.uploadCost} PPCoin`,
          },
          {
            product: `Storage: ${this.fileSizeStr}/${this.storageTimeStr}`,
            fee: `${this.storageCost} PPCoin(Funds)`,
          },
        ],
        totalCost: this.totalCost,
      }
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
        localPath: this.file ? this.file.path : '',
        isSecure: this.securityOption === this.options[1].value,
        storageTime: this.storageDays * 24 * 3600,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
  },
  watch: {
    copyCount: function() {
      this.f_estimateCost()
    },
    'taskOptions.storageTime': function() {
      this.f_estimateCost()
    },
  },
  mounted() {
    this.preparingUpload = false
    if (this.file) {
      this.filename = this.file.name
      this.f_estimateCost()
    }
    // TODO: get ongoing contract from sdk, concat with locally-persisted task queue
  },
  methods: {
    f_estimateCost() {
      if (!this.file || this.copyCount === 0 || this.taskOptions.storageTime === 0) {
        return
      }
      return getEstimateCost({
        size: this.file.size,
        copyCount: this.copyCount,
        storageTime: this.taskOptions.storageTime,
      }).then(res => {
        console.log(res)
        this.totalChi = res.totalCost
        this.storageChi = res.storageCost
        this.uploadChi = res.uploadCost
        return res
      })
    },
    f_prev() {
      if (this.preparingUpload) {
        return
      }
      this.curStep -= 1
    },
    f_next() {
      if (this.preparingUpload) {
        return
      }
      if (this.curStep === 0) {
        if (this.filename.length > 0) {
          this.curStep += 1
        }
      } else if (this.curStep === 1) {
        const options = this.taskOptions
        if (options.storageTime > 0 && options.chiPrice > 0 && options.copyCount > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      if (this.preparingUpload) {
        return
      }
      this.$vueBus.$emit(this.$events.CLOSE_UPLOAD_FILE)
    },
    f_confirm() {
      if (this.preparingUpload) {
        return
      }
      this.preparingUpload = true
      console.log('upload confirm')
      const options = this.taskOptions
      console.log(options)

      // TODO: What do we need to store in metadata?
      const putParams = {
        file: new PPFile({
          key: this.filename,
          filename: this.filename,
          size: this.file.size,
          isSecure: options.isSecure,
        }),
        cpoolId: this.$store.state.user.cpoolData.cpoolId,
        objectKey: this.filename,
        ...options,
      }
      return this.$store
        .dispatch(UL_TASK.ACT_CREATE_TASK, putParams)
        .then(() => {
          this.preparingUpload = false
          return this.$vueBus.$emit(this.$events.UPLOAD_FILE_DONE)
        })
        .catch(err => {
          console.error(err)
          this.preparingUpload = false
          if (parseInt(err.code) === 2017) {
            return this.$message.error('File exists.')
          }
          return this.$message.error('Upload failed!')
        })
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
    .file-icon {
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
    }
    .file-name-input {
      display: block;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 10px;
      height: 40px;
      line-height: 40px;
      width: 300px;

      .el-input__inner {
        text-align: center;
      }
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
  &.step-1 {
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
