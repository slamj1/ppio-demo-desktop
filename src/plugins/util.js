// some util functions
import { remote } from 'electron'
import EVENTS from '../constants/events'
import { version } from '../../package.json'

console.log('checking env from vue plugin')
console.log(process.env.IS_CPOOL)

export default {
  install: (Vue, options) => {
    Vue.testGlobalMethod = () => 'testGlobalMethod'

    Vue.prototype.$testInstanceMethod = () => 'testInstanceMethod'

    // bind remote to vue global instance
    Vue.prototype.$remote = remote

    // vue event bus instance and event names
    Vue.prototype.$vueBus = new Vue()
    Vue.prototype.$events = EVENTS

    Vue.prototype.$isCpoolPackage = process.env.IS_CPOOL === 'true'

    Vue.prototype.$appVer = version
  },
}
