import { expect, test } from '@playwright/test'
import { selectM3Option, setM3SliderValue } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/progress-indicator')
})

test('linear indicator follows the range input and reports determinate progress accessibly', async ({
  page,
}) => {
  const progress = page.getByTestId('linear-progress')
  // progress-indicator.a11y.determinate-value
  await expect(progress).toHaveAttribute('role', 'progressbar')
  await expect(progress).toHaveAttribute('aria-label', 'File upload')
  await expect(progress).toHaveAttribute('aria-valuenow', '42')
  await expect(progress).toHaveAttribute('aria-valuemax', '100')

  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 70)
  await expect(progress).toHaveAttribute('aria-valuenow', '70')
})

test('circular animation advances without measuring CSS geometry on each frame', async ({
  page,
}) => {
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  const circular = page.getByTestId('circular-progress')
  const result = await circular.evaluate(async (element) => {
    const path = element.querySelector('.yam3x-circular-progress__indicator')!
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    const before = path.getAttribute('d')
    const original = HTMLElement.prototype.getBoundingClientRect
    let reads = 0
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.parentElement === element && this.style.width.startsWith('var(')) reads++
      return original.call(this)
    }
    try {
      for (let index = 0; index < 12; index++) await new Promise(requestAnimationFrame)
      return { reads, before, after: path.getAttribute('d') }
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })
  expect(result.after).not.toBe(result.before)
  expect(result.reads).toBe(0)
})

test('linear stop size is independent from track thickness and zero hides the stop', async ({
  page,
}) => {
  const progress = page.getByTestId('linear-progress')
  const stop = progress.locator('.yam3x-linear-progress__stop')

  await expect(stop).toHaveCSS('width', '4px')
  await progress.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty(
      '--yam3x-linear-progress-indicator-thickness',
      '8px',
    )
  })
  await expect(progress).toHaveCSS('height', '8px')
  await expect(stop).toHaveCSS('width', '4px')
  const stopSize = page.getByRole('slider', { name: 'Set stop indicator size' })
  await setM3SliderValue(stopSize, 8)
  await expect(stop).toHaveCSS('width', '8px')
  await expect(stop).toHaveCSS('height', '8px')

  await setM3SliderValue(stopSize, 0)
  await expect(progress.locator('.yam3x-linear-progress__stop')).toHaveCount(0)
})

test('linear buffer and query modes expose their distinct visual and ARIA states', async ({
  page,
}) => {
  const progress = page.getByTestId('linear-progress')
  const mode = page.getByRole('combobox', { name: 'Linear mode' })
  await selectM3Option(page, mode, 'buffer')
  await expect(progress).toHaveAttribute('aria-valuenow', '42')
  await expect(progress).toHaveClass(/yam3x-linear-progress--buffer/)
  await expect(progress.locator('.yam3x-linear-progress__buffer')).toHaveCSS('display', 'block')
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await expect(progress.locator('.yam3x-linear-progress__buffer')).toHaveCSS('height', '4px')
  await expect(progress.locator('.yam3x-linear-progress__buffer')).toHaveCSS(
    'background-image',
    /radial-gradient/,
  )
  await expect(progress.locator('.yam3x-linear-progress__stop')).toHaveCSS('right', '0px')
  const bufferLayout = await progress.evaluate((element) => {
    const track = element.querySelector('.yam3x-linear-progress__track')!
    const buffer = element.querySelector('.yam3x-linear-progress__buffer')!
    return {
      activeEnd: element.getBoundingClientRect().width * 0.42,
      solidStart: Number.parseFloat(getComputedStyle(track, '::before').left),
      dotsStart: Number.parseFloat(getComputedStyle(buffer).left),
    }
  })
  expect(bufferLayout.solidStart).toBeGreaterThan(bufferLayout.activeEnd)
  expect(bufferLayout.dotsStart).toBeGreaterThan(bufferLayout.solidStart)
  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 90)
  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 42)
  await page.getByRole('checkbox', { name: 'Wavy style' }).uncheck()
  await selectM3Option(page, mode, 'query')
  await expect(progress).not.toHaveAttribute('aria-valuenow')
  await expect(progress).toHaveClass(/yam3x-linear-progress--query/)
  await expect(progress.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'animation-name',
    /^yam3x-progress-linear/,
  )
  await expect(progress.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'animation-duration',
    '2.1s',
  )
  await expect(progress.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'animation-timing-function',
    'linear',
  )
  await expect(progress.locator('.yam3x-linear-progress__secondary')).toHaveCSS(
    'animation-delay',
    '1.15s',
  )
  await expect(progress.locator('.yam3x-linear-progress__secondary')).toHaveCSS('display', 'block')
  await expect(progress.locator('.yam3x-linear-progress__secondary')).toHaveCSS(
    'background-color',
    await progress.evaluate((element) => getComputedStyle(element).color),
  )
  const track = progress.locator('.yam3x-linear-progress__track')
  await expect(track).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)')
  // progress-indicator.direction.rtl
  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await expect(track).toHaveCSS('transform', 'none')
  await selectM3Option(page, mode, 'indeterminate')
  await expect(track).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)')
})

