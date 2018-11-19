<template>
  <TransferTable
      tableName="download"
      :tableData="taskList"
      @cancel="f_cancel"
  ></TransferTable>
</template>
<script>
import { mapState } from 'vuex'
import { DL_TASK } from '../constants/store'
import TransferTable from '@/components/TransferTable'

export default {
  name: 'download-list',
  data: () => ({
    getStatusTimer: null,
  }),
  computed: {
    ...mapState({
      taskList: state => {
        console.log(state.file)
        return state.downloadTask.taskQueue
      },
    }),
  },
  components: {
    TransferTable,
  },
  activated() {
    console.log('activated')
    this.f_updateStatus()
  },
  deactivated() {
    console.log('deactivated')
    if (this.getStatusTimer) {
      clearTimeout(this.getStatusTimer)
    }
  },
  methods: {
    f_cancel(taskId) {
      const toCancel = window.confirm('Are you sure to cancel the downloading?')
      if (toCancel) {
        this.$store.dispatch(DL_TASK.ACT_CANCEL_TASK, taskId)
      }
    },
    f_updateStatus() {
      console.log('update dl status')
      this.$store.dispatch(DL_TASK.ACT_GET_STATUS).catch(err => {
        console.error(err)
      })
      if (this.taskList.length > 0) {
        this.getStatusTimer = setTimeout(() => {
          this.f_updateStatus()
        }, 2000)
      }
    },
  },
}
</script>
