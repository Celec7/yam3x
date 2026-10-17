import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/tree-view')
})

test('keeps focus separate from selection and returns to the collapsed ancestor', async ({
  page,
}) => {
  // tree-view.focus.navigation; tree-view.selection.independent
  const demo = page.getByTestId('tree-explorer')
  const tree = demo.getByRole('tree')
  const node = (name: string) => tree.getByRole('treeitem', { name, exact: true })
  await node('Workspace').focus()
  await page.keyboard.press('ArrowRight')
  await expect(node('Design')).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(node('Brief')).toBeFocused()
  await expect(demo.getByTestId('tree-selected')).toHaveText('Selected: —')
  await page.keyboard.press('Enter')
  await expect(node('Brief')).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(node('Design')).toBeFocused()
  await expect(node('Brief')).toHaveCount(0)
  await page.keyboard.press('End')
  await expect(node('Zebra')).toBeFocused()
  await page.keyboard.press('Home')
  await page.keyboard.press('n')
  await expect(node('Notes')).toBeFocused()
  await expect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1)
  await node('Unavailable').focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('tree-selected')).toHaveText('Selected: brief')
})

test('supports modifier-free multiple selection', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Allow multiple selection', exact: true }).check()
  const demo = page.getByTestId('tree-explorer')
  const workspace = demo.getByRole('treeitem', { name: 'Workspace', exact: true })
  const notes = demo.getByRole('treeitem', { name: 'Notes', exact: true })
  await workspace.focus()
  await page.keyboard.press('Space')
  await notes.focus()
  await page.keyboard.press('Space')
  await expect(demo.getByTestId('tree-selected')).toHaveText('Selected: 0, notes')
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('tree-selected')).toHaveText('Selected: 0, notes')
})

test('derives mixed checks and excludes disabled records from cascade', async ({ page }) => {
  // tree-view.check.known
  const demo = page.getByTestId('tree-batch')
  const tree = demo.getByRole('tree')
  const node = (name: string) => tree.getByRole('treeitem', { name, exact: true })
  await node('Brief').focus()
  await page.keyboard.press('Space')
  await expect(node('Design')).toHaveAttribute('aria-checked', 'mixed')
  await expect(node('Workspace')).toHaveAttribute('aria-checked', 'mixed')
  await node('Tokens').focus()
  await page.keyboard.press('Space')
  await expect(node('Design')).toHaveAttribute('aria-checked', 'true')
  await expect(node('Archived')).toHaveAttribute('aria-checked', 'false')
  await node('Workspace')
    .locator(':scope > .yam3x-tree-view__row .yam3x-tree-view__check-target')
    .click()
  await expect(node('Notes')).toHaveAttribute('aria-checked', 'true')
  await expect(node('Workspace')).toHaveAttribute('aria-checked', 'true')
  await expect(node('Workspace')).not.toHaveAttribute('aria-selected')
  await expect(tree.getByRole('checkbox')).toHaveCount(0)
})

test('exposes distinct native checks when inspection and checking are combined', async ({
  page,
}) => {
  const demo = page.getByTestId('tree-batch')
  await demo.getByRole('checkbox', { name: 'Inspect and check separately', exact: true }).check()
  const tree = demo.getByRole('tree')
  const brief = tree.getByRole('treeitem', { name: 'Brief', exact: true })
  await brief.focus()
  await page.keyboard.press('Enter')
  await expect(brief).toHaveAttribute('aria-selected', 'true')
  await expect(brief).not.toHaveAttribute('aria-checked')
  await expect(demo.getByTestId('tree-checked')).toHaveText('Checked: —')
  await page.keyboard.press('Space')
  await expect(tree.getByRole('checkbox', { name: 'Check Brief', exact: true })).toBeChecked()
  const tokens = tree.getByRole('checkbox', { name: 'Check Tokens', exact: true })
  await tokens.click()
  await expect(tokens).toBeChecked()
  await expect(tokens).toHaveAttribute('tabindex', '-1')
  await expect(demo.getByTestId('tree-inspected')).toHaveText('Inspecting: brief')
})

