import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/components/navigation-drawer')
})

test('opens a named modal drawer, focuses the first destination, and provides an in-panel close control', async ({
  page,
}) => {
  const toggle = page.getByRole('button', { name: 'Open navigation' })
  await toggle.click()

  const dialog = page.getByRole('dialog', { name: 'Main navigation' })
  const navigation = dialog.getByRole('navigation', { name: 'Main navigation' })
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect(navigation).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeVisible()
  await expect(navigation.getByRole('link', { name: /Inbox/ })).toBeFocused()
  await expect(navigation.getByRole('group', { name: 'Mail' })).toBeVisible()
})

test('closes after destination selection and leaves route and page focus to the application', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const dialog = page.getByRole('dialog', { name: 'Main navigation' })
  await dialog.getByRole('link', { name: /Starred/ }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Starred' })).toBeVisible()
  await expect(page.locator('.navigation-drawer-demo__main')).toBeFocused()
})

test('supports disclosure branches and supplementary arrow-key navigation', async ({ page }) => {
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  const inbox = navigation.getByRole('link', { name: /Inbox/ })
  await inbox.press('ArrowDown')
  await expect(navigation.getByRole('link', { name: /Starred/ })).toBeFocused()

  const collections = navigation.getByRole('button', { name: 'Collections' })
  const archive = navigation.getByRole('link', { name: 'Archive' })
  await expect(collections).toHaveAttribute('aria-expanded', 'false')
  await collections.press('ArrowRight')
  await expect(collections).toHaveAttribute('aria-expanded', 'true')
  await expect(archive).toBeVisible()
  await collections.press('ArrowLeft')
  await expect(archive).toBeHidden()
})

test('switches from modal to standard at the configured container width', async ({ page }) => {
  const panel = page.locator('.yam3x-drawer__panel')
  const drawerRoot = page.locator('.yam3x-navigation-drawer-root')
  const resolveColor = (name: string) =>
    drawerRoot.evaluate((root, customProperty) => {
      const probe = document.createElement('span')
      probe.style.backgroundColor = `var(${customProperty})`
      root.append(probe)
      const color = getComputedStyle(probe).backgroundColor
      probe.remove()
      return color
    }, name)

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(panel).toHaveClass(/yam3x-drawer__panel--overlay/)
  await expect(panel).toHaveClass(/yam3x-drawer__panel--open/)
  await expect
    .poll(async () => panel.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(await resolveColor('--_yam3x-navigation-drawer-color-surface-container-low'))

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1500, height: 900 })
  await page.locator('.navigation-drawer-demo').evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '900px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(panel).toHaveCSS('border-start-end-radius', '16px')
  await expect
    .poll(async () => panel.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(await resolveColor('--_yam3x-navigation-drawer-color-surface'))
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('dismisses a modal drawer with Escape and restores focus to its toggle', async ({ page }) => {
  const toggle = page.getByRole('button', { name: 'Open navigation' })
  await toggle.click()
  const dialog = page.getByRole('dialog', { name: 'Main navigation' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(toggle).toBeFocused()
})
