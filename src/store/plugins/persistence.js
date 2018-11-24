import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../../constants/constants'

/**
 * vuex store persistence
 * @param store
 */
export default store => {
  // store vuex state on every mutation
  store.subscribe((mutation, state) => {
    // TODO: add mutation filter, only [metadata, filelist, usage, download/upload task add/remove] can trigger persistence
    console.log('setting app state to storage')
    console.log(state)
    if (state.dataDir.length > 0 && state.user.uid.length > 0) {
      storage.setItem(APP_STATE_PERSIST_KEY, state).catch(err => {
        console.error(err)
      })
    }
  })
}
