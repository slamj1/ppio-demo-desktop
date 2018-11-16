<template>
  <div class="upload-page">
    <step-popup ref="step" :steps="steps" :button-title="'Pay'" @close="f_close" @confirm="f_confirm" @next="f_next" class="popup-wrap">
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
          <div class="line-wrap">
            <label class="line-label">Product:</label>
            <span class="text-1">Free</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Upload:</label>
            <span class="text-1">{{fileSizeStr}}</span>
            <span class="text-2">{{estimatedCost}} PPCoin</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Storage:</label>
            <span class="text-1">{{fileSizeStr}}/{{storageTimeStr}}</span>
            <span class="text-2">234.122 PPCoin(Fund)</span>
          </div>
          <div class="line"></div>
          <div class="line-wrap">
            <label class="line-label">Gas Limit:</label>
            <span class="text-2">268.122 PPCoin(Fund)</span>
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
    steps: ['Choose Type', 'Storage Setting', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    copyCount: 1,
    chiLimit: 12332,
    estimatedCost: 12,
  }),
  props: ['file'],
  computed: {
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
  },
  components: {
    StepPopup,
  },
  mounted() {
    if (this.file) {
      this.filename = this.file.name
    }
  },
  methods: {
    async f_next(step) {
      if (step === 0) {
        if (this.filename.length > 0) {
          this.$refs.step.f_next()
        }
      } else if (step === 1) {
        const options = this.taskOptions
        if (options.storageTime > 0 && options.chiPrice > 0 && options.copyCount > 0) {
          this.$refs.step.f_next()
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
