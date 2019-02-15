<template>
  <el-container class="app-page home">
    <el-aside class="app-aside" mode="vertical" width="200px">
      <el-popover class="aside-profile" v-model="showProfile" @show="onProfileShow">
        <Profile
          @check-billing="f_goBilling"
          @check-update="f_checkUpdate"
          @logout="f_logout"
        ></Profile>
        <div class="profile-wrapper" slot="reference">
          <img class="profile-avatar" src="/img/avatar.png" />
          <div class="profile-userinfo">
            <span class="profile-username">{{ userData.address }}</span>
            <template v-if="$isCpoolPackage">
              <el-progress
                class="usage-progress"
                :percentage="usagePercent"
                :show-text="false"
              ></el-progress>
              <span class="usage-number with-progress"
                >{{ usedStorageStr }} / {{ capacityStr }}</span
              >
            </template>
            <template v-else>
              <span class="usage-number">Used: {{ usedStorageStr }}</span>
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
          <span slot="title"
            >Downloading
            <el-badge
              class="task-count-badge"
              v-show="downloadCount > 0"
              :value="downloadCount"
          /></span>
        </el-menu-item>
        <el-menu-item index="upload-list">
          <i class="app-icon icon-nav-upload"></i>
          <span slot="title"
            >Uploading
            <el-badge
              class="task-count-badge"
              v-show="uploadCount > 0"
              :value="uploadCount"
          /></span>
        </el-menu-item>
      </el-menu>
      <el-button
        type="text"
        class="feedback-btn"
        @click="showFeedback = true"
        icon="el-icon-edit-outline"
        >Feedback</el-button
      >
    </el-aside>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>

    <BillingRecords
      v-if="showPopups.billingRecords"
      :recordsData="userData.billingRecords"
    ></BillingRecords>
    <Upload v-if="showPopups.uploadFile" :filePath="uploadingFilePath"></Upload>
    <Download v-if="showPopups.downloadFile" :file="downloadingFile"></Download>
    <Get v-if="showPopups.getFile"></Get>
    <Renew v-if="showPopups.renewFile" :file="renewingFile"></Renew>
    <Share
      v-if="showPopups.shareFile"
      :file="sharingFile"
      :fileIndex="sharingFileIndex"
    ></Share>
    <Delete
      v-if="showPopups.deleteFile"
      :file="deletingFile"
      :fileIndex="deletingFileIndex"
    ></Delete>
    <Feedback v-if="showFeedback" @close="showFeedback = false"></Feedback>
  </el-container>
</template>

<script>
import electron from 'electron'
import filesize from 'filesize'
import { mapState, mapGetters } from 'vuex'
import { APP_MODE_COINPOOL } from '../constants/constants'
import { checkUpdate } from '../services/user'
import {
  DL_TASK,
  UL_TASK,
  USAGE_STORAGE_GETTER,
  ACT_LOGOUT,
  ACT_START_POLLING_CHI_PRICE,
  ACT_GET_ACCOUNT_DETAILS,
  ACT_GET_USER_CPOOL,
} from '../constants/store'
import { DOWNLOAD_PAGE } from '../constants/urls'
import * as GA_PAGEVIEWS from '../constants/ga'
import Profile from '../components/Profile'
import Download from './subviews/Download'
import Get from './subviews/Get'
import Renew from './subviews/Renew'
import Share from './subviews/Share'
import Upload from './subviews/Upload'
import Delete from './subviews/Delete'
import BillingRecords from './BillingRecords'
import Feedback from './Feedback'

const visitor = electron.remote.getGlobal('gaVisitor')

