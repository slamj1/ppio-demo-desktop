module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/assets/css/_var.scss";`,
      },
    },
  },
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
        productName: process.env.IS_CPOOL === 'true' ? 'PPIO-demo_cpool' : 'PPIO-demo',
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
          icon: 'public/icons/icon.ico',
        },
        linux: {
          target: ['deb'],
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
