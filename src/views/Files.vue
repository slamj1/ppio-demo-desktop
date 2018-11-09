<template>
  <el-container @click.native="f_selectFile(-1)">
    <el-header class="app-header" @click.native.stop="">
      <div class="header-btn-group">
        <template v-if="selectedFileId !== 0">
          <el-button size="small" type="primary" :loading="preparingDl" @click="f_download"><i class="app-icon icon-download"></i> Download</el-button>
          <el-button size="small" type="primary" plain :loading="preparingShare" @click="f_share"><i class="app-icon icon-share"></i> Share</el-button>
          <el-dropdown class="header-dropdown-menu" size="small" trigger="click">
              <span class="el-dropdown-link">
                More<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :loading="preparingRename" @click.native="f_rename">Rename</el-dropdown-item>
              <el-dropdown-item :loading="preparingRenew" @click.native="f_renew">Renew</el-dropdown-item>
              <el-dropdown-item :loading="preparingDel" @click.native="f_delete">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button size="small" type="primary" :loading="preparingUl" @click="f_upload"><i class="app-icon icon-upload"></i> Upload</el-button>
          <el-button size="small" type="primary" plain :loading="preparingGet" @click="f_get"><i class="app-icon icon-get"></i> Get</el-button>
        </template>
      </div>
      <el-button class="refresh-btn" icon="el-icon-refresh" circle @click="f_refreshList"></el-button>
    </el-header>
    <el-main class="app-main">
      <div class="file-container" v-loading="refreshingData">
        <FileItem
            v-for="(file, idx) in fileList"
            :selected="selectedFileId === file.id"
            :key="file.id"
            :file="file"
            @click.native.right.prevent.stop="f_rightClickFile(idx)"
            @click.native.stop="f_selectFile(idx)"></FileItem>
      </div>
    </el-main>
    <router-view :file="operatingFile" @click.native.stop=""></router-view>
  </el-container>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { remote } from 'electron'
import { APP_MODE_COINPOOL } from '../constants/constants'
import {
  ACT_SET_FILE_LIST,
  UL_TASK,
  ACT_GET_FILE,
  ACT_REMOVE_FILE,
} from '../constants/store'
import FileItem from '@/components/FileItem'

