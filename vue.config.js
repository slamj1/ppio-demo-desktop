module.exports = {
  pages: {
    index: 'src/index/main.js',
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => [
      {
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          BASE_URL: args[0]['process.env'].BASE_URL,
          IS_CPOOL: JSON.stringify(process.env.IS_CPOOL),
        },
      },
    ])
  },
  configureWebpack: {
    resolve: {
      symlinks: false,
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.ppio-demo.app',
        productName: 'PPIO-demo',
        copyright: 'Copyright © 2019 PPLabs.org',
        mac: {
          category: 'public.app-category.productivity',
          target: ['dmg'],
          icon: 'public/icons/icon.icns',
        },
        dmg: {
          title: 'PPIO-demo installation',
          icon: 'public/icons/icon.icns',
        },
        win: {
          target: ['nsis'],
        },
        asarUnpack: [
          '**/node_modules/poss-sdk/*',
          '**/src/background.js',
          '**/src/background/ppiosdk.js',
        ],
      },
    },
  },
}
