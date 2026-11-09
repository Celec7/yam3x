import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/slider')
})

test('standard slider keeps both track segments and responds to keyboard', async ({ page }) => {
  // slider.a11y.keyboard
  const slider = page.getByTestId('slider')
  const input = page.getByRole('slider', { name: 'Value' })
  await expect(input).toHaveValue('46')
  await expect(slider.locator('.yam3x-slider__active')).toBeVisible()
  await expect(slider.locator('.yam3x-slider__inactive--after')).toBeVisible()
  const track = await slider.locator('.yam3x-slider__track').boundingBox()
  const active = await slider.locator('.yam3x-slider__active').boundingBox()
  const inactive = await slider.locator('.yam3x-slider__inactive--after').boundingBox()
  expect(track && active && inactive).toBeTruthy()
  expect(active!.width).toBeGreaterThan(0)
  expect(inactive!.width).toBeGreaterThan(0)
  expect(active!.x + active!.width).toBeLessThan(inactive!.x)
  await input.focus()
  await input.press('ArrowRight')
  await expect(input).toHaveValue('47')
  await expect(page.locator('.slider-demo output')).toHaveText('47')
  await input.press('Home')
  await expect(input).toHaveValue('0')
  await input.press('End')
  await expect(input).toHaveValue('100')
})

test('sizes, centered track, vertical direction, and RTL change geometry', async ({ page }) => {
  // slider.geometry.sizes
  const slider = page.getByTestId('slider')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider size' }), 'extra-large')
  await expect(slider.locator('.yam3x-slider__track')).toHaveCSS('height', '96px')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider mode' }), 'centered')
  await expect(slider.locator('.yam3x-slider__inactive--before')).toBeVisible()
  await expect(slider.locator('.yam3x-slider__inactive--after')).toBeVisible()
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider orientation' }), 'vertical')
  const input = page.getByRole('slider', { name: 'Value' })
  await input.focus()
  await input.press('ArrowUp')
  await expect(input).toHaveValue('47')
  await input.press('ArrowDown')
  await expect(input).toHaveValue('46')
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'Slider orientation' }),
    'horizontal',
  )
  await slider.evaluate((element) => ((element as HTMLElement).dir = 'rtl'))
  await input.press('ArrowLeft')
  await expect(input).toHaveValue('47')
})

test('range exposes independent handles and maintains ordered values', async ({ page }) => {
  // slider.selection.range
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider mode' }), 'range')
  const min = page.getByRole('slider', { name: 'Select range minimum' })
  const max = page.getByRole('slider', { name: 'Select range maximum' })
  await expect(min).toHaveValue('25')
  await expect(max).toHaveValue('75')
  await min.focus()
  await min.press('End')
  await expect(min).toHaveValue('75')
  await max.focus()
  await max.press('Home')
  await expect(max).toHaveValue('75')
  await expect(page.locator('.slider-demo output')).toHaveText('75–75')
})

test('vertical stop indicators stay centered on the track', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Show stops' }).check()
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider orientation' }), 'vertical')
  const slider = page.getByTestId('slider').first()
  const geometry = await slider.evaluate((element) => {
    const track = element.querySelector('.yam3x-slider__track')!.getBoundingClientRect()
    const markers = [
      ...element.querySelectorAll('.yam3x-slider__tick'),
      ...element.querySelectorAll('.yam3x-slider__end-stop'),
    ]
      .map((tick) => tick.getBoundingClientRect())
      .sort((left, right) => left.top - right.top)
    const thumb = element.querySelector('.yam3x-slider__thumb')!.getBoundingClientRect()
    return {
      trackCenter: track.x + track.width / 2,
      thumbCenter: thumb.y + thumb.height / 2,
      markerCenters: markers.map((tick) => tick.x + tick.width / 2),
      markerRows: markers.map((tick) => tick.y + tick.height / 2),
      gaps: markers.slice(1).map((tick, index) => tick.top - markers[index]!.top),
    }
  })
  for (const center of geometry.markerCenters)
    expect(Math.abs(geometry.trackCenter - center)).toBeLessThanOrEqual(0.5)
  const smallestGap = Math.min(...geometry.gaps)
  const largestGap = Math.max(...geometry.gaps)
  for (const gap of geometry.gaps) {
    expect(gap === largestGap || Math.abs(gap - smallestGap) <= 0.5).toBe(true)
  }
  expect(largestGap).toBeLessThanOrEqual(smallestGap * 2 + 0.5)
  expect(geometry.markerRows.some((row) => Math.abs(row - geometry.thumbCenter) <= 2)).toBe(false)
  const nearestToHandle = Math.min(
    ...geometry.markerRows.map((row) => Math.abs(row - geometry.thumbCenter)),
  )
  expect(Math.abs(nearestToHandle - smallestGap)).toBeLessThanOrEqual(0.5)
})

