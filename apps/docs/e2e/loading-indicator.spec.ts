import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/loading-indicator')
})

test('default geometry, accessible status, and variant change match the target', async ({
  page,
}) => {
  const indicator = page.getByTestId('loading-indicator')
  const active = indicator.locator('.yam3x-loading-indicator__active')
  // loading-indicator.a11y.unknown-value
  await expect(indicator).toHaveAttribute('role', 'progressbar')
  await expect(indicator).toHaveAttribute('aria-label', 'Loading article')
  await expect(indicator).not.toHaveAttribute('aria-valuenow')
  // loading-indicator.geometry.size
  await expect(indicator).toHaveCSS('width', '48px')
  await expect(active).toHaveCSS('width', '38px')
  await expect(indicator.locator('.yam3x-loading-indicator__container')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(indicator.locator('.yam3x-loading-indicator__container')).toHaveCSS(
    'border-radius',
    '9999px',
  )
  const resolveRoleColor = async (role: string) =>
    indicator.evaluate((element, token) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${token})`
      element.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }, role)
  await expect(active).toHaveCSS(
    'background-color',
    await resolveRoleColor('--md-sys-color-primary'),
  )
  expect(await indicator.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1)
  await page.getByRole('checkbox', { name: 'Use container' }).check()
  await expect(indicator).toHaveClass(/yam3x-loading-indicator--contained/)
  await expect(indicator.locator('.yam3x-loading-indicator__container')).not.toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  )
  await expect(indicator.locator('.yam3x-loading-indicator__container')).toHaveCSS(
    'background-color',
    await resolveRoleColor('--md-sys-color-primary-container'),
  )
  await expect(active).toHaveCSS(
    'background-color',
    await resolveRoleColor('--md-sys-color-on-primary-container'),
  )
  await page.getByRole('checkbox', { name: 'Use container' }).uncheck()
  await expect(indicator).toHaveClass(/yam3x-loading-indicator--uncontained/)
  await indicator.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(indicator).toBeHidden()
  await expect(page.getByRole('progressbar', { name: 'Loading article' })).toHaveCount(0)
})

test('seven polygon states morph continuously and reduced motion freezes the shape', async ({
  page,
}) => {
  const active = page.getByTestId('loading-indicator').locator('.yam3x-loading-indicator__active')
  const values = await active.evaluate(async (element) => {
    const style = getComputedStyle(element)
    const first = style.getPropertyValue('--_yam3x-loading-shape-soft-burst').trim()
    const second = style.getPropertyValue('--_yam3x-loading-shape-nine-cookie').trim()
    const polygon = getComputedStyle(element).clipPath
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      first,
      second,
      polygon,
      current: getComputedStyle(element).clipPath,
      rotation: getComputedStyle(element.parentElement!).animationName,
    }
  })
  expect(values.first).toMatch(/^polygon\(/)
  expect(values.second).toMatch(/^polygon\(/)
  expect(values.first).not.toBe(values.second)
  expect(values.current).not.toBe(values.polygon)
  expect(values.current).not.toBe(values.first)
  expect(values.current).not.toBe(values.second)
  expect(values.rotation).not.toBe('none')
  const sequence = await active.evaluate((element) => {
    const animation = element.getAnimations()[0]
    animation.pause()
    return [0, 14, 29, 43, 57, 71, 83, 100].map((percent) => {
      animation.currentTime = percent * 46.66
      return getComputedStyle(element).clipPath
    })
  })
  expect(new Set(sequence.slice(0, -1)).size).toBe(7)
  expect(sequence[7]).toBe(sequence[0])
  // loading-indicator.motion.reduced
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(active).toHaveCSS('animation-name', 'none')
  const frozen = await active.evaluate((element) => getComputedStyle(element).clipPath)
  await page.waitForTimeout(100)
  await expect(active).toHaveCSS('clip-path', frozen)
})

test('documented style hooks affect the rendered result', async ({ page }) => {
  const host = page.getByTestId('loading-indicator')
  const active = host.locator('.yam3x-loading-indicator__active')
  const container = host.locator('.yam3x-loading-indicator__container')
  await host.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-loading-indicator-container-size', '96px')
    style.setProperty('--yam3x-loading-indicator-container-shape', '12px')
    style.setProperty('--yam3x-loading-indicator-active-indicator-color', 'rgb(12, 34, 56)')
  })
  await expect(host).toHaveCSS('width', '96px')
  await expect(active).toHaveCSS('width', '76px')
  await expect(active).toHaveCSS('background-color', 'rgb(12, 34, 56)')
  await expect(container).toHaveCSS('border-radius', '12px')
  await host.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-loading-indicator-active-indicator-size',
      '60px',
    ),
  )
  await expect(active).toHaveCSS('width', '60px')
  await page.getByRole('checkbox', { name: 'Use container' }).check()
  await host.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-loading-indicator-contained-container-color', 'rgb(10, 20, 30)')
    style.setProperty(
      '--yam3x-loading-indicator-contained-active-indicator-color',
      'rgb(240, 230, 220)',
    )
  })
  await expect(container).toHaveCSS('background-color', 'rgb(10, 20, 30)')
  await expect(active).toHaveCSS('background-color', 'rgb(240, 230, 220)')
})

test('default active colors meet 3:1 contrast in light and dark themes', async ({ page }) => {
  // loading-indicator.color.contrast
  const contrast = (first: string, second: string) => {
    const luminance = (color: string) => {
      const [red, green, blue] = color
        .match(/\d+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const value = channel / 255
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
    return (lighter + 0.05) / (darker + 0.05)
  }
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, enabled) => element.classList.toggle('dark', enabled), dark)
    for (const contained of [false, true]) {
      const checkbox = page.getByRole('checkbox', { name: 'Use container' })
      if (contained) await checkbox.check()
      else await checkbox.uncheck()
      const colors = await page.getByTestId('loading-indicator').evaluate(
        (element, isContained) => ({
          active: getComputedStyle(element.querySelector('.yam3x-loading-indicator__active')!)
            .backgroundColor,
          background: getComputedStyle(
            isContained
              ? element.querySelector('.yam3x-loading-indicator__container')!
              : element.closest('.yam3x-demo')!,
          ).backgroundColor,
        }),
        contained,
      )
      expect(contrast(colors.active, colors.background)).toBeGreaterThanOrEqual(3)
    }
  }
})

test('forced colors retain an active shape and contained boundary', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Use container' }).check()
  await page.emulateMedia({ forcedColors: 'active' })
  const host = page.getByTestId('loading-indicator')
  await expect(host.locator('.yam3x-loading-indicator__container')).toHaveCSS(
    'outline-width',
    '1px',
  )
  const colors = await host.evaluate((element) => ({
    active: getComputedStyle(element.querySelector('.yam3x-loading-indicator__active')!)
      .backgroundColor,
    container: getComputedStyle(element.querySelector('.yam3x-loading-indicator__container')!)
      .backgroundColor,
  }))
  expect(colors.active).not.toBe(colors.container)
})
