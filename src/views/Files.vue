<template>
  <el-container @click.native="f_selectFile(0)">
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
              <el-dropdown-item :loading="preparingRename" @click="f_rename">Rename</el-dropdown-item>
              <el-dropdown-item :loading="preparingRenew" @click="f_renew">Renew</el-dropdown-item>
              <el-dropdown-item :loading="preparingDel" @click="f_delete">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button size="small" type="primary" :loading="preparingUl" @click="f_upload"><i class="app-icon icon-upload"></i> Upload</el-button>
          <el-button size="small" type="primary" plain :loading="preparingGet" @click="f_get"><i class="app-icon icon-get"></i> Get</el-button>
        </template>
      </div>
      <el-button class="refresh-btn" icon="el-icon-refresh" circle @click="f_refreshData"></el-button>
    </el-header>
    <el-main class="app-main">
      <div class="file-container">
        <FileItem
            v-for="(file, fileId) in fileList"
            :selected="selectedFileId === fileId"
            :key="fileId"
            :file="file"
            @click.native.right.prevent.stop="f_rightClickFile(fileId)"
            @click.native.stop="f_selectFile(fileId)"></FileItem>
      </div>
    </el-main>
    <router-view :file="operatingFile" @click.native.stop=""></router-view>
  </el-container>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { APP_MODE_COINPOOL } from '@/constants/constants'
import { ACT_SET_FILE_LIST, ACT_CREATE_DL_TASK } from '@/constants/store'
import FileItem from '@/components/FileItem'
import { remote } from 'electron'

const { Menu, MenuItem } = remote
export default {
  name: 'main',
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
    this.f_refreshData()
    this.f_createContextMenu()
    this.f_initBusEvent()
  },
  methods: {
    ...mapActions({
      getFileList: ACT_SET_FILE_LIST,
    }),
    f_refreshData() {
      if (this.fetchingData) {
        return
      }
      this.fetchingData = true
      this.getFileList()
        .then(() => {
          this.fetchingData = false
          console.log(this.fileList)
          console.log(this.$store.state)
          return ''
        })
        .catch(err => {
          this.fetchingData = false
          console.log(err)
        })
    },
    f_selectFile(fileId) {
      this.selectedFileId = fileId
      this.operatingFile = this.fileList[this.selectedFileId]
      console.log(this.operatingFile)
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
    f_rightClickFile(fileId) {
      this.f_selectFile(fileId)
      this.contextMenu.popup({ window: remote.getCurrentWindow() })
    },
    f_initBusEvent() {
      // share event
      this.$vueBus.$on('unshare', () => {
        console.log('unshare')
        this.$router.replace({ name: 'files' })
      })

      this.$vueBus.$on('share-copy', () => {
        console.log('share-copy')
        // this.$router.replace({ name: 'files' })
      })

      this.$vueBus.$on('share-close', () => {
        console.log('share-close')
        this.$router.replace({ name: 'files' })
      })

      // upload event
      this.$vueBus.$on('upload-close', () => {
        console.log('upload-close')
        this.$router.replace({ name: 'home' })
      })

      this.$vueBus.$on('upload-pay', () => {
        console.log('upload-pay')
        this.$router.replace({ name: 'home' })
      })
    },
    f_download() {
      return this.$store
        .dispatch(ACT_CREATE_DL_TASK)
        .then(() => this.$router.push({ name: 'download-list' }))
    },

    f_share() {
      if (!this.operatingFile) {
        return
      }

      if (this.operatingFile.isSecure) {
        this.$notify.error({ title: 'Can not share secured file!', duration: 2000 })
        return
      }

      this.$router.replace({ name: 'share' })
    },

    f_rename() {},

    f_renew() {},

    f_delete() {},

    f_upload() {
      this.$router.replace({ name: 'upload' })
    },

    f_get() {},
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

    .el-dropdown-link {
      display: inline-block;
      padding: 0 15px;
      height: 30px;
      line-height: 30px;
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