test('stops use the end-cap span and the end stop replaces the last tick', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Show stops' }).check()
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider size' }), 'large')
  const slider = page.getByTestId('slider').first()
  const input = page.getByRole('slider', { name: 'Value' })
  await input.focus()
  await input.press('Home')
  for (let index = 0; index < 3; index += 1) await input.press('ArrowRight')
  await expect(input).toHaveValue('30')
  const geometry = await slider.evaluate((element) => {
    const track = element.querySelector('.yam3x-slider__track')!.getBoundingClientRect()
    const tickRows = [...element.querySelectorAll('.yam3x-slider__tick')].map((tick) => {
      const box = tick.getBoundingClientRect()
      return box.x + box.width / 2
    })
    const end = element.querySelector('.yam3x-slider__end-stop')!.getBoundingClientRect()
    const thumb = element.querySelector('.yam3x-slider__thumb')!.getBoundingClientRect()
    const radius = Number.parseFloat(
      getComputedStyle(element.querySelector('.yam3x-slider__inactive--after')!)
        .borderTopRightRadius,
    )
    return {
      trackLeft: track.left,
      trackWidth: track.width,
      radius,
      tickRows,
      endCenter: end.x + end.width / 2,
      thumbCenter: thumb.x + thumb.width / 2,
    }
  })
  const expected =
    geometry.trackLeft + geometry.radius + (geometry.trackWidth - geometry.radius * 2) * 0.3
  expect(Math.abs(geometry.thumbCenter - expected)).toBeLessThanOrEqual(0.5)
  expect(
    Math.abs(geometry.endCenter - (geometry.trackLeft + geometry.trackWidth - geometry.radius)),
  ).toBeLessThanOrEqual(0.5)
  expect(geometry.tickRows).toHaveLength(9)
  const stopValues = [0, 10, 20, 40, 50, 60, 70, 80, 90]
  for (const [index, value] of stopValues.entries()) {
    const center =
      geometry.trackLeft +
      geometry.radius +
      (geometry.trackWidth - geometry.radius * 2) * (value / 100)
    expect(Math.abs(geometry.tickRows[index]! - center)).toBeLessThanOrEqual(0.5)
  }
  await input.press('Home')
  const minimum = await slider.evaluate((element) => {
    const track = element.querySelector('.yam3x-slider__track')!.getBoundingClientRect()
    const thumb = element.querySelector('.yam3x-slider__thumb')!.getBoundingClientRect()
    const tick = element.querySelector('.yam3x-slider__tick')!.getBoundingClientRect()
    return {
      trackLeft: track.left,
      radius: parseFloat(
        getComputedStyle(element.querySelector('.yam3x-slider__inactive--after')!)
          .borderTopRightRadius,
      ),
      thumbCenter: thumb.left + thumb.width / 2,
      firstTickCenter: tick.left + tick.width / 2,
    }
  })
  expect(Math.abs(minimum.thumbCenter - minimum.trackLeft)).toBeLessThanOrEqual(0.5)
  expect(
    Math.abs(minimum.firstTickCenter - (minimum.trackLeft + minimum.radius)),
  ).toBeLessThanOrEqual(0.5)
})

test('centered and range sliders keep an end stop at each inactive end', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Show stops' }).check()
  const slider = page.getByTestId('slider').first()
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider mode' }), 'centered')
  await expect(slider.locator('.yam3x-slider__end-stop')).toHaveCount(2)
  await selectM3Option(page, page.getByRole('combobox', { name: 'Slider mode' }), 'range')
  await expect(slider.locator('.yam3x-slider__end-stop')).toHaveCount(2)
})

test('stops snap, labels show on focus, and disabled blocks input', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Show stops' }).check()
  const slider = page.getByTestId('slider')
  const input = page.getByRole('slider', { name: 'Value' })
  await expect(input).toHaveValue('50')
  await input.focus()
  const valueLabel = slider.locator('.yam3x-slider__label')
  await expect(valueLabel).toHaveText('50')
  await expect(valueLabel).toHaveCSS('font-size', '14px')
  await expect(valueLabel).toHaveCSS('font-weight', '400')
  await expect(valueLabel).toHaveCSS('line-height', '20px')
  await expect(valueLabel).toHaveCSS('letter-spacing', '0.5px')
  await input.press('ArrowRight')
  await expect(input).toHaveValue('60')
  await page.getByRole('checkbox', { name: 'Disabled' }).check()
  await expect(input).toBeDisabled()
  await expect(slider.locator('.yam3x-slider__label')).toHaveCount(0)
})

