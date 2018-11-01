<template>
  <el-table :data="listData" stripe style="width: 100%">
    <el-table-column
        prop="name"
        label="File"
        width="260">
      <template slot-scope="scope">
        <span class="transmit-file-icon"></span>
        <span class="transmit-filename" :show-text="false">{{scope.row.file.filename}}</span>
      </template>
    </el-table-column>
    <el-table-column
        prop="progress"
        label="Progress">
      <template slot-scope="scope">
        <el-progress class="transmit-progress" :percentage="scope.row.transferProgress" :show-text="false"></el-progress>
        <span @click="f_cancel(scope.row.id)">取消</span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { mapState } from 'vuex'
import { ACT_CANCEL_DL_TASK, ACT_GET_DL_STATUS } from '@/constants/store'

export default {
  name: 'download-list',
  computed: {
    ...mapState({
      listData: state => {
        console.log(state.file)
        return state.downloadTask.downloadQueue
      },
    }),
  },
  mounted() {
    console.log('mounted')
    this.f_updateStatus()
  },
  activated() {
    console.log('activated')
    // this.f_updateStatus()
  },
  methods: {
    f_cancel(taskId) {
      this.$store.dispatch(ACT_CANCEL_DL_TASK, taskId)
    },
    f_updateStatus() {
      console.log('update dl status')
      this.$store
        .dispatch(ACT_GET_DL_STATUS, this.listData.map(task => task.id))
        .then(() => {
          if (this.listData.length === 0) {
            return
          }
          return setTimeout(() => {
            this.f_updateStatus()
          }, 1000)
        })
        .catch(err => {
          console.error(err)
          this.f_updateStatus()
        })
    },
  },
}
</script>
<style lang="scss" scoped>
</style>
