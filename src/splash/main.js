import Vue from 'vue'
import Splash from './Splash.vue'

Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
  render: h => h(Splash),
}).$mount('#splash-screen')