test('pointer drag emits cancelable updates and commits once', async ({ page }) => {
  const slider = page.getByTestId('slider')
  const track = slider.locator('.yam3x-slider__track')
  const rect = await track.boundingBox()
  expect(rect).toBeTruthy()
  await slider.evaluate((element) => {
    const state = window as typeof window & { sliderEvents?: string[] }
    state.sliderEvents = []
    for (const type of ['beforeinput', 'input', 'change'])
      element.addEventListener(type, () => state.sliderEvents?.push(type))
  })
  await page.mouse.move(rect!.x + rect!.width * 0.3, rect!.y + rect!.height / 2)
  await page.mouse.down()
  await page.mouse.move(rect!.x + rect!.width * 0.7, rect!.y + rect!.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByRole('slider', { name: 'Value' })).toHaveValue('70')
  const events = await page.evaluate(
    () => (window as typeof window & { sliderEvents?: string[] }).sliderEvents ?? [],
  )
  expect(events.filter((type) => type === 'beforeinput').length).toBeGreaterThan(1)
  expect(events.filter((type) => type === 'input').length).toBeGreaterThan(1)
  expect(events.filter((type) => type === 'change')).toHaveLength(1)
  await slider.evaluate((element) =>
    element.addEventListener('beforeinput', (event) => event.preventDefault()),
  )
  await page.getByRole('slider', { name: 'Value' }).press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Value' })).toHaveValue('70')
})

test('focus and disabled stop indicators use their component state tokens', async ({ page }) => {
  // slider.state.focused-handle; slider.state.disabled-stops
  const slider = page.getByTestId('slider')
  await slider.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--md-sys-color-on-surface', 'rgb(10, 20, 30)')
    style.setProperty('--md-sys-color-inverse-on-surface', 'rgb(40, 50, 60)')
  })
  const input = page.getByRole('slider', { name: 'Value' })
  await input.focus()
  await expect(slider.locator('.yam3x-slider__handle')).toHaveCSS('width', '2px')

  await page.getByRole('checkbox', { name: 'Show stops' }).check()
  await page.getByRole('checkbox', { name: 'Disabled' }).check()
  const activeTick = slider.locator('.yam3x-slider__tick--active').first()
  const inactiveTick = slider
    .locator('.yam3x-slider__tick:not(.yam3x-slider__tick--active)')
    .first()
  await expect(activeTick).toHaveCSS('background-color', 'rgb(40, 50, 60)')
  await expect(activeTick).toHaveCSS('opacity', '0.38')
  await expect(inactiveTick).toHaveCSS('background-color', 'rgb(10, 20, 30)')
  await expect(inactiveTick).toHaveCSS('opacity', '0.38')
})

test('end anchor and focus remain visible in both themes and forced colors', async ({ page }) => {
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
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
    return (values[0] + 0.05) / (values[1] + 0.05)
  }
  const slider = page.getByTestId('slider')
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, enabled) => element.classList.toggle('dark', enabled), dark)
    const colors = await slider.evaluate((element) => ({
      anchor: getComputedStyle(element.querySelector('.yam3x-slider__end-stop')!).backgroundColor,
      background: getComputedStyle(element.closest('.yam3x-demo')!).backgroundColor,
    }))
    expect(contrast(colors.anchor, colors.background)).toBeGreaterThanOrEqual(3)
  }
  await page.emulateMedia({ forcedColors: 'active' })
  const input = page.getByRole('slider', { name: 'Value' })
  await input.focus()
  await expect(slider.locator('.yam3x-slider__thumb')).toHaveCSS('width', '48px')
  const painted = await slider.evaluate((element) => ({
    active: getComputedStyle(element.querySelector('.yam3x-slider__active')!).backgroundColor,
    inactive: getComputedStyle(element.querySelector('.yam3x-slider__inactive--after')!)
      .backgroundColor,
    focus: getComputedStyle(element.querySelector('.yam3x-slider__thumb')!, '::after')
      .borderTopWidth,
  }))
  expect(painted.active).not.toBe(painted.inactive)
  expect(painted.focus).toBe('3px')
  await slider.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(page.getByRole('slider', { name: 'Value' })).toHaveCount(0)
})
