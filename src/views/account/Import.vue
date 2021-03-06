<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">
        Import<a class="tutorial-link" @click="f_goTutorials">(How to use?)</a>
      </p>
    </div>
    <el-alert type="warning" :closable="false">
      <p>
        Alert: this is a demo net-disk app, our service is not stable at the moment.
        Meaning that your files uploaded might be lost. So DO NOT upload anything
        important.
      </p>
    </el-alert>
    <div class="form-wrap">
      <el-tabs v-model="curTab">
        <el-tab-pane label="Import from keystore" name="keystore">
          <p class="title">Provide your keystore file and passphrase</p>
          <div
            class="keystore-drag-area"
            @click="f_uploadKeystore"
            @dragover="f_onDragover"
            @drop="f_onDrop"
          >
            <p class="keystore-file-name" v-if="addressInKeystore.length > 0">
              {{ addressInKeystore }}
            </p>
            <template v-else>
              <i class="el-icon-plus"></i>
              <p class="keystore-file-hint">Drop your keystore file here</p>
            </template>
          </div>
          <!--<el-button class="keystore-button" type="primary" >Upload keystore file</el-button>-->
          <el-input
            type="password"
            placeholder="Enter your passphrase"
            required
            v-model="keystorePassphrase"
            class="password-input"
            @keyup.native.enter="f_importFromKeystore"
          ></el-input>
          <el-alert
            v-show="errorMsg !== ''"
            :title="errorMsg"
            type="error"
            :closable="false"
          ></el-alert>
          <el-button
            :loading="importing || startingApp"
            class="login-button"
            type="primary"
            @click="f_importFromKeystore"
            >Confirm</el-button
          >
        </el-tab-pane>
        <!--<el-tab-pane label="Import from private key" name="privatekey">-->
        <!--<p class="title">Provide your private key</p>-->
        <!--<el-input-->
        <!--type="textarea"-->
        <!--placeholder="Enter your private key"-->
        <!--required-->
        <!--v-model="privateKey"-->
        <!--class="privatekey-input"-->
        <!--@keyup.native.enter="f_importFromPrivatekey"></el-input>-->
        <!--<el-input-->
        <!--type="password"-->
        <!--placeholder="Enter your passphrase"-->
        <!--required-->
        <!--v-model="password"-->
        <!--class="password-input"-->
        <!--@keyup.native.enter="f_importFromPrivatekey"></el-input>-->
        <!--<el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>-->
        <!--<el-button :loading="importing || startingApp" class="login-button" type="primary" @click="f_importFromPrivatekey">Confirm</el-button>-->
        <!--</el-tab-pane>-->
      </el-tabs>
      <p>
        Don't have an account?
        <a class="wallet-link" @click="f_gotoWallet">Generate one</a>
      </p>
    </div>
  </div>
</template>
<script>
// import bip39 from 'bip39'
import fs from 'fs'
import path from 'path'
import ppwallet from 'ppwallet'
import { shell, remote } from 'electron'
import { USER_STATE_PERSIST_KEY } from '../../constants/constants'
import { MUT_REPLACE_STATE_HOOK } from '../../constants/store'
import { getAccountFromKeystore, getAccountFromPrivatekey } from '../../services/user'
import createUserDir from '../../utils/createUserDir'
import storage from '../../utils/storage'
import { HOW_TO_USE, WALLET } from '../../constants/urls'

const { dialog, getCurrentWindow } = remote

