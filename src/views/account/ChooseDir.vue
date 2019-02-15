<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Choose your data directory</p>
      <p>
        This is your first time importing this account on this computer. Please choose a
        directory to store your data:
      </p>
      <div class="attention-wrap">
        <!-- <p class="attention-title">Attention:</p> -->
        <p>
          DO NOT modify your data directory manually. DO NOT drag your file into your data
          directory.
        </p>
      </div>
    </div>
    <div class="dir-wrap">
      <el-button class="choose-btn" type="primary" @click="f_chooseDataDir"
        >Choose</el-button
      >
      <p v-show="dataDir.length > 0" class="dir"><b>Your directory: </b>{{ dataDir }}</p>
      <div class="btn-group">
        <el-button
          class="back-button"
          icon="el-icon-arrow-left"
          @click="f_back"
        ></el-button>
        <el-button
          :loading="subStartingApp || startingApp"
          class="start-button"
          type="primary"
          @click="f_start"
          >Start</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import fs from 'fs'
import { remote } from 'electron'

export default {
  data() {
    return {
      dataDir: '',
      subStartingApp: false,
    }
  },
  props: ['startingApp'],
  methods: {
    f_back() {
      this.$router.back()
    },
    f_chooseDataDir() {
      remote.dialog.showOpenDialog(
        remote.getCurrentWindow(),
        {
          message: 'Choose the location to store your data direction',
          properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
        },
        filePath => {
          console.log(filePath)
          if (!filePath) {
            return
          }
          const dirFiles = fs.readdirSync(filePath[0])
          if (dirFiles.length > 0) {
            this.$message.error('Please choose an empty directory')
          } else {
            this.dataDir = filePath[0]
          }
        },
      )
    },
    f_start() {
      if (this.dataDir.length === 0) {
        return this.$message.error('Please select your data directory')
      }
      this.$emit('setDatadir', this.dataDir)
      this.$emit('startApp', true)
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';

.choose-btn {
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.dir {
  margin-bottom: 40px;
}

.btn-group {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.back-button {
  flex: 0 0;
  padding: 12px 12px;
  display: inline-block;
  vertical-align: middle;
}
.start-button {
  flex: 1 1;
  display: inline-block;
  width: 100%;
  vertical-align: middle;
}
</style>
