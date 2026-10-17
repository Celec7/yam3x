import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/components/pagination')
})

test('navigates local records and preserves the first result when page size changes', async ({
  page,
}) => {
  const local = page.getByRole('region', { name: 'Local results', exact: true })
  const nav = local.getByRole('navigation', { name: 'Pagination', exact: true })
  const current = nav.getByRole('button', { name: 'Page 5', exact: true })
  await expect(current).toHaveAttribute('aria-current', 'page')
  await expect(current).not.toHaveAttribute('aria-pressed')
  await nav.getByRole('button', { name: 'Page 6', exact: true }).click()
  await expect(nav.getByRole('button', { name: 'Page 6', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.getByTestId('pagination-records')).toContainText('51, 52')
  await selectM3Option(
    page,
    local.getByRole('combobox', { name: 'Results per page', exact: true }),
    '25',
  )
  await expect(nav.getByRole('button', { name: 'Page 3', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.getByTestId('pagination-records')).toContainText('51, 52')
  await nav.getByRole('button', { name: 'Page 1', exact: true }).click()
  await expect(nav.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled()
  await nav.getByRole('button', { name: 'Page 8', exact: true }).click()
  await expect(nav.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
})

test('keeps the accepted marker through a failed request and supports retry', async ({ page }) => {
  // pagination.state.accepted
  const region = page.getByRole('region', { name: 'Accepted results', exact: true })
  const nav = region.getByRole('navigation', { name: 'Server results pages', exact: true })
  await nav.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.getByTestId('pagination-accepted')).toHaveText('4')
  await expect(nav.getByRole('button', { name: 'Page 4', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(nav.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
  await expect(region.getByRole('status').filter({ hasText: 'Loading page…' })).toHaveText(
    'Loading page…',
  )
  await page.getByRole('button', { name: 'Fail page request', exact: true }).click()
  await expect(page.getByTestId('pagination-accepted')).toHaveText('4')
  await expect(region.locator('.yam3x-inline-message[role="status"]')).toContainText(
    'previous results are still available',
  )
  await nav.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.getByRole('button', { name: 'Accept page request', exact: true }).click()
  await expect(page.getByTestId('pagination-accepted')).toHaveText('5')
})

test('adapts to its container, preserves focused identity, and keeps targets at enlarged text size', async ({
  page,
}) => {
  // pagination.layout.adaptive
  const region = page.getByRole('region', { name: 'Local results', exact: true })
  const paginator = region.locator('.yam3x-pagination')
  const current = paginator.getByRole('button', { name: 'Page 5', exact: true })
  await current.focus()
  await paginator.evaluate((element: HTMLElement) => {
    element.style.width = '290px'
  })
  await expect(paginator).toHaveClass(/--compact/)
  const summary = paginator.locator('.yam3x-pagination__current')
  await expect(summary).toHaveText('Page 5 of 20')
  await expect(summary).toBeFocused()
  await expect(paginator.getByRole('button', { name: 'Page 5', exact: true })).toHaveCount(0)
  await paginator.evaluate((element: HTMLElement) => {
    element.style.width = ''
  })
  await expect(current).toBeFocused()
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  await region.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await expect(paginator).toHaveClass(/--compact/)
  const boxes = await paginator
    .locator('.yam3x-pagination__navigation > .yam3x-pagination__target')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect()
        return { width: box.width, height: box.height }
      }),
    )
  expect(boxes).toHaveLength(2)
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(48)
    expect(box.height).toBeGreaterThanOrEqual(48)
  }
  const overflow = await paginator.evaluate((element) => element.scrollWidth > element.clientWidth)
  expect(overflow).toBe(false)
  await expect(paginator.locator('.yam3x-pagination__range')).toHaveCSS('direction', 'ltr')
  const labelGeometry = await paginator.locator('.yam3x-pagination__size').evaluate((element) => {
    const field = element.getBoundingClientRect()
    const label = element.querySelector('.yam3x-form-field__label')!.getBoundingClientRect()
    return { inset: field.right - label.right, left: label.left, fieldLeft: field.left }
  })
  expect(Math.abs(labelGeometry.inset - 16)).toBeLessThanOrEqual(2)
  expect(labelGeometry.left).toBeGreaterThanOrEqual(labelGeometry.fieldLeft)
  await paginator.screenshot({ path: '/tmp/yam3x-pagination-mobile.png' })
})

test('uses paired selected roles and localizes navigation while honoring reduced motion', async ({
  page,
}) => {
  const current = page
    .getByRole('region', { name: 'Local results', exact: true })
    .getByRole('button', { name: 'Page 5', exact: true })
  const colors = await current.evaluate((element) => {
    const sample = document.createElement('span')
    sample.style.background = 'var(--md-sys-color-secondary-container)'
    sample.style.color = 'var(--md-sys-color-on-secondary-container)'
    element.append(sample)
    const result = {
      actual: getComputedStyle(element).backgroundColor,
      expected: getComputedStyle(sample).backgroundColor,
      foreground: getComputedStyle(element).color,
      expectedForeground: getComputedStyle(sample).color,
    }
    sample.remove()
    return result
  })
  expect(colors.actual).toBe(colors.expected)
  expect(colors.foreground).toBe(colors.expectedForeground)
  await page.getByRole('switch', { name: /dark theme|dark mode/i }).click()
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await expect(current).toBeVisible()
  await page.goto('/zh/components/pagination')
  const nav = page
    .getByRole('region', { name: '本地结果', exact: true })
    .getByRole('navigation', { name: '分页', exact: true })
  await nav.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(nav.getByRole('button', { name: '第 6 页', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
})
