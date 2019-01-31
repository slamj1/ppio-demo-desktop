<template>
  <div class="share-page">
    <popup class="popup" @close="f_close">
      <span slot="header">Delete File</span>
      <template v-if="!inDeleteProgress">
        <div class="content" slot="content">
          <p class="delete-hint">Are you sure to delete this file?</p>
          <span class="file-icon" :class="'file-icon_' + fileType"></span>
          <p class="file-name">{{file && file.filename}}</p>
          <!--<PaymentTable :payment-data="paymentData"></PaymentTable>-->
        </div>
        <template slot="footer">
          <el-button class="button" :loading="preparingDelete" @click="f_confirm" size="mini" type="primary">Yes</el-button>
        </template>
      </template>
      <template v-else>
        <div class="content" slot="content">
          <span class="file-icon" :class="'file-icon_' + fileType"></span>
          <p>Deleting file: {{file && file.filename}}</p>
          <el-progress
              class="delete-progress"
              :width="300"
              :stroke-width="4"
              :percentage="deleteProgress"
              :status="deleteStatus"></el-progress>
          <p v-if="deleteFailed" class="delete-fail-msg">{{failMsg}}</p>
          <p v-if="deleteFinished" class="delete-success-msg">Finished</p>
        </div>
        <template slot="footer">
          <el-button class="button" v-if="!deleting" @click="f_finishDelete" size="mini" type="primary">Ok</el-button>
        </template>
      </template>
    </popup>
  </div>
</template>
<script>
import { remote } from 'electron'
import filesize from 'filesize'
import Popup from '../../components/Popup'
import PaymentTable from '../../components/PaymentTable'
import getFileType from '../../utils/getFileType'
import { deleteFile } from '../../services/file'
import { getTaskProgress } from '../../services/task'
import { ACT_REMOVE_FILE } from '../../constants/store'
import { EVENT_DELETE_DONE, EVENT_DELETE_FAIL } from '../../constants/ga'

const visitor = remote.getGlobal('gaVisitor')

const TIME_INTERVAL = 1000

export default {
  name: 'delete',
  data() {
    return {
      preparingDelete: false,
      deleting: false,
      inDeleteProgress: false,
      deleteTaskId: '',
      deleteTimer: null,
      deleteProgress: 0,
      deleteFinished: false,
      deleteFailed: false,
      failMsg: '',
      storageRefund: 0,
    }
  },
  props: ['file', 'fileIndex'],
  components: {
    Popup,
    PaymentTable,
  },
  computed: {
    fileType: function() {
      if (this.file) {
        return getFileType(this.file.filename)
      }
      return 'plain'
    },
    fileSizeStr: function() {
      return filesize(this.file.size)
    },
    // storageTimeLeft: function() {
    //   return this.file.expireTime - Date.now()
    // },
    // storageTimeStr: function() {
    //   const daysLeft = Math.ceil((this.storageTimeLeft / 60) * 60 * 24)
    //   console.log('storage days: ', daysLeft)
    //   if (daysLeft > 1) {
    //     return `${daysLeft} Days`
    //   }
    //   return `${daysLeft} Day`
    // },
    // paymentData: function() {
    //   return {
    //     list: [
    //       {
    //         product: `Storage refund: ${this.fileSizeStr}/${this.storageTimeStr}`,
    //         fee: `${this.storageRefund} PPCoin(Funds)`,
    //       },
    //     ],
    //   }
    // },
    deleteStatus: function() {
      if (this.deleteFinished) {
        return 'success'
      }
      if (this.deleteFailed) {
        return 'exception'
      }
      return 'text'
    },
  },
  activated() {
    console.log('deletion component activated')
    this.deleting = false
    this.deleteTaskId = ''
    this.deleteTimer = null
    this.deleteProgress = 0
    this.deleteFinished = false
    this.deleteFailed = false
    this.failMsg = ''
  },
  mounted() {
    console.log(this.file)
    // this.f_estimateRefund()
  },
  methods: {
    // f_estimateRefund() {
    //   if (!this.file) {
    //     return
    //   }
    //   return getEstimateRefund({
    //     size: this.file.size,
    //     copyCount: this.file.copyCount,
    //     storageTime: this.storageTimeLeft,
    //   }).then(res => {
    //     console.log(res)
    //     this.storageRefund = res
    //     return res
    //   })
    // },
    f_close() {
      // if (this.deleting) {
      //   return
      // }
      clearTimeout(this.deleteTimer)
      this.$vueBus.$emit(this.$events.CLOSE_DELETE_FILE)
    },
    f_confirm() {
      console.log('getting share code, ', this.file.key)
      if (this.deleting) {
        return
      }
      this.preparingDelete = true
      deleteFile(this.file.key)
        .then(taskId => {
          this.preparingDelete = false
          console.log('task started')
          this.deleting = true
          this.inDeleteProgress = true
          return this.f_getDeleteProgress(taskId)
        })
        .catch(err => {
          this.preparingDelete = false
          this.deleting = false
          this.$message.error(err.message)
        })
    },
    f_getDeleteProgress(taskId) {
      getTaskProgress(taskId)
        .then(res => {
          console.log(res)
          if (res.status === 'Finished') {
            this.deleteFinished = true
            this.deleteProgress = 100
            this.deleting = false
            visitor.event(EVENT_DELETE_DONE).send()
            clearTimeout(this.deleteTimer)
            this.$store.dispatch(ACT_REMOVE_FILE, {
              file: this.file,
              fileIndex: this.fileIndex,
            })
          } else if (res.status === 'Error') {
            this.deleteFailed = true
            this.failMsg = res.errMsg || 'deletion failed'
            this.deleting = false
            visitor.event(EVENT_DELETE_FAIL).send()
            clearTimeout(this.deleteTimer)
          } else if (res.transferred && res.total) {
            this.deleteProgress = res.transferred / res.total
            console.log(this.deleteProgress)
            this.deleteTimer = setTimeout(() => {
              this.f_getDeleteProgress(taskId)
            }, TIME_INTERVAL)
          } else {
            this.deleteProgress = 0
            this.deleteTimer = setTimeout(() => {
              this.f_getDeleteProgress(taskId)
            }, TIME_INTERVAL)
          }
          return false
        })
        .catch(err => {
          console.error('get task progress failed')
          console.error(err)
          this.deleting = false
        })
    },
    f_finishDelete() {
      if (this.deleting) {
        return
      }
      clearTimeout(this.deleteTimer)
      this.$vueBus.$emit(this.$events.DELETE_FILE_DONE)
    },
  },
}
</script>
<style lang="scss" scoped>
.popup {
  text-align: left;
  .content {
    text-align: center;
    padding: 20px 60px;
    .file-icon {
      height: 58px;
      width: 48px;
    }
    .file-name {
      margin-top: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .delete-hint {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .delete-progress {
      width: 400px;
      margin: 10px auto;
    }

    .delete-fail-msg {
      color: $fail-color;
    }

    .delete-success-msg {
      color: $succ-color;
    }
  }
}
</style>
