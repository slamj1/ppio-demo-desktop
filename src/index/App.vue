<template>
  <div id="app">
    <div class="app-global-loading" v-if="initializing">
      <p>Initializing....</p>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../constants/constants'
import { ACT_GET_USER_DATA } from '../constants/store'

export default {
  name: 'app',
  data() {
    return {
      initializing: true,
    }
  },
  mounted() {
    const timer = () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 800)
      })
    const dataFetcher = () => this.$store.dispatch(ACT_GET_USER_DATA)

    // get persisted state from storage
    console.log('getting app state from storage')
    storage
      .getItem(APP_STATE_PERSIST_KEY)
      .then(val => {
        console.log('init app state')
        console.log(val)
        if (val) {
          this.$store.replaceState(val)
        }
        return val
      })
      .then(() =>
        Promise.all([timer(), dataFetcher()])
          .then(() => {
            console.log('data init finished')
            this.initializing = false
            return this.$router.push({ name: 'files' })
          })
          .catch(err => {
            console.log('data init failed. unlogin')
            console.error(err)
            this.initializing = false
            this.$router.push({ name: 'account' })
          }),
      )
      .catch(err => {
        console.error(err)
      })
  },
}
</script>

<style lang="scss">
@import '../assets/css/_base.scss';

#app {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.app-global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  color: #ccc;
  font-weight: bold;
  font-size: 40px;
}
</style>
