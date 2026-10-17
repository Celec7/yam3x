import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/avatar')
})

test('initials, icon, and image content stay passive and fit the default square', async ({
  page,
}) => {
  const avatars = page.locator('.yam3x-avatar')
  await expect(avatars).toHaveCount(4)

  const initials = avatars.nth(0)
  await expect(initials).toContainText('Annie')
  await expect(initials).not.toHaveAttribute('role')
  const inlineDisplay = await initials.evaluate((element) => {
    const parent = element.parentElement!
    const display = parent.style.display
    parent.style.display = 'block'
    const result = getComputedStyle(element).display
    parent.style.display = display
    return result
  })
  expect(inlineDisplay).toBe('inline-block')
  await expect(initials).toHaveCSS('width', '40px')
  await expect(initials).toHaveCSS('height', '40px')
  await expect(initials.locator('.yam3x-avatar__base')).toHaveCSS('border-radius', '9999px')
  await expect(initials.locator('.yam3x-avatar__base')).toHaveCSS('font-size', '16px')
  await expect(initials.locator('.yam3x-avatar__base')).toHaveCSS('font-weight', '500')
  await expect(initials.locator('.yam3x-avatar__base')).toHaveCSS('line-height', '24px')
  await expect(initials.locator('.yam3x-avatar__base')).toHaveCSS('letter-spacing', '0.15px')

  // avatar.extension.accessible-name
  await expect(avatars.nth(1)).toHaveAttribute('role', 'img')
  await expect(avatars.nth(1)).toHaveAttribute('aria-label', 'User profile icon')
  await expect(avatars.nth(1).locator('.yam3x-icon')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.getByRole('img', { name: 'User profile icon' })).toBeVisible()
  const image = avatars.nth(2).locator('img')
  await expect(image).toHaveAttribute('alt', 'Annie’s avatar')
  await expect(image).toHaveCSS('object-fit', 'cover')
  await expect(image).toHaveCSS('width', '40px')
  await expect(image).toHaveCSS('height', '40px')
  await expect(page.getByRole('img', { name: 'Annie’s avatar' })).toBeVisible()
})

test('uses foundation color roles in light and dark themes', async ({ page }) => {
  const base = page.locator('.yam3x-avatar__base').first()
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, enabled) => element.classList.toggle('dark', enabled), dark)
    const actual = await base.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      foreground: getComputedStyle(element).color,
    }))
    const expected = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--md-sys-color-primary-container)'
      document.body.append(probe)
      const background = getComputedStyle(probe).color
      probe.style.color = 'var(--md-sys-color-on-primary-container)'
      const foreground = getComputedStyle(probe).color
      probe.remove()
      return { background, foreground }
    })
    expect(actual).toEqual(expected)
  }
})

test('all m3e avatar custom properties override geometry, shape, type, and color', async ({
  page,
}) => {
  const avatar = page.locator('.yam3x-avatar').first()
  const base = avatar.locator('.yam3x-avatar__base')
  await avatar.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-avatar-size', '56px')
    style.setProperty('--yam3x-avatar-shape', '10px')
    style.setProperty('--yam3x-avatar-font-size', '20px')
    style.setProperty('--yam3x-avatar-font-weight', '700')
    style.setProperty('--yam3x-avatar-line-height', '28px')
    style.setProperty('--yam3x-avatar-tracking', '1px')
    style.setProperty('--yam3x-avatar-color', 'rgb(1, 2, 3)')
    style.setProperty('--yam3x-avatar-label-color', 'rgb(4, 5, 6)')
  })
  await expect(avatar).toHaveCSS('width', '56px')
  await expect(avatar).toHaveCSS('height', '56px')
  await expect(base).toHaveCSS('border-radius', '10px')
  await expect(base).toHaveCSS('font-size', '20px')
  await expect(base).toHaveCSS('font-weight', '700')
  await expect(base).toHaveCSS('line-height', '28px')
  await expect(base).toHaveCSS('letter-spacing', '1px')
  await expect(base).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(base).toHaveCSS('color', 'rgb(4, 5, 6)')
})

test('native hidden and forced colors preserve a visible boundary', async ({ page }) => {
  const avatar = page.locator('.yam3x-avatar').first()
  await avatar.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(avatar).toBeHidden()
  await avatar.evaluate((element) => element.removeAttribute('hidden'))
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(avatar.locator('.yam3x-avatar__base')).toHaveCSS('outline-width', '1px')
})
