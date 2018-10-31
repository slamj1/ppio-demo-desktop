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
import Share from './views/subviews/share/Share'
import Upload from './views/subviews/upload/Upload'
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
