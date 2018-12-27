<template>
  <div class="user-profile-popover" :class="{'cpool': isCpoolMode}">
    <div class="profile-username">
      <p>{{userData.address}}&nbsp;&nbsp;<span @click="f_copyAddress" class="address-copy-btn">copy</span></p>
    </div>
    <div class="profile-data">
      <el-table
          class="ppio-plain-table profile-table"
          :data="profileData"
          :show-header="false"
          :row-class-name="getRowClassName"
          @row-click="handleClick">
        <el-table-column
            prop="label"
            :width="100"
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
    <div class="cpool-renew" @click="f_renew">{{isCpoolMode ? 'Renew service' : 'Recharge'}}</div>
    <div class="logout-btn" @click="f_logout">Log out</div>
  </div>
</template>

<script>
import { clipboard } from 'electron'
import moment from 'moment'
import { chiToPPCoin } from '../utils/units'
import { APP_MODE_NON_COINPOOL, APP_MODE_COINPOOL } from '../constants/constants'

export default {
  computed: {
    isCpoolMode: function() {
      return this.$store.getters.appMode === APP_MODE_COINPOOL
    },
    userData: function() {
      return this.$store.state.user
    },
    expireDate: function() {
      const expireTime = this.userData.cpoolData.expires
      if (expireTime !== -1) {
        return moment(expireTime).format('YYYY/MM/DD')
      }
      return 'unlimited'
    },
    profileData: function() {
      if (this.$store.getters.appMode === APP_MODE_NON_COINPOOL) {
        return [
          {
            key: 'balance',
            label: 'Balance',
            val: `${chiToPPCoin(this.userData.balance).toFixed()} PPCoin`,
          },
          {
            key: 'func',
            label: 'Funds',
            val: `${chiToPPCoin(this.userData.funds).toFixed()} PPCoin`,
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
      } else if (this.$store.getters.appMode === APP_MODE_COINPOOL) {
        return [
          {
            key: 'cpool',
            label: 'My coin pool',
            val: this.userData.cpoolData.cpoolName,
          },
          {
            key: 'plan',
            label: 'Plan',
            val: this.userData.cpoolData.planName,
          },
          {
            key: 'expires',
            label: 'Expire date',
            val: this.expireDate,
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
      }
    },
  },
  methods: {
    f_copyAddress() {
      clipboard.writeText(this.userData.address)
    },
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
    f_renew() {
      console.log('renew cpool service')
    },
  },
}
</script>

<style lang="scss">
@import '../assets/css/_var.scss';

.user-profile-popover {
  max-width: 370px;

  &.cpool {
    max-width: 260px;
  }
  .profile-username {
    font-weight: bold;
    padding: 0 20px;

    p {
      padding: 10px 0;
      border-bottom: 1px solid #dcdfe6;
    }

    .address-copy-btn {
      cursor: pointer;
      font-weight: normal;
      text-decoration: underline;
      color: $primary-color;
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
    color: #f56c6c;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .cpool-renew {
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
