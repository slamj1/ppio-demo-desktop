<template>
  <el-container @click.native="f_selectFile(-1)">
    <el-header class="app-header" @click.native.stop="">
      <div class="header-btn-group">
        <template v-if="selectedFileKey !== ''">
          <el-button size="small" type="primary" @click="f_download"
            ><i class="app-icon icon-download"></i> Download</el-button
          >
          <el-button size="small" type="primary" plain @click="f_share"
            ><i class="app-icon icon-share"></i> Share</el-button
          >
          <el-dropdown class="header-dropdown-menu" size="small" trigger="click">
            <span class="el-dropdown-link">
              More<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="!isCpoolMode" @click.native="f_renew"
                >Renew</el-dropdown-item
              >
              <el-dropdown-item @click.native="f_delete">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="f_chooseUploadFile"
            ><i class="app-icon icon-upload"></i> Upload</el-button
          >
          <el-button size="small" type="primary" plain @click="f_get"
            ><i class="app-icon icon-get"></i> Get</el-button
          >
        </template>
      </div>
      <el-button
        class="refresh-btn"
        icon="el-icon-refresh"
        circle
        @click="f_refreshList"
      ></el-button>
      <a class="header-help-btn" @click="f_goTutorials">How to use?</a>
    </el-header>
    <el-main class="app-main" @dragover.native="f_onDragover" @drop.native="f_onDrop">
      <div v-if="fileList.length === 0 && !fetchingData" class="empty">
        <img src="../assets/img/files-empty.png" alt="empty" />
        <p>You haven't uploaded any file yet.</p>
      </div>
      <div v-else class="file-container" v-loading="refreshingData">
        <FileItem
          v-for="(file, idx) in fileList"
          :selected="selectedFileKey === file.key"
          :key="file.key"
          :file="file"
          @click.native.right.prevent.stop="f_rightClickFile(idx)"
          @click.native.stop="f_selectFile(idx)"
        ></FileItem>
      </div>
    </el-main>
    <router-view :file="operatingFile" @click.native.stop=""></router-view>
  </el-container>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { remote, shell } from 'electron'
import { APP_MODE_COINPOOL } from '../constants/constants'
import { ACT_GET_FILE_LIST } from '../constants/store'
import FileItem from '../components/FileItem'
import * as FILE_STATUS from '../constants/file'
import { HOW_TO_USE } from '../constants/urls'

