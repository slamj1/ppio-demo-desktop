// some util functions
import { Notification } from 'element-ui'
import { remote } from 'electron'

export default {
  install: (Vue, options) => {
    Vue.testGlobalMethod = () => 'testGlobalMethod'

    Vue.prototype.$testInstanceMethod = () => 'testInstanceMethod'

    // bind remote to vue global instance
    Vue.prototype.$remote = remote

    // vue event bus instance
    Vue.prototype.$vueBus = new Vue()

    Vue.prototype.$notify = Notification
  },
}
