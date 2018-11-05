<template>
  <TransferTable
      tableName="upload"
      :tableData="transferList"
      @cancel="f_cancel"
  ></TransferTable>
</template>
<script>
import { mapState } from 'vuex'
import { UL_TASK } from '../constants/store'
import TransferTable from '@/components/TransferTable'

export default {
  name: 'upload-list',
  data: () => ({
    getStatusTimer: null,
  }),
  computed: {
    ...mapState({
      transferList: state => {
        console.log(state.file)
        return state.uploadTask.taskQueue
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
      const toCancel = window.confirm('Are you sure to cancel the uploading?')
      if (toCancel) {
        this.$store.dispatch(UL_TASK.ACT_CANCEL_TASK, taskId)
      }
    },
    f_updateStatus() {
      console.log('update ul status')
      this.$store
        .dispatch(UL_TASK.ACT_GET_STATUS, this.transferList.map(task => task.id))
        .then(() => true)
        .catch(err => {
          console.error(err)
          this.f_updateStatus()
        })
      if (this.transferList.length > 0) {
        this.getStatusTimer = setTimeout(() => {
          this.f_updateStatus()
        }, 2000)
      }
    },
  },
}
</script>
