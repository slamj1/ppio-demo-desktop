<template>
  <div id="app">
    <div class="app-global-loading" v-if="initializing">
      <p>Initializing....</p>
    </div>
    <router-view @startApp="f_startApp"></router-view>
  </div>
</template>

<script>
import { remote } from 'electron'
import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../constants/constants'
import { ACT_GET_USER_DATA } from '../constants/store'
import { startDaemon } from '../services/daemon'

export default {
  name: 'app',
  data() {
    return {
      initializing: true,
    }
  },
  mounted() {
    // get persisted state from storage
    console.log('getting app state from storage')
    storage
      .getItem(APP_STATE_PERSIST_KEY)
      .then(val => {
        console.log('init app state')
        console.log(val)
        if (val) {
          if (val.dataDir.length > 0 && val.user.uid.length > 0) {
            this.$store.replaceState(val)
            return val
          }
        }
        return Promise.reject(new Error('not login'))
      })
      .then(() => this.f_startApp())
      .catch(err => {
        console.log('data init failed.')
        console.log(err)
        this.initializing = false
        remote.getCurrentWindow().setSize(1000, 670, true)
        this.$router.push({ name: 'account/import' })
      })
  },
  methods: {
    f_startApp() {
      console.log('starting app')
      const startPpioDaemon = () => {
        console.log('starting daemon ', Date.now())
        const timer = () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve()
            }, 8000)
          })

        return startDaemon(this.$store.state.dataDir).then(hasStarted => {
          console.log('daemon started')
          if (hasStarted) {
            return true
          }
          return timer()
        })
      }

      return startPpioDaemon()
        .then(() => this.$store.dispatch(ACT_GET_USER_DATA))
        .then(() => {
          console.log('data init finished')
          this.initializing = false
          remote.getCurrentWindow().setSize(1000, 670, true)
          return this.$router.push({ name: 'files' })
        })
    },
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
