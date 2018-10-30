<template>
  <el-container class="app-page home">
    <el-header class="app-header">
      <div class="header-profile">
        <img class="header-avatar" :src="avatar" />
        <div class="header-userinfo">
          <span class="header-username">{{username}}</span>
          <template v-if="mode === APP_MODE_COINPOOL">
            <el-progress class="usage-progress" :percentage="usedPercent" :show-text="false"></el-progress>
            <span class="usage-number with-progress">{{usedStorage}}G/{{capacity}}G</span>
          </template>
          <template v-else>
            <span class="usage-number">Used: {{usedStorage}}</span>
          </template>
        </div>
      </div>
      <el-col class="header-btn-group" :span="12">
        <el-row>
          <template v-if="isSelect">
            <el-button size="small" type="primary" :loading="preparingDl" @click="f_download"><i class="el-icon-download el-icon--left"></i> Download</el-button>
            <el-button size="small" plain :loading="preparingShare" @click="f_share"><i class="el-icon-share el-icon--left"></i> Share</el-button>
            <el-dropdown size="small" trigger="click" :hide-on-click="false">
              <span class="el-dropdown-link">
                More<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :loading="preparingRename" @click="f_rename">Rename</el-dropdown-item>
                <el-dropdown-item :loading="preparingRenew" @click="f_renew">Renew</el-dropdown-item>
                <el-dropdown-item :loading="preparingDel" @click="f_delete">Delete</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button size="small" plain :loading="preparingUl" @click="f_upload"><i class="el-icon-upload el-icon--left"></i> Upload</el-button>
            <el-button size="small" plain :loading="preparingGet" @click="f_get"><i class="el-icon-download el-icon--left"></i> Get</el-button>
          </template>
        </el-row>
      </el-col>
      <el-button class="refresh-btn" icon="el-icon-refresh" circle></el-button>
    </el-header>
    <el-main></el-main>
  </el-container>
</template>

<script>
import { APP_MODE_COINPOOL } from '@/constants/constants'

export default {
  name: 'home',
  data() {
    return {
      avatar: '',
      username: 'fdsafeILHULHUIfwe235',
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      usedStorage: '720',
      capacity: '1000',
      isSelect: false,
      preparingDl: false,
      preparingShare: false,
      preparingRename: false,
      preparingRenew: false,
      preparingDel: false,
      preparingUl: false,
      preparingGet: false,
    }
  },
  computed: {
    usedPercent() {
      return (this.usedStorage / this.capacity) * 100
    },
  },
  components: {},
  methods: {
    f_download() {},

    f_share() {},

    f_rename() {},

    f_renew() {},

    f_delete() {},

    f_upload() {},

    f_get() {},
  },
}
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #1e1c51;
  color: #fff;
}
.header-profile {
  flex: 0 0 240px;
  margin-right: 20px;

  .header-avatar {
    float: left;
    margin-right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-top: 3px;
  }

  .header-userinfo {
    height: 46px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;

    .usage-progress {
      align-self: stretch;
    }

    .usage-number {
      font-size: 12px;
      color: #ccc;

      &.with-progress {
        align-self: flex-end;
      }
    }
  }
}
</style>
