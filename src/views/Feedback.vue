<template>
  <popup class="feedback-popup" @close="f_close" width="500">
    <span slot="header">Feedback</span>
    <div class="content" slot="content">
      <h3>Please help us to improve!</h3>
      <!--<p class="feedback-hint">Please join our gitter to report your problems, or discuss about our products!</p>-->
      <!--<p class="feedback-hint">We'll upload your log file to our server. There may contain </p>-->
      <el-input type="textarea" class="msg-input" placeholder="Your suggestion..." v-model="feedbackContent" :rows="4" resize="none"></el-input>
      <el-checkbox class="upload-checkbox" v-model="uploadLog"><p class="hint">Upload log file. (If checked, some of your log files will be uploaded.)</p></el-checkbox>
      <p class="hint"></p>
      <!--<el-button class="submit-btn" @click="f_goGitter" type="primary">Join!</el-button>-->
      <el-button class="submit-btn" :loading="submitting" @click="f_submit" type="primary">Submit</el-button>
    </div>
  </popup>
</template>
<script>
import { shell } from 'electron'
import Popup from '../components/Popup'
import { feedback } from '../services/feedback'
import { GITTER_URL } from '../constants/urls'

export default {
  data() {
    return {
      feedbackContent: '',
      submitting: false,
      uploadLog: true,
    }
  },
  components: {
    Popup,
  },
  methods: {
    f_goGitter() {
      shell.openExternal(GITTER_URL)
      this.$emit('close')
    },
    f_submit() {
      if (this.submitting) {
        return false
      }
      console.log('submit feedback')
      this.submitting = true

      const descObj = {
        desc: this.feedbackContent,
        demoVersion: this.$appVer,
      }

      feedback(
        descObj,
        this.$store.state.user.address,
        this.uploadLog ? this.$store.state.dataDir : null,
      )
        .then(() => {
          this.submitting = false
          this.$message.success('We have received your feedback, thanks!')
          return true
        })
        .catch(err => {
          console.error(err)
          this.submitting = false
          this.$message.success('We have received your feedback, thanks!')
        })
    },
    f_close() {
      if (this.submitting) {
        return false
      }
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
.content {
  padding: 0 50px;

  h3 {
    margin-bottom: 20px;
    font-weight: normal;
    text-align: center;
  }

  .feedback-hint {
    font-size: 16px;
    margin: 30px 0;
  }

  .msg-input {
    margin-bottom: 20px;
  }

  .upload-checkbox {
    margin-bottom: 20px;
  }

  .hint {
    white-space: normal;
    vertical-align: middle;
    display: inline-block;
  }

  .submit-btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
