import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import DataTable from '../../../../registry/components/data-table/data-table.vue'
import {
  nextTableSort,
  selectTablePage,
  sortTableRows,
} from '../../../../registry/components/data-table/data-table.utils'
import type {
  DataTableColumn,
  DataTableKey,
} from '../../../../registry/components/data-table/data-table.types'

enableAutoUnmount(afterEach)
interface Row {
  id: string
  name: string
  amount: number | null
  locked?: boolean
}
const rows: Row[] = [
  { id: 'a', name: 'Project 10', amount: 10 },
  { id: 'b', name: 'Project 2', amount: 2 },
  { id: 'c', name: 'Project 1', amount: 2, locked: true },
  { id: 'd', name: 'Last', amount: null },
]
const columns: Array<DataTableColumn<Row>> = [
  { id: 'name', label: 'Project', rowHeader: true, value: (row) => row.name, sortable: true },
  { id: 'amount', label: 'Amount', value: (row) => row.amount, sortable: true, numeric: true },
]
const key = (row: Row) => row.id
const ids = (list: readonly Row[]) => list.map(key)
const base = { caption: 'Projects', rows, columns, rowKey: key }

describe('Data table sorting and page selection', () => {
  it('compares dates and booleans and leaves invalid or missing values last', () => {
    const dated = [
      { id: 'later', value: new Date('2026-10-17') },
      { id: 'invalid', value: new Date('invalid') },
      { id: 'earlier', value: new Date('2025-01-01') },
    ]
    const dateColumn: DataTableColumn<(typeof dated)[number]> = {
      id: 'value',
      label: 'Date',
      value: (row) => row.value,
      sortable: true,
    }
    expect(
      sortTableRows(dated, [dateColumn], { column: 'value', direction: 'ascending' }, 'en').map(
        (row) => row.id,
      ),
    ).toEqual(['earlier', 'later', 'invalid'])
    const flags = [
      { id: 'true', value: true },
      { id: 'missing', value: undefined },
      { id: 'false', value: false },
    ]
    const flagColumn: DataTableColumn<(typeof flags)[number]> = {
      id: 'value',
      label: 'Flag',
      value: (row) => row.value,
      sortable: true,
    }
    expect(
      sortTableRows(flags, [flagColumn], { column: 'value', direction: 'ascending' }, 'en').map(
        (row) => row.id,
      ),
    ).toEqual(['false', 'true', 'missing'])
  })
  it('uses stable numeric and natural text ordering without mutating the supplied collection', () => {
    // data-table.sort.pipeline
    expect(
      ids(sortTableRows(rows, columns, { column: 'amount', direction: 'ascending' }, 'en')),
    ).toEqual(['b', 'c', 'a', 'd'])
    expect(
      ids(sortTableRows(rows, columns, { column: 'amount', direction: 'descending' }, 'en')),
    ).toEqual(['a', 'b', 'c', 'd'])
    expect(
      ids(sortTableRows(rows, columns, { column: 'name', direction: 'ascending' }, 'en')),
    ).toEqual(['d', 'c', 'b', 'a'])
    expect(sortTableRows(rows, columns, null, 'en')).toBe(rows)
    expect(ids(rows)).toEqual(['a', 'b', 'c', 'd'])
    const extremes = [
      { id: 'large', name: 'Large', amount: 1e308 },
      { id: 'small', name: 'Small', amount: -1e308 },
    ]
    expect(
      ids(sortTableRows(extremes, columns, { column: 'amount', direction: 'ascending' }, 'en')),
    ).toEqual(['small', 'large'])
    expect(nextTableSort(null, 'amount')).toEqual({ column: 'amount', direction: 'ascending' })
    expect(nextTableSort({ column: 'amount', direction: 'descending' }, 'amount')).toBeNull()
  })

  it('allows a domain comparator and preserves supplied order for ties or non-sortable columns', () => {
    const custom = [{ ...columns[0]!, compare: (a: Row, b: Row) => b.id.localeCompare(a.id) }]
    expect(
      ids(sortTableRows(rows, custom, { column: 'name', direction: 'ascending' }, 'en')),
    ).toEqual(['d', 'c', 'b', 'a'])
    expect(
      sortTableRows(
        rows,
        [{ ...columns[0]!, sortable: false }],
        { column: 'name', direction: 'ascending' },
        'en',
      ),
    ).toBe(rows)
  })

  it('sorts all client records before taking the requested page', async () => {
    const wrapper = mount(DataTable<Row>, {
      props: {
        ...base,
        paginated: true,
        pageSize: 2,
        page: 1,
        sort: { column: 'amount', direction: 'ascending' },
      },
    })
    expect(
      wrapper.findAll('tbody [data-row-key]').map((row) => row.attributes('data-row-key')),
    ).toEqual(['b', 'c'])
    await wrapper.setProps({ page: 2 })
    expect(
      wrapper.findAll('tbody [data-row-key]').map((row) => row.attributes('data-row-key')),
    ).toEqual(['a', 'd'])
    expect(wrapper.get('table').attributes('aria-rowcount')).toBe('5')
    expect(wrapper.get('tbody tr').attributes('aria-rowindex')).toBe('4')
    expect(wrapper.find('[role="grid"]').exists()).toBe(false)
    expect(wrapper.find('tbody [tabindex]').exists()).toBe(false)
  })

  it('keeps server rows and accepted query markers until the application accepts a request', async () => {
    // data-table.query.accepted
    const wrapper = mount(DataTable<Row>, {
      props: { ...base, mode: 'server', paginated: true, page: 2, pageSize: 2, total: 8 },
    })
    await wrapper.get('thead button').trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      sort: { column: 'name', direction: 'ascending' },
      page: 1,
      pageSize: 2,
    })
    expect(wrapper.find('th[aria-sort]').exists()).toBe(false)
    expect(
      wrapper.findAll('tbody [data-row-key]').map((row) => row.attributes('data-row-key')),
    ).toEqual(ids(rows))
    await wrapper.setProps({ sort: { column: 'amount', direction: 'descending' }, loading: true })
    expect(wrapper.get('th[aria-sort]').attributes('aria-sort')).toBe('descending')
    await wrapper.get('thead button').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(
      wrapper.findAll('tbody [data-row-key]').map((row) => row.attributes('data-row-key')),
    ).toEqual(ids(rows))
  })

  it('changes only current-page selectable keys and retains off-page and locked selections', async () => {
    // data-table.selection.page
    expect(selectTablePage(['other', 0, '0'], ['a', 'b'], true)).toEqual([
      'other',
      0,
      '0',
      'a',
      'b',
    ])
    expect(selectTablePage(['other', 'a', 'locked'], ['a', 'b'], false)).toEqual([
      'other',
      'locked',
    ])
    const wrapper = mount(DataTable<Row>, {
      props: {
        ...base,
        selectable: true,
        paginated: true,
        pageSize: 3,
        selectedKeys: ['other', 'c'],
        isRowSelectable: (row: Row) => !row.locked,
      },
    })
    await wrapper.get('thead input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0]).toEqual(['other', 'c', 'a', 'b'])
    expect(wrapper.emitted('selectionChange')?.[0]?.[0]).toMatchObject({
      source: 'page',
      changedKeys: ['a', 'b'],
    })
    await wrapper.setProps({ selectedKeys: ['other', 'c', 'a'] })
    expect(wrapper.get<HTMLInputElement>('thead input').element.indeterminate).toBe(true)
    expect(wrapper.get<HTMLInputElement>('tbody tr[data-row-key="c"] input').element.disabled).toBe(
      true,
    )
  })

  it('preserves accepted selection through native form reset while allowing the application to reset it', async () => {
    const selected = ref<DataTableKey[]>(['a'])
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('form', [
            h(DataTable<Row>, {
              ...base,
              selectable: true,
              selectedKeys: selected.value,
              'onUpdate:selectedKeys': (keys) => {
                selected.value = keys
              },
            }),
          ]),
      }),
      { attachTo: document.body },
    )
    selected.value = ['b']
    await flushPromises()
    wrapper.get<HTMLFormElement>('form').element.reset()
    await flushPromises()
    expect(selected.value).toEqual(['b'])
    expect(wrapper.get<HTMLInputElement>('tbody tr[data-row-key="b"] input').element.checked).toBe(
      true,
    )
    selected.value = []
    await flushPromises()
    expect(wrapper.get<HTMLInputElement>('tbody tr[data-row-key="b"] input').element.checked).toBe(
      false,
    )
  })

  it('distinguishes initial loading, refresh, failure, an empty collection, and no filter matches', async () => {
    // data-table.content.states
    const wrapper = mount(DataTable<Row>, { props: { ...base, rows: [], loading: true } })
    expect(wrapper.text()).toContain('Loading records…')
    expect(wrapper.text()).not.toContain('No records yet')
    await wrapper.setProps({ loading: false, error: 'Could not retrieve projects.' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Could not retrieve projects.')
    expect(wrapper.find('.yam3x-empty-state').exists()).toBe(false)
    expect(wrapper.findAll('thead th')).toHaveLength(2)
    await wrapper.setProps({ error: '' })
    expect(wrapper.text()).toContain('No records yet')
    await wrapper.setProps({ emptyKind: 'filtered' })
    expect(wrapper.text()).toContain('No matching records')
    await wrapper.setProps({ rows, loading: true })
    expect(wrapper.text()).toContain('Refreshing; previous records remain visible…')
    expect(wrapper.findAll('tbody [data-row-key]')).toHaveLength(4)
  })

  it('offers recovery when a controlled client page is outside the collection', async () => {
    const retry = vi.fn()
    const wrapper = mount(DataTable<Row>, {
      props: { ...base, paginated: true, page: 99, pageSize: 2, onRetry: retry },
    })
    expect(wrapper.text()).toContain('This page is unavailable.')
    await wrapper.get('.yam3x-data-table__state button').trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([1])
    expect(retry).not.toHaveBeenCalled()
  })
})
