<template>
  <div class="upload-page">
    <step-popup
        :cur-step="curStep"
        :steps="steps"
        :button-title="'Pay'"
        @close="f_close"
        @confirm="f_confirm"
        @next="f_next"
        @prev="f_prev"
        class="popup-wrap">
      <span slot="header">Download File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
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
      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <el-table class="ppio-plain-table payment-table" :data="paymentData">
            <el-table-column
                prop="product"
                label="Product"
                width="220"
                class-name="table-column-product">
            </el-table-column>
            <el-table-column
                prop="fee"
                label="Fee"
                width="100">
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
import { DL_TASK } from '../../constants/store'

export default {
  name: 'download',
  data: () => ({
    type: '1',
    filename: 'PPIO download filename',
    curStep: 0,
    steps: ['Settings', 'Payment'],
    options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Secure' }],
    radio: 1,
    estimatedCost: 123,
    chiPrice: 100,
    chiLimit: 12332,
    downloadCost: 12,
  }),
  props: ['file'],
  components: {
    StepPopup,
  },
  computed: {
    fileSizeStr() {
      return filesize(this.file.size)
    },
    paymentData() {
      return [
        {
          product: `Download: ${this.fileSizeStr}`,
          fee: `${this.downloadCost} PPCoin`,
        },
      ]
    },
    totalCost() {
      return this.downloadCost
    },
  },
  mounted() {
    if (this.file) {
      this.filename = this.file.name
    }
  },
  methods: {
    f_prev() {
      this.curStep -= 1
    },
    f_next() {
      if (this.curStep === 0) {
        if (this.chiPrice > 0) {
          this.curStep += 1
        }
      }
    },
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_DOWNLOAD_FILE)
    },
    f_confirm() {
      console.log('download confirm')
      const getParams = {
        file: this.file,
        objectHash: this.file.id,
        chiPrice: parseInt(this.chiPrice),
      }
      this.$store
        .dispatch(DL_TASK.ACT_CREATE_TASK, getParams)
        .then(() => this.$vueBus.$emit(this.$events.DOWNLOAD_FILE_DONE))
        .catch(err => {
          console.error(err)
          this.$notify.error({ title: JSON.stringify(err), duration: 2000 })
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
  &.step-1 {
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