const { Menu, MenuItem, dialog, getCurrentWindow } = remote
export default {
  name: 'file',
  data() {
    return {
      mode: APP_MODE_COINPOOL,
      APP_MODE_COINPOOL: APP_MODE_COINPOOL,
      selectedFileKey: '',
      refreshingData: false,
      fetchingData: false,
      operatingFile: null,
      contextMenu: new Menu(),
      ...FILE_STATUS,
    }
  },
  computed: {
    ...mapState({
      fileList: state => state.file.fileList,
    }),
    isCpoolMode() {
      return this.$isCpoolPackage
    },
  },
  components: {
    FileItem,
  },
  watch: {
    fileList: function(val) {
      if (val.map(file => file.key).indexOf(this.selectedFileKey) === -1) {
        this.selectedFileKey = ''
      }
    },
  },
  mounted() {
    this.f_createContextMenu()
    console.log('files page mounted')

    // get file done
    this.$vueBus.$on(this.$events.GET_FILE_DONE, () => {
      console.log('Files page get file listener')
    })
  },

  activated() {
    this.f_getFileList()
      .then(() => {
        for (let i = 0; i < this.fileList.length; i++) {
          if (this.fileList[i].daysLeft < 2 && this.fileList[i].daysLeft > 0) {
            this.$message.info(
              'There are some files about to expire. RENEW to save them from being deleted.',
            )
            break
          }
        }
        return true
      })
      .catch(() => {
        this.$message.error('Get file list failed')
      })
    console.log('files page activated')
  },

  methods: {
    ...mapActions({
      getFileList: ACT_GET_FILE_LIST,
    }),
    f_goTutorials() {
      shell.openExternal(HOW_TO_USE)
    },
    f_onDragover(e) {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'copy'
    },
    f_onDrop(e) {
      e.preventDefault()
      console.log('drop')
      console.log(e.dataTransfer.files[0])
      this.$vueBus.$emit(this.$events.OPEN_UPLOAD_FILE, e.dataTransfer.files[0].path)
    },
    f_getFileList() {
      if (this.fetchingData) {
        return Promise.resolve()
      }
      if (this.fileList.map(file => file.key).indexOf(this.selectedFileKey) === -1) {
        console.log('lose select')
        this.selectedFileKey = ''
        this.operatingFile = null
      }
      this.fetchingData = true
      return this.getFileList()
        .then(() => {
          this.fetchingData = false
          return true
        })
        .catch(err => {
          this.fetchingData = false
          console.error(err)
        })
    },
    f_refreshList() {
      console.log('refreshing file list')
      this.refreshingData = true
      this.f_getFileList()
        .then(() => (this.refreshingData = false))
        .catch(err => {
          console.error(err)
        })
    },
    f_selectFile(idx) {
      if (idx === -1) {
        console.log('lose select')
        this.selectedFileKey = ''
        this.operatingFile = null
      } else {
        this.selectedFileKey = this.fileList[idx].key
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
      this.contextMenu.popup({ window: getCurrentWindow() })
    },
    f_share() {
      if (!this.operatingFile) {
        return
      }
      if (
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_BROKEN ||
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_END
      ) {
        return this.$message.error('Cannot share this file.')
      }
      this.$vueBus.$emit(this.$events.OPEN_SHARE_FILE, {
        file: this.operatingFile,
        fileIndex: this.fileList.indexOf(this.operatingFile),
      })
    },
    f_renew() {
      if (!this.operatingFile) {
        return
      }
      if (
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_BROKEN ||
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_END
      ) {
        return this.$message.error('Cannot renew this file.')
      }
      this.$vueBus.$emit(this.$events.OPEN_RENEW_FILE, this.operatingFile)
    },
    f_delete() {
      if (!this.operatingFile) {
        return
      }
      console.log('deleting file')
      console.log(this.operatingFile)
      this.$vueBus.$emit(this.$events.OPEN_DELETE_FILE, {
        file: this.operatingFile,
        fileIndex: this.fileList.indexOf(this.operatingFile),
      })
      // dialog.showMessageBox(
      //   getCurrentWindow(),
      //   {
      //     type: 'info',
      //     buttons: ['ok', 'cancel'],
      //     defaultId: 0,
      //     message: `Are you sure to delete "${this.operatingFile.filename}"?`,
      //   },
      //   index => {
      //     if (index === 0) {
      //       this.$store
      //         .dispatch(ACT_REMOVE_FILE, {
      //           file: this.operatingFile,
      //           fileIndex: this.fileList.indexOf(this.operatingFile),
      //         })
      //         .then(() => {
      //           this.$message.success({
      //             message: 'delete file success',
      //             duration: 2000,
      //           })
      //           return this.f_selectFile(-1)
      //         })
      //         .catch(err => {
      //           console.error(err)
      //           this.$message.error({ message: 'Deletion failed!', duration: 2000 })
      //         })
      //     }
      //   },
      // )
    },
    f_chooseUploadFile() {
      dialog.showOpenDialog(
        getCurrentWindow(),
        {
          message: 'Select the file to upload',
          properties: ['openFile'],
        },
        filePaths => {
          if (!filePaths) {
            return
          }
          console.log(filePaths[0])
          this.$vueBus.$emit(this.$events.OPEN_UPLOAD_FILE, filePaths[0])
        },
      )
    },
    f_download() {
      if (!this.operatingFile) {
        return
      }
      if (
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_BROKEN ||
        this.operatingFile.status === FILE_STATUS.FILE_STATUS_END
      ) {
        return this.$message.error('Cannot download this file.')
      }
      this.$vueBus.$emit(this.$events.OPEN_DOWNLOAD_FILE, this.operatingFile)
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

  .file-upload-input {
    display: none;
  }

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
  .header-help-btn {
    position: absolute;
    right: 80px;
    cursor: pointer;
  }
}

.app-main {
  background-color: #fff;

  .empty {
    margin-top: 100px;
    text-align: center;

    img {
      width: 240px;
      margin-bottom: 20px;
    }
  }

  .file-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: left;
    align-items: flex-start;
  }
}
</style>
