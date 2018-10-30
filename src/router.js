import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

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
          component: require('./views/subviews/Service').default,
        },
        {
          path: 'download',
          name: 'download',
          component: require('./views/subviews/download/Process').default,
          children: [
            {
              path: 'payment',
              name: 'download/payment',
              component: require('./views/subviews/Payment').default,
            },
          ],
        },
        {
          path: 'get',
          name: 'get',
          component: require('./views/subviews/get/Process').default,
          children: [
            {
              path: 'inputcode',
              name: 'get/inputcode',
              component: require('./views/subviews/get/InputCode').default,
            },
            {
              path: 'method',
              name: 'get/method',
              component: require('./views/subviews/get/ChooseMethod').default,
            },
            {
              path: 'security',
              name: 'get/security',
              component: require('./views/subviews/get/Security').default,
            },
            {
              path: 'payment',
              name: 'get/payment',
              component: require('./views/subviews/Payment').default,
            },
          ],
        },
        {
          path: 'renew',
          name: 'renew',
          component: require('./views/subviews/renew/Process').default,
          children: [
            {
              path: 'payment',
              name: 'renew/payment',
              component: require('./views/subviews/Payment').default,
            },
          ],
        },
        {
          path: 'share',
          name: 'share',
          component: require('./views/subviews/share/Process').default,
          children: [
            {
              path: 'share',
              name: 'share/share',
              component: require('./views/subviews/share/Share').default,
            },
            {
              path: 'payment',
              name: 'share/payment',
              component: require('./views/subviews/Payment').default,
            },
          ],
        },
        {
          path: 'upload',
          name: 'upload',
          component: require('./views/subviews/upload/Process').default,
          children: [
            {
              path: 'security',
              name: 'upload/security',
              component: require('./views/subviews/upload/Security').default,
            },
            {
              path: 'payment',
              name: 'upload/payment',
              component: require('./views/subviews/Payment').default,
            },
          ],
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: require('./views/About.vue').default,
    },
    {
      path: '/billing',
      name: 'billing',
      component: require('./views/BillingRecords').default,
    },
    {
      path: '/account',
      name: 'account',
      component: require('./views/account/Start').default,
      children: [
        {
          path: '/',
          redirect: 'import',
        },
        {
          path: 'import',
          name: 'account/import',
          component: require('./views/account/Import').default,
        },
        {
          path: 'create',
          name: 'account/create',
          component: require('./views/account/Create').default,
        },
      ],
    },
  ],
})
