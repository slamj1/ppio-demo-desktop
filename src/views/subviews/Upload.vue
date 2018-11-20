<template>
  <div class="upload-page">
    <step-popup
        ref="step"
        :steps="steps"
        :cur-step="curStep"
        :button-title="'Pay'"
        @close="f_close"
        @confirm="f_confirm"
        @next="f_next"
        @prev="f_prev"
        class="popup-wrap">
      <span slot="header">Upload File</span>
      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/img/file.png" class="file-icon" :alt="filename">
        <el-input v-model="filename" class="file-name-input"></el-input>
        <el-select v-model="type" class="select"  placeholder="Plaese Choose">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-alert v-show="type === options[1].value" title="You can not share secured file." show-icon class="alert-msg" type="warning" :closable="false"> </el-alert>
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
          <el-table class="ppio-plain-table payment-table" :data="paymentData" :fit="true">
            <el-table-column
                class-name="table-column-product"
                prop="product"
                label="Product"
                min-width="240">
            </el-table-column>
            <el-table-column
                prop="fee"
                label="Fee"
                min-width="150">
            </el-table-column>
          </el-table>
          <div class="total-cost">
            <p><b>Total:</b> {{totalCost}} PPCoin</p>
          </div>
        </div>
      </div>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import StepPopup from '@/components/StepPopup'
import { UL_TASK } from '../../constants/store'
import { importObject } from '../../services/upload'

export default {
  name: 'upload',
  data: () => ({
    type: '1',
    filename: 'PPIO upload filename',
    customStorageDays: '1',
    chiPrice: 100,
    steps: ['Choose Type', 'Storage Settings', 'Payment'],
    curStep: 0,
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    copyCount: 1,
    estimatedCost: 123,
    chiLimit: 12332,
    storageCost: 123,
    uploadCost: 12,
  }),
  props: ['file'],
  components: {
    StepPopup,
  },
  computed: {
    paymentData: function() {
      return [
        {
          product: `Upload: ${this.fileSizeStr}`,
          fee: `${this.uploadCost} PPCoin`,
        },
        {
          product: `Storage: ${this.fileSizeStr}/${this.storageTimeStr}`,
          fee: `${this.storageCost} PPCoin(Fund)`,
        },
      ]
    },
    fileSizeStr() {
      return filesize(this.file.size)
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
      console.log('computing task options')
      return {
        localPath: this.file ? this.file.path : '',
        isSecure: this.type === this.options[1].value,
        storageTime: this.storageDays * 24 * 3600,
        copyCount: parseInt(this.copyCount),
        chiPrice: parseInt(this.chiPrice),
      }
    },
    totalCost() {
      return this.storageCost + this.uploadCost
    },
  },
  mounted() {
    if (this.file) {
      this.filename = this.file.name
    }
    // TODO: get ongoing contract from sdk, concat with persisted task queue
  },
  methods: {
    f_prev() {
      this.curStep -= 1
    },
    async f_next() {
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
      this.$vueBus.$emit(this.$events.CLOSE_UPLOAD_FILE)
    },
    async f_confirm() {
      console.log('upload confirm')
      const options = this.taskOptions
      console.log(options)
      try {
        const objectHash = await importObject(options)
        const putParams = {
          file: {
            id: objectHash,
            filename: this.filename,
            size: this.file.size,
            isSecure: options.isSecure,
            isPublic: false,
          },
          objectHash,
          ...options,
        }
        await this.$store.dispatch(UL_TASK.ACT_CREATE_TASK, putParams)
        this.$vueBus.$emit(this.$events.UPLOAD_FILE_DONE)
      } catch (err) {
        console.error(err)
        if (parseInt(err.code) === 2017) {
          return this.$message.error('Object existed')
        }
        return this.$message.error('Object import failed!')
      }
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
    }
  }
  &.step-2 {
    .payment-table {
      color: inherit;
      text-align: center;
      margin-bottom: 10px;
    }
    .total-cost {
      position: relative;
      padding-left: 10px;
    }
    .line-label {
      position: absolute;
      top: 6px;
      left: 0;
      font-weight: bold;
    }
  }
}
</style>
