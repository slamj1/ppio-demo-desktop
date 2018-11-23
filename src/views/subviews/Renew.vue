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
            <el-input class="copy-input" type="number" v-model="copyCount" size="mini"></el-input>
          </div>
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

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
        <!--<div class="inner-wrap">-->
          <!--<div class="line-wrap">-->
            <!--<label class="line-label">Product:</label>-->
            <!--<span class="text-1">Free</span>-->
          <!--</div>-->
          <!--<div class="line-wrap">-->
            <!--<label class="line-label">Upload:</label>-->
            <!--<span class="text-1">3.1G</span>-->
            <!--<span class="text-2">34.12 PPCoin</span>-->
          <!--</div>-->
          <!--<div class="line-wrap">-->
            <!--<label class="line-label">Storage:</label>-->
            <!--<span class="text-1">3.1G/12Days</span>-->
            <!--<span class="text-2">234.122 PPCoin(Fund)</span>-->
          <!--</div>-->
          <!--<div class="line"></div>-->
          <!--<div class="line-wrap">-->
            <!--<label class="line-label">Gas Limit:</label>-->
            <!--<span class="text-2">268.122 PPCoin(Fund)</span>-->
          <!--</div>-->
        <!--</div>-->
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
import { renewFile } from '../../services/file'

export default {
  name: 'renew',
  data: () => ({
    type: '1',
    customStorageDays: '1',
    chiPrice: 100,
    steps: ['File', 'Storage Setting', 'Payment'],
    curStep: 0,
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    copyCount: 5,
    estimatedCost: 123,
    chiLimit: 12332,
    storageCost: 123,
    renewing: false,
  }),
  props: ['file'],
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    paymentData: function() {
      return {
        list: [
          {
            product: `Storage: ${filesize(this.file.size)}/${this.storageTimeStr}`,
            fee: `${this.storageCost} PPCoin(Fund)`,
          },
        ],
        totalCost: this.storageCost,
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
        storageTime: this.storageDays * 24 * 3600,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
  },
  mounted() {
    this.renewing = false
  },
  methods: {
    f_prev() {
      this.curStep -= 1
    },
    f_next() {
      if (this.curStep === 0) {
        this.curStep += 1
      } else if (this.curStep === 1) {
        const options = this.taskOptions
        if (options.storageTime > 0 && options.chiPrice > 0 && options.copyCount > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_RENEW_FILE)
    },
    f_confirm() {
      if (this.renewing) {
        return
      }
      this.renewing = true
      renewFile({
        objectHash: this.file.id,
        isPublic: this.file.isPublic,
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
  padding: 20px 20px 0px;
  .inner-wrap {
    display: inline-block;
    text-align: left;
  }
  &.step-0 {
    .file-icon {
      height: 58px;
      width: 48px;
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
      padding: 6px 0 6px 130px;
      position: relative;
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
  &.step-2 {
    .line-wrap {
      padding: 6px 0 6px 90px;
      position: relative;
    }
    .line-label {
      position: absolute;
      top: 6px;
      left: 0;
      font-weight: bold;
    }
    .text-1 {
      display: inline-block;
      width: 120px;
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
