<template>
  <el-table class="ppio-list-table billing-table" :data="billingRecords" stripe style="width: 100%">
    <el-table-column
        label="Time"
        width="240"
        class-name="table-column-time">
      <template slot-scope="scope">
        <p class="billing-time">{{getTime(scope.row.timestamp)}}</p>
      </template>
    </el-table-column>
    <el-table-column
        prop="product"
        label="Product">
    </el-table-column>
    <el-table-column
        prop="transaction"
        label="Transaction"
        width="180">
    </el-table-column>
  </el-table>
</template>

<script>
import moment from 'moment'
import { ACT_GET_JOURNAL } from '../constants/store'

export default {
  name: 'billing-records',
  computed: {
    billingRecords() {
      return this.$store.state.user.billingRecords
    },
  },
  activated() {
    this.$store.dispatch(ACT_GET_JOURNAL)
  },
  methods: {
    getTime(timestamp) {
      return moment(timestamp)
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/css/_var.scss';

$stripe-color: #f5f7fa;

.transfer-table {
  width: 100%;
  height: 100%;

  .el-table__header-wrapper .el-table__header {
    th {
      background-color: $stripe-color;
      padding: 6px 0;
      color: #606266;
      font-weight: normal;
    }
  }

  .el-table__body {
    thead td {
      background-color: $stripe-color;
    }

    .el-table__row--striped td {
      background-color: $stripe-color;
    }
  }

  .table-column-filename {
    padding-left: 30px;

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