test('flat and wavy variants and circular progress retain dimensions and reduced-motion fallback', async ({
  page,
}) => {
  const linear = page.getByTestId('linear-progress')
  const circular = page.getByTestId('circular-progress')
  // progress-indicator.geometry.linear
  await expect(linear).toHaveCSS('height', '4px')
  await expect(linear.locator('.yam3x-linear-progress__track')).toHaveCSS('border-radius', '4px')
  await expect(circular).toHaveCSS('width', '40px')
  await expect(circular.locator('path.yam3x-circular-progress__indicator')).toBeVisible()
  await expect(circular.locator('path.yam3x-circular-progress__track')).toBeVisible()
  await expect(circular.locator('path.yam3x-circular-progress__track')).not.toHaveCSS(
    'stroke',
    'rgba(0, 0, 0, 0)',
  )
  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 0)
  await expect(circular.locator('path.yam3x-circular-progress__indicator')).toHaveCount(0)
  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 100)
  await expect(circular.locator('path.yam3x-circular-progress__indicator')).toBeVisible()
  await expect(circular.locator('path.yam3x-circular-progress__track')).toHaveCount(0)
  await setM3SliderValue(page.getByRole('slider', { name: 'Set progress' }), 42)
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await expect(linear).toHaveClass(/yam3x-linear-progress--wavy/)
  await expect(linear).toHaveCSS('height', '10px')
  await expect(circular).toHaveClass(/yam3x-circular-progress--wavy/)
  await expect(circular.locator('path.yam3x-circular-progress__track')).not.toHaveCSS(
    'stroke',
    'rgba(0, 0, 0, 0)',
  )
  await page.getByRole('checkbox', { name: 'Circular indeterminate progress' }).check()
  const spinner = page.locator(
    '.yam3x-circular-progress--indeterminate .yam3x-circular-progress__indicator',
  )
  await expect(page.locator('.yam3x-circular-progress--indeterminate')).not.toHaveAttribute(
    'aria-valuenow',
  )
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await expect(spinner).toHaveCSS('animation-name', 'none')
  await expect(linear.locator('.yam3x-linear-progress__track')).toBeVisible()
})

test('linear logical progress and indeterminate motion adapt to RTL and reduced motion', async ({
  page,
}) => {
  const progress = page.getByTestId('linear-progress')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Linear mode' }), 'indeterminate')
  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await expect(progress).not.toHaveAttribute('aria-valuenow')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(progress.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'animation-name',
    'none',
  )
})

