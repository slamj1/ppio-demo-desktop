<template>
  <el-container class="app-page home">
    <el-aside class="app-aside" mode="vertical" width="200px">
      <el-popover class="aside-profile" v-model="showProfile" @show="onProfileShow">
        <Profile @check-billing="f_goBilling" @check-update="f_checkUpdate" @logout="f_logout"></Profile>
        <div class="profile-wrapper" slot="reference">
          <img class="profile-avatar" :src="userData.avatar" />
          <div class="profile-userinfo">
            <span class="profile-username">{{userData.address}}</span>
            <template v-if="appMode === APP_MODE_COINPOOL">
              <el-progress class="usage-progress" :percentage="usagePercent" :show-text="false"></el-progress>
              <span class="usage-number with-progress">{{usedStorageStr}} / {{capacityStr}}</span>
            </template>
            <template v-else>
              <span class="usage-number">Used: {{usedStorageStr}}</span>
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
      <el-button type="text" class="feedback-btn" @click="showFeedback = true" icon="el-icon-edit-outline">Feedback</el-button>
    </el-aside>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>

    <BillingRecords v-if="showPopups.billingRecords" :recordsData="userData.billingRecords"></BillingRecords>
    <Upload v-if="showPopups.uploadFile" :file="uploadingFile"></Upload>
    <Download v-if="showPopups.downloadFile" :file="downloadingFile"></Download>
    <Get v-if="showPopups.getFile"></Get>
    <Renew v-if="showPopups.renewFile" :file="renewingFile"></Renew>
    <Rename v-if="showPopups.renameFile" :file="renamingFile"></Rename>
    <Share v-if="showPopups.shareFile" :file="sharingFile" :fileIndex="sharingFileIndex"></Share>
    <Feedback v-if="showFeedback" @close="showFeedback = false"></Feedback>
  </el-container>
</template>

<script>
import filesize from 'filesize'
import { mapState, mapGetters } from 'vuex'
import electron from 'electron'
import { APP_MODE_COINPOOL } from '../constants/constants'
import {
  DL_TASK,
  UL_TASK,
  USAGE_STORAGE_GETTER,
  ACT_LOGOUT,
  ACT_START_POLLING_CHI_PRICE,
  ACT_GET_ACCOUNT_DETAILS,
} from '../constants/store'

import Profile from '../components/Profile'
import Download from './subviews/Download'
import Get from './subviews/Get'
import Renew from './subviews/Renew'
import Rename from './subviews/Rename'
import Share from './subviews/Share'
import Upload from './subviews/Upload'
import BillingRecords from './BillingRecords'
import Feedback from './Feedback'

export default {
  name: 'home',
  data() {
    return {
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
      sharingFileIndex: -1,
      renamingFile: null,
      renewingFile: null,
      uploadingFile: null,
      showFeedback: false,
    }
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
    Feedback,
  },
  computed: {
    ...mapState({
      userData: state => state.user,
    }),
    ...mapGetters({
      appMode: 'appMode',
      downloadCount: DL_TASK.GET_TASK_COUNT,
      uploadCount: UL_TASK.GET_TASK_COUNT,
      usedStorage: USAGE_STORAGE_GETTER, // in file size string
    }),
    usedStorageStr: function() {
      if (this.appMode === APP_MODE_COINPOOL) {
        return filesize(this.userData.cpoolData.usage)
      }
      return filesize(this.usedStorage)
    },
    capacityStr: function() {
      if (this.appMode === APP_MODE_COINPOOL) {
        return filesize(this.userData.cpoolData.capacity)
      }
      return 0
    },
    usagePercent: function() {
      if (this.appMode === APP_MODE_COINPOOL) {
        return (this.userData.cpoolData.usage / this.userData.cpoolData.capacity) * 100
      }
      return 0
    },
    curRoutePath: function() {
      return this.$route.path.split('/').slice(-1)[0]
    },
  },
  mounted() {
    this.f_initEventBus()
    this.$store.dispatch(ACT_START_POLLING_CHI_PRICE)
  },
  methods: {
    onProfileShow() {
      this.$store.dispatch(ACT_GET_ACCOUNT_DETAILS)
    },
    f_goBilling() {
      this.showProfile = false
      this.$vueBus.$emit(this.$events.OPEN_BILLING_RECORDS)
    },
    f_checkUpdate() {
      this.showProfile = false
      electron.shell.openExternal('https://pp.io')
    },
    f_logout() {
      this.$store
        .dispatch(ACT_LOGOUT)
        .then(() => this.$router.push({ name: 'account/import' }))
        .catch(err => {
          console.error(err)
        })
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
        // this.$router.push({ name: 'files' })
      })

      // upload file
      // open upload file
      this.$vueBus.$on(this.$events.OPEN_UPLOAD_FILE, file => {
        console.log('open upload file')
        this.uploadingFile = file
        this.showPopups.uploadFile = true
      })
      // close upload file
      this.$vueBus.$on(this.$events.CLOSE_UPLOAD_FILE, () => {
        console.log('close upload file')
        this.showPopups.uploadFile = false
        this.uploadingFile = null
      })
      // upload file
      this.$vueBus.$on(this.$events.UPLOAD_FILE_DONE, () => {
        console.log('upload file done')
        this.showPopups.uploadFile = false
        this.uploadingFile = null
        this.$router.push({ name: 'upload-list' })
      })

      // download file
      // open download file
      this.$vueBus.$on(this.$events.OPEN_DOWNLOAD_FILE, file => {
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
      this.$vueBus.$on(this.$events.OPEN_SHARE_FILE, payload => {
        console.log('open share file ', payload.file)
        this.showPopups.shareFile = true
        this.sharingFile = payload.file
        this.sharingFileIndex = payload.fileIndex
      })
      // close download file
      this.$vueBus.$on(this.$events.CLOSE_SHARE_FILE, () => {
        console.log('close share file')
        this.showPopups.shareFile = false
        this.sharingFile = null
        this.sharingFileIndex = -1
      })
      // shared file
      this.$vueBus.$on(this.$events.SHARE_FILE_DONE, () => {
        console.log('share file done')
        this.showPopups.shareFile = false
        this.sharingFile = null
        this.sharingFileIndex = -1
      })
      // unshared file
      this.$vueBus.$on(this.$events.UNSHARE_FILE_DONE, () => {
        console.log('unshare file done')
        this.showPopups.shareFile = false
        this.sharingFile = null
        this.sharingFileIndex = -1
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
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: flex-start;

      .usage-progress {
        margin: 5px 0;
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

  .feedback-btn {
    position: absolute;
    bottom: 10px;
    left: 20px;
    opacity: 0.6;
    color: #fff;
  }
}
</style>
