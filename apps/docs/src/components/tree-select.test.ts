import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import { TreeSelect, type TreeSelectNode } from '../../../../registry/components/tree-select'
import TreeView from '../../../../registry/components/tree-view/tree-view.vue'
import FormField from '../../../../registry/components/form-field/form-field.vue'
import { LocaleProvider } from '../../../../registry/components/localization'
import {
  filterTreeSelectNodes,
  validateTreeSelectNodes,
} from '../../../../registry/components/tree-select/tree-select.utils'

enableAutoUnmount(afterEach)
afterEach(() => vi.restoreAllMocks())
const nodes: TreeSelectNode[] = [
  {
    key: 'root',
    label: 'Workspace',
    children: [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
      { key: 'locked', label: 'Locked', disabled: true },
      { key: 'context', label: 'Grouping', selectable: false },
    ],
  },
]
const props = { nodes, label: 'Record', expandedKeys: ['root'] }
it('tree-select.selection.independent: commits a single key through the tree and preserves native values', async () => {
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: { ...props, modelValue: 'a', name: 'record' },
  })
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  await wrapper
    .getComponent(TreeView)
    .get('[data-tree-key="b"]')
    .trigger('keydown', { key: 'Enter' })
  await flushPromises()
  expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('b')
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('Beta')
  expect(wrapper.get('.yam3x-tree-select__trigger').attributes('aria-expanded')).toBe('false')
})
it('tree-select.selection.independent: cancellation preserves accepted keys, and multiple selection never cascades', async () => {
  const before = vi.fn((event: Event) => event.preventDefault())
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: { ...props, multiple: true, modelValue: ['missing', 'a'], onBeforeinput: before },
  })
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  await wrapper
    .getComponent(TreeView)
    .get('[data-tree-key="root"]')
    .trigger('keydown', { key: 'Enter' })
  expect(before).toHaveBeenCalledOnce()
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ onBeforeinput: undefined })
  await wrapper
    .getComponent(TreeView)
    .get('[data-tree-key="root"]')
    .trigger('keydown', { key: 'Enter' })
  await flushPromises()
  expect(
    [...wrapper.get<HTMLSelectElement>('select').element.selectedOptions].map(
      (option) => option.value,
    ),
  ).toEqual(['missing', 'a', 'root'])
  expect(wrapper.get('.yam3x-tree-select__trigger').attributes('aria-expanded')).toBe('true')
  await wrapper
    .getComponent(TreeView)
    .get('[data-tree-key="context"]')
    .trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
})
it('tree-select.search.ancestry: filtering keeps ancestors and hidden accepted keys without changing application expansion', async () => {
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      ...props,
      expandedKeys: [],
      multiple: true,
      searchable: true,
      modelValue: ['a', 'missing'],
    },
  })
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  const dialog = document.querySelector('[role="dialog"]')!
  const input = dialog.querySelector('input[type="search"]')!
  ;(input as HTMLInputElement).value = 'Beta'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
  const tree = wrapper.getComponent(TreeView)
  expect(tree.findAll('[role="treeitem"]').map((node) => node.attributes('data-tree-key'))).toEqual(
    ['root', 'b'],
  )
  expect(wrapper.emitted('update:expandedKeys')).toBeUndefined()
  await tree.get('[data-tree-key="b"]').trigger('keydown', { key: 'Enter' })
  await flushPromises()
  expect(
    [...wrapper.get<HTMLSelectElement>('select').element.selectedOptions].map(
      (option) => option.value,
    ),
  ).toEqual(['a', 'missing', 'b'])
  expect(wrapper.emitted('update:expandedKeys')).toBeUndefined()
})
it('tree-select.form.native: initial values reset through an external form and keep a chip field label floating', async () => {
  const form = document.createElement('form')
  form.id = 'tree-reset-form'
  document.body.append(form)
  try {
    const accepted = ref<string | string[] | null>(['a'])
    const wrapper = mount(FormField, {
      attachTo: document.body,
      props: { label: 'Record' },
      slots: {
        default: () =>
          h(TreeSelect, {
            ...props,
            modelValue: accepted.value,
            'onUpdate:modelValue': (value) => {
              accepted.value = value
            },
            multiple: true,
            form: form.id,
            name: 'record',
            required: true,
          }),
      },
    })
    await flushPromises()
    expect(wrapper.classes()).toContain('yam3x-form-field--floating')
    await wrapper.get('.yam3x-input-chip__remove').trigger('click')
    await flushPromises()
    expect(wrapper.get<HTMLSelectElement>('select').element.selectedOptions).toHaveLength(0)
    expect(wrapper.get<HTMLSelectElement>('select').element.validity.valueMissing).toBe(true)
    form.reset()
    await flushPromises()
    expect(
      [...wrapper.get<HTMLSelectElement>('select').element.selectedOptions].map(
        (option) => option.value,
      ),
    ).toEqual(['a'])
  } finally {
    form.remove()
  }
})
it('tree-select.dialog.focus: mounting closed fields does not take unrelated focus', async () => {
  const outside = document.createElement('button')
  document.body.append(outside)
  outside.focus()
  try {
    mount(TreeSelect, { attachTo: document.body, props })
    await flushPromises()
    expect(document.activeElement).toBe(outside)
  } finally {
    outside.remove()
  }
})
it('tree-select.form.native: inherited fieldset disabling closes a teleported picker and blocks changes', async () => {
  const wrapper = mount(
    { render: () => h('fieldset', {}, [h(TreeSelect, { ...props, modelValue: 'a' })]) },
    { attachTo: document.body },
  )
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  const native = wrapper.get<HTMLSelectElement>('select').element
  const fieldset = wrapper.get<HTMLFieldSetElement>('fieldset').element
  vi.spyOn(native, 'matches').mockImplementation(
    (selector) => selector === ':disabled' && fieldset.disabled,
  )
  fieldset.setAttribute('disabled', '')
  await flushPromises()
  expect(wrapper.get('.yam3x-tree-select__trigger').attributes('aria-expanded')).toBe('false')
  expect(wrapper.get('.yam3x-tree-select__trigger').attributes('disabled')).toBeDefined()
})
it('tree-select.load.recovery: retains loaded labels across popup mounts and replaces stale source caches', async () => {
  const loadChildren = vi.fn().mockResolvedValue([{ key: 'remote-a', label: 'Remote Alpha' }])
  const remote = [{ key: 'remote', label: 'Remote', hasChildren: true }]
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: remote,
      label: 'Remote choice',
      expandedKeys: ['remote'],
      modelValue: 'remote-a',
      loadChildren,
    },
  })
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  expect(loadChildren).toHaveBeenCalledOnce()
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('Remote Alpha')
  wrapper.vm.close(false)
  await flushPromises()
  wrapper.vm.show()
  await flushPromises()
  expect(loadChildren).toHaveBeenCalledOnce()
  await wrapper.setProps({ nodes: [{ key: 'remote', label: 'Replacement', hasChildren: true }] })
  await flushPromises()
  expect(loadChildren).toHaveBeenCalledTimes(2)
})
it('tree-select.search.ancestry: locale-aware matching keeps only matching nodes and their ancestors', () => {
  expect(
    filterTreeSelectNodes(nodes, 'beta', 'en-US')[0]?.children?.map((node) => node.key),
  ).toEqual(['b'])
  expect(() => validateTreeSelectNodes([{ key: '', label: 'Invalid' }])).toThrow('non-empty')
  expect(() =>
    validateTreeSelectNodes([
      { key: 'dup', label: 'Root', children: [{ key: 'dup', label: 'Duplicate' }] },
    ]),
  ).toThrow('unique')
})
it('tree-select.form.native: server rendering preserves accepted unknown keys without rendering closed tree rows', async () => {
  const context: SSRContext = {}
  const html = await renderToString(
    h(
      LocaleProvider,
      { locale: 'zh-CN' },
      {
        default: () =>
          h(TreeSelect, { ...props, multiple: true, modelValue: ['a', 'missing'], name: 'record' }),
      },
    ),
    context,
  )
  expect(html).toContain('Alpha')
  expect(html).toContain('missing')
  expect(context.teleports?.body).not.toContain('role="treeitem"')
  expect(html).toContain('移除Alpha')
})

