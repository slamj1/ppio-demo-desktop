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

    <BillingRecords v-if="showPopups.billingRecords" :recordsData="userData.billingRecords"></BillingRecords>
    <Download ref="download-file" v-if="showPopups.downloadFile" :file="downloadingFile"></Download>
    <Get v-if="showPopups.getFile"></Get>
    <Renew v-if="showPopups.renewFile" :file="renewingFile"></Renew>
    <Rename v-if="showPopups.renameFile" :file="renamingFile" :fileindex="renamingFileIndex"></Rename>
    <Share v-if="showPopups.shareFile" :file="sharingFile"></Share>
    <Upload v-if="showPopups.uploadFile"></Upload>
  </el-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import electron from 'electron'
import { APP_MODE_COINPOOL } from '../constants/constants'
import { DL_TASK, UL_TASK, USAGE_PERCENT_GETTER } from '../constants/store'

import Profile from '../components/Profile'
import Download from './subviews/Download'
import Get from './subviews/Get'
import Renew from './subviews/Renew'
import Rename from './subviews/Rename'
import Share from './subviews/Share'
import Upload from './subviews/Upload'
import BillingRecords from '../views/BillingRecords'

export default {
  name: 'home',
  data() {
    return {
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      showProfile: false,
      showPopups: {
        downloadFile: false,
        getFile: false,
        renewFile: false,
        shareFile: false,
        uploadFile: false,
        billingRecords: false,
        renameFile: false,
      },
      downloadingFile: null,
      sharingFile: null,
      renamingFile: null,
      renamingFileIndex: -1,
      renewingFile: null,
    }
  },
  computed: {
    ...mapState({
      userData: state => state.user,
    }),
    ...mapGetters({
      downloadCount: DL_TASK.GET_TASK_COUNT,
      uploadCount: UL_TASK.GET_TASK_COUNT,
      usagePercent: USAGE_PERCENT_GETTER,
    }),
    curRoutePath() {
      return this.$route.path.split('/').slice(-1)[0]
    },
  },
  components: {
    Profile,
    BillingRecords,
    Download,
    Get,
    Renew,
    Rename,
    Share,
    Upload,
  },
  mounted() {
    this.f_initEventBus()
  },
  methods: {
    f_goBilling() {
      this.showProfile = false
      this.$vueBus.$emit(this.$events.OPEN_BILLING_RECORDS)
    },
    f_checkUpdate() {
      this.showProfile = false
      electron.shell.openExternal('https://pp.io')
    },
    f_initEventBus() {
      // open get file
      this.$vueBus.$on(this.$events.OPEN_GET_FILE, () => {
        console.log('open get file')
        this.showPopups.getFile = true
      })
      // close get file
      this.$vueBus.$on(this.$events.CLOSE_GET_FILE, () => {
        console.log('close get file')
        this.showPopups.getFile = false
      })
      // get file done
      this.$vueBus.$on(this.$events.GET_FILE_DONE, () => {
        console.log('get file done')
        this.showPopups.getFile = false
      })

      // download file
      // open download file
      this.$vueBus.$on(this.$events.OPEN_DOWNLOAD_FILE, file => {
        this.$store.dispatch(DL_TASK.ACT_CREATE_TASK, file)
        console.log('open download file ', file)
        this.showPopups.downloadFile = true
        this.downloadingFile = file
      })
      // close download file
      this.$vueBus.$on(this.$events.CLOSE_DOWNLOAD_FILE, () => {
        console.log('close download file')
        this.showPopups.downloadFile = false
        this.downloadingFile = null
      })
      // download file done
      this.$vueBus.$on(this.$events.DOWNLOAD_FILE_DONE, () => {
        console.log('download file done')
        this.showPopups.downloadFile = false
        this.downloadingFile = null
        this.$router.push({ name: 'download-list' })
      })

      // share file
      // open share file
      this.$vueBus.$on(this.$events.OPEN_SHARE_FILE, file => {
        console.log('open share file ', file)
        this.showPopups.shareFile = true
        this.sharingFile = file
      })
      // close download file
      this.$vueBus.$on(this.$events.CLOSE_SHARE_FILE, () => {
        console.log('close share file')
        this.showPopups.shareFile = false
        this.sharingFile = null
      })
      // shared file
      this.$vueBus.$on(this.$events.SHARE_FILE_DONE, () => {
        console.log('share file done')
        this.showPopups.shareFile = false
        this.sharingFile = null
      })
      // unshared file
      this.$vueBus.$on(this.$events.UNSHARE_FILE_DONE, () => {
        console.log('unshare file done')
        this.showPopups.shareFile = false
        this.sharingFile = null
      })

      // renew file
      // open renew file
      this.$vueBus.$on(this.$events.OPEN_RENEW_FILE, file => {
        console.log('open renew file ', file)
        this.showPopups.renewFile = true
        this.renewingFile = file
      })
      // close renew file
      this.$vueBus.$on(this.$events.CLOSE_RENEW_FILE, () => {
        console.log('close renew file')
        this.showPopups.renewFile = false
        this.renewingFile = null
      })
      // renew file
      this.$vueBus.$on(this.$events.RENEW_FILE_DONE, () => {
        console.log('renew file done')
        this.showPopups.renewFile = false
        this.renewingFile = null
      })

      // rename file
      // open rename file
      this.$vueBus.$on(this.$events.OPEN_RENAME_FILE, payload => {
        console.log('open rename file ', payload.file)
        this.showPopups.renameFile = true
        this.renamingFile = payload.file
        this.renamingFileIndex = payload.fileindex
      })
      // close rename file
      this.$vueBus.$on(this.$events.CLOSE_RENAME_FILE, () => {
        console.log('close rename file')
        this.showPopups.renameFile = false
        this.renamingFile = null
      })
      // rename file
      this.$vueBus.$on(this.$events.RENAME_FILE_DONE, () => {
        console.log('rename file done')
        this.showPopups.renameFile = false
        this.renamingFile = null
      })

      // upload file
      // open upload file
      this.$vueBus.$on(this.$events.OPEN_UPLOAD_FILE, () => {
        console.log('open upload file ')
        this.showPopups.uploadFile = true
      })
      // close download file
      this.$vueBus.$on(this.$events.CLOSE_UPLOAD_FILE, () => {
        console.log('close upload file')
        this.showPopups.uploadFile = false
      })
      // uploadd file
      this.$vueBus.$on(this.$events.UPLOAD_FILE_DONE, () => {
        console.log('upload file done')
        this.showPopups.uploadFile = false
        this.$router.push({ name: 'upload-list' })
      })

      // open billing records
      this.$vueBus.$on(this.$events.OPEN_BILLING_RECORDS, () => {
        console.log('open billing records')
        this.showPopups.billingRecords = true
      })
      // close billing records
      this.$vueBus.$on(this.$events.CLOSE_BILLING_RECORDS, () => {
        console.log('close billing records')
        this.showPopups.billingRecords = false
      })
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
