import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test('connected button group demonstrates compact geometry and expanded touch targets', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const buttons = group.locator('.yam3x-button-group__item .yam3x-button')
  await expect(group).toHaveClass(/yam3x-button-group--connected/)
  await expect(buttons).toHaveCount(3)
  await expect(buttons.first()).toHaveCSS('height', '40px')
  await expect(group).toHaveCSS('column-gap', '2px')
  await expect(buttons.nth(0)).toHaveCSS('border-top-right-radius', '20px')
  await expect(buttons.nth(1)).toHaveCSS('border-top-left-radius', '8px')
  await buttons.nth(1).click()
  await expect(buttons.nth(1)).toHaveCSS('border-top-left-radius', '20px')
  await expect(buttons.nth(1)).toHaveCSS('border-top-right-radius', '20px')
  await expect(buttons.nth(0)).toHaveCSS('border-top-right-radius', '8px')

  for (const button of await buttons.all()) {
    const target = await button.evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) }
    })
    expect(target.width).toBeGreaterThanOrEqual(48)
    expect(target.height).toBeGreaterThanOrEqual(48)
  }
})

test('button group keyboard navigation skips disabled options and changes one selection', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const list = group.getByRole('radio', { name: 'List' })
  const grid = group.getByRole('radio', { name: 'Grid' })
  const map = group.getByRole('radio', { name: 'Map' })

  await expect(list).toHaveAttribute('aria-checked', 'true')
  await expect(map).toBeDisabled()
  await list.focus()
  await page.keyboard.press('ArrowRight')
  await expect(grid).toBeFocused()
  await expect(grid).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('Space')
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await expect(list).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('ArrowRight')
  await expect(list).toBeFocused()
})

test('explicit button group sizes remain effective on both sides of the compact-width breakpoint', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const button = group.locator('.yam3x-button-group__item .yam3x-button').first()
  const size = page.getByRole('combobox', { name: 'Button group size' })
  for (const [value, height] of [
    ['extra-small', '32px'],
    ['small', '40px'],
    ['medium', '56px'],
    ['large', '96px'],
    ['extra-large', '136px'],
  ]) {
    await selectM3Option(page, size, value)
    for (const width of [561, 560]) {
      await page.setViewportSize({ width, height: 800 })
      await expect(button).toHaveCSS('min-height', height)
    }
  }
})

test('standard button group width responds with the spring and remains still for reduced motion', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('group', { name: 'Text formatting' })
  const item = group.locator('.yam3x-button-group__item').first()
  const button = item.locator('.yam3x-icon-button')
  await button.hover()
  await page.mouse.down()
  await expect(item).toHaveAttribute('data-group-sizing', '')
  await expect(item).toHaveCSS('transition-duration', /0\.178s/)
  await expect(item).toHaveCSS('transition-timing-function', /linear\(/)
  await page.mouse.up()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await button.hover()
  await page.mouse.down()
  await expect
    .poll(() =>
      item.evaluate((element) =>
        Math.max(
          ...getComputedStyle(element)
            .transitionDuration.split(',')
            .map((duration) => Number.parseFloat(duration) || 0),
        ),
      ),
    )
    .toBeLessThanOrEqual(0.001)
  await page.mouse.up()
})

test('multiple button group keeps its selected choices independent', async ({ page }) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('group', { name: 'Content filters' })
  const recent = group.getByRole('button', { name: 'Recent' })
  const saved = group.getByRole('button', { name: 'Saved' })
  const shared = group.getByRole('button', { name: 'Shared' })

  await expect(recent).toHaveAttribute('aria-pressed', 'true')
  await expect(saved).toHaveAttribute('aria-pressed', 'false')
  await shared.click()
  await expect(recent).toHaveAttribute('aria-pressed', 'true')
  await expect(shared).toHaveAttribute('aria-pressed', 'true')
  await saved.click()
  await expect(page.getByText(/Current filters:\s*recent, shared, saved/)).toBeVisible()
})

test('Material spatial easing overshoots while effects easing remains monotonic', async ({
  page,
}) => {
  await page.goto('/components/button')
  const curves = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      spatial: style.getPropertyValue('--md-sys-motion-easing-fast-spatial'),
      effects: style.getPropertyValue('--md-sys-motion-easing-fast-effects'),
    }
  })
  const coordinates = (curve: string) => {
    const match = curve.trim().match(/^cubic-bezier\(([^)]+)\)$/)
    expect(match).not.toBeNull()
    return match![1]!.split(',').map(Number)
  }
  const spatial = coordinates(curves.spatial)
  const effects = coordinates(curves.effects)
  expect(spatial[1]).toBeGreaterThan(1)
  expect(effects[1]).toBeGreaterThanOrEqual(0)
  expect(effects[1]).toBeLessThanOrEqual(1)
  expect(effects[3]).toBeGreaterThanOrEqual(0)
  expect(effects[3]).toBeLessThanOrEqual(1)
})

test('button corner shape transitions from rest to pressed and back without overshoot', async ({
  page,
}) => {
  await page.goto('/components/button')
  const button = page.locator('.yam3x-demo__row').first().locator('.yam3x-button').first()
  const sampleCorners = () =>
    button.evaluate(
      (element) =>
        new Promise<number[]>((resolve) => {
          const values: number[] = []
          const started = performance.now()
          const sample = () => {
            values.push(Number.parseFloat(getComputedStyle(element).borderTopLeftRadius))
            if (performance.now() - started >= 300) resolve(values)
            else requestAnimationFrame(sample)
          }
          requestAnimationFrame(sample)
        }),
    )

  await button.hover()
  await page.mouse.down()
  const pressing = await sampleCorners()
  expect(Math.min(...pressing)).toBeGreaterThanOrEqual(7.99)
  expect(Math.max(...pressing)).toBeLessThanOrEqual(20.01)
  expect(
    pressing.every((value, index) => index === 0 || value <= pressing[index - 1]! + 0.01),
  ).toBe(true)
  await expect(button).toHaveCSS('border-radius', '8px')
  await page.mouse.up()
  const releasing = await sampleCorners()
  expect(Math.min(...releasing)).toBeGreaterThanOrEqual(7.99)
  expect(Math.max(...releasing)).toBeLessThanOrEqual(20.01)
  expect(
    releasing.every((value, index) => index === 0 || value >= releasing[index - 1]! - 0.01),
  ).toBe(true)
  await expect(button).toHaveCSS('border-radius', '20px')
})

test('a compact toggle button receives touch input outside its visible surface', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto('/components/button')
    const button = page.locator('.yam3x-demo .yam3x-button[aria-pressed]').first()
    await button.scrollIntoViewIfNeeded()
    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    const hitTarget = await button.evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) }
    })
    expect(box!.height).toBe(40)
    expect(hitTarget.height).toBeGreaterThanOrEqual(48)
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y - 4)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  } finally {
    await context.close()
  }
})
