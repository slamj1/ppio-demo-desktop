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
      <div class="header-btn-group">
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
      </div>
      <el-button class="refresh-btn" icon="el-icon-refresh" circle></el-button>
    </el-header>
    <el-main>
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
</template>

<script>
import { APP_MODE_COINPOOL } from '@/constants/constants'
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
      fileList: [],
      selectedFileId: 0,
    }
  },
  computed: {
    usedPercent() {
      return (this.usedStorage / this.capacity) * 100
    },
  },
  components: {
    FileItem,
  },
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
@import "@/assets/css/_var.scss";

.app-header {
  position: relative;
  padding-top: $titleHeight;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  background-color: #1e1c51;
  color: #fff;
  -webkit-app-region: drag;
}
.header-profile {
  flex: 0 0 240px;
  margin-right: 20px;
  -webkit-app-region: no-drag;

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
.header-btn-group {
  -webkit-app-region: no-drag;
}
.refresh-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  -webkit-app-region: no-drag;
}

.file-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
}
</style>
