import storage from 'localforage'
import throttle from 'lodash.throttle'
import { APP_STATE_PERSIST_KEY } from '../../constants/constants'

export default store => {
  store.subscribe(
    throttle(
      (mutation, state) => {
        // store vuex state on every mutation
        // TODO: add mutation filter, only [metadata, filelist, usage, download/upload task add/remove] can trigger persistence
        // Prevent persisting on app start
        if (
          (state.dataDir.length === 0 || state.user.address.length === 0) &&
          !mutation.type.match('clear') // There are 4 clear mutation types, all matches "clear", will be triggered when logging out.
        ) {
          console.log('not setting state')
          return
        }
        console.log('setting app state to storage')
        storage
          .setItem(APP_STATE_PERSIST_KEY, state)
          .then(res => {
            console.log('app state persisted')
            console.log(res)
            console.log(state)
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
