<template>
  <div class="renew-page">
    <step-popup :cur-step="curStep" :steps="steps" @close="f_close" class="popup-wrap">
      <span slot="header">Renew File</span>
      <div class="step-content step-0" slot="step-0">
        <span class="file-icon" :class="'file-icon_' + fileType"></span>
        <p class="file-name">{{ file.filename }}</p>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Renew Storage Time:</label>
            <el-radio-group class="radio-group" v-model="radio">
              <el-radio :label="1">1 Year(365 days)</el-radio> <br />
              <el-radio :label="2">1 Month(30 days)</el-radio> <br />
              <el-radio :label="3" @change="$refs.customStorageDaysInput.focus()">
                <el-input
                  class="storage-day-input"
                  ref="customStorageDaysInput"
                  type="number"
                  size="mini"
                  v-model="customStorageDays"
                  @focus="radio = 3"
                ></el-input>
                <span>{{ parseInt(customStorageDays) > 1 ? 'Days' : 'Day' }}</span>
              </el-radio>
            </el-radio-group>
            <p class="storage-time-hint">
              The storage time will be added to your current storage duration
            </p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input
              class="copy-input"
              type="number"
              v-model="copyCount"
              size="mini"
            ></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input
              class="price-input"
              type="number"
              size="mini"
              v-model="chiPrice"
            ></el-input>
            <span> {{ $minimalUnit }}</span>
            <span
              class="recommend-chiprice"
              :class="{
                'too-low': chiPrice < recChiPrice,
                safe: chiPrice >= recChiPrice,
              }"
              >Recommended: {{ recChiPrice }}</span
            >
          </div>
          <div class="line-wrap">
            <label class="line-label">Total Chi:</label>
            <span>{{ totalChi }}</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{ totalCost }} PPCoin</span>
          </div>
        </div>
      </div>

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <div class="step-content step-3" slot="step-3">
        <div class="content" slot="content">
          <span class="file-icon" :class="'file-icon_' + fileType"></span>
          <p>Renewing file: {{ file && file.filename }}</p>
          <el-progress
            class="renew-progress"
            :width="300"
            :stroke-width="4"
            :percentage="renewProgress"
            :status="renewStatus"
          ></el-progress>
          <p v-if="renewFailed" class="renew-fail-msg">{{ failMsg }}</p>
          <p v-if="renewFinished" class="renew-success-msg">Renew Finished</p>
        </div>
      </div>

      <template slot="footer">
        <el-button
          class="button"
          v-if="curStep > 0 && curStep < steps.length - 1"
          @click="f_prev"
          size="mini"
          >Prev</el-button
        >
        <el-button
          class="button"
          v-if="curStep < steps.length - 2"
          @click="f_next"
          size="mini"
          type="primary"
          >Next</el-button
        >
        <el-button
          class="button"
          v-if="curStep === steps.length - 2"
          @click="f_confirm"
          size="mini"
          type="primary"
          >Renew</el-button
        >
        <el-button
          class="button"
          v-if="curStep === steps.length - 1"
          @click="f_finishRenew"
          size="mini"
          type="primary"
          >Ok</el-button
        >
      </template>
    </step-popup>
  </div>
</template>
<script>
import { remote } from 'electron'
import filesize from 'filesize'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { renewFile } from '../../services/file'
import { getEstimateCost } from '../../services/upload'
import { chiToPPCoin } from '../../utils/units'
import getFileType from '../../utils/getFileType'
import { getTaskProgress } from '../../services/task'
import { EVENT_RENEW_DONE, EVENT_RENEW_FAIL } from '../../constants/ga'
import { ACT_GET_FILE_LIST_DETAILS } from '../../constants/store'

const TIME_INTERVAL = 1000

const visitor = remote.getGlobal('gaVisitor')

