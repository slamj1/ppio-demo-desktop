import localforage from 'localforage'

console.log(process.env.IS_CPOOL === 'true')
const store = localforage.createInstance({
  name: process.env.IS_CPOOL === 'true' ? 'ppio-demo_cpool' : 'ppio-demo',
})

console.log(store)

export default store
