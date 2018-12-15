<template>
  <el-table class="ppio-list-table transfer-table" :data="tableData" stripe style="width: 100%">
    <p class="empty-text" slot="empty">No {{tableName}} task</p>
    <el-table-column
        prop="name"
        label="File"
        width="240"
        class-name="table-column-filename">
      <template scope="scope">
        <div class="file-name-wrap">
          <span class="transmit-file-icon"></span>
          <span class="transmit-filename" :show-text="false">{{scope.row.file.filename}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="progress" label="Progress">
      <template scope="scope">
        <el-progress
            class="transmit-progress"
            v-if="scope.row.status !== TASK_STATUS_FAIL"
            :stroke-width="4"
            :percentage="scope.row.transferProgress"
            :show-text="scope.row.status === TASK_STATUS_RUNNING || scope.row.finished"
            :status="getProgressStatus(scope.row)"></el-progress>
        <span class="transfer-progress-text" v-if="scope.row.status === TASK_STATUS_RUNNING">{{scope.row.displayTransferSpeed}}</span>
        <span class="transfer-progress-text failed" v-else-if="scope.row.status === TASK_STATUS_FAIL">{{scope.row.failMsg}}</span>
      </template>
    </el-table-column>
    <el-table-column width="120">
      <template scope="scope">
        <slot name="operations" :index="scope.$index" :task="scope.row"></slot>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { TASK_STATUS_FAIL, TASK_STATUS_RUNNING } from '../constants/task'

export default {
  name: 'transfer-list',
  data() {
    return {
      TASK_STATUS_FAIL,
      TASK_STATUS_RUNNING,
    }
  },
  props: ['tableName', 'tableData'],
  mounted() {
    console.log(this.tableData)
  },
  methods: {
    f_cancel(taskIndex) {
      this.$emit('cancel', taskIndex)
    },
    getProgressStatus(rowData) {
      if (rowData.finished) {
        return 'success'
      }

      if (rowData.status === TASK_STATUS_FAIL) {
        return 'exeption'
      }

      return 'text'
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/css/_var.scss';

.transfer-table {
  width: 100%;
  height: 100%;

  .empty-text {
    padding: 50px 0;
  }

  .el-table__header-wrapper .el-table__header {
    -webkit-app-region: drag;
  }

  .table-column-filename {
    .file-name-wrap {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .transmit-file-icon {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 24px;
    margin-right: 10px;
    background-image: url(~@/assets/img/file_download.png);
    @include general-bg;
  }
  .transmit-progress {
    display: inline-block;
    width: 200px;
    margin-right: 20px;
    vertical-align: middle;
  }
  .transfer-progress-text {
    display: inline-block;

    &.processing {
      color: #ccc;
    }

    &.failed {
      color: red;
    }
  }
}
</style>
