import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/empty-state')
})

test('keeps search and surrounding region available while clearing no-match results', async ({
  page,
}) => {
  const search = page.getByRole('searchbox', { name: 'Search documents', exact: true })
  const empty = page.locator('.yam3x-empty-state').filter({ hasText: 'No matching documents' })
  await expect(empty).not.toHaveAttribute('role')
  await search.focus()
  await search.fill('new query')
  await expect(search).toBeFocused()
  await expect(empty).toBeVisible()
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(empty).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Search results', exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Showing all documents')
})

test('offers creation separately from no-match recovery and uses contextual title roles', async ({
  page,
}) => {
  const embedded = page.locator('.yam3x-empty-state').filter({ hasText: 'No documents yet' })
  const destination = page.locator('.yam3x-empty-state--page')
  await expect(embedded.getByRole('heading', { name: 'No documents yet', exact: true })).toHaveCSS(
    'font-size',
    '16px',
  )
  await expect(destination.getByRole('heading')).toHaveCSS('font-size', '24px')
  await expect(embedded.locator('.yam3x-icon')).toHaveAttribute('aria-hidden', 'true')
  await page.getByRole('button', { name: 'Create document', exact: true }).click()
  await expect(embedded).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Documents', exact: true })).toContainText(
    'Untitled document created',
  )
})

test('wraps enlarged text and actions in narrow RTL regions without adding a background', async ({
  page,
}) => {
  // empty-state.content.adaptive
  await page.getByRole('switch', { name: /dark theme|dark mode/i }).click()
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const demo = page.locator('.empty-state-demo')
  await demo.evaluate((element) => element.setAttribute('dir', 'rtl'))
  for (const state of await demo.locator('.yam3x-empty-state').all()) {
    const geometry = await state.evaluate((element) => ({
      overflow: element.scrollWidth > element.clientWidth,
      background: getComputedStyle(element).backgroundColor,
    }))
    expect(geometry.overflow).toBe(false)
    expect(geometry.background).toBe('rgba(0, 0, 0, 0)')
  }
  await expect(demo.locator('.yam3x-empty-state--start')).toHaveCSS('text-align', 'start')
  await demo.screenshot({ path: '/tmp/yam3x-empty-state-mobile.png' })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(page.getByRole('button', { name: 'Create document', exact: true })).toBeVisible()
  await page.goto('/zh/components/empty-state')
  await expect(page.getByRole('heading', { name: '没有匹配的文档', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '清除搜索', exact: true }).click()
  await expect(page.getByRole('searchbox', { name: '搜索文档', exact: true })).toHaveValue('')
})
