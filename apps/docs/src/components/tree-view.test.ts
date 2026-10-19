import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import TreeView from '../../../../registry/components/tree-view/tree-view.vue'
import {
  treeRecords,
  treeCheckState,
  updateTreeChecks,
  validateTreeChildren,
} from '../../../../registry/components/tree-view/tree-view.utils'
import type { TreeViewNode } from '../../../../registry/components/tree-view/tree-view.types'
enableAutoUnmount(afterEach)
const nodes: TreeViewNode[] = [
  {
    key: 0,
    label: 'Root',
    children: [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
      { key: 'locked', label: 'Locked', disabled: true },
    ],
  },
  { key: 'other', label: 'Other', children: [{ key: 'outside', label: 'Outside' }] },
]
const children = (node: TreeViewNode) => node.children
function deferred() {
  let resolve!: (nodes: readonly TreeViewNode[]) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<readonly TreeViewNode[]>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe('Tree view', () => {
  it('checks a deep complete subtree without repeatedly traversing its descendants', () => {
    const depth = 400
    let root: TreeViewNode = { key: depth, label: 'Leaf' }
    for (let key = depth - 1; key >= 0; key--) root = { key, label: String(key), children: [root] }
    let reads = 0
    const children = (node: TreeViewNode) => {
      reads++
      return node.children
    }
    const records = treeRecords([root], children)
    reads = 0
    const result = updateTreeChecks(root, true, ['unknown'], records, children, true)
    expect(result).toHaveLength(depth + 2)
    expect(result).toContain('unknown')
    expect(reads).toBeLessThan(depth * 20)
    const cleared = updateTreeChecks(root, false, result, records, children, true)
    expect(cleared).toEqual(['unknown'])
  })
  it('derives mixed checks for complete branches and changes only the target subtree and its ancestors', () => {
    // tree-view.check.known
    const records = treeRecords(nodes, children)
    const first = updateTreeChecks(
      nodes[0]!,
      true,
      ['outside-key', 'locked', 'other'],
      records,
      children,
      true,
    )
    expect(new Set(first)).toEqual(new Set(['outside-key', 'locked', 'other', 0, 'a', 'b']))
    expect(treeCheckState(nodes[0]!, new Set(first), children, true)).toBe('checked')
    const partial = updateTreeChecks(nodes[0]!.children![0]!, false, first, records, children, true)
    expect(partial).toEqual(['outside-key', 'locked', 'other', 'b'])
    expect(treeCheckState(nodes[0]!, new Set(partial), children, true)).toBe('indeterminate')
    const cleared = updateTreeChecks(nodes[0]!, false, partial, records, children, true)
    expect(cleared).toEqual(['outside-key', 'locked', 'other'])
    const unknown: TreeViewNode = { key: 'unknown', label: 'Unknown', hasChildren: true }
    expect(
      updateTreeChecks(unknown, true, [], treeRecords([unknown], children), children, true),
    ).toEqual(['unknown'])
  })

  it('rejects loader nodes that would duplicate keys, introduce cycles, or invalidate the node shape', () => {
    expect(() =>
      validateTreeChildren([{ key: 'root', label: 'Duplicate' }], new Set(['root'])),
    ).toThrow('unique')
    expect(() => validateTreeChildren([{ key: 'bad' }], new Set())).toThrow('invalid')
    const cyclic: TreeViewNode = { key: 'cycle', label: 'Cycle' }
    cyclic.children = [cyclic]
    expect(() => validateTreeChildren([cyclic], new Set())).toThrow('unique')
  })
  it('treats non-checkable grouping nodes as structure and preserves independent parent-only targets', () => {
    const root: TreeViewNode = {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'group',
          label: 'Group',
          checkable: false,
          children: [{ key: 'decorative', label: 'Decorative', checkable: false }],
        },
      ],
    }
    const records = treeRecords([root], children)
    const checked = updateTreeChecks(root, true, ['group'], records, children, true)
    expect(checked).toEqual(['group', 'root'])
    expect(treeCheckState(root, new Set(checked), children, true)).toBe('checked')
    expect(treeCheckState(root, new Set(['group']), children, true)).toBe('unchecked')
    root.children![0]!.children = [{ key: 'leaf', label: 'Leaf' }]
    expect(treeCheckState(root, new Set(['group']), children, true)).toBe('unchecked')
    expect(treeCheckState(root, new Set(['leaf']), children, true)).toBe('checked')
  })

  it('keeps focus separate from selection and returns focus to a collapsed ancestor', async () => {
    // tree-view.focus.navigation
    const wrapper = mount(TreeView, {
      attachTo: document.body,
      props: { nodes, label: 'Files', expandedKeys: [0], selectedKeys: ['a'] },
    })
    await flushPromises()
    expect(wrapper.findAll('[role="tree"] [tabindex="0"]')).toHaveLength(1)
    expect(wrapper.get('[data-tree-key="a"]').attributes('tabindex')).toBe('0')
    wrapper.vm.focus('a')
    await wrapper.get('[data-tree-key="a"]').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.get('[data-tree-key="b"]').element)
    expect(wrapper.get('[data-tree-key="a"]').attributes('aria-selected')).toBe('true')
    await wrapper.setProps({ expandedKeys: [] })
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('[data-tree-key="0"]').element)
    expect(wrapper.vm.focus('a')).toBe(false)
  })

  it('does not move unrelated focus when external data removes the current node', async () => {
    const wrapper = mount(TreeView, {
      attachTo: document.body,
      props: { nodes, label: 'Files', expandedKeys: [0] },
    })
    await flushPromises()
    const outside = document.createElement('button')
    document.body.append(outside)
    wrapper.vm.focus('a')
    outside.focus()
    await wrapper.setProps({ nodes: [] })
    await flushPromises()
    expect(document.activeElement).toBe(outside)
    expect(wrapper.get('[role="tree"]').attributes('tabindex')).toBe('0')
    expect(wrapper.text()).toContain('No items yet')
    outside.remove()
  })

  it('uses independent checks for loader-backed trees even when cascade was requested', async () => {
    const load = vi.fn(async () => [{ key: 'new', label: 'New child' }])
    const wrapper = mount(TreeView, {
      attachTo: document.body,
      props: {
        nodes: [{ key: 'lazy', label: 'Lazy', hasChildren: true }],
        label: 'Files',
        checkMode: 'cascade',
        loadChildren: load,
      },
    })
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).toEqual(['lazy'])
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(wrapper.get('[data-tree-key="new"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.get('[data-tree-key="lazy"]').attributes('aria-checked')).toBe('true')
  })

  it('starts loading only after an expansion request is accepted', async () => {
    const load = vi.fn(async () => [])
    const wrapper = mount(TreeView, {
      props: {
        nodes: [{ key: 'lazy', label: 'Lazy', hasChildren: true }],
        label: 'Files',
        loadChildren: load,
        expandedKeys: [],
        'onUpdate:expandedKeys': () => {},
      },
    })
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(load).not.toHaveBeenCalled()
    expect(wrapper.get('[role="treeitem"]').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ expandedKeys: ['lazy'] })
    await flushPromises()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('contains a branch load failure and permits retry without clearing other selections', async () => {
    // tree-view.load.recovery
    const error = new Error('Private server detail')
    const load = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce([{ key: 'loaded', label: 'Loaded' }])
    const wrapper = mount(TreeView, {
      attachTo: document.body,
      props: {
        nodes: [
          { key: 'lazy', label: 'Lazy', hasChildren: true },
          { key: 'saved', label: 'Saved' },
        ],
        label: 'Files',
        selectedKeys: ['saved'],
        expandedKeys: ['lazy'],
        loadChildren: load,
      },
    })
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Children could not be loaded.')
    expect(wrapper.text()).not.toContain('Private server detail')
    expect(wrapper.emitted('loadError')?.[0]?.[0]).toMatchObject({ error })
    await wrapper.get('[data-tree-key="lazy"]').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('[data-tree-key="saved"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[data-tree-key="loaded"]').exists()).toBe(true)
  })

  it('aborts a collapsed read and ignores its late success after a replacement read finishes', async () => {
    const first = deferred()
    const second = deferred()
    const signals: AbortSignal[] = []
    const load = vi.fn((_node, { signal }) => {
      signals.push(signal)
      return signals.length === 1 ? first.promise : second.promise
    })
    const wrapper = mount(TreeView, {
      props: {
        nodes: [{ key: 'lazy', label: 'Lazy', hasChildren: true }],
        label: 'Files',
        expandedKeys: ['lazy'],
        loadChildren: load,
      },
    })
    await flushPromises()
    await wrapper.setProps({ expandedKeys: [] })
    expect(signals[0]?.aborted).toBe(true)
    await wrapper.setProps({ expandedKeys: ['lazy'] })
    await flushPromises()
    second.resolve([{ key: 'current', label: 'Current' }])
    await flushPromises()
    first.resolve([{ key: 'old', label: 'Old' }])
    await flushPromises()
    expect(wrapper.find('[data-tree-key="current"]').exists()).toBe(true)
    expect(wrapper.find('[data-tree-key="old"]').exists()).toBe(false)
  })

  it('preserves cached children across metadata replacement with stable keys and reloads explicitly', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce([{ key: 'old', label: 'Old' }])
      .mockResolvedValueOnce([])
    const wrapper = mount(TreeView, {
      props: {
        nodes: [{ key: 'lazy', label: 'Lazy', hasChildren: true }],
        label: 'Files',
        expandedKeys: ['lazy'],
        loadChildren: load,
      },
    })
    await flushPromises()
    await wrapper.setProps({ nodes: [{ key: 'lazy', label: 'Renamed', hasChildren: true }] })
    await flushPromises()
    expect(load).toHaveBeenCalledTimes(1)
    wrapper.vm.reload('lazy')
    await flushPromises()
    expect(wrapper.find('[data-tree-key="old"]').exists()).toBe(false)
    expect(wrapper.get('[data-tree-key="lazy"]').attributes('aria-expanded')).toBeUndefined()
    expect(wrapper.text()).toContain('This node has no children.')
  })

  it('aborts owned reads on unmount and does not publish late load events', async () => {
    const request = deferred()
    let signal: AbortSignal | undefined
    const wrapper = mount(TreeView, {
      props: {
        nodes: [{ key: 'lazy', label: 'Lazy', hasChildren: true }],
        label: 'Files',
        expandedKeys: ['lazy'],
        loadChildren: (_node, context) => {
          signal = context.signal
          return request.promise
        },
      },
    })
    await flushPromises()
    wrapper.unmount()
    expect(signal?.aborted).toBe(true)
    request.resolve([{ key: 'late', label: 'Late' }])
    await flushPromises()
    expect(wrapper.emitted('load')).toBeUndefined()
    await nextTick()
  })
})

