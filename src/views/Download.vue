<template>
  <TransferTable
      class="download-task-manager"
      tableName="download"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="task-operate-btn pause-btn" v-if="operationProps.task.status === TASK_STATUS_RUNNING" @click="f_pause(operationProps.index)"><i class="app-icon icon-pause"></i></span>
      <span class="task-operate-btn pause-btn" v-if="operationProps.task.status === TASK_STATUS_PAUSED" @click="f_resume(operationProps.index)"><i class="app-icon icon-play"></i></span>
      <span class="task-operate-btn cancel-btn" v-if="!operationProps.task.finished" @click="f_cancel(operationProps.index)"><i class="el-icon el-icon-close"></i></span>
      <span class="task-operate-btn open-btn" v-if="operationProps.task.status === TASK_STATUS_FAIL" @click="f_resume(operationProps.index)"><i class="el-icon el-icon-refresh"></i></span>
      <span class="task-operate-btn open-btn" v-if="operationProps.task.status === TASK_STATUS_SUCC" @click="f_open(operationProps.index)"><i class="app-icon icon-open"></i></span>
      <span class="task-operate-btn delete-btn" v-if="operationProps.task.finished" @click="f_delete(operationProps.index)"><i class="el-icon el-icon-delete"></i></span>
    </template>
  </TransferTable>
</template>
<script>
import fs from 'fs'
import { remote } from 'electron'
import { DL_TASK } from '../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../constants/constants'
import TransferTable from '../components/TransferTable'
import * as TASK_STATUS from '../constants/task'

export default {
  name: 'download-list',
  data: () => ({
    getStatusTimer: null,
    ...TASK_STATUS,
  }),
  computed: {
    taskList() {
      // concat uploading queue and finished queue
      return this.$store.state.downloadTask.taskQueue.concat(
        this.$store.state.downloadTask.finishedQueue,
      )
    },
  },
  components: {
    TransferTable,
  },
  activated() {
    console.log('activated')
    // TODO: start getting all task status on app start
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
      this.$store.dispatch(DL_TASK.ACT_PAUSE_TASK, index).catch(err => {
        this.$message.error(err.message)
      })
    },
    f_resume(index) {
      this.$store.dispatch(DL_TASK.ACT_RESUME_TASK, index).catch(err => {
        this.$message.error(err.message)
      })
    },
    f_cancel(index) {
      const toCancel = window.confirm('Are you sure to cancel the downloading?')
      if (toCancel) {
        this.$store.dispatch(DL_TASK.ACT_CANCEL_TASK, index).catch(err => {
          this.$message.error(err.message)
        })
      }
    },
    f_delete(index) {
      const toDelete = window.confirm('Are you sure to delete the task?')
      if (toDelete) {
        const deleteIdx = index - this.$store.state.downloadTask.taskQueue.length
        this.$store.dispatch(DL_TASK.ACT_DELETE_TASK, deleteIdx).catch(err => {
          this.$message.error(err.message)
        })
      }
    },
    f_open(index) {
      console.log('opening file ', index)
      const filePath = this.taskList[index].exportPath
      console.log(filePath)
      try {
        if (fs.existsSync(filePath)) {
          remote.shell.showItemInFolder(filePath)
        } else {
          this.$message.error('File does not exist!')
        }
      } catch (err) {
        this.$message.error('File does not exist!')
      }
    },
    f_updateStatus() {
      this.$store.dispatch(DL_TASK.ACT_GET_PROGRESS).catch(err => {
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

<style lang="scss">
.download-task-manager {
  .task-operate-btn {
    cursor: pointer;
  }

  .app-icon {
    vertical-align: middle;
  }
}
</style>
