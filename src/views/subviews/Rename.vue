<template>
  <div class="upload-page">
    <step-popup :steps="steps" ref="step" :button-title="'Pay'" @close="f_close" @next="f_step" @confirm="f_confirm" class="popup-wrap">
      <span slot="header">Rename File</span>
      <div class="step-content step-0" slot="step-0">
        <div class="inner-wrap">
          <el-input v-model="filename" class="share-code-input"></el-input>
          <el-alert v-show="errorMsg!=''" :title="errorMsg" show-icon class="error-msg" type="error" :closable="false"> </el-alert>
        </div>
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
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
import { ACT_RENAME_FILE } from '../../constants/store'

export default {
  name: 'rename',
  data: () => ({
    filename: '',
    errorMsg: '',
    steps: ['File name', 'Gas Setting', 'Payment'],
  }),
  props: ['file', 'fileindex'],
  mounted() {
    if (this.file) {
      this.filename = this.file.filename
    }
  },
  components: {
    StepPopup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_RENAME_FILE)
    },
    f_step(step) {
      this.$refs.step.f_next()
    },
    f_confirm() {
      this.$store
        .dispatch(ACT_RENAME_FILE, {
          file: this.file,
          filename: this.filename,
          fileindex: this.fileindex,
        })
        .then(
          () => {
            this.$notify.success({
              title: `rename the ${this.file.filename} success`,
              duration: 2000,
            })
            return this.$vueBus.$emit(this.$events.RENAME_FILE_DONE)
          },
          err => {
            this.$notify.error({ title: err.toString(), duration: 2000 })
          },
        )
        .catch(err => {
          console.error(err.toString())
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
  &.step-2 {
    .line-wrap {
      padding: 6px 0 6px 90px;
      position: relative;
    }
  }
}
</style>
