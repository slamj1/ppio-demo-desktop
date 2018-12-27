<template>
  <div class="renew-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Renew File</span>
      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file.filename">
        <p class="file-name">{{file.filename}}</p>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Renew Storage Time:</label>
            <el-radio-group class="radio-group" v-model="radio">
              <el-radio :label="1">1 Year(365 days)</el-radio> <br>
              <el-radio :label="2">1 Month(30 days)</el-radio> <br>
              <el-radio :label="3" @change="$refs.customStorageDaysInput.focus()">
                <el-input
                    class="storage-day-input"
                    ref="customStorageDaysInput"
                    type="number"
                    size="mini"
                    v-model="customStorageDays"
                    @focus="radio = 3"></el-input>
                <span>{{parseInt(customStorageDays) > 1 ? "Days" : "Day" }}</span>
              </el-radio>
            </el-radio-group>
            <p class="storage-time-hint">The storage time will be added to your current storage duration</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input class="copy-input" type="number" v-model="copyCount" size="mini"></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input> <span> chi</span>
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
        <el-button class="button" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Renew</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { renewFile } from '../../services/file'
import { getEstimateCost } from '../../services/upload'
import { chiToPPCoin } from '../../utils/units'

export default {
  name: 'renew',
  data: () => ({
    steps: ['PPFile', 'Storage Setting', 'Payment'],
    curStep: 0,
    radio: 1,
    customStorageDays: '1',
    chiPrice: 100,
    copyCount: 5,
    totalChi: 0,
    storageChi: 0,
    renewing: false,
  }),
  props: ['file'],
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    recChiPrice() {
      return this.$store.state.recChiPrice.storage
    },
    totalCost: function() {
      return chiToPPCoin(this.totalChi * this.chiPrice).toFixed(4)
    },
    storageCost: function() {
      return chiToPPCoin(this.storageChi * this.chiPrice).toFixed(4)
    },
    fileSizeStr() {
      return filesize(this.file.size)
    },
    paymentData: function() {
      return {
        list: [
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
      console.log('storage days: ', days)
      if (isNaN(days)) {
        return null
      }
      return days
    },
    storageTimeStr() {
      if (!this.storageDays) {
        return ''
      }
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
        storageTime: this.storageDays ? this.storageDays * 24 * 3600 : 0,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
  },
  watch: {
    'taskOptions.copyCount': function() {
      this.f_estimateCost()
    },
    'taskOptions.storageTime': function() {
      this.f_estimateCost()
    },
  },
  mounted() {
    this.renewing = false
    this.f_estimateCost()
  },
  methods: {
    f_estimateCost() {
      if (
        !this.file ||
        isNaN(this.taskOptions.copyCount) ||
        this.taskOptions.storageTime === 0
      ) {
        return
      }
      return getEstimateCost({
        size: this.file.size,
        copyCount: this.taskOptions.copyCount,
        storageTime: this.taskOptions.storageTime,
      }).then(res => {
        console.log(res)
        this.totalChi = res.totalCost
        this.storageChi = res.storageCost
        return res
      })
    },
    f_prev() {
      if (this.renewing) {
        return
      }
      this.curStep -= 1
    },
    f_next() {
      if (this.renewing) {
        return
      }
      if (this.curStep === 0) {
        this.curStep += 1
      } else if (this.curStep === 1) {
        const options = this.taskOptions
        let todayStartTime = 0
        todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000
        if (todayStartTime + options.storageTime <= this.file.expireTime) {
          this.$message.error('New expire date is before current expire date.')
          return
        }
        if (
          options.storageTime === 0 ||
          options.chiPrice === 0 ||
          options.copyCount === 0
        ) {
          return
        }
        this.curStep += 1
      }
    },
    f_close() {
      if (this.renewing) {
        return
      }
      this.$vueBus.$emit(this.$events.CLOSE_RENEW_FILE)
    },
    f_confirm() {
      if (this.renewing) {
        return
      }
      this.renewing = true
      renewFile({
        objectKey: this.file.key,
        isSecure: true,
        ...this.taskOptions,
      })
        .then(() => {
          this.renewing = false
          this.$message.success('renew succeeded')
          return this.$vueBus.$emit(this.$events.RENEW_FILE_DONE)
        })
        .catch(err => {
          console.error(err.toString())
          this.renewing = false
          this.$message.error(err.toString())
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
    .file-name {
      height: 40px;
      line-height: 40px;
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
      padding: 6px 0 6px 160px;
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
      .storage-time-hint {
        width: 300px;
        font-size: 12px;
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
