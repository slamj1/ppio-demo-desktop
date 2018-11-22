<template>
  <TransferTable
      class="download-task-manager"
      tableName="download"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="open-btn" @click="f_open(operationProps.index)"><i class="app-icon icon-open"></i></span>
    </template>
  </TransferTable>
</template>
<script>
import { remote } from 'electron'
import { DL_TASK } from '../constants/store'
import TransferTable from '@/components/TransferTable'

export default {
  name: 'download-list',
  data: () => ({
    getStatusTimer: null,
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
    f_open(index) {
      console.log('opening file ', index)
      console.log(this.taskList[index].exportPath)
      remote.shell.showItemInFolder(this.taskList[index].exportPath)
    },
    f_updateStatus() {
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

<style lang="scss">
.download-task-manager {
  .open-btn {
    cursor: pointer;

    .app-icon {
      vertical-align: middle;
    }
  }
}
</style>
