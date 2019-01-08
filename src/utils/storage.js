import localforage from 'localforage'

const store = localforage.createInstance({
  name: process.env.IS_CPOOL === 'true' ? 'ppio-demo_cpool' : 'ppio-demo',
})

export default store
