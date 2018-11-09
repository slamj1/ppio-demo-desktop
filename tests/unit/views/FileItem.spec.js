import { shallowMount } from '@vue/test-utils'

import FileItem from '@/components/FileItem.vue'

describe('Home.vue', () => {
  it('renders file item component', () => {
    const wrapper = shallowMount(FileItem, {
      propsData: {
        file: {
          id: 'dfsafsd2',
          filename: 'test-file-name.ext',
          size: 100,
          type: 'image/png',
          isSecure: true,
          isPublic: false,
        },
        selected: true,
      },
    })

    expect(wrapper.find('.file-item').classes()).toContain('secure')
  })
})
