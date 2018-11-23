<template>
  <div class="share-page">
    <step-popup
        v-if="!file.isPublic"
        :cur-step="curStep"
        :steps="steps"
        @close="f_close"
        class="popup-wrap">
      <span slot="header">Share File</span>
      <div class="step-content step-0" slot="step-0">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file && file.filename">
        <p class="file-name">{{file && file.filename}}</p>
        <p class="share-hint">Sharing a file will set its type from private to public, and everyone who knows your id and the hash of the file can access it.</p>
        <!--<div class="line-wrap">-->
          <!--<label class="line-label">Chi Price:</label>-->
          <!--<el-input class="price-input" type="number" size="mini" v-model="chiPrice"></el-input>-->
          <!--<span>wei</span>-->
        <!--</div>-->
        <!--<div class="line-wrap">-->
          <!--<label class="line-label">Chi Limit:</label>-->
          <!--<span>{{chiLimit}}</span>-->
        <!--</div>-->
        <!--<div class="line-wrap">-->
          <!--<label class="line-label">Expected Cost:</label>-->
          <!--<span>{{estimatedCost}} PPCoin</span>-->
        <!--</div>-->
      </div>

      <div class="step-content step-1" slot="step-1">
        <div class="inner-wrap">
          <PaymentTable :payment-data="paymentData"></PaymentTable>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" v-if="curStep > 0" @click="f_prev" size="mini">Prev</el-button>
        <el-button class="button" v-if="curStep < steps.length - 1" @click="f_next" size="mini" type="primary">Next</el-button>
        <el-button class="button" v-if="curStep >= steps.length - 1" @click="f_confirm" size="mini" type="primary">Pay</el-button>
      </template>
    </step-popup>

    <popup v-else class="popup" @close="f_close">
      <span slot="header">Share File</span>
      <div class="content" slot="content">
        <img src="@/assets/img/file.png" class="file-icon" :alt="file && file.filename">
        <p class="file-name">{{file && file.filename}}</p>
        <div class="code-wrap">
          <label class="share-code-label">Share Code:</label>
          <el-input class="share-code-input" v-model="shareCode" :disabled="true"></el-input>
        </div>
      </div>

      <template slot="footer">
        <el-button class="button" @click="f_copy" size="mini" type="primary">Copy Code</el-button>
        <el-button class="button" @click="f_unshare" size="mini">Unshare</el-button>
      </template>
    </popup>
  </div>
</template>
<script>
import Popup from '@/components/Popup'
import StepPopup from '@/components/StepPopup'
import PaymentTable from '@/components/PaymentTable'
import { ACT_SHARE_FILE } from '../../constants/store'

const { clipboard } = require('electron')

export default {
  name: 'share',
  data: () => ({
    curStep: 0,
    steps: ['Confirm', 'Payment'],
    radio: 1,
    estimatedCost: 123,
    chiPrice: 100,
    chiLimit: 12332,
    updateCost: 12,
    updatingAcl: false,
    shareCode: '',
  }),
  props: ['file', 'fileIndex'], // file is a /store/File.js object
  components: {
    Popup,
    StepPopup,
    PaymentTable,
  },
  computed: {
    paymentData() {
      return {
        list: [
          {
            product: `Publish file`,
            fee: `${this.updateCost} PPCoin`,
          },
        ],
        totalCost: this.updateCost,
      }
    },
  },
  mounted() {
    this.updatingAcl = false
    if (this.file.isPublic) {
      this.f_genShareCode()
    }
  },
  methods: {
    f_genShareCode() {
      this.shareCode = this.file.id
    },
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
      this.$vueBus.$emit(this.$events.CLOSE_SHARE_FILE)
    },
    f_confirm() {
      if (this.updatingAcl) {
        return
      }
      this.updatingAcl = true
      this.$store
        .dispatch(ACT_SHARE_FILE, {
          objectHash: this.file.id,
          isPublic: true,
          fileIndex: this.fileIndex,
        })
        .then(() => {
          this.updatingAcl = false
          console.log('publish file succeeded')
          this.$message.success('publish file succeeded')
          return this.f_genShareCode()
        })
        .catch(err => {
          console.log('publish file failed')
          console.error(err.toString())
          this.$message.error('sharing file failed')
          this.updatingAcl = false
        })
    },
    f_copy() {
      clipboard.writeText(this.shareCode)
      this.$message.success('Share code copied.')
    },
    f_unshare() {
      if (this.updatingAcl) {
        return
      }
      this.updatingAcl = true
      this.$store
        .dispatch(ACT_SHARE_FILE, {
          objectHash: this.file.id,
          isPublic: false,
          fileIndex: this.fileIndex,
        })
        .then(() => {
          console.log('private file succeeded')
          this.updatingAcl = false
          this.$message.success('The file now is private')
          return this.$vueBus.$emit(this.$events.UNSHARE_FILE_DONE)
        })
        .catch(() => {
          console.log('private file failed')
          this.updatingAcl = false
          this.$message.error('Unsharing file failed')
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.step-content {
  text-align: center;
  padding: 20px 20px 0;
  .inner-wrap {
    display: inline-block;
    text-align: left;
  }
  &.step-0 {
    .inner-wrap {
      text-align: center;
    }
    .file-icon {
      height: 58px;
      width: 48px;
      margin-bottom: 10px;
    }
    .share-hint {
      width: 300px;
      margin-top: 20px;
      font-size: 12px;
      text-align: left;
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
}

.popup {
  text-align: left;
  .content {
    text-align: center;
    padding: 40px 60px;
    .file-icon {
      width: 60px;
    }
    .file-name {
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .code-wrap {
      text-align: left;
      padding-left: 90px;
      position: relative;
      .share-code-label {
        position: absolute;
        top: 0;
        height: 40px;
        line-height: 40px;
        left: 0;
        display: inline-block;
      }
    }
  }
  .button {
    margin-right: 15px;
  }
}
</style>