test('circular determinate progress interpolates visually while ARIA updates immediately', async ({
  page,
}) => {
  const circular = page.getByTestId('circular-progress')
  const slider = page.getByRole('slider', { name: 'Set progress' })
  const arcLength = () =>
    circular
      .locator('path.yam3x-circular-progress__indicator')
      .evaluate((element) => (element as SVGPathElement).getTotalLength())

  for (const wavy of [false, true]) {
    if (wavy) await page.getByRole('checkbox', { name: 'Wavy style' }).check()
    await setM3SliderValue(slider, 20)
    await page.waitForTimeout(550)
    const start = await arcLength()
    await setM3SliderValue(slider, 80)
    await expect(circular).toHaveAttribute('aria-valuenow', '80')
    await page.waitForTimeout(150)
    const middle = await arcLength()
    await page.waitForTimeout(450)
    const finish = await arcLength()
    expect(middle).toBeGreaterThan(start)
    expect(finish).toBeGreaterThan(middle)
  }

  // progress-indicator.motion.reduced
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(50)
  await setM3SliderValue(slider, 20)
  await expect(circular).toHaveAttribute('aria-valuenow', '20')
  await expect.poll(arcLength).toBeLessThan(80)
  const reduced = await arcLength()
  await page.waitForTimeout(100)
  expect(await arcLength()).toBeCloseTo(reduced, 1)
})

test('progress colors keep the active indicator distinct in light and dark themes', async ({
  page,
}) => {
  // progress-indicator.color.contrast
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
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, enabled) => element.classList.toggle('dark', enabled), dark)
    for (const wavy of [false, true]) {
      if (wavy) await page.getByRole('checkbox', { name: 'Wavy style' }).check()
      else await page.getByRole('checkbox', { name: 'Wavy style' }).uncheck()
      const colors = await page.getByTestId('circular-progress').evaluate((element) => ({
        active: getComputedStyle(element.querySelector('.yam3x-circular-progress__indicator')!)
          .stroke,
        track: getComputedStyle(element.querySelector('.yam3x-circular-progress__track')!).stroke,
        background: getComputedStyle(element.closest('.yam3x-demo')!).backgroundColor,
      }))
      expect(contrast(colors.active, colors.background)).toBeGreaterThanOrEqual(3)
      expect(contrast(colors.active, colors.track)).toBeGreaterThanOrEqual(3)
      const linearColors = await page.getByTestId('linear-progress').evaluate((element, isWavy) => {
        const indicator = element.querySelector('.yam3x-linear-progress__indicator')!
        return {
          active: isWavy
            ? getComputedStyle(indicator.querySelector('path')!).stroke
            : getComputedStyle(indicator).backgroundColor,
          track: getComputedStyle(
            element.querySelector('.yam3x-linear-progress__track')!,
            '::before',
          ).backgroundColor,
          background: getComputedStyle(element.closest('.yam3x-demo')!).backgroundColor,
        }
      }, wavy)
      expect(contrast(linearColors.active, linearColors.background)).toBeGreaterThanOrEqual(3)
      expect(contrast(linearColors.active, linearColors.track)).toBeGreaterThanOrEqual(3)
    }
  }
})

test('hidden state and forced colors preserve passive progress semantics and painted arcs', async ({
  page,
}) => {
  const linear = page.getByTestId('linear-progress')
  const circular = page.getByTestId('circular-progress')
  await expect(linear).toHaveAttribute('role', 'progressbar')
  await expect(circular).toHaveAttribute('role', 'progressbar')
  expect(await circular.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1)
  await expect(circular.locator('svg.yam3x-circular-progress__graphic')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(circular.locator('.yam3x-circular-progress__content')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(circular.locator('.yam3x-circular-progress__content')).toHaveAttribute('inert', '')

  await circular.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(circular).toBeHidden()
  await expect(page.getByRole('progressbar', { name: 'Completed tasks' })).toHaveCount(0)
  await circular.evaluate((element) => element.removeAttribute('hidden'))
  await linear.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(linear).toBeHidden()
  await expect(page.getByRole('progressbar', { name: 'File upload' })).toHaveCount(0)
  await linear.evaluate((element) => element.removeAttribute('hidden'))

  await page.emulateMedia({ forcedColors: 'active' })
  const colors = await circular.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'CanvasText'
    document.body.append(probe)
    const active = getComputedStyle(probe).color
    probe.style.color = 'GrayText'
    const track = getComputedStyle(probe).color
    probe.remove()
    return {
      expected: { active, track },
      actual: {
        active: getComputedStyle(element.querySelector('.yam3x-circular-progress__indicator')!)
          .stroke,
        track: getComputedStyle(element.querySelector('.yam3x-circular-progress__track')!).stroke,
      },
    }
  })
  expect(colors.actual).toEqual(colors.expected)
  await expect(linear.locator('.yam3x-linear-progress__track')).toHaveCSS('outline-width', '1px')
})

