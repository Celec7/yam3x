import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

function control(page: Page, label: string) {
  return page.locator('.yam3x-switch').filter({
    has: page.getByRole('switch', { name: label, exact: true }),
  })
}

function roleColor(page: Page, role: string) {
  return page.evaluate((name) => {
    const hex = getComputedStyle(document.documentElement)
      .getPropertyValue(`--md-sys-color-${name}`)
      .trim()
      .slice(1)
    const value = Number.parseInt(hex, 16)
    return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
  }, role)
}

test('switch examples render Material on, off, icon, and disabled states', async ({ page }) => {
  await page.goto('/components/switch')
  const offInput = page.getByRole('switch', { name: 'Location services', exact: true })
  const onInput = page.getByRole('switch', { name: 'Notifications', exact: true })
  const disabledInput = page.getByRole('switch', { name: 'Unavailable setting', exact: true })
  const off = control(page, 'Location services')
  const on = control(page, 'Notifications')
  const disabled = control(page, 'Unavailable setting')
  const offTrack = off.locator('.yam3x-switch__track')
  const onTrack = on.locator('.yam3x-switch__track')
  const offThumb = off.locator('.yam3x-switch__thumb')
  const onThumb = on.locator('.yam3x-switch__thumb')

  await expect(offInput).toHaveAttribute('aria-checked', 'false')
  await expect(onInput).toHaveAttribute('aria-checked', 'true')
  await expect(disabledInput).toBeDisabled()
  // switch.geometry.track
  await expect(offTrack).toHaveCSS('width', '52px')
  await expect(offTrack).toHaveCSS('height', '32px')
  await expect(offTrack).toHaveCSS('border-width', '2px')
  await expect(offTrack).toHaveCSS('border-top-left-radius', '9999px')
  await expect(offThumb).toHaveCSS('width', '24px')
  await expect(offThumb).toHaveCSS('height', '24px')
  // switch.color.roles
  await expect(offThumb).toHaveCSS('background-color', await roleColor(page, 'outline'))
  await expect(onTrack).toHaveCSS('border-width', '0px')
  await expect(onThumb).toHaveCSS('width', '24px')
  await expect(onThumb).toHaveCSS('height', '24px')
  await expect(onTrack).toHaveCSS('background-color', await roleColor(page, 'primary'))
  await expect(onThumb).toHaveCSS('background-color', await roleColor(page, 'on-primary'))
  await expect(off.locator('.yam3x-switch__icon')).toHaveCount(1)
  await expect(on.locator('.yam3x-switch__icon')).toHaveCount(0)
  // switch.disabled.unselected-icon
  const disabledIcon = disabled.locator('.yam3x-switch__icon')
  await expect(disabledIcon).toHaveCount(1)
  await expect(disabledIcon).toHaveCSS('color', await roleColor(page, 'surface-container-highest'))
  await expect(disabledIcon).toHaveCSS('opacity', '0.38')
  // switch.a11y.target
  const target = await off.boundingBox()
  expect(target?.width).toBeGreaterThanOrEqual(48)
  expect(target?.height).toBeGreaterThanOrEqual(48)
})

