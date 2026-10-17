import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from '../../../../registry/components/pagination/pagination.vue'
import { paginationItems } from '../../../../registry/components/pagination/pagination.utils'

describe('Pagination requests', () => {
  it('retains the displayed page until the application accepts a request', async () => {
    // pagination.state.accepted
    const wrapper = mount(Pagination, { props: { total: 200, page: 5 } })
    await wrapper.get('[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ page: 6, pageSize: 10 })
    expect(wrapper.get('[aria-label="Page 5"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[aria-label="Page 6"]').attributes('aria-current')).toBeUndefined()
    await wrapper.setProps({ pending: true })
    await wrapper.get('[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
    await wrapper.setProps({ pending: false, page: 6 })
    expect(wrapper.get('[aria-label="Page 6"]').attributes('aria-current')).toBe('page')
    wrapper.unmount()
  })

  it('preserves the first visible result when requesting a new page size', () => {
    const wrapper = mount(Pagination, { props: { total: 200, page: 5, pageSizes: [10, 25, 50] } })
    wrapper.getComponent({ name: 'Select' }).vm.$emit('update:modelValue', '25')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ page: 2, pageSize: 25 })
    expect(wrapper.emitted('update:pageSize')).toEqual([[25]])
    wrapper.unmount()
  })

  it('leaves modified links native without changing the current result', async () => {
    const wrapper = mount(Pagination, {
      props: { total: 200, page: 5, href: (page) => `?page=${page}` },
    })
    const link = wrapper.get('a[aria-label="Page 6"]')
    expect(link.attributes('href')).toBe('?page=6')
    await link.trigger('click', { ctrlKey: true })
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('omits redundant navigation for zero and one page and never invents a current page', async () => {
    const wrapper = mount(Pagination, { props: { total: 0 } })
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.text()).toContain('0–0 of 0 results')
    await wrapper.setProps({ total: 8 })
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.text()).toContain('1–8 of 8 results')
    await wrapper.setProps({ total: 200, page: 25 })
    expect(wrapper.find('[aria-current="page"]').exists()).toBe(false)
    expect(wrapper.get('[aria-label="Next page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('update:page')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('Pagination window', () => {
  it.each([
    [1, 0, []],
    [2, 5, [1, 2, 3, 4, 5]],
    [1, 20, [1, 2, 'gap-2', 20]],
    [5, 20, [1, 'gap-1', 4, 5, 6, 'gap-6', 20]],
    [19, 20, [1, 'gap-1', 18, 19, 20]],
    [4, 8, [1, 2, 3, 4, 5, 'gap-5', 8]],
  ])('shows boundary and adjacent pages around %s of %s', (page, count, expected) => {
    expect(paginationItems(page as number, count as number)).toEqual(expected)
  })
})
