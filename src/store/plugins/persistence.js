import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../../constants/constants'

/**
 * vuex store persistence
 * @param store
 */
export default store => {
  // get persisted state from storage
  storage
    .getItem(APP_STATE_PERSIST_KEY)
    .then(val => {
      console.log('init app state')
      console.log(val)
      if (val) {
        store.replaceState(val)
      }
      return true
    })
    .catch(err => {
      console.error(err)
    })

  // store vuex state on every mutation
  store.subscribe((mutation, state) => {
    console.log('mutation hook fired')
    console.log(state)
    storage.setItem(APP_STATE_PERSIST_KEY, state).catch(err => {
      console.error(err)
    })
  })
}
