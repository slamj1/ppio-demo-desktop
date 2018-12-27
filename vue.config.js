module.exports = {
  pages: {
    index: 'src/index/main.js',
  },
  devServer: {
    proxy: {
      '/cpool': {
        target: 'http://192.168.50.233:10001',
        changeOrigin: true,
        pathRewrite: {
          '^/cpool': '',
        },
      },
    },
  },
  configureWebpack: {
    resolve: {
      symlinks: false,
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        // asar: false,
        asarUnpack: [
          '**/node_modules/poss-sdk/*',
          '**/src/background.js',
          '**/src/background/ppiosdk.js',
        ],
      },
    },
  },
}
