<template>
  <TransferTable
      class="upload-task-manager"
      tableName="upload"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="task-operate-btn delete-btn" v-if="operationProps.task.status.failed || operationProps.task.status.finished" @click="f_delete(operationProps.index)"><i class="el-icon el-icon-delete"></i></span>
      <!--<span class="task-operate-btn cancel-btn" v-if="operationProps.task.status.transferringData" @click="f_cancel(operationProps.index)"><i class="el-icon el-icon-close"></i></span>-->
    </template>
  </TransferTable>
</template>
<script>
import { UL_TASK } from '../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../constants/constants'
import TransferTable from '../components/TransferTable'

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
    f_cancel(index) {
      const toCancel = window.confirm('Are you sure to cancel the uploading?')
      if (toCancel) {
        this.$store.dispatch(UL_TASK.ACT_CANCEL_TASK, index)
      }
    },
    f_delete(index) {
      const toDelete = window.confirm('Are you sure to delete the task?')
      if (toDelete) {
        const cancelIdx = index - this.$store.state.uploadTask.taskQueue.length
        this.$store.commit(UL_TASK.MUT_REMOVE_TASK, cancelIdx)
      }
    },
    f_updateStatus() {
      this.$store.dispatch(UL_TASK.ACT_GET_PROGRESS).catch(err => {
        console.error(err)
      })
      if (this.taskList.length > 0) {
        this.getStatusTimer = setTimeout(() => {
          this.f_updateStatus()
        }, TASK_GET_PROGRESS_INTERVAL)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.task-operate-btn {
  cursor: pointer;
}
</style>