test('custom thumb content receives checked state and replaces built-in icons', async ({
  page,
}) => {
  await page.goto('/components/switch')
  const input = page.getByRole('switch', { name: 'Sync across devices', exact: true })
  const root = control(page, 'Sync across devices')
  const thumb = root.locator('.yam3x-switch__thumb')
  const content = thumb.locator('.yam3x-switch__custom-thumb-content')
  const icon = content.locator('.yam3x-icon')

  await expect(input).toHaveAttribute('aria-checked', 'true')
  await expect(content).toHaveAttribute('aria-hidden', 'true')
  await expect(content.locator('[data-demo-state="checked"]')).toBeVisible()
  await expect(icon).toHaveCSS('font-size', '16px')
  await expect(thumb.locator('.yam3x-switch__icon')).toHaveCount(1)
  const checkedCenters = await icon.evaluate((element) => {
    const iconRect = element.getBoundingClientRect()
    const thumbRect = element.closest('.yam3x-switch__thumb')!.getBoundingClientRect()
    return {
      x: iconRect.left + iconRect.width / 2 - (thumbRect.left + thumbRect.width / 2),
      y: iconRect.top + iconRect.height / 2 - (thumbRect.top + thumbRect.height / 2),
    }
  })
  expect(Math.abs(checkedCenters.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(checkedCenters.y)).toBeLessThanOrEqual(1)

  await root.click()
  await expect(input).toHaveAttribute('aria-checked', 'false')
  await expect(content.locator('[data-demo-state="unchecked"]')).toBeVisible()
  await expect(icon).toHaveCSS('font-size', '16px')
  await expect(thumb.locator('.yam3x-switch__icon')).toHaveCount(1)
  const uncheckedCenters = await icon.evaluate((element) => {
    const iconRect = element.getBoundingClientRect()
    const thumbRect = element.closest('.yam3x-switch__thumb')!.getBoundingClientRect()
    return {
      x: iconRect.left + iconRect.width / 2 - (thumbRect.left + thumbRect.width / 2),
      y: iconRect.top + iconRect.height / 2 - (thumbRect.top + thumbRect.height / 2),
    }
  })
  expect(Math.abs(uncheckedCenters.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(uncheckedCenters.y)).toBeLessThanOrEqual(1)
})

test('switch hover, focus, and press feedback preserve the selected value until activation', async ({
  page,
}) => {
  await page.goto('/components/switch')
  const input = page.getByRole('switch', { name: 'Location services', exact: true })
  const root = control(page, 'Location services')
  const track = root.locator('.yam3x-switch__track')
  const thumb = root.locator('.yam3x-switch__thumb')

  await root.hover()
  await expect(root).toHaveAttribute('data-hover', '')
  await expect(track).toHaveCSS(
    'background-color',
    await roleColor(page, 'surface-container-highest'),
  )
  await expect(thumb).toHaveCSS('background-color', await roleColor(page, 'on-surface-variant'))
  await expect(input).toHaveAttribute('aria-checked', 'false')

  await input.focus()
  // switch.behavior.keyboard
  await page.keyboard.down('Space')
  await expect(root).toHaveAttribute('data-active', '')
  // switch.geometry.pressed-handle
  await expect(thumb).toHaveCSS('width', '28px')
  await expect(thumb).toHaveCSS('height', '28px')
  await page.keyboard.up('Space')
  await expect(input).toHaveAttribute('aria-checked', 'true')
  await expect(root).not.toHaveAttribute('data-active', '')
})

test('pointer and Enter activation update the switch and its visible status', async ({ page }) => {
  await page.goto('/components/switch')
  const input = page.getByRole('switch', { name: 'Location services', exact: true })
  // switch.behavior.immediate-effect
  await control(page, 'Location services').click()
  await expect(input).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText(/Location: \s*On/)).toBeVisible()
  await input.press('Enter')
  await expect(input).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByText(/Location: \s*Off/)).toBeVisible()
})

test('descriptions, disabled states, dark colors, RTL, forced colors, and reduced motion stay usable', async ({
  page,
}) => {
  await page.goto('/components/switch')
  const notifications = page.getByRole('switch', { name: 'Notifications', exact: true })
  const notificationControl = control(page, 'Notifications')
  const disabled = page.getByRole('switch', { name: 'Unavailable setting', exact: true })
  // switch.a11y.name-description
  const descriptionId = await notifications.getAttribute('aria-describedby')
  expect(descriptionId).toBeTruthy()
  await expect(page.locator(`#${descriptionId}`)).toHaveText('Receive important updates')
  await expect(disabled).toBeDisabled()

  await page.getByRole('switch').first().click()
  await expect(notificationControl.locator('.yam3x-switch__track')).toHaveCSS(
    'background-color',
    await roleColor(page, 'primary'),
  )
  await expect(notificationControl.locator('.yam3x-switch__thumb')).toHaveCSS(
    'background-color',
    await roleColor(page, 'on-primary'),
  )
  await notificationControl.evaluate((root) => root.parentElement?.setAttribute('dir', 'rtl'))
  await expect(notificationControl).toHaveCSS('direction', 'rtl')
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await notifications.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(notifications).toBeFocused()
  await expect(notificationControl.locator('.yam3x-switch__thumb')).toHaveCSS(
    'outline-style',
    'solid',
  )
  const transition = await notificationControl
    .locator('.yam3x-switch__track')
    .evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(transition.split(',').every((value) => Number.parseFloat(value) <= 0.01)).toBe(true)
})

test('selected icon and hover handle colors follow mapped System roles', async ({ page }) => {
  await page.goto('/components/switch')
  const root = control(page, 'Location services')
  const input = page.getByRole('switch', { name: 'Location services', exact: true })
  const track = root.locator('.yam3x-switch__track')
  const thumb = root.locator('.yam3x-switch__thumb')
  const icon = root.locator('.yam3x-switch__icon')
  await root.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--md-sys-color-primary', 'rgb(1, 2, 3)')
    style.setProperty('--md-sys-color-primary-container', 'rgb(4, 5, 6)')
  })

  await root.click()
  await expect(input).toHaveAttribute('aria-checked', 'true')
  // switch.color.selected-icon
  await expect(track).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(icon).toHaveCSS('color', 'rgb(1, 2, 3)')

  await root.hover()
  // switch.color.selected-hover-handle
  await expect(thumb).toHaveCSS('background-color', 'rgb(4, 5, 6)')
  await expect(icon).toHaveCSS('color', 'rgb(1, 2, 3)')
})
