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
          <input type="file" ref="fileUploadInput" class="file-upload-input" name="file-upload" @change="f_upload">
          <el-button size="small" type="primary" :loading="preparingUl" @click="f_chooseUploadFile"><i class="app-icon icon-upload"></i> Upload</el-button>
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
        <FileItem
            v-for="(task, index) in gettingTaskList"
            :file="task.file"
            :get-failed="task.status.failed"
            :key="`gettingtask_${task.file.id}`"
            :is-getting="true"
            @delete="f_removeTask(index)"></FileItem>
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
  ACT_GET_FILE_LIST,
  ACT_GET_FILE,
  ACT_REMOVE_FILE,
  GET_TASK,
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
      refreshingData: false,
      fetchingData: false,
      operatingFile: null,
      contextMenu: new Menu(),
      getStatusTimer: null,
    }
  },
  computed: {
    ...mapState({
      fileList: state => state.file.fileList,
      gettingTaskList: state => state.getTask.taskQueue, // TODO: move gettingTaskList into fileList, to make finished file retain its position
    }),
  },
  components: {
    FileItem,
  },
  mounted() {
    this.f_createContextMenu()
    console.log('files page mounted')

    // get file done
    this.$vueBus.$on(this.$events.GET_FILE_DONE, () => {
      console.log('Files page get file listener')
      if (this.getStatusTimer === null) {
        this.f_updateGetStatus()
      }
    })
  },

  activated() {
    this.f_getFileList()
    console.log('files page activated')
    console.log(this.gettingTaskList)
    this.f_updateGetStatus()
  },

  methods: {
    ...mapActions({
      getFileList: ACT_GET_FILE_LIST,
      getFile: ACT_GET_FILE,
    }),
    f_updateGetStatus() {
      if (this.gettingTaskList.length > 0) {
        console.log('updating get status')
        this.$store
          .dispatch(GET_TASK.ACT_GET_STATUS)
          .then(taskStatusArr => {
            // if any task finished, refresh file list from sdk
            if (taskStatusArr.filter(status => status.finished).length > 0) {
              this.f_refreshList()
            }
            return true
          })
          .catch(err => {
            console.error(err)
          })
        this.getStatusTimer = setTimeout(() => {
          this.f_updateGetStatus()
        }, 2000)
      } else {
        this.getStatusTimer = null
      }
    },
    f_removeTask(idx) {
      console.log('remove task ', idx)
      this.$store.dispatch(GET_TASK.ACT_CANCEL_TASK, idx)
    },
    f_getFileList() {
      if (this.fetchingData) {
        return Promise.resolve()
      }
      if (this.fileList.map(file => file.id).indexOf(this.selectedFileId) === -1) {
        console.log('lose select')
        this.selectedFileId = 0
        this.operatingFile = null
      }
      this.fetchingData = true
      return this.getFileList()
        .then(() => {
          this.fetchingData = false
          return ''
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
    f_share() {
      if (!this.operatingFile) {
        return
      }

      // if (this.operatingFile.isSecure) {
      //   this.$notify.error({
      //     title: 'Can not share secured file!',
      //     duration: 2000,
      //   })
      //   return
      // }

      this.$vueBus.$emit(this.$events.OPEN_SHARE_FILE, {
        file: this.operatingFile,
        fileIndex: this.fileList.indexOf(this.operatingFile),
      })
    },
    f_rename() {
      if (!this.operatingFile) {
        return
      }
      this.$vueBus.$emit(this.$events.OPEN_RENAME_FILE, {
        file: this.operatingFile,
        fileIndex: this.fileList.indexOf(this.operatingFile),
      })
    },
    f_renew() {
      if (!this.operatingFile) {
        return
      }
      this.$vueBus.$emit(this.$events.OPEN_RENEW_FILE, this.operatingFile)
    },
    f_delete() {
      if (!this.operatingFile) {
        return
      }
      console.log('deleting file')
      console.log(this.operatingFile)
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
                fileIndex: this.fileList.indexOf(this.operatingFile),
              })
              .then(() => {
                this.$notify.success({
                  title: `delete file success`,
                  duration: 2000,
                })
                return this.f_selectFile(-1)
              })
              .catch(err => {
                console.error(err)
                this.$notify.error({ title: 'Deletion failed!', duration: 2000 })
              })
          }
        },
      )
    },
    f_chooseUploadFile() {
      this.$refs.fileUploadInput.click()
    },
    f_upload() {
      const file = this.$refs.fileUploadInput.files[0]
      console.log(file)
      if (file) {
        this.$vueBus.$emit(this.$events.OPEN_UPLOAD_FILE, file)
      }
    },
    f_download() {
      if (!this.operatingFile) {
        return
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
