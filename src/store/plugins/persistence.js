import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../../constants/constants'

/**
 * vuex store persistence
 * @param store
 */
export default store => {
  // store vuex state on every mutation
  store.subscribe((mutation, state) => {
    console.log('setting app state to storage')
    console.log(state)
    // TODO: only fired by SOME type of mutations: [metadata, filelist, usage, download/upload task add/remove]
    storage.setItem(APP_STATE_PERSIST_KEY, state).catch(err => {
      console.error(err)
    })
  })
}
