<template>
  <div class="upload-page">
    <step-popup :steps="steps" ref="step" :button-title="'Pay'" @close="f_close" @next="f_step" @confirm="f_confirm" class="popup-wrap">
      <span slot="header">Get File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <el-input v-model="shareCode" class="share-code-input" placeholder="Enter the share code"></el-input>
          <el-alert v-show="errorMsg!=''" :title="errorMsg" show-icon class="error-msg" type="error" :closable="false"> </el-alert>
        </div>
      </div>

      <div class="step-content step-1" slot="step-1">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file && file.filename">
        <p class="file-name">{{file && file.filename}}</p>
        <el-select v-model="type" class="select"  placeholder="Plaese Choose">
         <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
         </el-option>
       </el-select>
       <el-alert title="You can not share secured file." show-icon class="alert-msg" type="warning" :closable="false"> </el-alert>
      </div>

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Storage Time:</label>
            <el-radio-group class="radio-group" v-model="radio">
              <el-radio :label="1">1 Year(365 days)</el-radio> <br>
              <el-radio :label="2">1 Month(30 days)</el-radio> <br>
              <el-radio :label="3">
                <el-input class="storage-day-input" size="mini"></el-input>  <span>Days</span>
              </el-radio>
            </el-radio-group>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input class="copy-input" v-model="copyNumber" size="mini"></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Gas Price:</label>
            <el-input class="price-input" size="mini"></el-input>
            <span>chi</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Gas Limit:</label>
            <span>34543543</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>34543543 PPCOIN</span>
          </div>
        </div>
      </div>

      <div class="step-content step-3" slot="step-3">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Product:</label>
            <span class="text-1">Free</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Upload:</label>
            <span class="text-1">3.1G</span>
            <span class="text-2">34.12 PPCoin</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Storage:</label>
            <span class="text-1">3.1G/12Days</span>
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
import StepPopup from '@/components/StepPopup'
import { getFileInfoByShareCode, getFile } from '@/services/file'

export default {
  name: 'upload',
  data: () => ({
    type: '1',
    shareCode: '',
    errorMsg: '',
    file: null,
    steps: ['Input Code', 'Choose Type', 'Storage Setting', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    copyNumber: 5,
  }),
  components: {
    StepPopup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit('get-close')
    },
    f_step(step) {
      if (step === 0) {
        if (this.shareCode === '') {
          this.errorMsg = 'share code can not be empty'
        } else {
          this.errorMsg = ''
          getFileInfoByShareCode(this.shareCode)
            .then(
              res => {
                console.log('get fileinfo by share code', res.result)
                this.file = res.result
                return this.$refs.step.f_next()
              },
              err => {
                this.errorMsg = JSON.stringify(err)
                console.log(err)
              },
            )
            .catch(err => {
              console.log(JSON.stringify(err))
            })
        }
        return
      }
      this.$refs.step.f_next()
    },
    f_confirm() {
      getFile(this.file.id)
        .then(
          res => {
            this.$notify.success({ title: `get the ${this.file.filename} success`, duration: 2000 })
            return this.$vueBus.$emit('get-done', this.file)
          },
          err => {
            self.$notify.error({ title: JSON.stringify(err), duration: 2000 })
          },
        )
        .catch(err => {
          console.log(JSON.stringify(err))
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
  &.step-1 {
    .file-icon {
      width: 50px;
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
  &.step-2 {
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
  &.step-3 {
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
