import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Services from './views/subviews/Service'
import Download from './views/subviews/download/Process'
import Payment from './views/subviews/Payment'
import GetProcess from './views/subviews/get/Process'
import InputCode from './views/subviews/get/InputCode'
import GetMethod from './views/subviews/get/ChooseMethod'
import GetSecurity from './views/subviews/get/Security'
import RenewProcess from './views/subviews/renew/Process'
import ShareProcess from './views/subviews/share/Process'
import Share from './views/subviews/share/Share'
import UploadProcess from './views/subviews/upload/Process'
import UploadSecurity from './views/subviews/upload/Security'
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
      redirect: 'home',
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
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
          children: [
            {
              path: 'payment',
              name: 'download/payment',
              component: Payment,
            },
          ],
        },
        {
          path: 'get',
          name: 'get',
          component: GetProcess,
          children: [
            {
              path: 'inputcode',
              name: 'get/inputcode',
              component: InputCode,
            },
            {
              path: 'method',
              name: 'get/method',
              component: GetMethod,
            },
            {
              path: 'security',
              name: 'get/security',
              component: GetSecurity,
            },
            {
              path: 'payment',
              name: 'get/payment',
              component: Payment,
            },
          ],
        },
        {
          path: 'renew',
          name: 'renew',
          component: RenewProcess,
          children: [
            {
              path: 'payment',
              name: 'renew/payment',
              component: Payment,
            },
          ],
        },
        {
          path: 'share',
          name: 'share',
          component: ShareProcess,
          children: [
            {
              path: 'share',
              name: 'share/share',
              component: Share,
            },
            {
              path: 'payment',
              name: 'share/payment',
              component: Payment,
            },
          ],
        },
        {
          path: 'upload',
          name: 'upload',
          component: UploadProcess,
          children: [
            {
              path: 'security',
              name: 'upload/security',
              component: UploadSecurity,
            },
            {
              path: 'payment',
              name: 'upload/payment',
              component: Payment,
            },
          ],
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
