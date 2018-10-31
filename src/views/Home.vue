<template>
  <el-container class="app-page home">
    <el-aside class="app-aside" mode="vertical" width="200px">
      <div class="aside-profile">
        <img class="profile-avatar" :src="avatar" />
        <div class="profile-userinfo">
          <span class="profile-username">{{username}}</span>
          <template v-if="mode === APP_MODE_COINPOOL">
            <el-progress class="usage-progress" :percentage="usedPercent" :show-text="false"></el-progress>
            <span class="usage-number with-progress">{{usedStorage}}G/{{capacity}}G</span>
          </template>
          <template v-else>
            <span class="usage-number">Used: {{usedStorage}}</span>
          </template>
        </div>
      </div>
      <el-menu default-active="0" class="aside-nav">
        <el-menu-item index="0">
          <i class="app-icon icon-nav-file"></i>
          <span slot="title">All files</span>
        </el-menu-item>
        <p class="nav-group-title">Transmission list</p>
        <el-menu-item index="1">
          <i class="app-icon icon-nav-download"></i>
          <span slot="title">Downloading</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="app-icon icon-nav-upload"></i>
          <span slot="title">Uploading</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <router-view></router-view>
  </el-container>
</template>

<script>
import { APP_MODE_COINPOOL } from '@/constants/constants'

export default {
  name: 'home',
  data() {
    return {
      avatar: require('@/assets/img/avatar.png'),
      username: 'fdsafeILHULHUIfwe235feILHULfeILHUL',
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      usedStorage: '720',
      capacity: '1000',
    }
  },
  computed: {
    usedPercent() {
      return (this.usedStorage / this.capacity) * 100
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/_var.scss';

$nav-font-color: #c0c4cc;

.app-page {
  height: 100%;
}

.app-aside {
  padding-top: 30px;
  background-color: $sidebar-color;
  color: #fff;
  -webkit-app-region: drag;

  .aside-profile {
    width: 100%;
    padding: 16px 20px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    -webkit-app-region: no-drag;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .profile-avatar {
      flex: 0 0 40px;
      margin-right: 10px;
      width: 40px;
      height: 40px;
      border-radius: 20px;
    }

    .profile-username {
      width: 110px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .profile-userinfo {
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
        color: #909399;
      }
    }
  }

  .aside-nav {
    margin-top: 16px;
    background-color: transparent;
    -webkit-app-region: no-drag;
    border: none;

    .el-menu-item {
      height: 40px;
      line-height: 40px;
      background-color: transparent;
      color: $nav-font-color;
      padding: 0 20px;

      &:hover {
        color: $nav-font-color;
        background-color: transparent;
      }

      &.is-active {
        color: #fff;
        background-color: $primary-color;
      }
    }

    .nav-group-title {
      margin-top: 16px;
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
