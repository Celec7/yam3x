import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

async function openScrollFields(page: Page) {
  await page.goto('/components/scroll-field')
  await expect(page.getByRole('heading', { name: 'Scroll field', level: 1 })).toBeVisible()
}

function rgb(value: string): number[] {
  const srgb = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (srgb) return srgb.slice(1).map((part) => Math.round(Number(part) * 255))
  const legacy = value.match(/(\d+),\s*(\d+),\s*(\d+)/)
  return legacy ? legacy.slice(1).map(Number) : []
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

test('three sizes keep the measured widths and selection typography', async ({ page }) => {
  // scroll-field.geometry.sizes
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)

  const widths = [
    ['small', 100],
    ['medium', 120],
    ['large', 186],
  ] as const
  for (const [size, width] of widths) {
    const field = page.getByTestId(`scroll-field-${size}`)
    const viewport = field.locator('.yam3x-scroll-field__viewport')
    await expect(viewport).toBeVisible()
    expect((await field.boundingBox())!.width).toBe(width)
    await expect(viewport).toHaveCSS('border-radius', '16px')
    expect((await viewport.boundingBox())!.height).toBe(200)
  }

  const minutes = page.getByTestId('scroll-field-minutes')
  const selected = minutes.locator('.yam3x-scroll-field__item--active')
  await expect(selected).toHaveCSS('font-size', '57px')
  expect(rgb(await selected.evaluate((element) => getComputedStyle(element).color))).toEqual(
    rgb(await colorForRole(page, 'on-surface')),
  )
  const neighbour = minutes.locator('.yam3x-scroll-field__item').first()
  await expect(neighbour).toHaveCSS('font-size', '45px')
  expect(rgb(await neighbour.evaluate((element) => getComputedStyle(element).color))).toEqual(
    rgb(await colorForRole(page, 'outline')),
  )
})

test('the wheel is one spinbutton with keyboard selection and value text', async ({ page }) => {
  // scroll-field.selection.keyboard and scroll-field.a11y.spinbutton
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)
  const viewport = page.getByTestId('scroll-field-minutes').locator('.yam3x-scroll-field__viewport')

  await expect(viewport).toHaveAttribute('role', 'spinbutton')
  await expect(viewport).toHaveAttribute('aria-label', 'Minutes')
  await expect(viewport).toHaveAttribute('aria-valuenow', '30')
  await expect(viewport).toHaveAttribute('aria-valuemin', '0')
  await expect(viewport).toHaveAttribute('aria-valuemax', '59')
  await expect(viewport).toHaveAttribute('aria-valuetext', '30 minutes')

  await viewport.focus()
  await page.keyboard.press('ArrowUp')
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('29')
  await page.keyboard.press('ArrowDown')
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('30')
  await page.keyboard.press('Home')
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('0')
  await page.keyboard.press('End')
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('59')
})

async function expectSettled(viewport: Locator) {
  let previous = Number.NaN
  await expect
    .poll(
      async () => {
        const top = await viewport.evaluate((element) => element.scrollTop)
        const stable = Math.abs(top - previous) < 0.5
        previous = top
        return stable
      },
      { intervals: [40, 60, 80, 100, 120, 160] },
    )
    .toBe(true)
}

test('looping wraps keyboard and pointer selection', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)
  const field = page.getByTestId('scroll-field-loop')
  const viewport = field.locator('.yam3x-scroll-field__viewport')

  await viewport.focus()
  for (const expected of ['8', '9', '0']) {
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe(expected)
  }
  await page.keyboard.press('ArrowUp')
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('9')
  await expectSettled(viewport)

  await field.locator('.yam3x-scroll-field__item[data-value="7"]').click()
  await expect.poll(() => viewport.getAttribute('aria-valuenow')).toBe('7')
  await expect(field.locator('.yam3x-scroll-field__item--active')).toHaveText('7')
})

test('mouse drag scrolls the wheel and snaps to a value', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)
  const viewport = page.getByTestId('scroll-field-minutes').locator('.yam3x-scroll-field__viewport')
  const box = (await viewport.boundingBox())!
  const startTop = await viewport.evaluate((element) => element.scrollTop)

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 150, { steps: 6 })
  const draggedTop = await viewport.evaluate((element) => element.scrollTop)
  expect(draggedTop).toBeGreaterThan(startTop)
  await page.mouse.up()

  await expect.poll(() => viewport.getAttribute('aria-valuenow')).not.toBe('30')
  await expectSettled(viewport)
  const settledTop = await viewport.evaluate((element) => element.scrollTop)
  expect(settledTop % 80).toBeCloseTo(0, 0)
})

test('text input commits valid values and rejects out-of-range drafts', async ({ page }) => {
  // scroll-field.input.validation
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)
  const field = page.getByTestId('scroll-field-input')
  const toggle = page.getByTestId('scroll-field-mode')

  await toggle.click()
  const input = field.locator('input.yam3x-scroll-field__input')
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('15')
  await expect(input).toHaveAttribute('role', 'spinbutton')
  await expect(field.locator('.yam3x-scroll-field__control')).toHaveCSS(
    'border-color',
    await colorForRole(page, 'primary'),
  )

  await input.fill('75')
  await page.keyboard.press('Enter')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAttribute('aria-valuenow', '15')
  await expect(field.locator('.yam3x-scroll-field__error')).toContainText('rangeOverflow')

  await input.fill('45')
  await page.keyboard.press('Enter')
  await expect(input).toHaveAttribute('aria-valuenow', '45')
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await expect(field.locator('.yam3x-scroll-field__error')).toHaveCount(0)

  await toggle.click()
  await expect(field.locator('.yam3x-scroll-field__item--active')).toHaveText('45')
})

test('disabled fields keep their value at 38% and leave the tab order', async ({ page }) => {
  // scroll-field.state.disabled
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openScrollFields(page)
  const field = page.getByTestId('scroll-field-disabled')
  const viewport = field.locator('.yam3x-scroll-field__viewport')

  await expect(field).toHaveCSS('opacity', '0.38')
  await expect(viewport).toHaveAttribute('tabindex', '-1')
  await expect(viewport).toHaveAttribute('aria-disabled', 'true')
  await expect(viewport).toHaveCSS('pointer-events', 'none')
})

test('reduced motion removes selection transitions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openScrollFields(page)
  const frame = page.getByTestId('scroll-field-minutes').locator('.yam3x-scroll-field__frame')
  const transition = await frame.evaluate(
    (element) => getComputedStyle(element, '::before').transitionProperty,
  )
  expect(transition).toBe('none')
})
