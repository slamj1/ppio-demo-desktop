<template>
  <div class="upload-page">
    <step-popup :steps="steps" :button-title="'Pay'" v-on:close="f_close" v-on:confirm="f_confirm" class="popup-wrap">
      <span slot="header">Renew File</span>

      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/logo.png" class="file-icon" :alt="filename">
        <p class="file-name">{{filename}}</p>
        <el-select v-model="type" class="select"  placeholder="Plaese Choose">
         <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
         </el-option>
       </el-select>
       <el-alert title="You can not share secured file." show-icon class="alert-msg" type="warning" :closable="false"> </el-alert>
      </div>

      <div class="step-content step-1" slot="step-1">
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

      <div class="step-content step-2" slot="step-2">
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

export default {
  name: 'upload',
  data: () => ({
    type: '1',
    filename: 'PPIO upload filename',
    steps: ['Choose Type', 'Storage Setting', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    copyNumber: 5,
  }),
  components: {
    StepPopup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit('upload-close')
    },
    f_confirm() {
      this.$vueBus.$emit('upload-pay')
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
