<template>
  <TransferTable
      class="upload-task-manager"
      tableName="upload"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="cancel-btn" @click="f_cancel(operationProps.index)"><i class="el-icon el-icon-delete"></i></span>
    </template>
    <template slot="operations">

    </template>
  </TransferTable>
</template>
<script>
import { UL_TASK } from '../constants/store'
import TransferTable from '@/components/TransferTable'

export default {
  name: 'upload-list',
  data: () => ({
    getStatusTimer: null,
  }),
  computed: {
    taskList() {
      // concat uploading queue and finished queue
      return this.$store.state.uploadTask.taskQueue.concat(
        this.$store.state.uploadTask.finishedQueue,
      )
    },
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
      const toCancel = window.confirm('Are you sure to cancel the uploading?')
      if (toCancel) {
        this.$store.dispatch(UL_TASK.ACT_CANCEL_TASK, taskId)
      }
    },
    f_updateStatus() {
      this.$store.dispatch(UL_TASK.ACT_GET_STATUS).catch(err => {
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
