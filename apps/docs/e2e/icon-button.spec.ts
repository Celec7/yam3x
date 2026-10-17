import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/icon-button')
})

test('five expressive sizes and three widths preserve their target geometry', async ({ page }) => {
  // icon-button.a11y.target
  const dimensions = [
    { size: 'extra-small', height: 32, widths: { narrow: 28, default: 32, wide: 40 } },
    { size: 'small', height: 40, widths: { narrow: 32, default: 40, wide: 52 } },
    { size: 'medium', height: 56, widths: { narrow: 48, default: 56, wide: 72 } },
    { size: 'large', height: 96, widths: { narrow: 64, default: 96, wide: 128 } },
    { size: 'extra-large', height: 136, widths: { narrow: 104, default: 136, wide: 184 } },
  ]
  for (const { size, height, widths } of dimensions) {
    for (const [width, expectedWidth] of Object.entries(widths)) {
      const button = page.getByRole('button', { name: `Add item, ${size} ${width}`, exact: true })
      await expect(button).toHaveCSS('height', `${height}px`)
      await expect(button).toHaveCSS('width', `${expectedWidth}px`)
      const target = await button.evaluate((element) => {
        const style = getComputedStyle(element, '::before')
        return {
          width: Number.parseFloat(style.width),
          height: Number.parseFloat(style.height),
          radius: style.borderTopLeftRadius,
          surfaceRadius: getComputedStyle(element).borderTopLeftRadius,
        }
      })
      expect(target.width).toBe(Math.max(expectedWidth, 48))
      expect(target.height).toBe(Math.max(height, 48))
      if (expectedWidth >= 48 && height >= 48) expect(target.radius).toBe(target.surfaceRadius)
    }
  }
  const small = page.getByRole('button', { name: 'Add item, extra-small narrow', exact: true })
  const hitTarget = await small.evaluate((element) => ({
    width: getComputedStyle(element, '::before').width,
    height: getComputedStyle(element, '::before').height,
  }))
  expect(parseFloat(hitTarget.width)).toBeGreaterThanOrEqual(48)
  expect(parseFloat(hitTarget.height)).toBeGreaterThanOrEqual(48)
})

test('expanded round target follows the icon button corner shape', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Add item, extra-small default', exact: true })
  await button.evaluate((element) => {
    element.addEventListener('click', () => element.setAttribute('data-activated', 'true'))
  })
  const bounds = await button.boundingBox()
  if (!bounds) throw new Error('Icon button has no rendered bounds')

  // The outer target is a 48px circle. This point falls in the rounded corner
  // of a 48px box with the unexpanded radius, but outside the expanded circle.
  await page.mouse.click(bounds.x - 2, bounds.y - 2)
  await expect(button).not.toHaveAttribute('data-activated', 'true')

  // This point is outside the visible 32px button, but inside its expanded target.
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y - 7)
  await expect(button).toHaveAttribute('data-activated', 'true')
})

test('disabled-interactive icon button remains focusable and suppresses activation feedback', async ({
  page,
}) => {
  const button = page.getByRole('button', { name: 'Sign in to add to favorites', exact: true })
  await expect(button).toHaveAttribute('aria-disabled', 'true')
  await expect(button).toHaveJSProperty('disabled', false)
  await button.focus()
  await expect(button).toBeFocused()
  await expect(button).toHaveCSS('outline-style', 'solid')
  await button.evaluate((element) => {
    element.addEventListener('click', () => element.setAttribute('data-activated', 'true'))
  })
  await button.click({ force: true })
  await expect(button).not.toHaveAttribute('data-activated', 'true')
  await expect(button.locator('.yam3x-ripple')).toHaveCount(0)
})

test('IconButton is an action and IconToggleButton exposes checked state', async ({ page }) => {
  const action = page.getByRole('button', { name: 'Search', exact: true })
  await expect(action).not.toHaveAttribute('aria-pressed')
  const button = page.getByRole('button', { name: 'Favorite', exact: true })
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'false')
})

test('icon button colors follow the active Material system roles', async ({ page }) => {
  const button = page.getByRole('button', { name: 'More options', exact: true })
  await button.evaluate((element) => {
    const style = (element.parentElement as HTMLElement).style
    style.setProperty('--md-sys-color-primary', 'rgb(1, 2, 3)')
    style.setProperty('--md-sys-color-on-primary', 'rgb(4, 5, 6)')
  })
  await expect(button).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(button).toHaveCSS('color', 'rgb(4, 5, 6)')
})

test('forced colors retain button boundaries and reduced motion removes decorative transitions', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  const enabled = page.getByRole('button', { name: 'Add item, small default', exact: true })
  await enabled.focus()
  await expect(enabled).toBeFocused()
  const forcedColorStyle = await enabled.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      outline: style.outlineColor,
      outlineWidth: style.outlineWidth,
      transitionDuration: style.transitionDuration,
      animationName: style.animationName,
    }
  })
  expect(forcedColorStyle.background).not.toBe('rgba(0, 0, 0, 0)')
  expect(forcedColorStyle.outline).not.toBe('rgba(0, 0, 0, 0)')
  expect(forcedColorStyle.outlineWidth).not.toBe('0px')
  expect(
    forcedColorStyle.transitionDuration
      .split(',')
      .every((value) => Number.parseFloat(value) <= 0.001),
  ).toBe(true)
  expect(forcedColorStyle.animationName).toBe('none')

  const selected = page.getByRole('button', { name: 'Favorite', exact: true })
  await selected.click()
  await expect(selected).toHaveAttribute('aria-pressed', 'true')
  const selectedBackground = await selected.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  expect(selectedBackground).not.toBe('rgba(0, 0, 0, 0)')
})

test('hover applies only the 8% state layer and keeps the icon visible', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Favorite', exact: true })
  await button.hover()
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  const visual = await button.evaluate((element) => {
    const icon = element.querySelector<HTMLElement>('.yam3x-icon')!
    const bounds = icon.getBoundingClientRect()
    return {
      iconColor: getComputedStyle(icon).color,
      iconSize: [bounds.width, bounds.height],
      background: getComputedStyle(element).backgroundColor,
    }
  })
  expect(visual.iconSize).toEqual([24, 24])
  expect(visual.iconColor).not.toBe(visual.background)
})

test('filled toggles and outlined defaults use the current light and dark color roles', async ({
  page,
}) => {
  const filledToggle = page.getByRole('button', { name: 'Pin item', exact: true })
  const outlined = page.getByRole('button', { name: 'View details', exact: true })
  const modeSwitch = page.getByRole('switch')
  const color = async (role: string) =>
    page.evaluate((name) => {
      const probe = document.createElement('span')
      probe.style.color = `var(--md-sys-color-${name})`
      document.body.append(probe)
      const resolved = getComputedStyle(probe).color
      probe.remove()
      return resolved
    }, role)

  for (let theme = 0; theme < 2; theme++) {
    await expect(filledToggle).toHaveCSS('background-color', await color('surface-container'))
    await expect(filledToggle).toHaveCSS('color', await color('on-surface-variant'))
    await expect(outlined).toHaveCSS('outline-color', await color('outline-variant'))
    await filledToggle.click()
    await expect(filledToggle).toHaveCSS('background-color', await color('primary'))
    await expect(filledToggle).toHaveCSS('color', await color('on-primary'))
    await filledToggle.click()
    if (theme === 0) await modeSwitch.click()
  }
})
