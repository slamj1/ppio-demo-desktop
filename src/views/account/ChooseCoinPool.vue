<template>
  <popup class="choose-cpool-popover" @close="$emit('close')">
    <span class="" slot="header">Select service</span>
    <div class="cpool-container" slot="content">
      <h3>Link to a coin pool</h3>
      <p class="address">Your address: {{curAddress}} <span @click="f_copy">copy</span></p>
      <div class="coin-pool-select-wrapper">
        <el-select
          class="coin-pool-selector"
          v-model="cpoolCode"
          :disabled="notUseCpool"
          placeholder="Please select a coin pool host">
          <el-option
            v-for="(item, index) in cpoolHostList"
            :key="index"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
        <el-button class="go-coin-pool-page" :disabled="notUseCpool" type="primary" @click="f_goSubscribe">Go subscribe!</el-button>
      </div>
      <p class="bind-coin-pool-hint"></p>
      <el-button v-if="subscribing" :loading="checking" id="payment-confirm-button" type="primary" @click="f_confirmSubscription" size="large">I've subscribed a plan</el-button>
      <p class="coin-pool-intro">
        Coin Pool is an individual business entity is responsible for its own profits and losses.	Users purchase services provided by the Coin Pool,the Coin Pool will handle all payments on behalf of the user.We provide you a test coin pool which you can find at
        <a @click="f_goCpool">{{testCpoolSite}}</a>
      </p>
      <!-- <h3>Do not use a coin pool</h3>
      <div class="checkbox-container">
        <el-checkbox v-model="notUseCpool">1 PPCoin for 1G upload,1 PPCoin for 1G download, 1 PPCoin for 1G/day storage.</el-checkbox>
      </div> -->
    </div>
    <!-- <template slot="footer">
      <el-button class="confirm-btn button" @click="f_confirm" type="primary">Confirm</el-button>
    </template> -->
  </popup>
</template>
<script>
import { shell, clipboard } from 'electron'
import Popup from '../../components/Popup'
import { getCpoolSubscriptionInfo } from '../../services/cpool'
import { AVAILABLE_CPOOLS } from '../../constants/constants'

export default {
  name: 'choose-cpool',
  data() {
    return {
      cpoolCode: '',
      cpoolHostList: AVAILABLE_CPOOLS,
      bindingCpoolHost: '',
      subscribing: false,
      checking: false,
      notUseCpool: false,
      testCpoolSite: 'http://192.168.50.125:1235',
      testCpoolLinkPage: 'http://192.168.50.125:1235/purchase.html',
    }
  },
  components: {
    Popup,
  },
  props: ['account'],
  computed: {
    curAddress: function() {
      return this.account.getAddressString()
    },
  },
  methods: {
    f_copy() {
      clipboard.writeText(this.curAddress)
    },
    f_goSubscribe() {
      if (this.notUseCpool) {
        return
      }
      console.log('open purchase page')
      this.bindingCpoolHost = this.cpoolCode
      this.subscribing = true
      shell.openExternal(this.testCpoolLinkPage)
    },
    f_confirmSubscription() {
      this.checking = true
      getCpoolSubscriptionInfo(this.bindingCpoolHost, this.curAddress)
        .then(res =>
          this.$emit('bindCpool', {
            host: this.bindingCpoolHost,
            address: res.account_id,
          }),
        )
        .catch(err => {
          console.error(err)
          this.checking = false
          return this.$message.error('Subscription incomplete')
        })
    },
    f_goCpool() {
      console.log('go to coin pool page')
      shell.openExternal(this.testCpoolSite)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/_var.scss';

.choose-cpool-popover {
  .cpool-container {
    padding: 30px 50px;
  }

  h3 {
    margin-bottom: 10px;
  }

  .coin-pool-select-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    .coin-pool-selector {
      flex: 1 1;
      margin-right: 20px;
    }

    .go-coin-pool-page {
      flex: 0 0 135px;
    }
  }

  .address {
    font-size: 14px;
    margin-bottom: 10px;
    user-select: text;

    span {
      margin-left: 10px;
      color: $primary-color;
      cursor: pointer;
    }
  }

  #payment-confirm-button {
    display: block;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
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
