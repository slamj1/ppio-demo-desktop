<template>
  <popup class="choose-cpool-popover" @close="$emit('close')">
    <span class="" slot="header">Select service</span>
    <div class="cpool-container" slot="content">
      <h3>Link to a coin pool</h3>
      <el-input class="coin-pool-code-input" placeholder="Input the coin pool code" v-model="cpoolCode" :disabled="notUseCpool">
        <el-button
            class="go-coin-pool-page"
            slot="append"
            :disabled="notUseCpool"
            :icon="bindSucc ? 'el-icon-check' : ''"
            @click="f_link">Go purchase page</el-button>
      </el-input>
      <p class="bind-coin-pool-hint"></p>
      <p class="coin-pool-intro">
        Coin Pool is an individual business entity is responsible for its own profits and losses.	Users purchase services provided by the Coin Pool,the Coin Pool will handle all payments on behalf of the user.We provide you a test coin pool which you can find at
        <a @click="f_goCpool">{{testCpoolSite}}</a>
      </p>
      <h3>Do not use a coin pool</h3>
      <div class="checkbox-container">
        <el-checkbox v-model="notUseCpool">1 PPCoin for 1G upload,1PPCoin for 1G download, 1 PPCoin for 1G/day storage.</el-checkbox>
      </div>
    </div>
    <template slot="footer">
      <el-button class="confirm-btn button" @click="f_confirm" type="primary">Confirm</el-button>
    </template>
  </popup>
</template>
<script>
import electron from 'electron'
import Popup from './Popup'

export default {
  name: 'choose-cpool',
  data() {
    return {
      cpoolCode: '',
      notUseCpool: false,
      bindSucc: false,
      testCpoolSite: 'https://pp.io',
    }
  },
  components: {
    Popup,
  },
  watch: {
    cpoolCode() {
      this.bindSucc = false
    },
    notUseCpool() {
      this.bindSucc = false
    },
  },
  methods: {
    f_link() {
      if (this.notUseCpool) {
        return
      }
      console.log('linking cpool')
    },
    f_goCpool() {
      console.log('go to coin pool page')
      electron.shell.openExternal(this.testCpoolSite)
    },
    f_confirm() {
      this.$emit('confirm')
    },
  },
}
</script>
<style lang="scss" scoped>
.choose-cpool-popover {
  .cpool-container {
    padding: 30px 50px;
  }

  h3 {
    margin-bottom: 10px;
  }

  .coin-pool-intro {
    margin: 10px 0;
    color: #909399;
    font-size: 12px;
  }

  .confirm-btn {
    margin-top: -20px;
    margin-bottom: 20px;
  }
}
</style>
