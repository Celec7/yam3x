import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

async function openNavigationDemo(page: Page) {
  await page.goto('/components/navigation-bar')
  await page.addStyleTag({
    content:
      '.navigation-bar-example__bar { display: flex !important; } .navigation-bar-example__rail { display: none !important; }',
  })
  return page.getByRole('navigation', { name: 'Documentation navigation' })
}

async function keepLinksOnDemoPage(navigation: Locator) {
  await navigation.evaluate((element) => {
    element.addEventListener('click', (event) => event.preventDefault())
  })
}

function colorForRole(page: Page, role: string) {
  return page.evaluate((name) => {
    const hex = getComputedStyle(document.documentElement)
      .getPropertyValue(`--md-sys-color-${name}`)
      .trim()
      .slice(1)
    const value = Number.parseInt(hex, 16)
    return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
  }, role)
}

test('selected navigation indicator aligns with item content in compact and expanded layouts', async ({
  page,
}) => {
  // navigation-bar.selection.indicator
  await page.setViewportSize({ width: 390, height: 844 })
  const navigation = await openNavigationDemo(page)
  const current = navigation.getByRole('link', { name: 'Overview' })
  const alignment = () =>
    current.evaluate((element) => {
      const indicator = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__indicator')!
        .getBoundingClientRect()
      const ripple = element
        .querySelector<HTMLElement>('.yam3x-ripple-container')!
        .getBoundingClientRect()
      const icon = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__icon')!
        .getBoundingClientRect()
      const label = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__label')!
        .getBoundingClientRect()
      return {
        indicatorCenter: indicator.y + indicator.height / 2,
        rippleCenter: ripple.y + ripple.height / 2,
        iconCenter: icon.y + icon.height / 2,
        contentCenter: (Math.min(icon.y, label.y) + Math.max(icon.bottom, label.bottom)) / 2,
      }
    })

  const compact = await alignment()
  expect(Math.abs(compact.indicatorCenter - compact.iconCenter)).toBeLessThan(2)
  expect(Math.abs(compact.indicatorCenter - compact.rippleCenter)).toBeLessThan(2)
  await expect(current.locator('.yam3x-ripple-container')).toHaveCSS('border-radius', '9999px')
  await page.setViewportSize({ width: 1046, height: 844 })
  await expect(current).toHaveCSS('display', 'flex')
  const expanded = await alignment()
  expect(Math.abs(expanded.indicatorCenter - expanded.contentCenter)).toBeLessThan(2)
  expect(Math.abs(expanded.indicatorCenter - expanded.rippleCenter)).toBeLessThan(2)
})

test('compact navigation keeps its indicator clear of every destination label', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const navigation = await openNavigationDemo(page)
  const items = navigation.getByRole('link')

  for (const item of await items.all()) {
    const gap = await item.evaluate((element) => {
      const indicator = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__indicator')!
        .getBoundingClientRect()
      const label = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__label')!
        .getBoundingClientRect()
      return label.top - indicator.bottom
    })
    expect(gap).toBeGreaterThanOrEqual(4)
  }
})

test('inactive destination shows a rounded hover layer and centered press ripple', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1046, height: 844 })
  const navigation = await openNavigationDemo(page)
  const item = navigation.getByRole('link', { name: 'Components' })
  await item.hover()
  await expect
    .poll(() =>
      item
        .locator('.yam3x-navigation-bar__indicator')
        .evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(100)
  const layerOpacity = await item
    .locator('.yam3x-navigation-bar__indicator')
    .evaluate((element) => getComputedStyle(element, '::after').opacity)
  expect(Number(layerOpacity)).toBeGreaterThan(0)

  const box = await item.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(0, 0)
  await expect
    .poll(() =>
      item
        .locator('.yam3x-navigation-bar__indicator')
        .evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThan(2)
  const pressX = box!.x + 30
  await page.mouse.move(pressX, box!.y + box!.height / 2)
  await page.mouse.down()
  const rippleOffset = await item.evaluate((element, pressX) => {
    const wave = element.querySelector('.yam3x-ripple')!.getBoundingClientRect()
    return Math.abs(wave.x + wave.width / 2 - pressX)
  }, pressX)
  expect(rippleOffset).toBeLessThan(2)
  await page.mouse.up()
})