const { Menu, MenuItem, dialog } = remote
export default {
  name: 'file',
  data() {
    return {
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      preparingDl: false,
      preparingShare: false,
      preparingRename: false,
      preparingRenew: false,
      preparingDel: false,
      preparingUl: false,
      preparingGet: false,
      selectedFileId: 0,
      selectedFileIndex: -1,
      refreshingData: false,
      fetchingData: false,
      operatingFile: null,
      contextMenu: new Menu(),
    }
  },
  computed: {
    ...mapState({
      fileList: state => {
        console.log(state.file)
        return state.file.fileList
      },
    }),
  },
  components: {
    FileItem,
  },
  mounted() {
    this.f_createContextMenu()
  },

  activated() {
    this.f_getFileList()
  },

  methods: {
    ...mapActions({
      getFileList: ACT_SET_FILE_LIST,
      getFile: ACT_GET_FILE,
      createUpload: UL_TASK.ACT_CREATE_TASK,
    }),
    f_getFileList() {
      if (this.fetchingData) {
        return Promise.resolve()
      }
      this.selectedFileId = 0
      this.fetchingData = true
      return this.getFileList()
        .then(() => {
          this.fetchingData = false
          return ''
        })
        .finally(() => {
          this.f_selectFile(-1)
        })
        .catch(err => {
          this.fetchingData = false
          console.error(err)
        })
    },
    f_refreshList() {
      console.log('refreshing file list')
      this.refreshingData = true
      this.selectedFileId = 0
      this.f_getFileList()
        .then(() => (this.refreshingData = false))
        .catch(err => {
          console.error(err)
        })
    },
    f_selectFile(idx) {
      this.selectedFileIndex = idx
      if (idx === -1) {
        this.selectedFileId = 0
        this.operatingFile = null
      } else {
        this.selectedFileId = this.fileList[idx].id
        this.operatingFile = this.fileList[idx]
      }
    },
    f_createContextMenu() {
      const self = this
      this.contextMenu.append(
        new MenuItem({
          label: 'Download',
          click() {
            self.f_download()
          },
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          label: 'Share',
          click() {
            self.f_share()
          },
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          type: 'separator',
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          label: 'Renew',
          click() {
            self.f_renew()
          },
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          label: 'Rename',
          click() {
            self.f_rename()
          },
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          type: 'separator',
        }),
      )
      this.contextMenu.append(
        new MenuItem({
          label: 'Delete',
          click() {
            self.f_delete()
          },
        }),
      )
    },
    f_rightClickFile(idx) {
      this.f_selectFile(idx)
      this.contextMenu.popup({ window: remote.getCurrentWindow() })
    },
    f_download() {
      if (!this.operatingFile) {
        return
      }
      this.$vueBus.$emit(this.$events.OPEN_DOWNLOAD_FILE, this.operatingFile)
    },
    f_share() {
      if (!this.operatingFile) {
        return
      }

      if (this.operatingFile.isSecure) {
        this.$notify.error({
          title: 'Can not share secured file!',
          duration: 2000,
        })
        return
      }

      this.$vueBus.$emit(this.$events.OPEN_SHARE_FILE, this.operatingFile)
    },
    f_rename() {
      if (!this.operatingFile || this.selectedFileIndex === -1) {
        return
      }
      this.$vueBus.$emit(this.$events.OPEN_RENAME_FILE, {
        file: this.operatingFile,
        fileindex: this.selectedFileIndex,
      })
    },
    f_renew() {
      if (!this.operatingFile) {
        return
      }
      this.$vueBus.$emit(this.$events.OPEN_RENEW_FILE, this.operatingFile)
    },
    f_delete() {
      if (!this.operatingFile || this.selectedFileIndex === -1) {
        return
      }
      dialog.showMessageBox(
        this.$remote.getCurrentWindow(),
        {
          type: 'info',
          buttons: ['ok', 'cancel'],
          defaultId: 0,
          message: `Are you sure to delete "${this.operatingFile.filename}"?`,
        },
        index => {
          if (index === 0) {
            this.$store
              .dispatch(ACT_REMOVE_FILE, {
                file: this.operatingFile,
                fileIndex: this.selectedFileIndex,
              })
              .then(
                () => {
                  this.$notify.success({
                    title: `delete the file success`,
                    duration: 2000,
                  })
                  return this.f_selectFile(-1)
                },
                err => this.$notify.error({ title: err.toString(), duration: 2000 }),
              )
              .catch(err => {
                console.error(err.toString())
              })
          }
        },
      )
    },
    f_upload() {
      this.$vueBus.$emit(this.$events.OPEN_UPLOAD_FILE)
    },
    f_get() {
      this.$vueBus.$emit(this.$events.OPEN_GET_FILE)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/_var.scss';

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
  border-bottom: 1px solid #dcdfe6;

  .header-dropdown-menu {
    margin: 0 20px;
    font-size: 0;
    &:focus {
      outline: none;
    }

    .el-dropdown-link {
      font-size: 14px;
      display: inline-block;
      padding: 0 15px;
      height: 30px;
      line-height: 28px;
      border: 1px solid #eee;
      border-radius: 4px;
      &.focusing {
        outline: none;
      }
    }
  }

  .header-btn-group {
    -webkit-app-region: no-drag;
  }

  button:hover,
  button:focus {
    .icon-get.app-icon {
      background-image: url('~@/assets/img/icon-get_active.png');
    }
    .icon-share.app-icon {
      background-image: url('~@/assets/img/icon-share_active.png');
    }
  }
  .refresh-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    -webkit-app-region: no-drag;
    border: none;
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
