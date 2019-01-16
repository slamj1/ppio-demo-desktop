<template>
  <div class="account">
    <div class="tip-wrap">
      <p class="title">Log in</p>
      <div class="attention-wrap">
        <p>Your seed phrase and password are VERY IMPORTANT. Once lost, all your data will be in danger. Please keep them carefully!</p>
      </div>
    </div>
    <div class="form-wrap">
      <p class="title">Provide your keystore file and password</p>
      <!--<el-input type="textarea" :autofocus="true" :rows="4" resize="none" required placeholder="Enter your seed phrase" v-model="mnemonic" class="seed-phrase-input"></el-input>-->
      <div class="keystore-drag-area" @click="f_uploadKeystore" @dragover="f_onDragover" @drop="f_onDrop">
        <p class="keystore-file-name" v-if="addressInKeystore.length > 0">{{addressInKeystore}}</p>
        <template v-else>
          <i class="el-icon-plus"></i>
          <p class="keystore-file-hint">Drop your keystore file here</p>
        </template>
      </div>
      <!--<el-button class="keystore-button" type="primary" >Upload keystore file</el-button>-->
      <el-input
          type="password"
          placeholder="Enter your password"
          required
          v-model="password"
          class="password-input"
          @keyup.native.enter="f_import"></el-input>
      <el-alert v-show="errorMsg !== ''" :title="errorMsg" type="error" :closable="false"></el-alert>
      <el-button :loading="importing || startingApp" class="login-button" type="primary" @click="f_import">Confirm</el-button>
      <!--<p>Don't have an account? <router-link class="wallet-link" :to="{ name: 'account/create' }">Generate one</router-link></p>-->
      <p>Don't have an account? <span class="wallet-link" @click="f_gotoWallet">Generate one</span></p>
    </div>
  </div>
</template>
<script>
// import bip39 from 'bip39'
import fs from 'fs'
import path from 'path'
import { shell, remote } from 'electron'
import { USER_STATE_PERSIST_KEY, walletUrl } from '../../constants/constants'
import { MUT_REPLACE_STATE_HOOK } from '../../constants/store'
import { getAccountWithKeystore } from '../../services/user'
import createUserDir from '../../utils/createUserDir'
import storage from '../../utils/storage'

const { dialog, getCurrentWindow } = remote

export default {
  name: 'import-account',
  data: () => ({
    password: '',
    mnemonic: '',
    errorMsg: '',
    keystoreJson: null,
    addressInKeystore: '',
    importing: false,
  }),
  props: ['startingApp'],
  activated() {
    this.importing = false
  },
  methods: {
    f_onDragover(e) {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'copy'
    },
    f_onDrop(e) {
      e.preventDefault()
      console.log('drop')
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
        const fileContent = fs.readFileSync(filePath)
        const keystoreJson = JSON.parse(fileContent)
        this.keystoreJson = keystoreJson
        this.addressInKeystore = keystoreJson.address
        return keystoreJson
      } catch (err) {
        return null
      }
    },
    f_gotoWallet() {
      shell.openExternal(walletUrl)
    },
    f_import() {
      // if (!bip39.validateMnemonic(this.mnemonic)) {
      //   this.$message.error('Seed phrase invalid!')
      //   return
      // }
      if (this.password.length === 0) {
        this.$message.error('Password is empty!')
        return
      }
      if (!this.keystoreJson) {
        this.$message.error('Please provide your keystore file!')
        return
      }
      this.importing = true

      let account
      try {
        account = getAccountWithKeystore(this.keystoreJson, this.password)
      } catch (err) {
        this.errorMsg = err.message
        this.importing = false
        return false
      }
      const address = account.getAddressString()
      console.log(`${USER_STATE_PERSIST_KEY}_${address}`)
      this.$emit('setAccount', account)
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
              return this.$emit('startApp', { passphrase: this.password })
            } else {
              console.log('config file does not exist, initing app')
              return this.$emit('startApp', { isInit: true, passphrase: this.password })
            }
          }
          const datadir = createUserDir(address)
          if (datadir) {
            this.$emit('setDatadir', datadir)
            return this.$emit('startApp', { isInit: true, passphrase: this.password })
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
