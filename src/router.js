import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Start from './views/account/Start.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'start',
      component: Start,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'services',
          name: 'services',
          component: require('./views/subviews/Service'),
        },
        {
          path: 'download',
          name: 'download',
          component: require('./views/subviews/download/Process'),
          children: [
            {
              path: 'payment',
              name: 'download/payment',
              component: require('./views/subviews/Payment'),
            },
          ],
        },
        {
          path: 'get',
          name: 'get',
          component: require('./views/subviews/get/Process'),
          children: [
            {
              path: 'inputcode',
              name: 'get/inputcode',
              component: require('./views/subviews/get/InputCode'),
            },
            {
              path: 'method',
              name: 'get/method',
              component: require('./views/subviews/get/ChooseMethod'),
            },
            {
              path: 'security',
              name: 'get/security',
              component: require('./views/subviews/get/Security'),
            },
            {
              path: 'payment',
              name: 'get/payment',
              component: require('./views/subviews/Payment'),
            },
          ],
        },
        {
          path: 'renew',
          name: 'renew',
          component: require('./views/subviews/renew/Process'),
          children: [
            {
              path: 'payment',
              name: 'renew/payment',
              component: require('./views/subviews/Payment'),
            },
          ],
        },
        {
          path: 'share',
          name: 'share',
          component: require('./views/subviews/share/Process'),
          children: [
            {
              path: 'share',
              name: 'share/share',
              component: require('./views/subviews/share/Share'),
            },
            {
              path: 'payment',
              name: 'share/payment',
              component: require('./views/subviews/Payment'),
            },
          ],
        },
        {
          path: 'upload',
          name: 'upload',
          component: require('./views/subviews/upload/Process'),
          children: [
            {
              path: 'security',
              name: 'upload/security',
              component: require('./views/subviews/upload/Security'),
            },
            {
              path: 'payment',
              name: 'upload/payment',
              component: require('./views/subviews/Payment'),
            },
          ],
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: require('./views/About.vue'),
    },
    {
      path: '/billing',
      name: 'billing',
      component: require('./views/BillingRecords'),
    },
    {
      path: '/account',
      name: 'account',
      component: require('./views/account/Start'),
      children: [
        {
          path: 'import',
          name: 'account/import',
          component: require('./views/account/Import'),
        },
        {
          path: 'create',
          name: 'account/create',
          component: require('./views/account/Create'),
        },
      ],
    },
  ],
})
