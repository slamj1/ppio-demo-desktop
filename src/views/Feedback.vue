<template>
  <popup class="feedback-popup" @close="f_close" width="500">
    <span slot="header">Feedback</span>
    <div class="content" slot="content">
      <h3>Help us to improve!</h3>
      <!--<p class="feedback-hint">Please join our gitter to report your problems, or discuss about our products!</p>-->
      <p class="feedback-hint">We'll collect some usage statistics which can help us to fix bugs.</p>
      <el-input type="textarea" class="msg-input" placeholder="Problems you've met or your suggestions" v-model="feedbackContent" :rows="4" resize="none"></el-input>
      <!--<el-checkbox class="upload-checkbox" v-model="uploadLog"><p class="hint">Upload log file. (If checked, some log files of this app will be uploaded. This can help us to find out bugs greatly)</p></el-checkbox>-->

      <el-button class="submit-btn" :loading="submitting" @click="f_submit" type="primary">Submit</el-button>
      <p class="feedback-hint">Have questions? Join our discord channel: </p>
      <el-button class="submit-btn" @click="f_goDiscord" type="primary">Join!</el-button>
    </div>
  </popup>
</template>
<script>
import { shell } from 'electron'
import Popup from '../components/Popup'
import { feedback } from '../services/feedback'
import { GITTER_URL, DISCORD_LINK } from '../constants/urls'

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
    f_goDiscord() {
      shell.openExternal(DISCORD_LINK)
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

      feedback(descObj, this.$store.state.user.address, this.$store.state.dataDir)
        .then(() => {
          this.submitting = false
          this.$message.success('Your feedback has been sent, thanks for your support!')
          return true
        })
        .catch(err => {
          console.error(err)
          this.submitting = false
          this.$message.error(
            'There are some problems sending your feedback. You can try again later.',
          )
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
    margin: 15px 0;
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
