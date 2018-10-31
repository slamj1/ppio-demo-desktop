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
          <i class="el-icon-document"></i>
          <span slot="title">All files</span>
        </el-menu-item>
        <p class="nav-group-title">Transmission list</p>
        <el-menu-item index="1">
          <i class="el-icon-download"></i>
          <span slot="title">Downloading</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-upload"></i>
          <span slot="title">Uploading</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div class="header-btn-group">
          <template v-if="isSelect">
            <el-button size="small" type="primary" :loading="preparingDl" @click="f_download"><i class="el-icon-download el-icon--left"></i> Download</el-button>
            <el-button size="small" type="primary" plain :loading="preparingShare" @click="f_share"><i class="el-icon-share el-icon--left"></i> Share</el-button>
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
            <el-button size="small" type="primary" :loading="preparingUl" @click="f_upload"><i class="el-icon-upload el-icon--left"></i> Upload</el-button>
            <el-button size="small" type="primary" plain :loading="preparingGet" @click="f_get"><i class="el-icon-download el-icon--left"></i> Get</el-button>
          </template>
        </div>
        <el-button class="refresh-btn" icon="el-icon-refresh" circle></el-button>
      </el-header>
      <el-main class="app-main">
        <div class="file-container">
          <FileItem
              v-for="(file, fileId) in fileList"
              :class="{'selected': selectedFileId === fileId}"
              :key="fileId"
              :file="file"
              @click="f_selectFile(fileId)"></FileItem>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { APP_MODE_COINPOOL } from '@/constants/constants'
import { ACT_SET_FILE_LIST } from '@/constants/store'
import FileItem from '@/components/FileItem'

export default {
  name: 'home',
  data() {
    return {
      avatar: '',
      username: 'fdsafeILHULHUIfwe235feILHULfeILHUL',
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
      selectedFileId: 0,
    }
  },
  computed: {
    usedPercent() {
      return (this.usedStorage / this.capacity) * 100
    },
    ...mapState({
      fileList: state => {
        console.log(state.file)
        return state.file.fileList
      },

      countPlusLocalState(state) {
        return state.count + this.localCount
      },
    }),
  },
  components: {
    FileItem,
  },
  mounted() {
    this.getFileList().then(() => {
      console.log(this.fileList)
      console.log(this.$store.state)
    })
  },
  methods: {
    ...mapActions({
      getFileList: ACT_SET_FILE_LIST,
    }),
    f_selectFile(fileId) {
      if (this.selectedFileId === fileId) {
        this.selectedFileId = 0
        return
      }
      this.selectedFileId = fileId
    },

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
@import "@/assets/css/_var.scss";

$nav-font-color: #C0C4CC;

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
        color: #ccc;

        &.with-progress {
          align-self: flex-end;
        }
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
        color: $nav-font-color;
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

.app-header {
  position: relative;
  height: 56px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  background-color: #fff;
  color: #fff;
  -webkit-app-region: drag;
  box-sizing: content-box;
  border-bottom: 1px solid #DCDFE6;

  .header-btn-group {
    -webkit-app-region: no-drag;
  }
  .refresh-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    -webkit-app-region: no-drag;
  }
}

.app-main {
  background-color: #fff;

  .file-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: left;
    align-items: flex-start;
  }
}
</style>
