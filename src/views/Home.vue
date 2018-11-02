<template>
  <el-container class="app-page home">
    <el-aside class="app-aside" mode="vertical" width="200px">
      <el-popover class="aside-profile" v-model="showProfile">
        <Profile :userData="userData" @check-billing="f_goBilling" @check-update="f_checkUpdate"></Profile>
        <div class="profile-wrapper" slot="reference">
          <img class="profile-avatar" :src="userData.avatar" />
          <div class="profile-userinfo">
            <span class="profile-username">{{userData.address}}</span>
            <template v-if="mode === APP_MODE_COINPOOL">
              <el-progress class="usage-progress" :percentage="usagePercent" :show-text="false"></el-progress>
              <span class="usage-number with-progress">{{userData.usedStorage}}G/{{userData.capacity}}G</span>
            </template>
            <template v-else>
              <span class="usage-number">Used: {{userData.usedStorage}}</span>
            </template>
          </div>
        </div>
      </el-popover>
      <el-menu :default-active="curRoutePath" :router="true" class="aside-nav">
        <el-menu-item index="files">
          <i class="app-icon icon-nav-file"></i>
          <span slot="title">All files</span>
        </el-menu-item>
        <p class="nav-group-title">Transmission list</p>
        <el-menu-item index="download-list">
          <i class="app-icon icon-nav-download"></i>
          <span slot="title">Downloading <el-badge class="task-count-badge" v-show="downloadCount > 0" :value="downloadCount" /></span>
        </el-menu-item>
        <el-menu-item index="upload-list">
          <i class="app-icon icon-nav-upload"></i>
          <span slot="title">Uploading <el-badge class="task-count-badge" v-show="uploadCount > 0" :value="uploadCount" /></span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </el-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import electron from 'electron'
import { APP_MODE_COINPOOL } from '../constants/constants'
import { DL_TASK, UL_TASK, USAGE_PERCENT_GETTER } from '../constants/store'
import Profile from '@/components/Profile'

export default {
  name: 'home',
  data() {
    return {
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      showProfile: false,
    }
  },
  computed: {
    curRoutePath() {
      return this.$route.path.split('/').slice(-1)[0]
    },
    ...mapGetters({
      downloadCount: DL_TASK.GET_TASK_COUNT,
      uploadCount: UL_TASK.GET_TASK_COUNT,
      usagePercent: USAGE_PERCENT_GETTER,
    }),
    ...mapState({
      userData: state => state.user,
    }),
  },
  components: {
    Profile,
  },
  methods: {
    f_goBilling() {
      this.$router.push({ name: 'billing-records' })
      this.showProfile = false
    },
    f_checkUpdate() {
      this.showProfile = false
      electron.shell.openExternal('https://pp.io')
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
    display: block;
    -webkit-app-region: no-drag;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .profile-wrapper {
      width: 100%;
      padding: 16px 20px;
      display: flex;
      flex-direction: row;
      justify-content: left;
      align-items: center;
      cursor: pointer;
    }
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

    .task-count-badge {
      display: inline-block;
      position: absolute;
      right: 10px;
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
