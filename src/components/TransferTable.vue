<template>
  <el-table class="ppio-list-table transfer-table" :data="tableData" stripe style="width: 100%">
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
        <el-progress class="transmit-progress" :stroke-width="4" :percentage="scope.row.transferProgress" :show-text="false"></el-progress>
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
  props: ['tableData'],
  methods: {
    f_cancel(taskIndex) {
      this.$emit('cancel', taskIndex)
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/css/_var.scss';

.transfer-table {
  width: 100%;
  height: 100%;

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
    width: 200px;
  }
  .cancel-btn {
    cursor: pointer;
  }
}
</style>