test('selected navigation colors follow semantic roles in both themes', async ({ page }) => {
  // navigation-bar.color.selected
  await page.setViewportSize({ width: 1280, height: 844 })
  const navigation = await openNavigationDemo(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const current = navigation.getByRole('link', { name: 'Overview' })
  const inactive = navigation.getByRole('link', { name: 'Components' })
  const colors = (item: typeof current) =>
    item.evaluate((element) => ({
      icon: getComputedStyle(element.querySelector('.yam3x-navigation-bar__icon')!).color,
      label: getComputedStyle(element.querySelector('.yam3x-navigation-bar__label')!).color,
      labelWeight: getComputedStyle(element.querySelector('.yam3x-navigation-bar__label')!)
        .fontWeight,
      indicator: getComputedStyle(element.querySelector('.yam3x-navigation-bar__indicator')!)
        .backgroundColor,
    }))
  const expectCompactColors = async () => {
    const active = await colors(current)
    expect(active.icon).toBe(await colorForRole(page, 'on-secondary-container'))
    expect(active.label).toBe(await colorForRole(page, 'secondary'))
    expect(active.labelWeight).toBe('700')
    expect(active.indicator).toBe(await colorForRole(page, 'secondary-container'))
    const inactiveColors = await colors(inactive)
    expect(inactiveColors.icon).toBe(await colorForRole(page, 'on-surface-variant'))
    expect(inactiveColors.label).toBe(await colorForRole(page, 'on-surface-variant'))
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await expectCompactColors()
  await page.setViewportSize({ width: 1280, height: 844 })
  await page.getByRole('switch', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.setViewportSize({ width: 390, height: 844 })
  await expectCompactColors()
  await page.setViewportSize({ width: 1280, height: 844 })
  await expect(current).toHaveCSS('display', 'flex')
  const expanded = await colors(current)
  expect(expanded.label).toBe(await colorForRole(page, 'secondary'))
  expect(expanded.icon).toBe(await colorForRole(page, 'on-secondary-container'))
})

test('navigation item geometry maps the official compact and horizontal token values', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const navigation = await openNavigationDemo(page)
  const selected = navigation.getByRole('link', { name: 'Overview' })
  const indicator = selected.locator('.yam3x-navigation-bar__indicator')
  const label = selected.locator('.yam3x-navigation-bar__label')
  await expect(indicator).toHaveCSS('width', '56px')
  await expect(indicator).toHaveCSS('height', '32px')
  await expect(selected).toHaveCSS('row-gap', '6px')
  await expect(label).toHaveCSS('font-size', '12px')

  await page.setViewportSize({ width: 1046, height: 844 })
  await expect(selected).toHaveCSS('display', 'flex')
  await expect(indicator).toHaveCSS('height', '40px')
  await expect(indicator).toHaveCSS('left', '16px')
  await expect(selected).toHaveCSS('column-gap', '4px')
})

test('keyboard selection, RTL, forced colors, and reduced motion keep destinations usable', async ({
  page,
}) => {
  // navigation-bar.a11y.semantics
  await page.setViewportSize({ width: 1046, height: 844 })
  const navigation = await openNavigationDemo(page)
  await keepLinksOnDemoPage(navigation)
  const overview = navigation.getByRole('link', { name: 'Overview' })
  const components = navigation.getByRole('link', { name: 'Components' })
  const foundations = navigation.getByRole('link', { name: 'Design foundations' })

  await overview.focus()
  await page.keyboard.press('Tab')
  await expect(components).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(components).toHaveAttribute('aria-current', 'page')
  await expect(overview).not.toHaveAttribute('aria-current')
  await page.keyboard.press('Tab')
  await expect(foundations).toBeFocused()
  await page.keyboard.press('Space')
  await expect(foundations).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)

  await navigation.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await expect(navigation).toHaveCSS('direction', 'rtl')
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(foundations.locator('.yam3x-navigation-bar__indicator')).toHaveCSS(
    'border-top-style',
    'solid',
  )
  const transition = await foundations
    .locator('.yam3x-navigation-bar__indicator')
    .evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(transition.split(',').every((duration) => parseFloat(duration) <= 0.00001)).toBe(true)
})

test('navigation labels remain visible at 2x text size and activate links on touch', async ({
  browser,
}) => {
  // navigation-bar.text.scaling
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    const navigation = await openNavigationDemo(page)
    await keepLinksOnDemoPage(navigation)
    const labels = navigation.locator('.yam3x-navigation-bar__label')
    await page.addStyleTag({
      content:
        '.yam3x-navigation-bar__label { font-size: 24px !important; line-height: 32px !important; }',
    })

    await expect(navigation).toHaveCSS('min-height', '64px')
    await expect
      .poll(() => navigation.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThan(64)
    await expect(labels).toHaveCount(3)
    const expectUnclippedLabels = async () => {
      for (const label of await labels.all()) {
        await expect(label).toBeVisible()
        const dimensions = await label.evaluate((element) => ({
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
        }))
        expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
        expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight)
      }
    }
    await expectUnclippedLabels()

    const components = navigation.getByRole('link', { name: 'Components' })
    const demoUrl = page.url()
    await components.scrollIntoViewIfNeeded()
    const bounds = await components.boundingBox()
    expect(bounds).not.toBeNull()
    await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2)
    await expect(page).toHaveURL(demoUrl)
    await expect(components).toHaveAttribute('aria-current', 'page')

    await page.setViewportSize({ width: 1046, height: 844 })
    await expect(components).toHaveCSS('display', 'flex')
    await expectUnclippedLabels()
  } finally {
    await context.close()
  }
})

