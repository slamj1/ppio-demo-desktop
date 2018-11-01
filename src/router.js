import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Files from './views/Files'
import DownloadList from './views/Download'
import UploadList from './views/Upload'
import Services from './views/subviews/Service'
import Download from './views/subviews/Download'
import Get from './views/subviews/Get'
import Renew from './views/subviews/Renew'
import Share from './views/subviews/Share'
import Upload from './views/subviews/Upload'
import About from './views/About'
import BillingRecords from './views/BillingRecords'
import Start from './views/account/Start'
import ImportAccount from './views/account/Import'
import CreateAccount from './views/account/Create'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home/files',
    },
    {
      path: '/home',
      redirect: '/home/files',
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
          children: [
            {
              path: 'services',
              name: 'services',
              component: Services,
            },
            {
              path: 'download',
              name: 'download',
              component: Download,
            },
            {
              path: 'get',
              name: 'get',
              component: Get,
            },
            {
              path: 'renew',
              name: 'renew',
              component: Renew,
            },
            {
              path: 'share',
              name: 'share',
              component: Share,
            },
            {
              path: 'upload',
              name: 'upload',
              component: Upload,
            },
          ],
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
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/billing',
      name: 'billing',
      component: BillingRecords,
    },
    {
      path: '/account',
      name: 'account',
      component: Start,
      children: [
        {
          path: '/',
          redirect: 'import',
        },
        {
          path: 'import',
          name: 'account/import',
          component: ImportAccount,
        },
        {
          path: 'create',
          name: 'account/create',
          component: CreateAccount,
        },
      ],
    },
  ],
})