it('tree-select.virtual.catalog: keeps a large expanded hierarchy bounded and retains offscreen accepted labels', async () => {
  const large = [
    {
      key: 'root',
      label: 'Catalog',
      children: Array.from({ length: 10000 }, (_, index) => ({
        key: `item-${index}`,
        label: `Item ${index}`,
      })),
    },
  ]
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: large,
      label: 'Large tree',
      expandedKeys: ['root'],
      virtual: true,
      modelValue: 'item-9999',
    },
  })
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('Item 9999')
  await wrapper.get('.yam3x-tree-select__trigger').trigger('click')
  await flushPromises()
  const tree = wrapper.getComponent(TreeView)
  expect(tree.findAll('[role="treeitem"]').length).toBeLessThan(30)
  expect(tree.get('[data-tree-key="item-9999"]').attributes('aria-posinset')).toBe('10000')
  expect(wrapper.findAll('select option')).toHaveLength(2)
})

it('tree-select.load.recovery: closing cancels a pending load and ignores its late result', async () => {
  let resolve!: (nodes: readonly TreeSelectNode[]) => void
  const promise = new Promise<readonly TreeSelectNode[]>((done) => {
    resolve = done
  })
  const loadChildren = vi.fn(() => promise)
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: [{ key: 'remote', label: 'Remote', hasChildren: true }],
      label: 'Remote choice',
      expandedKeys: ['remote'],
      modelValue: 'late',
      loadChildren,
    },
  })
  wrapper.vm.show()
  await flushPromises()
  wrapper.vm.close(false)
  await flushPromises()
  resolve([{ key: 'late', label: 'Obsolete label' }])
  await flushPromises()
  expect(wrapper.emitted('load')).toBeUndefined()
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('late')
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).not.toContain('Obsolete label')
})