test('circular size, thickness, waveform, and colors respond to m3e style hooks', async ({
  page,
}) => {
  const circular = page.getByTestId('circular-progress')
  await circular.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--yam3x-circular-flat-progress-indicator-diameter', '64px')
    host.style.setProperty('--yam3x-circular-progress-indicator-thickness', '8px')
    host.style.setProperty('--yam3x-progress-indicator-color', 'rgb(12, 34, 56)')
  })
  await expect(circular).toHaveCSS('width', '64px')
  const circularIndicator = circular.locator('path.yam3x-circular-progress__indicator')
  await expect(circularIndicator).toHaveAttribute('d', /M /)
  await expect(circularIndicator).toHaveCSS('stroke-width', '8px')
  await expect(circular).toHaveCSS('color', 'rgb(12, 34, 56)')
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await circular.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--yam3x-circular-wavy-progress-indicator-diameter', '72px')
    host.style.setProperty('--yam3x-circular-wavy-progress-indicator-amplitude', '3px')
    host.style.setProperty('--yam3x-circular-wavy-progress-indicator-wavelength', '8px')
  })
  await expect(circular).toHaveCSS('width', '72px')
  await expect(circular.locator('svg')).toHaveAttribute('viewBox', '0 0 86 86')
  const wavePath = circular.locator('path.yam3x-circular-progress__indicator')
  await expect(wavePath).toHaveAttribute('d', /M /)
  const firstWavePath = await wavePath.getAttribute('d')
  await expect.poll(async () => wavePath.getAttribute('d')).not.toBe(firstWavePath)
})

test('linear geometry and shared colors respond to the remaining m3e style hooks', async ({
  page,
}) => {
  const linear = page.getByTestId('linear-progress')
  await linear.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--yam3x-linear-progress-indicator-thickness', '8px')
    host.style.setProperty('--yam3x-linear-progress-indicator-shape', '2px')
    host.style.setProperty('--yam3x-progress-indicator-color', 'rgb(12, 34, 56)')
    host.style.setProperty('--yam3x-progress-indicator-track-color', 'rgb(78, 90, 102)')
  })
  await expect(linear).toHaveCSS('height', '8px')
  await expect(linear.locator('.yam3x-linear-progress__track')).toHaveCSS('border-radius', '2px')
  await expect(linear.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'background-color',
    'rgb(12, 34, 56)',
  )
  await expect
    .poll(() =>
      linear
        .locator('.yam3x-linear-progress__track')
        .evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
    )
    .toBe('rgb(78, 90, 102)')
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await linear.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-linear-wavy-progress-indicator-amplitude',
      '5px',
    ),
  )
  await expect(linear).toHaveCSS('height', '18px')
  await expect(linear.locator('.yam3x-linear-progress__wave')).toHaveAttribute('height', '18')
  await linear.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-linear-wavy-progress-indicator-amplitude',
      '0px',
    ),
  )
  await expect(linear).toHaveClass(/yam3x-linear-progress--flat/)
  await expect(linear.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'background-color',
    'rgb(12, 34, 56)',
  )
  await selectM3Option(page, page.getByRole('combobox', { name: 'Linear mode' }), 'indeterminate')
  await expect(linear.locator('.yam3x-linear-progress__indicator')).toHaveCSS(
    'animation-name',
    /^yam3x-progress-linear/,
  )
  await expect(linear.locator('.yam3x-linear-progress__indeterminate-graphic')).toHaveCount(0)
})