it('tree-view.load.recovery: cancels an obsolete read even when explicit replacement children make reload inapplicable', async () => {
  const nodes = ref<TreeViewNode[]>([{ key: 'remote', label: 'Remote', hasChildren: true }])
  const pending = deferred()
  let signal!: AbortSignal
  const wrapper = mount(TreeView, {
    props: {
      nodes: nodes.value,
      label: 'Records',
      expandedKeys: ['remote'],
      loadChildren: (_node, context) => {
        signal = context.signal
        return pending.promise
      },
    },
  })
  await flushPromises()
  nodes.value[0]!.children = [{ key: 'local', label: 'Local' }]
  expect(wrapper.vm.reload('remote')).toBe(false)
  expect(signal.aborted).toBe(true)
  pending.resolve([{ key: 'old', label: 'Obsolete' }])
  await flushPromises()
  expect(wrapper.emitted('load')).toBeUndefined()
  expect(wrapper.emitted('loadError')).toBeUndefined()
  expect(wrapper.get('[data-tree-key="local"]').text()).toContain('Local')
})

it('tree-view.load.recovery: explicit child data replaces stale loader failure feedback', async () => {
  const wrapper = mount(TreeView, {
    props: {
      nodes: [{ key: 'remote', label: 'Remote', hasChildren: true }],
      label: 'Records',
      expandedKeys: ['remote'],
      loadChildren: async () => {
        throw new Error('Offline')
      },
    },
  })
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  await wrapper.setProps({
    nodes: [{ key: 'remote', label: 'Remote', children: [{ key: 'local', label: 'Local' }] }],
  })
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('[data-tree-key="local"]').text()).toContain('Local')
})
