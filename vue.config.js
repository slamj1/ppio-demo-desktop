module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  filenameHashing: false,
  devServer: {
    proxy: {
      '/version': {
        target: 'https://resource.testnet.pp.io/',
        changeOrigin: true,
      },
    },
  },
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
        protocols: [
          {
            name: 'PPIO-Demo',
            schemes: ['ppio-demo', 'app'],
          },
        ],
        mac: {
          category: 'public.app-category.productivity',
          target: ['dmg'],
          icon: 'public/icons/icon.icns',
          extraResources: [
            {
              from: 'src/poss-bin/poss_mac',
              to: 'extraResources/poss_mac',
            },
            {
              from: 'src/assets/tray-icon.png',
              to: 'extraResources/tray-icon.png',
            },
          ],
        },
        dmg: {
          background: 'public/installer-bg.png',
          title: 'PPIO-Demo installation',
          icon: 'public/icons/icon.icns',
          window: {
            width: 540,
            height: 380,
          },
        },
        win: {
          target: ['nsis'],
          icon: 'public/icons/icon.ico',
          extraResources: [
            {
              from: 'src/poss-bin/poss_win.exe',
              to: 'extraResources/poss_win.exe',
            },
            {
              from: 'src/assets/tray-icon.png',
              to: 'extraResources/tray-icon.png',
            },
          ],
        },
        nsis: {
          installerIcon: 'public/icons/nsis-icon.ico',
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          allowElevation: false,
          installerSidebar: 'public/installer-bg_nsis.bmp',
        },
        linux: {
          target: ['deb'],
          extraResources: [
            {
              from: 'src/poss-bin/poss_linux',
              to: 'extraResources/poss_linux',
            },
            {
              from: 'src/assets/tray-icon.png',
              to: 'extraResources/tray-icon.png',
            },
          ],
        },
        asarUnpack: ['**/src/background.js', '**/src/background/ppiosdk.js'],
      },
    },
  },
}
