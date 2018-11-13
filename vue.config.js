module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        // asar: false,
        asarUnpack: [
          '**/node_modules/ppio_sdk_npm/*',
          '**/src/background.js',
          '**/src/ppiosdk.js',
        ],
      },
    },
  },
}
