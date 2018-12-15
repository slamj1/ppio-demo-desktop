<template>
  <popup class="feedback-popup" @close="f_close" width="500">
    <span slot="header">Feedback</span>
    <div class="content" slot="content">
      <h3>Help us to improve our product</h3>
      <el-input type="textarea" class="msg-input" v-model="feedbackContent" :rows="4" resize="none"></el-input>
      <el-checkbox class="upload-checkbox" v-model="uploadLog"><p class="hint">Upload log file. (If checked, your poss log file will be uploaded.)</p></el-checkbox>
      <p class="hint"></p>
      <el-button class="submit-btn" :loading="submitting" @click="f_submit" type="primary">Submit</el-button>
    </div>
  </popup>
</template>
<script>
import Popup from '../components/Popup'
import feedback from '../services/feedback'

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
    f_submit() {
      if (this.submitting) {
        return false
      }
      console.log('submit feedback')
      this.submitting = true
      feedback(this.feedbackContent, this.uploadLog ? this.$store.state.dataDir : null)
        .then(() => {
          this.submitting = false
          this.$message.success('We have received your feedback, thanks!')
          return true
        })
        .catch(err => {
          console.error(err)
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
