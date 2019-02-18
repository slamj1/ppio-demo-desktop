<template>
  <div class="user-profile-popover" :class="{ cpool: isCpoolMode }">
    <div class="profile-username">
      <p>
        {{ userData.address }}&nbsp;&nbsp;<span
          @click="f_copyAddress"
          class="address-copy-btn"
          >copy</span
        >
      </p>
    </div>
    <div class="profile-data">
      <el-table
        class="ppio-plain-table profile-table"
        :data="profileData"
        :show-header="false"
        :row-class-name="getRowClassName"
        @row-click="handleClick"
      >
        <el-table-column prop="label" :width="140" class-name="profile-table-key">
        </el-table-column>
        <el-table-column class-name="profile-table-val">
          <template slot-scope="scope">
            <span>{{ scope.row.val }}</span>
            <i v-if="scope.row.key === 'record'" class="el-icon-arrow-right"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="profile-menu-btn cpool-renew" @click="f_renew">
      {{ isCpoolMode ? 'Renew service' : 'Recharge' }}
    </div>
    <!--<div class="profile-menu-btn help-btn" @click="f_goTutorials">How to use?</div>-->
    <div class="profile-menu-btn logout-btn" @click="f_logout">Log out</div>
  </div>
</template>

<script>
import { clipboard, shell, remote } from 'electron'
import moment from 'moment'
import { chiToPPCoin } from '../utils/units'
import { WALLET, HOW_TO_USE } from '../constants/urls'
import { version } from '../../package.json'

const poss = remote.getGlobal('poss')

export default {
  computed: {
    isCpoolMode: function() {
      return this.$isCpoolPackage
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
      if (!this.isCpoolMode) {
        return [
          {
            key: 'balance',
            label: 'Balance',
            val: `${chiToPPCoin(this.userData.balance).toFixed()} PPCoin`,
          },
          {
            key: 'func',
            label: 'Total Spending',
            val: `${chiToPPCoin(this.userData.funds).toFixed()} PPCoin`,
          },
          {
            key: 'record',
            label: 'Transaction Records',
            val: '',
          },
          {
            key: 'checkupdate',
            label: `Check update`,
            val: `v${version}`,
          },
        ]
      } else {
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
            val: `Demo(v${this.$appVer})`,
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
    f_goTutorials() {
      shell.openExternal(HOW_TO_USE)
    },
    f_copyAddress() {
      clipboard.writeText(this.userData.address)
      this.$message.success('Address copied!')
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
      if (row.key === 'help') {
        shell.openExternal(HOW_TO_USE)
      }
    },
    f_renew() {
      if (this.isCpoolMode) {
        const cpoolHost = this.userData.cpoolData.cpoolHost
        console.log(cpoolHost)
        const rechargeUrl = poss.getCpoolService(cpoolHost).apiList.purchase.url
        shell.openExternal(rechargeUrl)
      } else {
        shell.openExternal(WALLET)
      }
    },
  },
}
</script>

<style lang="scss">
@import '../assets/css/_var.scss';

.user-profile-popover {
  max-width: 400px;

  &.cpool {
    max-width: 320px;
  }
  .profile-username {
    font-weight: bold;
    padding: 0 20px;

    p {
      padding: 10px 0;
      border-bottom: 1px solid #dcdfe6;
      word-break: initial;
    }

    .address-copy-btn {
      display: inline-block;
      cursor: pointer;
      font-weight: normal;
      text-decoration: underline;
      color: $primary-color;
    }
  }

  &.cpool .profile-username p {
    word-break: break-all;
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
  .profile-row-checkupdate,
  .profile-row-help {
    cursor: pointer;
  }

  .el-table--enable-row-transition .el-table__row:hover > td {
    background-color: #fff;
  }

  .profile-table-val {
    text-align: right;
  }

  .profile-menu-btn {
    text-align: center;
    height: 34px;
    line-height: 34px;
    font-size: 14px;
    border-top: 1px solid #dcdfe6;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    &.logout-btn {
      color: #f56c6c;
    }
  }
}
</style>