test('wavy linear progress clips its generated waveform to the determinate value', async ({
  page,
}) => {
  const linear = page.getByTestId('linear-progress')
  const indicator = linear.locator('.yam3x-linear-progress__indicator')
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await expect(linear.locator('.yam3x-linear-progress__track')).toHaveCSS('height', '10px')
  await expect(indicator.locator('svg')).toHaveAttribute('viewBox', /0 0 [\d.]+ 10$/)
  await expect(indicator.locator('.yam3x-linear-progress__wave path')).toHaveCSS(
    'animation-duration',
    '1s',
  )
  const activeWidth = await indicator.evaluate((element) => getComputedStyle(element).width)
  const trackWidth = await linear
    .locator('.yam3x-linear-progress__track')
    .evaluate((element) => element.clientWidth)
  expect(Number.parseFloat(activeWidth)).toBeCloseTo(trackWidth * 0.42, 0)
  const firstWidth = await indicator.locator('svg').getAttribute('width')

  await linear.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-linear-wavy-progress-indicator-wavelength',
      '12px',
    ),
  )
  const secondWidth = await indicator.locator('svg').getAttribute('width')
  expect(Number(firstWidth) - Number(secondWidth)).toBeCloseTo(84, 0)
  await expect
    .poll(async () => {
      const width = await indicator.evaluate((element) => element.getBoundingClientRect().width)
      return Math.abs(width - trackWidth * 0.42)
    })
    .toBeLessThan(1)

  await selectM3Option(page, page.getByRole('combobox', { name: 'Linear mode' }), 'indeterminate')
  const graphic = linear.locator('.yam3x-linear-progress__indeterminate-graphic')
  await expect(graphic).toBeVisible()
  await expect(indicator).toHaveCount(0)
  const track = linear.locator('.yam3x-linear-progress__track')
  await expect
    .poll(async () => track.evaluate((element) => getComputedStyle(element, '::before').display))
    .toBe('none')
  const indeterminateWave = graphic.locator('.yam3x-linear-progress__indeterminate-wave').first()
  await expect.poll(async () => indeterminateWave.getAttribute('d')).toMatch(/^M /)
  const indeterminatePath = await indeterminateWave.getAttribute('d')
  await linear.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-linear-wavy-indeterminate-progress-indicator-wavelength',
      '16px',
    ),
  )
  await expect.poll(async () => indeterminateWave.getAttribute('d')).not.toBe(indeterminatePath)
})

test('wavy indeterminate uses one global wave path for both moving segments', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  await selectM3Option(page, page.getByRole('combobox', { name: 'Linear mode' }), 'indeterminate')
  const progress = page.getByTestId('linear-progress')
  await expect(progress).toHaveCSS('--_yam3x-linear-progress-indeterminate-wave-wavelength', '20px')
  const graphic = progress.locator('.yam3x-linear-progress__indeterminate-graphic')
  await expect(graphic.locator('path')).toHaveCount(3)
  await expect
    .poll(async () =>
      graphic
        .locator('.yam3x-linear-progress__indeterminate-wave')
        .evaluateAll((paths) => paths.filter((path) => path.getAttribute('d')).length),
    )
    .toBeGreaterThan(0)
  const firstFrame = await graphic
    .locator('.yam3x-linear-progress__indeterminate-wave')
    .first()
    .getAttribute('d')
  await expect
    .poll(async () =>
      graphic.locator('.yam3x-linear-progress__indeterminate-wave').first().getAttribute('d'),
    )
    .not.toBe(firstFrame)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(50)
  const reducedFrame = await graphic
    .locator('.yam3x-linear-progress__indeterminate-wave')
    .first()
    .getAttribute('d')
  await page.waitForTimeout(100)
  await expect(
    graphic.locator('.yam3x-linear-progress__indeterminate-wave').first(),
  ).toHaveAttribute('d', reducedFrame!)
})

