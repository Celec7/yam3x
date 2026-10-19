import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import TreeView from '../../../../registry/components/tree-view/tree-view.vue'
import type { TreeViewNode } from '../../../../registry/components/tree-view'

enableAutoUnmount(afterEach)
const children: TreeViewNode[] = Array.from({ length: 10000 }, (_, index) => ({
  key: `item-${index}`,
  label: `Item ${index + 1}`,
  disabled: index === 9998,
}))
const nodes: TreeViewNode[] = [{ key: 0, label: 'Root', children }]
it('tree-view.virtual.catalog: scrolling only visits retained rows and their ancestors', async () => {
  let reads = 0
  const catalog = children.map((node) => ({
    get key() {
      reads++
      return node.key
    },
    label: node.label,
  }))
  const wrapper = mount(TreeView, {
    props: {
      nodes: [{ key: 0, label: 'Root', children: catalog }],
      label: 'Items',
      virtual: true,
      expandedKeys: [0],
    },
  })
  await flushPromises()
  const before = reads
  const scroller = wrapper.get<HTMLElement>('.yam3x-tree-view__scroll').element
  scroller.scrollTop = 4000
  scroller.dispatchEvent(new Event('scroll'))
  await flushPromises()
  expect(reads - before).toBeLessThan(500)
  expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30)
  expect(wrapper.get('[role="group"] [role="treeitem"]').attributes('aria-setsize')).toBe('10000')
})
it('tree-view.virtual.catalog: retained ancestors keep sibling order across branch boundaries', async () => {
  const nodes = Array.from({ length: 3 }, (_, root) => ({
    key: `root-${root}`,
    label: `Root ${root}`,
    children: Array.from({ length: 5 }, (_, index) => ({
      key: `${root}-${index}`,
      label: `Child ${index}`,
    })),
  }))
  const wrapper = mount(TreeView, {
    props: {
      nodes,
      label: 'Items',
      virtual: { overscan: 0 },
      expandedKeys: nodes.map((node) => node.key),
    },
  })
  await flushPromises()
  const scroller = wrapper.get<HTMLElement>('.yam3x-tree-view__scroll').element
  scroller.scrollTop = 9 * 56
  scroller.dispatchEvent(new Event('scroll'))
  await flushPromises()
  expect(
    wrapper
      .findAll('[role="tree"] > [role="treeitem"]')
      .map((row) => row.attributes('data-tree-key')),
  ).toEqual(['root-0', 'root-1', 'root-2'])
  expect(
    wrapper
      .findAll('[data-tree-key="root-1"] [role="group"] > [role="treeitem"]')
      .map((row) => row.attributes('data-tree-key')),
  ).toEqual(['1-2', '1-3', '1-4'])
})
it('tree-view.virtual.catalog: bounds the expanded tree and mounts distant focus targets with full hierarchy metadata', async () => {
  const wrapper = mount(TreeView, {
    attachTo: document.body,
    props: { nodes, label: 'Items', virtual: true, expandedKeys: [0] },
  })
  await flushPromises()
  expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30)
  const root = wrapper.get('[data-tree-key="0"]')
  await root.trigger('keydown', { key: 'End' })
  await flushPromises()
  const last = wrapper.get('[data-tree-key="item-9999"]')
  expect(last.attributes('aria-level')).toBe('2')
  expect(last.attributes('aria-posinset')).toBe('10000')
  expect(last.attributes('aria-setsize')).toBe('10000')
  expect(document.activeElement).toBe(last.element)
  await last.trigger('keydown', { key: 'ArrowUp' })
  await nextTick()
  const disabled = wrapper.get('[data-tree-key="item-9998"]')
  expect(document.activeElement).toBe(disabled.element)
  expect(disabled.attributes('aria-disabled')).toBe('true')
  await disabled.trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
  await wrapper.setProps({ expandedKeys: [] })
  await flushPromises()
  expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1)
  expect(document.activeElement).toBe(root.element)
})
it('tree-view.virtual.catalog: derives mixed checking from unmounted descendants', async () => {
  const wrapper = mount(TreeView, {
    props: {
      nodes,
      label: 'Items',
      virtual: true,
      expandedKeys: [0],
      checkMode: 'cascade',
      checkedKeys: ['item-9999'],
    },
  })
  await flushPromises()
  expect(wrapper.get('[data-tree-key="0"]').attributes('aria-checked')).toBe('mixed')
  expect(wrapper.find('[data-tree-key="item-9999"]').exists()).toBe(false)
  expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30)
})
it('tree-view.virtual.catalog: retries a failed branch and windows the complete loaded collection', async () => {
  const loadChildren = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(children)
  const wrapper = mount(TreeView, {
    props: {
      nodes: [{ key: 'remote', label: 'Remote', hasChildren: true }],
      label: 'Items',
      virtual: true,
      expandedKeys: ['remote'],
      loadChildren,
    },
  })
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  await wrapper.get('.yam3x-tree-view__retry').trigger('click')
  await flushPromises()
  expect(loadChildren).toHaveBeenCalledTimes(2)
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30)
  expect(wrapper.get('[data-tree-key="item-0"]').attributes('aria-setsize')).toBe('10000')
})
it('tree-view.virtual.catalog: server renders a bounded window of expanded descendants', async () => {
  const html = await renderToString(
    h(TreeView, { nodes, label: 'Items', virtual: true, expandedKeys: [0] }),
  )
  const host = document.createElement('div')
  host.innerHTML = html
  expect(host.querySelectorAll('[role="treeitem"]').length).toBeLessThan(30)
  expect(host.querySelector('[data-tree-key="item-0"]')?.getAttribute('aria-level')).toBe('2')
  expect(host.querySelector('[data-tree-key="item-0"]')?.getAttribute('aria-setsize')).toBe('10000')
})

it('tree-view.virtual.catalog: changing rendering mode preserves application-owned selection and external focus', async () => {
  const outside = document.createElement('button')
  document.body.append(outside)
  try {
    const wrapper = mount(TreeView, {
      attachTo: document.body,
      props: {
        nodes: [{ key: 0, label: 'Root', children: children.slice(0, 50) }],
        label: 'Items',
        virtual: true,
        expandedKeys: [0],
        selectedKeys: ['item-49'],
      },
    })
    await flushPromises()
    outside.focus()
    await wrapper.setProps({ virtual: false })
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(51)
    await wrapper.setProps({ virtual: true })
    await flushPromises()
    expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30)
    expect(wrapper.get('[data-tree-key="item-49"]').attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(outside)
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.vm.focus('missing')).toBe(false)
  } finally {
    outside.remove()
  }
})
