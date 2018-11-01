// some util functions
import { Notification } from 'element-ui'

export default {
  install: (Vue, options) => {
    Vue.testGlobalMethod = () => 'testGlobalMethod'

    Vue.prototype.$testInstanceMethod = () => 'testInstanceMethod'

    // bind remote to vue global instance
    Vue.prototype.$remote = require('electron').remote

    // vue event bus instance
    Vue.prototype.$vueBus = new Vue()

    Vue.prototype.$notify = Notification
  },
}