test('selected indicator expands from the item center and settles at its target size', async ({
  page,
}) => {
  // navigation-bar.motion.selection
  await page.setViewportSize({ width: 390, height: 844 })
  const navigation = await openNavigationDemo(page)
  await keepLinksOnDemoPage(navigation)
  await page.addStyleTag({
    content:
      '.yam3x-navigation-bar__indicator { transition-property: transform !important; transition-duration: 700ms !important; transition-timing-function: linear !important; }',
  })

  const components = navigation.getByRole('link', { name: 'Components' })
  const indicator = components.locator('.yam3x-navigation-bar__indicator')
  await expect
    .poll(() => indicator.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThan(1)
  await components.click()
  await expect(components).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  const width = () => indicator.evaluate((element) => element.getBoundingClientRect().width)
  await expect
    .poll(async () => {
      const value = await width()
      return value > 5 && value < 51
    })
    .toBe(true)

  const centers = async () =>
    components.evaluate((element) => {
      const indicatorRect = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__indicator')!
        .getBoundingClientRect()
      const iconRect = element
        .querySelector<HTMLElement>('.yam3x-navigation-bar__icon')!
        .getBoundingClientRect()
      return [indicatorRect.x + indicatorRect.width / 2, iconRect.x + iconRect.width / 2]
    })
  const intermediateCenters = await centers()
  expect(Math.abs(intermediateCenters[0]! - intermediateCenters[1]!)).toBeLessThan(1)
  await expect.poll(async () => Math.abs((await width()) - 56)).toBeLessThan(0.25)
  const settledCenters = await centers()
  expect(Math.abs(settledCenters[0]! - settledCenters[1]!)).toBeLessThan(1)
})

test('automatic mode shows compact and medium bars before the demo switches to a rail', async ({
  page,
}) => {
  // navigation-bar.adaptive.layout
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/navigation-bar')
  const navigation = page.locator('.navigation-bar-example__bar')
  const item = navigation.getByRole('link', { name: 'Overview' })

  await expect(item).toHaveCSS('display', 'grid')
  await page.setViewportSize({ width: 599, height: 844 })
  await expect(item).toHaveCSS('display', 'grid')
  await page.setViewportSize({ width: 600, height: 844 })
  await expect(item).toHaveCSS('display', 'flex')
  await page.setViewportSize({ width: 959, height: 844 })
  await expect(item).toHaveCSS('display', 'flex')
  await page.setViewportSize({ width: 960, height: 844 })
  await expect(navigation).toBeHidden()
  await expect(page.getByRole('navigation', { name: 'Documentation navigation' })).toBeVisible()
  await expect(page.locator('.navigation-bar-example__rail')).toBeVisible()
})
