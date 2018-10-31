<template>
  <div class="share-page">
    <popup class="popup" :button-title="'Copy'" v-on:close="f_close" v-on:confirm="f_confirm">
      <span slot="header">Share File: "The name of the sharing file!he name of the sharing filehe name of the sharing filehe name of the sharing file"</span>

      <div class="content" slot="content">
        <label class="share-code-label">Share Code:</label>
        <el-input class="share-code-input" v-model="shareCode" :disabled="true"></el-input>
      </div>

      <el-button slot="footer" class="button" size="mini" v-on:click="f_unshare">Unshare</el-button>
    </popup>
  </div>
</template>
<script>
import Popup from '@/components/Popup'

export default {
  name: 'share',
  data: () => ({
    shareCode: 'RWERT3456I3P4I6565435MNNFDSSDF5346OI',
  }),
  components: {
    Popup,
  },
  methods: {
    f_close() {
      this.$vueBus.$emit('share-close')
    },
    f_confirm() {
      this.$vueBus.$emit('share-copy')
    },
    f_unshare() {
      this.$vueBus.$emit('unshare')
    },
  },
}
</script>
<style lang="scss" scoped>
.popup {
  text-align: left;
  .content {
    padding-left: 120px;
    padding-right: 20px;
    position: relative;
    margin-top: 20px;
    margin-bottom: 20px;
    .share-code-label {
      position: absolute;
      top: 0;
      height: 40px;
      line-height: 40px;
      left: 20px;
      display: inline-block;
    }
  }
  .button {
    margin-right: 15px;
  }
}
</style>
