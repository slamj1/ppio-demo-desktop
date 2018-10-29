// some vue filter functions
export default {
  install: (Vue, options) => {
    Vue.filter('filter-hello', value => `hello ${value}`)
  },
}
