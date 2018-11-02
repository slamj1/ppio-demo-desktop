<template>
  <div class="user-profile-popover">
    <div class="profile-username">
      <p>{{userData.address}}</p>
    </div>
    <div class="profile-data">
      <el-table
          class="profile-table"
          :data="profileData"
          :show-header="false"
          :row-class-name="getRowClassName"
          @row-click="handleClick">
        <el-table-column
            prop="label"
            class-name="profile-table-key">
        </el-table-column>
        <el-table-column
            class-name="profile-table-val">
          <template slot-scope="scope">
            <i v-if="scope.row.key === 'record' || scope.row.key === 'checkupdate'" class="el-icon-arrow-right"></i>
            <p v-else>{{scope.row.val}}</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="logout-btn" @click="f_logout">Log out</div>
  </div>
</template>

<script>
export default {
  props: ['userData'],
  computed: {
    profileData() {
      return [
        {
          key: 'balance',
          label: 'Balance',
          val: this.userData.balance,
        },
        {
          key: 'func',
          label: 'Fund',
          val: this.userData.fund,
        },
        {
          key: 'record',
          label: 'Record',
          val: '',
        },
        {
          key: 'version',
          label: 'Version',
          val: `Demo(v${this.$store.state.appVersion})`,
        },
        {
          key: 'checkupdate',
          label: 'Check update',
          val: '',
        },
      ]
    },
  },
  methods: {
    f_logout() {
      this.$emit('logout')
    },
    getRowClassName: ({ row }) => `profile-row-${row.key}`,
    handleClick(row) {
      if (row.key === 'record') {
        this.$emit('check-billing')
      }
      if (row.key === 'checkupdate') {
        this.$emit('check-update')
      }
    },
  },
}
</script>

<style lang="scss">
.user-profile-popover {
  max-width: 240px;

  .profile-username {
    font-weight: bold;
    padding: 0 20px;

    p {
      padding: 10px 0;
      border-bottom: 1px solid #dcdfe6;
    }
  }

  .profile-data {
    padding: 4px 20px;
  }

  .profile-table::before {
    display: none;
  }

  .profile-table-key,
  .profile-table-val {
    padding: 4px 0;
    border: 0;
    white-space: nowrap;

    .cell {
      padding: 0;
    }
  }

  .profile-row-record,
  .profile-row-checkupdate {
    cursor: pointer;
  }

  .el-table--enable-row-transition .el-table__row:hover > td {
    background-color: #fff;
  }

  .profile-table-val {
    text-align: right;
  }

  .logout-btn {
    text-align: center;
    height: 34px;
    line-height: 34px;
    font-size: 14px;
    border-top: 1px solid #dcdfe6;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
