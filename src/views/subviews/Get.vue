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
        <div class="inner-wrap">
          <div class="fileinfo-wrap">
            <img src="@/assets/img/file.png" class="file-icon" :alt="fileInfo && fileInfo.filename">
            <p class="file-name">{{fileInfo && fileInfo.filename}}</p>
          </div>
          <div class="line-wrap">
            <label class="line-label">Storage Time:</label>
            <el-input class="storage-day-input" v-model="day" size="mini"></el-input><span>days</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Number of copies:</label>
            <el-input class="copy-input" v-model="copyNumber" size="mini"></el-input>
          </div>
          <div class="line-wrap">
            <label class="line-label">Gas Price:</label>
            <el-input class="price-input" v-model="gasPrice" size="mini"></el-input>
            <span>chi</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Gas Total:</label>
            <span>gasTotal</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span>{{gasPrice}} * {{gasTotal}} = {{gasTotal*gasPrice}} ppcoin</span>
          </div>
        </div>
      </div>

      <div class="step-content step-2" slot="step-2">
        <div class="inner-wrap">
          <div class="line-wrap">
            <label class="line-label">Service:</label>
            <span class="text-1">Fee</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Upload:</label>
            <span class="text-1">{{ (fileInfo && fileInfo.size) | convertFileSize }}</span>
            <span class="text-2">{{ gasTotal*gasPrice }} ppcoin</span>
          </div>
          <div class="line-wrap">
            <label class="line-label">Storage:</label>
            <span class="text-1">{{ (fileInfo && fileInfo.size) | convertFileSize }} / {{ day }} days</span>
            <span class="text-2">{{ gasTotal*gasPrice }}  ppcoin</span>
          </div>
          <div class="line"></div>
          <div class="line-wrap">
            <label class="line-label">Expected Cost:</label>
            <span class="text-2">{{ gasTotal*gasPrice }} ppcoin</span>
          </div>
        </div>
      </div>
    </step-popup>
  </div>
</template>
<script>
import StepPopup from '@/components/StepPopup'
import { getFileInfoByShareCode } from '@/services/file'
import { ACT_GET_FILE } from '../../constants/store'

export default {
  name: 'upload',
  data: () => ({
    type: '1',
    shareCode: '',
    errorMsg: '',
    fileInfo: null,
    steps: ['Share Code', 'Storage Setting', 'Payment'],
    day: 30,
    gasPrice: '100',
    gasTotal: 343,
    copyNumber: 1,
  }),
  components: {
    StepPopup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit(this.$events.CLOSE_GET_FILE)
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
                this.fileInfo = res.result
                return this.$refs.step.f_next()
              },
              err => {
                this.errorMsg = err.toString()
                console.log(err)
              },
            )
            .catch(err => {
              console.log(err)
            })
        }
        return
      }
      this.$refs.step.f_next()
    },
    f_confirm() {
      this.$store
        .dispatch(
          ACT_GET_FILE,
          Object.assign(
            {},
            {
              copies: this.copyNumber,
              duration: this.day,
              gasprice: this.gasPrice,
              acl: 'private',
            },
            this.fileInfo,
          ),
        )
        .then(
          () => {
            this.$notify.success({
              title: `get the ${this.fileInfo.filename} success`,
              duration: 2000,
            })
            return this.$vueBus.$emit(this.$events.GET_FILE_DONE)
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
  }
  .share-code-input {
    width: 360px;
  }
  .error-msg {
    margin-top: 10px;
  }

  .fileinfo-wrap {
    text-align: center;
    .file-icon {
      width: 50px;
    }
    .file-name {
      height: 40px;
      line-height: 40px;
    }
  }
  .line-wrap {
    padding: 6px 0 6px 150px;
    position: relative;
    text-align: left;
    .line-label {
      position: absolute;
      top: 6px;
      left: 0;
      font-weight: bold;
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
  &.step-2 {
    .line-wrap {
      padding: 6px 0 6px 120px;
      position: relative;
    }
    .text-1 {
      display: inline-block;
      width: 150px;
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
