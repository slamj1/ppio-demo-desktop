import Vue from 'vue'
import Router from 'vue-router'
import Splash from '../views/Splash'
import Home from '../views/Home'
import Files from '../views/Files'
import DownloadList from '../views/Download'
import UploadList from '../views/Upload'
import Start from '../views/account/Start'
import ImportAccount from '../views/account/Import'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/splash',
      name: 'splash',
      component: Splash,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'files',
          name: 'files',
          component: Files,
        },
        {
          path: 'download-list',
          name: 'download-list',
          component: DownloadList,
        },
        {
          path: 'upload-list',
          name: 'upload-list',
          component: UploadList,
        },
      ],
    },
    {
      path: '/account',
      name: 'account',
      component: Start,
      children: [
        {
          path: '',
          redirect: 'import',
        },
        {
          path: 'import',
          name: 'account/import',
          component: ImportAccount,
        },
      ],
    },
  ],
})
