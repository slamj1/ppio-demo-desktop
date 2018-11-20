<template>
  <el-table class="ppio-list-table transfer-table" :data="tableData" stripe style="width: 100%">
    <p class="empty-text" slot="empty">No {{tableName}} task</p>
    <el-table-column
        prop="name"
        label="File"
        width="240"
        class-name="table-column-filename">
      <template slot-scope="scope">
        <div class="file-name-wrap">
          <span class="transmit-file-icon"></span>
          <span class="transmit-filename" :show-text="false">{{scope.row.file.filename}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column
        prop="progress"
        label="Progress">
      <template slot-scope="scope">
        <el-progress
            class="transmit-progress"
            :stroke-width="4"
            :percentage="scope.row.transferProgress"
            :show-text="scope.row.transferringData"
            :color="getProgressStatus(scope.row)"></el-progress>
        <span class="transfer-progress-text" v-if="scope.row.finished">finished</span>
        <span class="transfer-progress-text" v-else-if="scope.row.transferringData">{{scope.row.transferSpeed}}</span>
        <span class="transfer-progress-text" v-else>generating copies...</span>
      </template>
    </el-table-column>
    <el-table-column
        width="120">
      <template slot-scope="scope">
        <span class="cancel-btn" @click="f_cancel(scope.$index)"><i class="el-icon el-icon-delete"></i></span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'download-list',
  props: ['tableName', 'tableData'],
  methods: {
    f_cancel(taskIndex) {
      this.$emit('cancel', taskIndex)
    },
    getProgressStatus(rowData) {
      if (rowData.finished) {
        return 'success'
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
  }
  .cancel-btn {
    cursor: pointer;
  }
}
</style>