export default {
  name: 'import-account',
  data: () => ({
    curTab: 'keystore',
    keystorePassphrase: '',
    privkeyPassphrase: '',
    mnemonic: '',
    errorMsg: '',
    keystorePath: '',
    keystoreJson: null,
    privateKey: '',
    addressInKeystore: '',
    importing: false,
  }),
  props: ['startingApp'],
  activated() {
    this.importing = false
  },
  methods: {
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
      console.log(e.dataTransfer.files[0])
      this.f_getKeystoreJson(e.dataTransfer.files[0].path)
    },
    f_uploadKeystore() {
      console.log('key store upload')
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
          this.f_getKeystoreJson(filePaths[0])
        },
      )
    },
    f_getKeystoreJson(filePath) {
      try {
        const fileStats = fs.statSync(filePath)
        if (fileStats.size > 1000) {
          this.$message.error('Keystore file invalid')
          return null
        }
        const fileContent = fs.readFileSync(filePath)
        const keystoreJson = JSON.parse(fileContent)
        if (!ppwallet.Account.isValidAddress(keystoreJson.address)) {
          this.$message.error('Keystore file invalid')
          return null
        }
        this.keystoreJson = keystoreJson
        this.addressInKeystore = keystoreJson.address
        this.keystorePath = filePath
        return keystoreJson
      } catch (err) {
        this.$message.error('Keystore file invalid')
        return null
      }
    },
    f_gotoWallet() {
      shell.openExternal(WALLET)
    },
    f_importFromPrivatekey() {
      if (this.importing) {
        return
      }
      if (this.privkeyPassphrase.length === 0) {
        this.$message.error('Passphrase is empty!')
        return
      }
      if (this.privateKey.length === 0) {
        this.$message.error('Please input your private key!')
        return
      }
      try {
        const account = getAccountFromPrivatekey(this.privateKey)
        this.f_import(account)
      } catch (err) {
        this.errorMsg = err.message
        return false
      }
    },
    f_importFromKeystore() {
      if (this.importing) {
        return
      }
      if (this.keystorePassphrase.length === 0) {
        this.$message.error('Passphrase is empty!')
        return
      }
      if (!this.keystoreJson) {
        this.$message.error('Please provide your keystore file!')
        return
      }
      try {
        const account = getAccountFromKeystore(this.keystoreJson, this.keystorePassphrase)
        this.f_import(account, this.keystorePassphrase)
      } catch (err) {
        this.errorMsg = err.message
        return false
      }
    },
    f_import(account, passphrase) {
      this.importing = true
      const address = account.getAddressString()
      console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
      this.$emit('setAccount', account)
      this.$emit('setKeystorePath', this.keystorePath)
      this.$emit('setPassphrase', passphrase)
      return storage
        .getItem(`${USER_STATE_PERSIST_KEY}_${address}`)
        .then(val => {
          this.importing = false
          console.log('persisted state got for import page')
          console.log(val)
          if (val && val.dataDir.length > 0 && val.user.uid.length > 0) {
            this.$store.replaceState(val)
            this.$store.commit(MUT_REPLACE_STATE_HOOK)
            this.$emit('setDatadir', val.dataDir)
            if (fs.existsSync(path.resolve(val.dataDir, './poss.conf'))) {
              console.log('user exists, starting app')
              return this.$emit('startApp')
            } else {
              console.log('config file does not exist, initing app')
              return this.$emit('startApp', { isInit: true })
            }
          }
          const datadir = createUserDir(address)
          if (datadir) {
            this.$emit('setDatadir', datadir)
            return this.$emit('startApp', { isInit: true })
          }
          return this.$message.error('Create data directory failed.')
        })
        .catch(err => {
          this.errorMsg = err.toString()
          console.error(err)
          this.importing = false
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './account.scss';

.tutorial-link {
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
}
.wallet-link {
  cursor: pointer;
}
.keystore-input {
  display: none;
}
.keystore-drag-area {
  width: 100%;
  height: 100px;
  border: 2px #ccc dashed;
  cursor: pointer;
  text-align: center;

  .keystore-file-name {
    margin-top: 20px;
    padding: 0 20px;
    text-align: left;
  }
  .keystore-file-hint {
    color: #b1b1b1;
  }
  .el-icon-plus {
    margin-top: 20px;
    margin-bottom: 5px;
    color: #b1b1b1;
    font-size: 30px;
  }
}
</style>
