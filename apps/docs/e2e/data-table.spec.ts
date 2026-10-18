import { expect, test, type Locator } from '@playwright/test'
import { selectM3Option } from './test-utils'
const keys = (region: Locator) =>
  region
    .locator('tbody [data-row-key]')
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-row-key')))
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/components/data-table')
})

test('sorts the full local collection before paging, restores source order, and keeps native table semantics', async ({
  page,
}) => {
  // data-table.sort.pipeline
  const local = page.getByTestId('table-local')
  const table = local.getByRole('table', { name: 'Project budgets', exact: true })
  const budget = table.getByRole('columnheader', { name: 'Budget', exact: true })
  await expect(table).toHaveAttribute('aria-rowcount', '8')
  await expect(local.getByRole('grid')).toHaveCount(0)
  await budget.getByRole('button', { name: 'Budget', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(budget).toHaveAttribute('aria-sort', 'ascending')
  expect(await keys(local)).toEqual(['ember', 'beacon', 'cedar'])
  await local.getByRole('button', { name: 'Next page', exact: true }).click()
  expect(await keys(local)).toEqual(['fern', 'atlas', 'grove'])
  await expect(local.locator('tbody tr').first()).toHaveAttribute('aria-rowindex', '5')
  await budget.getByRole('button').click()
  await expect(budget).toHaveAttribute('aria-sort', 'descending')
  expect(await keys(local)).toEqual(['delta', 'grove', 'atlas'])
  await budget.getByRole('button').click()
  await expect(budget).not.toHaveAttribute('aria-sort')
  expect(await keys(local)).toEqual(['atlas', 'beacon', 'cedar'])
  await selectM3Option(
    page,
    local.getByRole('combobox', { name: 'Results per page', exact: true }),
    '5',
  )
  await expect(table.locator('tbody tr')).toHaveCount(5)
  await local.getByRole('button', { name: 'Inspect Atlas', exact: true }).click()
  await expect(local.getByTestId('table-inspected')).toHaveText('Inspecting: Atlas')
  await expect(table.getByRole('rowheader').first()).toContainText('Atlas')
})

test('selects only eligible current-page records and keeps off-page keys through sorting and deselection', async ({
  page,
}) => {
  // data-table.selection.page
  const local = page.getByTestId('table-local')
  const all = local.getByRole('checkbox', {
    name: 'Select all selectable records on this page',
    exact: true,
  })
  await all.click()
  await expect(local.getByTestId('table-selected')).toHaveText('Selected keys: atlas, beacon')
  await expect(local.getByRole('checkbox', { name: 'Select Cedar', exact: true })).toBeDisabled()
  await local.getByRole('checkbox', { name: 'Select Beacon', exact: true }).click()
  await expect(all).toHaveJSProperty('indeterminate', true)
  await local.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(all).not.toBeChecked()
  await all.click()
  await expect(local.getByTestId('table-selected')).toHaveText(
    'Selected keys: atlas, delta, ember, fern',
  )
  await local.getByRole('button', { name: 'Previous page', exact: true }).click()
  await all.click()
  await all.click()
  await expect(local.getByTestId('table-selected')).toHaveText('Selected keys: delta, ember, fern')
  await local.getByRole('button', { name: 'Next page', exact: true }).click()
  const selected = local.locator('tr[data-row-key="delta"]')
  await expect(selected).toHaveClass(/--selected/)
  const colors = await selected.evaluate((element) => ({
    text: getComputedStyle(element).color,
    support: getComputedStyle(element.querySelector('.yam3x-data-table__support')!).color,
    primary: getComputedStyle(element.querySelector('.yam3x-data-table__cell')!).color,
    cellBackground: getComputedStyle(element.querySelector('.yam3x-data-table__cell')!)
      .backgroundColor,
    background: getComputedStyle(element).backgroundColor,
  }))
  expect(colors.text).toBe(colors.support)
  expect(colors.text).toBe(colors.primary)
  expect(colors.cellBackground).toBe('rgba(0, 0, 0, 0)')
  expect(colors.background).not.toBe('rgba(0, 0, 0, 0)')
  await local.getByRole('button', { name: 'Budget', exact: true }).click()
  await expect(local.getByTestId('table-selected')).toHaveText('Selected keys: delta, ember, fern')
})

test('preserves native checkbox state when the application rejects a selection request', async ({
  page,
}) => {
  const local = page.getByTestId('table-local')
  await local.getByRole('checkbox', { name: 'Keep selection unchanged', exact: true }).check()
  const row = local.getByRole('checkbox', { name: 'Select Atlas', exact: true })
  await row.click()
  await expect(row).not.toBeChecked()
  await expect(local.locator('.yam3x-data-table__row--selected')).toHaveCount(0)
  await local
    .getByRole('checkbox', { name: 'Select all selectable records on this page', exact: true })
    .click()
  await expect(row).not.toBeChecked()
  await expect(local.getByTestId('table-selected')).toHaveText('Selected keys: —')
  await local.getByRole('checkbox', { name: 'Keep selection unchanged', exact: true }).uncheck()
  await row.focus()
  await page.keyboard.press('Space')
  await expect(row).toBeChecked()
  await expect(row).toBeFocused()
})

test('retains accepted server rows and sort through failure, and restores focus after retry', async ({
  page,
}) => {
  // data-table.query.accepted; data-table.focus.recovery
  const server = page.getByTestId('table-server')
  const table = server.getByRole('table', { name: 'Accepted server results', exact: true })
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(server.getByText('No records yet', { exact: true })).toHaveCount(0)
  await expect(table.getByRole('columnheader')).toHaveCount(4)
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  expect(await keys(server)).toEqual(['atlas', 'beacon'])
  const sort = server.getByRole('button', { name: 'Budget', exact: true })
  await sort.click()
  await expect(sort).toBeFocused()
  await expect(sort).toHaveAttribute('aria-disabled', 'true')
  await expect(table.locator('th[aria-sort]')).toHaveCount(0)
  expect(await keys(server)).toEqual(['atlas', 'beacon'])
  await server.getByRole('button', { name: 'Fail response', exact: true }).click()
  await expect(server.getByRole('alert')).toContainText(
    'Your previous records are still available.',
  )
  expect(await keys(server)).toEqual(['atlas', 'beacon'])
  await server.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(
    server.getByRole('region', { name: 'Accepted server results', exact: true }),
  ).toBeFocused()
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  await expect(table.getByRole('columnheader', { name: 'Budget', exact: true })).toHaveAttribute(
    'aria-sort',
    'ascending',
  )
  expect(await keys(server)).toEqual(['ember', 'beacon'])
  await server.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(server.locator('.yam3x-pagination__secondary .yam3x-pagination__range')).toHaveText(
    '1–2 of 7 results',
  )
  expect(await keys(server)).toEqual(['ember', 'beacon'])
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  await expect(server.locator('.yam3x-pagination__secondary .yam3x-pagination__range')).toHaveText(
    '3–4 of 7 results',
  )
  expect(await keys(server)).toEqual(['cedar', 'fern'])
  await expect(table.locator('tbody tr').first()).toHaveAttribute('aria-rowindex', '4')
})

test('offers initial-load recovery without claiming an accepted page or cached records', async ({
  page,
}) => {
  // data-table.content.states
  const server = page.getByTestId('table-server')
  await expect(server.getByRole('navigation')).toHaveCount(0)
  await server.getByRole('button', { name: 'Fail response', exact: true }).click()
  await expect(server.getByRole('alert')).toContainText(
    'Records could not be loaded. Retry to request them again.',
  )
  await expect(server.getByRole('alert')).not.toContainText('previous records')
  await expect(server.getByRole('navigation')).toHaveCount(0)
  await server.getByRole('button', { name: 'Retry', exact: true }).click()
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  await expect(server.getByRole('navigation', { name: 'Pagination', exact: true })).toBeVisible()
})

test('distinguishes an empty collection from no filter matches and keeps column context', async ({
  page,
}) => {
  // data-table.content.states
  const local = page.getByTestId('table-local')
  const filter = local.getByRole('searchbox', { name: 'Filter projects', exact: true })
  await filter.fill('nothing matches')
  await expect(local.getByText('No matching records', { exact: true })).toBeVisible()
  await expect(local.getByRole('columnheader', { name: 'Budget', exact: true })).toBeVisible()
  await expect(local.locator('tbody tr')).toHaveCount(0)
  await local.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(filter).toBeFocused()
  await expect(local.locator('tbody tr')).toHaveCount(3)
  await local.getByRole('checkbox', { name: 'Use an empty collection', exact: true }).check()
  await expect(local.getByText('No records yet', { exact: true })).toBeVisible()
  await expect(local.getByText('No matching records', { exact: true })).toHaveCount(0)
})

test('contains horizontal scrolling at 200% text in RTL and keeps all columns, names, and actions accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const local = page.getByTestId('table-local')
  const table = local.locator('.yam3x-data-table')
  await table.evaluate((element) => element.setAttribute('dir', 'rtl'))
  const region = table.getByRole('region', { name: 'Project budgets', exact: true })
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
  expect(await table.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await expect(region.getByRole('columnheader')).toHaveCount(5)
  await expect(local.getByText('Project budgets', { exact: true })).toBeVisible()
  const typography = await local
    .locator('.yam3x-data-table__cell')
    .first()
    .evaluate((element) => {
      const probe = element.ownerDocument.createElement('span')
      probe.style.fontSize = 'var(--md-sys-typescale-body-medium-font-size)'
      element.append(probe)
      const expected = getComputedStyle(probe).fontSize
      probe.remove()
      const style = getComputedStyle(element)
      return {
        expected,
        actual: style.fontSize,
        startBorder: style.borderInlineStartWidth,
        endBorder: style.borderInlineEndWidth,
      }
    })
  expect(typography.actual).toBe(typography.expected)
  expect(typography.startBorder).toBe('0px')
  expect(typography.endBorder).toBe('0px')
  await table.screenshot({ path: '/tmp/yam3x-data-table-mobile.png' })
  await region.focus()
  await page.keyboard.press('ArrowLeft')
  await expect
    .poll(() => region.evaluate((element) => Math.abs(element.scrollLeft)))
    .toBeGreaterThan(0)
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await local.getByRole('button', { name: 'Next page', exact: true }).click()
  await local.getByRole('button', { name: 'Next page', exact: true }).click()
  const name = local.getByRole('rowheader')
  await expect(name).toContainText('Grove with a long name that stays available without truncation')
  await local
    .getByRole('button', {
      name: 'Inspect Grove with a long name that stays available without truncation',
      exact: true,
    })
    .click()
  await expect(local.getByTestId('table-inspected')).toContainText('Grove with a long name')
  await local.getByRole('searchbox', { name: 'Filter projects', exact: true }).fill('not found')
  await expect(local.getByRole('button', { name: 'Clear filters', exact: true })).toBeVisible()
  expect(await table.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('localizes table and selection feedback on the Chinese page', async ({ page }) => {
  await page.goto('/zh/components/data-table')
  const local = page.getByTestId('table-local')
  await local.getByRole('checkbox', { name: '选择当前页所有可选记录', exact: true }).click()
  await expect(local.locator('.yam3x-data-table > [role="status"]')).toHaveText(
    '已选择 2 条记录（包括其他页）。',
  )
  await local.getByRole('searchbox', { name: '筛选项目', exact: true }).fill('不存在')
  await expect(local.getByText('没有匹配记录', { exact: true })).toBeVisible()
})

test('data-table.filter.draft: edits multiple choices, discards dismissal, and applies before local paging', async ({
  page,
}) => {
  const local = page.getByTestId('table-local')
  const trigger = local.getByRole('button', { name: 'Filter Status', exact: true })
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Filter Status', exact: true })
  await menu.getByRole('menuitemcheckbox', { name: 'Archived', exact: true }).click()
  await expect(menu).toBeVisible()
  expect(await keys(local)).toEqual(['atlas', 'beacon', 'cedar'])
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(
    menu.getByRole('menuitemcheckbox', { name: 'Archived', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await menu.getByRole('menuitemcheckbox', { name: 'Archived', exact: true }).click()
  await menu.getByRole('menuitem', { name: 'Apply filter', exact: true }).click()
  const active = local.getByRole('button', { name: 'Filter Status, 1 selected', exact: true })
  await expect(active).toBeFocused()
  expect(await keys(local)).toEqual(['cedar'])
  await expect(local.getByRole('table')).toHaveAttribute('aria-rowcount', '2')
  await active.click()
  await menu.getByRole('menuitemcheckbox', { name: 'Active', exact: true }).click()
  await menu.getByRole('menuitem', { name: 'Apply filter', exact: true }).click()
  await expect(
    local.getByRole('button', { name: 'Filter Status, 2 selected', exact: true }),
  ).toBeFocused()
  expect(await keys(local)).toEqual(['atlas', 'beacon', 'cedar'])
  await local.getByRole('button', { name: 'Filter Status, 2 selected', exact: true }).click()
  await menu.getByRole('menuitem', { name: 'Clear filter', exact: true }).click()
  await expect(trigger).toBeFocused()
  await expect(local.getByRole('table')).toHaveAttribute('aria-rowcount', '8')
})

test('data-table.filter.accepted: failed server filtering retains records and markers until accepted', async ({
  page,
}) => {
  const server = page.getByTestId('table-server')
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  const trigger = server.getByRole('button', { name: 'Filter Status', exact: true })
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Filter Status', exact: true })
  await menu.getByRole('menuitemcheckbox', { name: 'Archived', exact: true }).click()
  await menu.getByRole('menuitem', { name: 'Apply filter', exact: true }).click()
  await expect(trigger).toHaveAttribute('aria-disabled', 'true')
  expect(await keys(server)).toEqual(['atlas', 'beacon'])
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
  await server.getByRole('button', { name: 'Fail response', exact: true }).click()
  await expect(trigger).not.toHaveAttribute('data-filter-active')
  expect(await keys(server)).toEqual(['atlas', 'beacon'])
  await server.getByRole('button', { name: 'Retry', exact: true }).click()
  await server.getByRole('button', { name: 'Accept response', exact: true }).click()
  await expect(
    server.getByRole('button', { name: 'Filter Status, 1 selected', exact: true }),
  ).toBeVisible()
  expect(await keys(server)).toEqual(['cedar'])
})

test('data-table.fixed.context: retains one header and measured fixed groups while scrolling in LTR and RTL', async ({
  page,
}) => {
  const group = page.getByTestId('table-pinned')
  const region = group.getByRole('region', { name: 'Scrollable projects', exact: true })
  await region.scrollIntoViewIfNeeded()
  await expect(region.locator('thead .yam3x-data-table__fixed')).toHaveCount(4)
  await expect(group.getByRole('table')).toHaveCount(1)
  await expect(group.getByRole('checkbox', { name: 'Select Delta', exact: true })).toHaveCount(1)
  await group.getByRole('checkbox', { name: 'Select Delta', exact: true }).check()
  await expect(group.locator('[data-row-key="delta"]')).toHaveClass(/--selected/)
  for (const rtl of [false, true]) {
    if (rtl)
      await group.getByRole('checkbox', { name: 'Use RTL for fixed columns', exact: true }).check()
    await region.evaluate((element, isRtl) => {
      element.scrollTop = 150
      element.scrollLeft = isRtl ? -220 : 220
    }, rtl)
    await expect
      .poll(() => region.evaluate((element) => Math.abs(element.scrollLeft)))
      .toBeGreaterThan(100)
    const geometry = await region.evaluate((element) => {
      const box = element.getBoundingClientRect()
      const headers = Array.from(element.querySelectorAll('thead th'), (cell) => {
        const rect = cell.getBoundingClientRect()
        return { left: rect.left, right: rect.right, top: rect.top }
      })
      const row = element.querySelector('[data-row-key="delta"]')!
      const fixed = Array.from(row.querySelectorAll('.yam3x-data-table__fixed'), (cell) => {
        const rect = cell.getBoundingClientRect()
        return {
          left: rect.left,
          right: rect.right,
          background: getComputedStyle(cell).backgroundColor,
        }
      })
      return {
        left: box.left + element.clientLeft,
        right: box.left + element.clientLeft + element.clientWidth,
        top: box.top + element.clientTop,
        headers,
        fixed,
        background: getComputedStyle(row).backgroundColor,
      }
    })
    for (const cell of geometry.headers) expect(Math.abs(cell.top - geometry.top)).toBeLessThan(2)
    const headers = geometry.headers
    if (!rtl) {
      expect(Math.abs(headers[0]!.left - geometry.left)).toBeLessThan(2)
      expect(Math.abs(headers[1]!.left - headers[0]!.right)).toBeLessThan(2)
      expect(Math.abs(headers[2]!.left - headers[1]!.right)).toBeLessThan(2)
      expect(Math.abs(headers[5]!.right - geometry.right)).toBeLessThan(2)
    } else {
      expect(Math.abs(headers[0]!.right - geometry.right)).toBeLessThan(2)
      expect(Math.abs(headers[1]!.right - headers[0]!.left)).toBeLessThan(2)
      expect(Math.abs(headers[2]!.right - headers[1]!.left)).toBeLessThan(2)
      expect(Math.abs(headers[5]!.left - geometry.left)).toBeLessThan(2)
    }
    for (const cell of geometry.fixed) expect(cell.background).toBe(geometry.background)
  }
  const filter = group.getByRole('button', { name: 'Filter Status', exact: true })
  await filter.focus()
  await expect
    .poll(() =>
      filter.evaluate((button) => {
        const rect = button.getBoundingClientRect()
        return button.contains(
          button.ownerDocument.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        )
      }),
    )
    .toBe(true)
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu', { name: 'Filter Status', exact: true })
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Archived', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(filter).toBeFocused()
  await region.screenshot({ path: '/tmp/yam3x-data-table-fixed-rtl.png' })
})

test('data-table.fixed.adaptation: releases oversized fixed groups and restores measured offsets after resizing', async ({
  page,
}) => {
  const group = page.getByTestId('table-pinned')
  const region = group.getByRole('region', { name: 'Scrollable projects', exact: true })
  await expect(region.locator('thead .yam3x-data-table__fixed')).toHaveCount(4)
  await page.setViewportSize({ width: 375, height: 900 })
  await expect(region.locator('thead .yam3x-data-table__fixed')).toHaveCount(0)
  await region.evaluate((element) => {
    element.scrollLeft = 300
    element.scrollTop = 140
  })
  expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  await expect(region.locator('thead th').first()).toHaveCSS('position', 'sticky')
  await expect(region.locator('thead th')).toHaveCount(6)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(region.locator('thead .yam3x-data-table__fixed')).toHaveCount(4)
  await region.evaluate((element) => {
    element.querySelector<HTMLElement>('thead th:nth-child(2)')!.style.inlineSize = '14rem'
  })
  await expect
    .poll(() =>
      region.evaluate((element) => {
        const cells = element.querySelectorAll('thead th')
        const previous = cells[1]!.getBoundingClientRect()
        const current = cells[2]!.getBoundingClientRect()
        return Math.abs(current.left - previous.right)
      }),
    )
    .toBeLessThan(2)
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(group.getByRole('checkbox', { name: 'Select Delta', exact: true })).toBeEnabled()
  await region.screenshot({ path: '/tmp/yam3x-data-table-fixed-forced-colors.png' })
})