test('recovers a failed branch without checking newly loaded descendants', async ({ page }) => {
  // tree-view.load.recovery; tree-view.check.known
  const demo = page.getByTestId('tree-lazy')
  const remote = demo.getByRole('treeitem', { name: 'Remote documents', exact: true })
  await remote.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await expect(demo.getByRole('progressbar')).toHaveCount(1)
  await demo
    .locator('[data-load-request="1"]')
    .getByRole('button', { name: 'Fail response', exact: true })
    .click()
  await expect(demo.getByRole('alert')).toBeVisible()
  await expect(demo.getByRole('alert')).not.toContainText('Simulated server failure')
  await remote.focus()
  await page.keyboard.press('ArrowRight')
  await demo
    .locator('[data-load-request="2"]')
    .getByRole('button', { name: 'Return children', exact: true })
    .click()
  await expect(remote).toHaveAttribute('aria-checked', 'true')
  await expect(
    demo.getByRole('treeitem', { name: 'Remote result 2', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await expect(demo.getByRole('alert')).toHaveCount(0)
})

test('ignores a canceled late result and retains accepted cached children', async ({ page }) => {
  // tree-view.load.recovery
  const demo = page.getByTestId('tree-lazy')
  const remote = demo.getByRole('treeitem', { name: 'Remote documents', exact: true })
  await remote.focus()
  await page.keyboard.press('ArrowRight')
  await expect(demo.locator('[data-load-request="1"]')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(demo.locator('[data-load-request="1"]')).toContainText('cancellation requested')
  await page.keyboard.press('ArrowRight')
  await demo
    .locator('[data-load-request="2"]')
    .getByRole('button', { name: 'Return children', exact: true })
    .click()
  await demo
    .locator('[data-load-request="1"]')
    .getByRole('button', { name: 'Return children', exact: true })
    .click()
  await expect(demo.getByRole('treeitem', { name: 'Remote result 2', exact: true })).toBeVisible()
  await expect(demo.getByRole('treeitem', { name: 'Remote result 1', exact: true })).toHaveCount(0)
  await remote.focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await expect(demo.locator('[data-load-request]')).toHaveCount(0)
  await expect(demo.getByRole('treeitem', { name: 'Remote result 2', exact: true })).toBeVisible()
})

test('mirrors branch navigation in RTL and keeps rounded focus visible', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Use RTL', exact: true }).check()
  const demo = page.getByTestId('tree-explorer')
  const workspace = demo.getByRole('treeitem', { name: 'Workspace', exact: true })
  const design = demo.getByRole('treeitem', { name: 'Design', exact: true })
  await workspace.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(design).toBeFocused()
  await page.keyboard.press('Enter')
  const row = design.locator(':scope > .yam3x-tree-view__row')
  await expect(row).toHaveCSS('border-top-left-radius', '12px')
  await expect(row).toHaveCSS('outline-width', '3px')
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(row).toHaveCSS('outline-style', 'solid')
  const duration = await design
    .locator(':scope > .yam3x-tree-view__row .yam3x-tree-view__chevron')
    .evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))
  expect(duration).toBeLessThanOrEqual(0.001)
  await page.keyboard.press('ArrowRight')
  await expect(workspace).toBeFocused()
})

test('renders Chinese names, descriptions and keyboard guidance', async ({ page }) => {
  await page.goto('/zh/components/tree-view')
  const demo = page.getByTestId('tree-explorer')
  const tree = demo.getByRole('tree', { name: '工作区浏览', exact: true })
  const workspace = tree.getByRole('treeitem', { name: '工作区', exact: true })
  await expect(workspace).toHaveAccessibleDescription('本地记录')
  await workspace.focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('tree-selected')).toHaveText('已选择： 0')
})

test('contains deep hierarchy at narrow widths and 200% text without losing complete labels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const demo = page.getByTestId('tree-explorer')
  const tree = demo.getByRole('tree')
  const shared = tree.getByRole('treeitem', { name: 'Shared', exact: true })
  await shared.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  const leaf = tree.getByRole('treeitem', {
    name: 'A complete document name that remains available when text is enlarged',
    exact: true,
  })
  await expect(leaf).toBeFocused()
  const region = demo.getByRole('region', { name: 'Workspace explorer', exact: true })
  await expect(region).toHaveAttribute('tabindex', '0')
  const layout = await region.evaluate((el) => ({
    overflow: el.scrollWidth > el.clientWidth,
    contained: el.getBoundingClientRect().right <= innerWidth,
  }))
  expect(layout).toEqual({ overflow: true, contained: true })
  await expect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1)
  await region.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
})

