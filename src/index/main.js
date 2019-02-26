import Vue from 'vue'
import { ipcRenderer } from 'electron'
import App from '../views/App.vue'
import router from './router'
import store from '../store/'
import '../plugins/element.js'
import FilterPlugin from '../utils/filter.js'
import UtilPlugin from '../plugins/util.js'
import { minimalUnit } from '../constants/constants'

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.use(FilterPlugin)
Vue.use(UtilPlugin)
Vue.prototype.$minimalUnit = minimalUnit

const appIns = new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

ipcRenderer.on('jump-to-route', (e, path) => {
  console.log(path)
  appIns.$router.push(path)
})