const sendPageview = name => visitor.pageview(name).send()

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
        deleteFile: false,
        billingRecords: false,
      },
      downloadingFile: null,
      sharingFile: null,
      sharingFileIndex: -1,
      renamingFile: null,
      renewingFile: null,
      deletingFile: null,
      deletingFileIndex: -1,
      uploadingFilePath: '',
      showFeedback: false,
    }
  },
  components: {
    Profile,
    BillingRecords,
    Download,
    Get,
    Renew,
    Share,
    Upload,
    Feedback,
    Delete,
  },
  computed: {
    ...mapState({
      userData: state => state.user,
    }),
    ...mapGetters({
      downloadCount: DL_TASK.GET_TASK_COUNT,
      uploadCount: UL_TASK.GET_TASK_COUNT,
      usedStorage: USAGE_STORAGE_GETTER, // in file size string
    }),
    isCpoolMode: function() {
      return this.$isCpoolPackage
    },
    usedStorageStr: function() {
      if (this.isCpoolMode) {
        return filesize(this.userData.cpoolData.usage)
      }
      return filesize(this.usedStorage)
    },
    capacityStr: function() {
      if (this.isCpoolMode) {
        return filesize(this.userData.cpoolData.capacity)
      }
      return 0
    },
    usagePercent: function() {
      if (this.isCpoolMode) {
        if (this.userData.cpoolData.capacity === 0) {
          return 0
        }
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
      if (this.isCpoolMode) {
        this.$store.dispatch(ACT_GET_USER_CPOOL)
      } else {
        this.$store.dispatch(ACT_GET_ACCOUNT_DETAILS)
      }
    },
    f_goBilling() {
      this.showProfile = false
      this.$vueBus.$emit(this.$events.OPEN_BILLING_RECORDS)
    },
    f_checkUpdate() {
      // this.showProfile = false
      checkUpdate()
        .then(ver => {
          console.log('check update from ', ver)
          console.log(this.$appVer)
          if (ver !== this.$appVer) {
            this.$alert(
              `A new version of PPIO-Demo (${ver}) is available, currently you have version ${
                this.$appVer
              }`,
              'Update available',
              {
                confirmButtonText: 'Go download',
                cancelButtonText: 'Cancel',
              },
            )
              .then(() => {
                electron.shell.openExternal(DOWNLOAD_PAGE)
                return true
              })
              .catch(() => {})
          } else {
            this.$message.success('You already have the latest version.')
          }
          return ver
        })
        .catch(err => console.error(err))
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
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_GET_FILE)
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
      this.$vueBus.$on(this.$events.OPEN_UPLOAD_FILE, filePath => {
        console.log('open upload file')
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_UPLOAD_FILE)
        this.uploadingFilePath = filePath
        this.showPopups.uploadFile = true
      })
      // close upload file
      this.$vueBus.$on(this.$events.CLOSE_UPLOAD_FILE, () => {
        console.log('close upload file')
        this.showPopups.uploadFile = false
        this.uploadingFilePath = ''
      })
      // upload file
      this.$vueBus.$on(this.$events.UPLOAD_FILE_DONE, () => {
        console.log('upload file done')
        this.showPopups.uploadFile = false
        this.uploadingFilePath = ''
        this.$router.push({ name: 'upload-list' })
      })

      // download file
      // open download file
      this.$vueBus.$on(this.$events.OPEN_DOWNLOAD_FILE, file => {
        console.log('open download file ', file)
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_DOWNLOAD_FILE)
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
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_SHARE_FILE)
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
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_RENEW_FILE)
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
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_BILLING_RECORDS)
        this.showPopups.billingRecords = true
      })
      // close billing records
      this.$vueBus.$on(this.$events.CLOSE_BILLING_RECORDS, () => {
        console.log('close billing records')
        this.showPopups.billingRecords = false
      })

      // delete file
      // open delete file
      this.$vueBus.$on(this.$events.OPEN_DELETE_FILE, payload => {
        console.log('open delete file ', payload.file)
        sendPageview(GA_PAGEVIEWS.PAGEVIEW_DELETE_FILE)
        this.showPopups.deleteFile = true
        this.deletingFile = payload.file
        this.deletingFileIndex = payload.fileIndex
      })
      // close delete file
      this.$vueBus.$on(this.$events.CLOSE_DELETE_FILE, () => {
        console.log('close delete file')
        this.showPopups.deleteFile = false
        this.deletingFile = null
        this.deletingFileIndex = -1
      })
      // deleted file
      this.$vueBus.$on(this.$events.DELETE_FILE_DONE, () => {
        console.log('delete file done')
        this.showPopups.deleteFile = false
        this.deletingFile = null
        this.deletingFileIndex = -1
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
