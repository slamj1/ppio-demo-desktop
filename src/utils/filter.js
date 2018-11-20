// some vue filter functions
export default {
  install: (Vue, options) => {
    Vue.filter('convertFileSize', value => {
      if (value === null) {
        return ''
      }
      var size = ''
      if (value < 0.1 * 1024) {
        size = `${value.toFixed(2)}B`
      } else if (value < 0.1 * 1024 * 1024) {
        size = `${(value / 1024).toFixed(2)}KB`
      } else if (value < 0.1 * 1024 * 1024 * 1024) {
        size = `${(value / (1024 * 1024)).toFixed(2)}MB`
      } else {
        size = `${(value / (1024 * 1024 * 1024)).toFixed(2)}GB`
      }

      var sizestr = `${size}`
      var len = sizestr.indexOf('.')
      var dec = sizestr.substr(len + 1, 2)
      if (dec === '00') {
        return sizestr.substring(0, len) + sizestr.substr(len + 3, 2)
      }
      return sizestr
    })
  },
}