it('tree-select.search.ancestry: shared-language changes retain an initial query and collapsed search branches', async () => {
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: { ...props, multiple: true, searchable: true, query: 'Beta', locale: 'en-US' },
  })
  wrapper.vm.show()
  await flushPromises()
  const tree = wrapper.getComponent(TreeView)
  expect(tree.get('[data-tree-key="root"]').attributes('aria-expanded')).toBe('true')
  await tree.get('[data-tree-key="root"]').trigger('keydown', { key: 'ArrowLeft' })
  await wrapper.setProps({ locale: 'zh-CN' })
  await flushPromises()
  expect(tree.get('[data-tree-key="root"]').attributes('aria-expanded')).toBe('false')
  expect(document.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('Beta')
  expect(wrapper.emitted('update:query')).toBeUndefined()
})

it('tree-select.load.recovery: rejects loaded keys that collide with records hidden by search', async () => {
  const loadChildren = vi.fn().mockResolvedValue([{ key: 'existing', label: 'Duplicate label' }])
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: [
        { key: 'existing', label: 'Original label' },
        { key: 'remote', label: 'Remote', hasChildren: true },
      ],
      label: 'Records',
      modelValue: 'existing',
      searchable: true,
      query: 'Remote',
      loadChildren,
    },
  })
  wrapper.vm.show()
  await flushPromises()
  await wrapper
    .getComponent(TreeView)
    .get('[data-tree-key="remote"]')
    .trigger('keydown', { key: 'ArrowRight' })
  await flushPromises()
  expect(wrapper.emitted('load')).toBeUndefined()
  expect(wrapper.emitted('loadError')).toHaveLength(1)
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('Original label')
})

it('tree-select.load.recovery: replacing a source node during a read cancels it and accepts only the new source result', async () => {
  let resolveOld!: (nodes: readonly TreeSelectNode[]) => void
  let resolveNew!: (nodes: readonly TreeSelectNode[]) => void
  const oldRead = new Promise<readonly TreeSelectNode[]>((resolve) => {
    resolveOld = resolve
  })
  const newRead = new Promise<readonly TreeSelectNode[]>((resolve) => {
    resolveNew = resolve
  })
  const signals: AbortSignal[] = []
  const loadChildren = vi.fn(
    (node: Readonly<TreeSelectNode>, { signal }: { signal: AbortSignal }) => {
      signals.push(signal)
      return node.label === 'Old source' ? oldRead : newRead
    },
  )
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: [{ key: 'remote', label: 'Old source', hasChildren: true }],
      label: 'Record',
      expandedKeys: ['remote'],
      modelValue: 'fresh',
      loadChildren,
    },
  })
  wrapper.vm.show()
  await flushPromises()
  await wrapper.setProps({ nodes: [{ key: 'remote', label: 'New source', hasChildren: true }] })
  await flushPromises()
  expect(signals[0]?.aborted).toBe(true)
  expect(loadChildren).toHaveBeenCalledTimes(2)
  resolveOld([{ key: 'old', label: 'Obsolete' }])
  await flushPromises()
  expect(wrapper.emitted('load')).toBeUndefined()
  resolveNew([{ key: 'fresh', label: 'Fresh record' }])
  await flushPromises()
  expect(wrapper.emitted('load')).toHaveLength(1)
  expect(wrapper.emitted('loadError')).toBeUndefined()
  expect(wrapper.get('.yam3x-tree-select__trigger').text()).toContain('Fresh record')
})

it('tree-select.load.recovery: explicit replacement children supersede a pending loader without a stale error', async () => {
  let reject!: (error: Error) => void
  const promise = new Promise<readonly TreeSelectNode[]>((_resolve, fail) => {
    reject = fail
  })
  const wrapper = mount(TreeSelect, {
    attachTo: document.body,
    props: {
      nodes: [{ key: 'remote', label: 'Remote', hasChildren: true }],
      label: 'Records',
      expandedKeys: ['remote'],
      loadChildren: () => promise,
    },
  })
  wrapper.vm.show()
  await flushPromises()
  await wrapper.setProps({
    nodes: [
      { key: 'remote', label: 'Remote', children: [{ key: 'local', label: 'Local record' }] },
    ],
  })
  reject(new Error('Obsolete failure'))
  await flushPromises()
  expect(wrapper.emitted('loadError')).toBeUndefined()
  expect(wrapper.getComponent(TreeView).find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.getComponent(TreeView).get('[data-tree-key="local"]').text()).toContain(
    'Local record',
  )
})
