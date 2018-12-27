import { createLocalVue, shallowMount } from '@vue/test-utils'
import Element from 'element-ui'
import Router from 'vue-router'
import Vuex from 'vuex'

import 'element-ui/lib/style.css'
import Profile from '@/components/Profile.vue'

const localVue = createLocalVue()

localVue.use(Element)
localVue.use(Router)
localVue.use(Vuex)

describe('Profile.vue', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        appVersion: '1.0',
      },
    })
  })

  it('renders profile component', () => {
    const wrapper = shallowMount(Profile, {
      localVue,
      store,
      propsData: {
        userData: {
          uid: '',
          isLogin: true,
          balance: 30,
          funds: 20,
          billingRecords: [],
          avatar: '',
          address: 'fdsafeILHULHUIfwe235feILHULfeILHUL',
          usedStorage: 520,
          capacity: 1000,
        },
      },
    })

    expect(wrapper.find('.profile-username').text()).toMatch('fdsafe')
  })
})
