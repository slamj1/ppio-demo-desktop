<template>
  <div class="rename-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Rename File</span>
      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/img/file.png" class="file-icon" :alt="filename">
        <el-input class="file-name-input" v-model="filename"></el-input>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Chi Price:</label>
            <el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input>
            <span>wei</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Chi Limit:</label>
            <span>{{chiLimit}}</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{estimatedCost}} PPCoin</span>
          </div>
        </div>
      </div>

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <!--<div class="step-content step-2" slot="step-2">-->
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
      <!--</div>-->

      <template slot="footer">
        <el-button class="button" v-if="curStep > 0" @click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" @click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Pay</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import StepPopup from '@/components/StepPopup'
import PaymentTable from '@/components/PaymentTable'
import { ACT_RENAME_FILE } from '../../constants/store'

export default {
  name: 'rename',
  data: () => ({
    curStep: 0,
    filename: '',
    steps: ['File name', 'Gas Setting', 'Payment'],
    estimatedCost: 123,
    chiPrice: 100,
    chiLimit: 12332,
    renameCost: 12,
    renaming: false,
  }),
  props: ['file', 'fileIndex'],
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    paymentData() {
      return {
        list: [
          {
            product: `Rename file`,
            fee: `${this.renameCost} PPCoin`,
          },
        ],
        totalCost: this.renameCost,
      }
    },
  },
  mounted() {
    this.renaming = false
    if (this.file) {
      this.filename = this.file.filename
    }
  },
  methods: {
    f_prev() {
      this.curStep -= 1
    },
    f_next() {
      if (this.curStep === 0) {
        if (this.filename.length > 0) {
          return this.curStep++
        }
      }
      if (this.curStep === 1) {
        if (this.chiPrice > 0) {
          return this.curStep++
        }
      }
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_RENAME_FILE)
    },
    f_confirm() {
      if (this.renaming) {
        return
      }
      this.renaming = true
      this.$store
        .dispatch(ACT_RENAME_FILE, {
          file: this.file,
          filename: this.filename,
          fileIndex: this.fileIndex, // unused for now
        })
        .then(() => {
          this.renaming = false
          this.$message.success('rename succeeded')
          return this.$vueBus.$emit(this.$events.RENAME_FILE_DONE)
        })
        .catch(err => {
          console.error(err.toString())
          this.renaming = false
          this.$message.error(err.toString())
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
  }
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
</style>
