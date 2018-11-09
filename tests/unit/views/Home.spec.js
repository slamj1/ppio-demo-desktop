import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Element from 'element-ui'
import 'element-ui/lib/style.css'

import Home from '@/views/Home.vue'
import FilterPlugin from '@/utils/filter.js'
import UtilPlugin from '@/plugins/util.js'
import { DL_TASK, UL_TASK, USAGE_PERCENT_GETTER } from '@/constants/store'

// create an extended 'Vue' constructor
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
localVue.use(FilterPlugin)
localVue.use(UtilPlugin)
localVue.use(Element)

describe('Home.vue', () => {
  let store, router

  beforeEach(() => {
    router = new VueRouter({
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
          children: [
            {
              path: 'files',
              name: 'files',
            },
            {
              path: 'download-list',
              name: 'download-list',
            },
            {
              path: 'upload-list',
              name: 'upload-list',
            },
          ],
        },
        {
          path: '/account',
          name: 'account',
          children: [
            {
              path: '/',
              redirect: 'import',
            },
            {
              path: 'import',
              name: 'account/import',
            },
            {
              path: 'create',
              name: 'account/create',
            },
          ],
        },
      ],
    })
    store = new Vuex.Store({
      state: {
        appVersion: '1.0',
      },
      getters: {
        [DL_TASK.GET_TASK_COUNT]: () => 2,
        [UL_TASK.GET_TASK_COUNT]: () => 3,
        [USAGE_PERCENT_GETTER]: () => 30,
      },
      modules: {
        user: {
          state: {
            uid: '',
            isLogin: true,
            nickname: '',
            balance: 30,
            fund: 20,
            billingRecords: [],
            avatar: require('@/assets/img/avatar.png'),
            address: 'fdsafeILHULHUIfwe235feILHULfeILHUL',
            usedStorage: 520,
            capacity: 1000,
          },
        },
      },
    })
  })

  it('renders user data', () => {
    const wrapper = shallowMount(Home, {
      router,
      store,
      localVue,
      mocks: {
        electron: {
          shell: {
            openExternal: jest.fn(),
          },
        },
      },
      stubs: {
        Profile: '<div id="stub-profile" />',
        BillingRecords: '<div id="stub-billing" />',
        Download: '<div id="stub-download" />',
        Get: '<div id="stub-get" />',
        Renew: '<div id="stub-renew" />',
        Share: '<div id="stub-share" />',
        Upload: '<div id="stub-upload" />',
      },
    })

    // render user address
    expect(wrapper.find('.profile-username').text()).toMatch('fdsafe')

    // TODO: Is it possible to test routing ?
  })
})