test('circular indeterminate motion uses the flat and wavy m3e timing layers', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Circular indeterminate progress' }).check()
  await expect(page.locator('.yam3x-circular-progress__rotation')).toHaveCSS(
    'animation-duration',
    '1.568s',
  )
  await expect(page.locator('.yam3x-circular-progress__spinner')).toHaveCSS(
    'animation-duration',
    '5.332s',
  )
  const flat = page.locator('.yam3x-circular-progress--flat.yam3x-circular-progress--indeterminate')
  const halves = flat.locator('.yam3x-circular-progress__half')
  await expect(halves).toHaveCount(2)
  await expect(halves.first()).toHaveCSS('width', '20px')
  await expect(flat.locator('.yam3x-circular-progress__arc')).toHaveCount(2)
  await expect(flat.locator('.yam3x-circular-progress__arc').first()).toHaveCSS(
    'animation-name',
    /^yam3x-progress-circular-expand/,
  )
  await expect(flat.locator('.yam3x-circular-progress__arc').first()).toHaveCSS(
    'animation-duration',
    '1.333s',
  )
  await expect(flat.locator('.yam3x-circular-progress__arc').last()).toHaveCSS(
    'animation-delay',
    '-0.6665s',
  )
  const flatTrack = flat.locator(
    ':scope > .yam3x-circular-progress__graphic > circle.yam3x-circular-progress__track',
  )
  await expect(flatTrack).toBeVisible()
  await expect(flatTrack).toHaveAttribute('cx', '20')
  await expect(flatTrack).toHaveAttribute('cy', '20')
  await expect(flatTrack).toHaveAttribute('r', '18')
  await expect(flatTrack).toHaveAttribute('pathLength', '100')
  await expect(flatTrack).not.toHaveCSS('stroke', 'rgba(0, 0, 0, 0)')
  const leftArc = flat.locator('.yam3x-circular-progress__half--left path')
  const rightArc = flat.locator('.yam3x-circular-progress__half--right path')
  await expect(leftArc).toHaveAttribute('d', /M .* A /)
  await expect(rightArc).toHaveAttribute('d', /M .* A /)
  await expect(leftArc).not.toHaveCSS('stroke', 'rgba(0, 0, 0, 0)')
  await expect(rightArc).not.toHaveCSS('stroke', 'rgba(0, 0, 0, 0)')
  const firstTransform = await flat
    .locator('.yam3x-circular-progress__arc')
    .first()
    .evaluate((element) => getComputedStyle(element).transform)
  await expect
    .poll(() =>
      flat
        .locator('.yam3x-circular-progress__arc')
        .first()
        .evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(firstTransform)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(flat.locator('.yam3x-circular-progress__arc').first()).toHaveCSS(
    'animation-name',
    'none',
  )
  await expect(flat.locator('.yam3x-circular-progress__track')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('checkbox', { name: 'Wavy style' }).check()
  const wavySpinner = page.locator(
    '.yam3x-circular-progress--indeterminate .yam3x-circular-progress__wavy-spinner',
  )
  await expect(wavySpinner).toHaveCSS('animation-duration', '1.575s')
  const wave = page.locator(
    '.yam3x-circular-progress--indeterminate .yam3x-circular-progress__indicator--wave',
  )
  const track = wavySpinner.locator('.yam3x-circular-progress__track')
  await expect(wave).toBeVisible()
  await expect(track).toBeVisible()
  const initialWave = await wave.getAttribute('d')
  const initialTrack = await track.getAttribute('d')
  await expect.poll(async () => wave.getAttribute('d')).not.toBe(initialWave)
  await expect.poll(async () => track.getAttribute('d')).not.toBe(initialTrack)
})
