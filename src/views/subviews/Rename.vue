<template>
  <div class="rename-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Rename File</span>
      <div class="step-content step-0" slot="step-0">
        <span class="file-icon" :class="'file-icon_' + fileType"></span>
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
        <el-button class="button" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Rename</el-button>
      </template>
    </step-popup>
  </div>
</template>
<script>
import filesize from 'filesize'
import StepPopup from '../../components/StepPopup'
import PaymentTable from '../../components/PaymentTable'
import { ACT_RENAME_FILE } from '../../constants/store'
import { chiToPPCoin } from '../../utils/units'
import getFileType from '../../utils/getFileType'

export default {
  name: 'rename',
  data: () => ({
    curStep: 0,
    // steps: ['PPFile name', 'Gas Setting', 'Payment'],
    steps: ['PPFile name'],
    filename: '',
    chiPrice: 100,
    totalChi: 0,
    renameChi: 0,
    renaming: false,
  }),
  props: ['file'],
  components: {
    StepPopup,
    PaymentTable,
  },
  computed: {
    fileType() {
      if (this.file) {
        return getFileType(this.filename)
      }
      return 'plain'
    },
    recChiPrice() {
      return this.$store.state.recChiPrice.storage
    },
    totalCost: function() {
      return chiToPPCoin(this.totalChi * this.chiPrice).toFixed(4)
    },
    renameCost: function() {
      return chiToPPCoin(this.renameChi * this.chiPrice).toFixed(4)
    },
    fileSizeStr() {
      return filesize(this.file.size)
    },
    paymentData() {
      return {
        list: [
          {
            product: `Rename file`,
            fee: `${this.renameCost} PPCoin`,
          },
        ],
        totalCost: this.totalCost,
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
      if (this.renaming) {
        return
      }
      this.curStep -= 1
    },
    f_next() {
      if (this.renaming) {
        return
      }
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
      if (this.renaming) {
        return
      }
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
