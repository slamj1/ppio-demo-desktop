import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '../store/'
import '../plugins/element.js'
import FilterPlugin from '../utils/filter.js'
import UtilPlugin from '../plugins/util.js'

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.use(FilterPlugin)
Vue.use(UtilPlugin)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