export default {
  name: 'renew',
  data: () => ({
    steps: ['Confirm', 'Storage Setting', 'Payment', 'Renew'],
    curStep: 0,
    radio: 1,
    customStorageDays: '1',
    chiPrice: 100,
    copyCount: 5,
    totalChi: 0,
    storageChi: 0,
    renewing: false,
    preparingRenew: false,
    renewTaskId: '',
    renewTimer: null,
    renewProgress: 0,
    renewFinished: false,
    renewFailed: false,
    failMsg: '',
  }),
  props: ['file'],
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    fileType: function() {
      if (this.file) {
        return getFileType(this.file.filename)
      }
      return 'plain'
    },
    recChiPrice: function() {
      return this.$store.state.recChiPrice.storage
    },
    totalCost: function() {
      return chiToPPCoin(this.totalChi * this.chiPrice).toFixed()
    },
    storageCost: function() {
      return chiToPPCoin(this.storageChi * this.chiPrice).toFixed()
    },
    fileSizeStr: function() {
      return filesize(this.file.size)
    },
    paymentData: function() {
      return {
        list: [
          {
            product: `Storage: ${this.fileSizeStr}/${this.storageTimeStr}`,
            fee: `${this.storageCost} PPCoin`,
          },
        ],
        totalCost: this.totalCost,
      }
    },
    storageDays: function() {
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
    storageTimeStr: function() {
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
    taskOptions: function() {
      return {
        storageTime: this.storageDays ? this.storageDays * 24 * 3600 : 0,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
    renewStatus: function() {
      if (this.renewFinished) {
        return 'success'
      }
      if (this.renewFailed) {
        return 'exception'
      }
      return 'text'
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
      clearTimeout(this.renewTimer)
      this.$vueBus.$emit(this.$events.CLOSE_RENEW_FILE)
    },
    f_confirm() {
      if (this.renewing) {
        return
      }
      this.preparingRenew = true
      renewFile({
        objectKey: this.file.key,
        isSecure: true,
        ...this.taskOptions,
      })
        .then(taskId => {
          this.preparingRenew = false
          console.log('renew task started')
          this.renewing = true
          this.curStep += 1
          return this.f_getRenewProgress(taskId)
        })
        .catch(err => {
          console.error(err.toString())
          visitor.event(EVENT_RENEW_FAIL).send()
          this.renewing = false
          this.$message.error(err.toString())
        })
    },
    f_getRenewProgress(taskId) {
      getTaskProgress(taskId)
        .then(res => {
          console.log(res)
          if (res.status === 'Finished') {
            this.renewFinished = true
            this.renewProgress = 100
            this.renewing = false
            visitor.event(EVENT_RENEW_DONE).send()
            clearTimeout(this.renewTimer)
            this.$store.dispatch(ACT_GET_FILE_LIST_DETAILS)
          } else if (res.status === 'Error') {
            this.renewFailed = true
            this.failMsg = res.errMsg || 'deletion failed'
            this.renewing = false
            visitor.event(EVENT_RENEW_FAIL).send()
            clearTimeout(this.renewTimer)
          } else if (res.transferred && res.total) {
            this.renewProgress = res.transferred / res.total
            this.renewTimer = setTimeout(() => {
              this.f_getRenewProgress(taskId)
            }, TIME_INTERVAL)
          } else {
            this.renewProgress = 0
            this.renewTimer = setTimeout(() => {
              this.f_getRenewProgress(taskId)
            }, TIME_INTERVAL)
          }
          return false
        })
        .catch(err => {
          console.error('get task progress failed')
          console.error(err)
          this.renewing = false
        })
    },
    f_finishRenew() {
      if (this.renewing) {
        return
      }
      clearTimeout(this.renewTimer)
      return this.$vueBus.$emit(this.$events.RENEW_FILE_DONE)
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

  &.step-3 {
    .file-icon {
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
    }
    .file-name {
      height: 40px;
      line-height: 40px;
    }

    .renew-progress {
      width: 400px;
      margin: 10px auto;
    }

    .renew-fail-msg {
      color: $fail-color;
    }

    .renew-success-msg {
      color: $succ-color;
    }
  }
}
</style>