test('shows held pointer and keyboard feedback only on the activated node row', async ({
  page,
}) => {
  const demo = page.getByTestId('tree-explorer')
  const tree = demo.getByRole('tree')
  const workspace = tree.getByRole('treeitem', { name: 'Workspace', exact: true })
  const design = tree.getByRole('treeitem', { name: 'Design', exact: true })
  const row = design.locator(':scope > .yam3x-tree-view__row')
  const label = row.locator('.yam3x-tree-view__label')
  const bounds = await label.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + 10, bounds!.y + 10)
  await page.mouse.down()
  await expect(design).toHaveAttribute('data-yam3x-pressed', '')
  await expect(row.locator('.yam3x-ripple--visible')).toHaveCount(1)
  await expect(workspace).not.toHaveAttribute('data-yam3x-pressed')
  await expect(workspace.locator(':scope > .yam3x-tree-view__row .yam3x-ripple')).toHaveCount(0)
  await page.mouse.up()
  await expect(design).not.toHaveAttribute('data-yam3x-pressed')
  await expect(row.locator('.yam3x-ripple')).toHaveCount(0)
  await design.focus()
  await page.keyboard.down('Space')
  await expect(design).toHaveAttribute('data-yam3x-pressed', '')
  await expect(row.locator('.yam3x-ripple--visible')).toHaveCount(1)
  await page.keyboard.up('Space')
  await expect(design).not.toHaveAttribute('data-yam3x-pressed')
  await expect(row.locator('.yam3x-ripple')).toHaveCount(0)
  await design
    .getByRole('button', { name: 'Expand Design', exact: true })
    .dispatchEvent('pointerdown', {
      pointerId: 17,
      isPrimary: true,
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    })
  await expect(design).not.toHaveAttribute('data-yam3x-pressed')
  await design
    .getByRole('button', { name: 'Expand Design', exact: true })
    .dispatchEvent('pointercancel', { pointerId: 17 })
  await page.getByRole('checkbox', { name: 'Disable tree actions', exact: true }).check()
  await design.focus()
  await page.keyboard.down('Enter')
  await expect(design).not.toHaveAttribute('data-yam3x-pressed')
  await page.keyboard.up('Enter')
})

test('clears canceled touch feedback and removes spatial motion for reduced motion', async ({
  page,
}) => {
  // tree-view.feedback.press
  const demo = page.getByTestId('tree-explorer')
  const node = demo.getByRole('treeitem', { name: 'Notes', exact: true })
  const row = node.locator(':scope > .yam3x-tree-view__row')
  await row.dispatchEvent('pointerdown', {
    pointerId: 23,
    isPrimary: true,
    pointerType: 'touch',
    clientX: 150,
    clientY: 150,
  })
  await expect(node).toHaveAttribute('data-yam3x-pressed', '')
  await expect(row.locator('.yam3x-ripple--visible')).toHaveCount(1)
  await row.dispatchEvent('pointercancel', { pointerId: 23 })
  await expect(node).not.toHaveAttribute('data-yam3x-pressed')
  await expect(row.locator('.yam3x-ripple')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await node.focus()
  await page.keyboard.down('Enter')
  await expect(node).toHaveAttribute('data-yam3x-pressed', '')
  const ripple = row.locator('.yam3x-ripple--visible')
  await expect(ripple).toHaveCount(1)
  expect(
    await ripple.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)),
  ).toBeLessThanOrEqual(0.001)
  await page.keyboard.up('Enter')
  await expect(row.locator('.yam3x-ripple')).toHaveCount(0)
  await expect(node).toHaveAttribute('aria-selected', 'true')
})

test('animates branch geometry, makes collapsing descendants inert immediately, and survives interruption', async ({
  page,
}) => {
  const demo = page.getByTestId('tree-explorer')
  const node = demo.getByRole('treeitem', { name: 'Design', exact: true })
  await node.focus()
  await page.keyboard.press('ArrowRight')
  const branch = node.locator(':scope > .yam3x-tree-view__branch')
  await expect
    .poll(() =>
      branch.evaluate(
        (el) =>
          el
            .getAnimations()
            .filter((a) => (a as CSSTransition).transitionProperty === 'grid-template-rows').length,
      ),
    )
    .toBe(1)
  await page.keyboard.press('ArrowLeft')
  await expect(branch).toHaveAttribute('inert', '')
  await expect(branch).toHaveAttribute('aria-hidden', 'true')
  await expect(demo.getByRole('treeitem', { name: 'Brief', exact: true })).toHaveCount(0)
  await page.keyboard.press('ArrowRight')
  await expect(demo.getByRole('treeitem', { name: 'Brief', exact: true })).toBeVisible()
  await expect(branch).not.toHaveAttribute('inert')
  await page.keyboard.press('ArrowRight')
  await expect(demo.getByRole('treeitem', { name: 'Brief', exact: true })).toBeFocused()
  await expect.poll(() => branch.evaluate((el) => el.getAnimations().length)).toBe(0)
  await expect(branch).not.toHaveClass(/enter-active|leave-active/)
})
