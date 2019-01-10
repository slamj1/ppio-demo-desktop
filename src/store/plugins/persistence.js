import throttle from 'lodash.throttle'
import { APP_STATE_PERSIST_KEY } from '../../constants/constants'
import { MUT_SET_POLLING_TASK_TIMER } from '../../constants/store'
import storage from '../../utils/storage'

export default store => {
  store.subscribe(
    throttle(
      (mutation, state) => {
        // store vuex state on every mutation
        // TODO: add mutation filter, only [metadata, filelist, usage, download/upload task add/remove] can trigger persistence
        // Prevent persisting on app start
        if (
          (state.dataDir.length === 0 || state.user.uid.length === 0) &&
          !mutation.type.match('clear') // There are 4 clear mutation types, all matches "clear", will be triggered when logging out.
        ) {
          console.log('not setting state')
          return
        }

        if (mutation.type === MUT_SET_POLLING_TASK_TIMER) {
          console.log(`not setting state, (${mutation.type})`)
          return
        }
        console.log('setting app state to storage')
        storage
          .setItem(APP_STATE_PERSIST_KEY, state)
          .then(res => {
            console.log('app state persisted')
            return res
          })
          .catch(err => {
            console.error(err)
          })
      },
      500,
      { leading: false },
    ),
  )
}
