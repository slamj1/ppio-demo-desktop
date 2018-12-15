<template>
  <TransferTable
      class="upload-task-manager"
      tableName="upload"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="task-operate-btn pause-btn" v-if="operationProps.task.status === TASK_STATUS_RUNNING" @click="f_pause(operationProps.index)"><i class="app-icon icon-pause"></i></span>
      <span class="task-operate-btn pause-btn" v-if="operationProps.task.status === TASK_STATUS_PAUSED" @click="f_resume(operationProps.index)"><i class="app-icon icon-play"></i></span>
      <span class="task-operate-btn cancel-btn" v-if="!operationProps.task.finished" @click="f_cancel(operationProps.index)"><i class="el-icon el-icon-close"></i></span>
      <span class="task-operate-btn delete-btn" v-if="operationProps.task.finished" @click="f_delete(operationProps.index)"><i class="el-icon el-icon-delete"></i></span>
    </template>
  </TransferTable>
</template>
<script>
import { TASK_STATUS_RUNNING, TASK_STATUS_PAUSED } from '../constants/task'
import { UL_TASK } from '../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../constants/constants'
import TransferTable from '../components/TransferTable'

export default {
  name: 'upload-list',
  data: () => ({
    getStatusTimer: null,
    TASK_STATUS_PAUSED,
    TASK_STATUS_RUNNING,
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
    f_pause(index) {
      this.$store.dispatch(UL_TASK.ACT_PAUSE_TASK, index)
    },
    f_resume(index) {
      this.$store.dispatch(UL_TASK.ACT_RESUME_TASK, index)
    },
    f_cancel(index) {
      const toCancel = window.confirm('Are you sure to cancel the uploading?')
      if (toCancel) {
        // this.$store.commit(UL_TASK.MUT_REMOVE_TASK, index)
        this.$store.dispatch(UL_TASK.ACT_CANCEL_TASK, index)
      }
    },
    f_delete(index) {
      const toDelete = window.confirm('Are you sure to delete the task?')
      if (toDelete) {
        const deleteIdx = index - this.$store.state.uploadTask.taskQueue.length
        this.$store.dispatch(UL_TASK.ACT_DELETE_TASK, deleteIdx)
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
