import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

const materialShapes = [
  '4-leaf-clover',
  '4-sided-cookie',
  '6-sided-cookie',
  '7-sided-cookie',
  '8-leaf-clover',
  '9-sided-cookie',
  '12-sided-cookie',
  'arch',
  'arrow',
  'boom',
  'bun',
  'burst',
  'circle',
  'diamond',
  'fan',
  'flower',
  'gem',
  'ghost-ish',
  'heart',
  'hexagon',
  'oval',
  'pentagon',
  'pill',
  'pixel-circle',
  'pixel-triangle',
  'puffy',
  'puffy-diamond',
  'semicircle',
  'slanted',
  'soft-boom',
  'soft-burst',
  'square',
  'sunny',
  'triangle',
  'very-sunny',
]

test.beforeEach(async ({ page }) => {
  await page.goto('/components/shape')
})

test('Shape renders 35 Material names with project-adapted clipped paths', async ({ page }) => {
  const gallery = page.locator('.shape-demo__gallery')
  const items = gallery.locator('.shape-demo__item')
  // shape.library.names
  await expect(items).toHaveCount(35)
  const names = await gallery
    .locator('.yam3x-shape')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-name')))
  expect([...names].sort()).toEqual([...materialShapes].sort())

  for (const name of materialShapes) {
    const shape = gallery.locator(`.yam3x-shape[data-name="${name}"]`)
    const geometry = await shape.evaluate((element) => {
      const box = element.getBoundingClientRect()
      const wrapper = element.querySelector('.yam3x-shape__wrapper')!
      const wrapperBox = wrapper.getBoundingClientRect()
      const styles = getComputedStyle(wrapper)
      const clipPath = styles.clipPath
      return {
        width: box.width,
        height: box.height,
        wrapperWidth: wrapperBox.width,
        wrapperHeight: wrapperBox.height,
        clipPath,
        componentClipPath: styles.getPropertyValue('--_yam3x-shape-clip-path').trim(),
        pointCount: (clipPath.match(/%\s+[-\d.]+%/g) ?? []).length,
      }
    })
    expect(geometry.width).toBe(48)
    expect(geometry.height).toBe(48)
    expect(geometry.wrapperWidth).toBe(48)
    expect(geometry.wrapperHeight).toBe(48)
    expect(geometry.clipPath).toMatch(/^polygon\(/)
    expect(geometry.componentClipPath).toMatch(/^polygon\(/)
    // shape.extension.geometry
    expect(geometry.pointCount).toBe(120)
  }
})

test('Shape morphs between named shapes through an interpolated clip path', async ({ page }) => {
  const shape = page.locator('.shape-demo__large').first()
  const wrapper = shape.locator('.yam3x-shape__wrapper')
  // shape.motion.morph
  const initial = await wrapper.evaluate((element) => getComputedStyle(element).clipPath)
  const target = await page
    .locator('.yam3x-shape[data-name="diamond"] .yam3x-shape__wrapper')
    .first()
    .evaluate((element) => getComputedStyle(element).clipPath)
  const transition = await wrapper.evaluate((element) => {
    const styles = getComputedStyle(element)
    const root = element.closest('.yam3x-shape')!
    const motion = getComputedStyle(root)
      .getPropertyValue('--_yam3x-shape-system-motion-spring-slow-spatial')
      .trim()
    return {
      value: styles.getPropertyValue('--_yam3x-shape-transition').trim(),
      motion,
      duration: styles.transitionDuration,
    }
  })
  expect(transition.value).toBe(`clip-path ${transition.motion}`)
  expect(Number.parseFloat(transition.duration)).toBeGreaterThan(0)

  await selectM3Option(page, page.getByRole('combobox', { name: 'From shape' }), 'diamond')
  await expect
    .poll(() => wrapper.evaluate((element) => getComputedStyle(element).clipPath))
    .not.toBe(initial)
  await page.waitForTimeout(120)
  const middle = await wrapper.evaluate((element) => getComputedStyle(element).clipPath)
  await expect
    .poll(() => wrapper.evaluate((element) => getComputedStyle(element).clipPath), {
      timeout: 1000,
    })
    .toBe(target)
  expect(middle).not.toBe(initial)
  expect(middle).not.toBe(target)
  expect((middle.match(/%\s+[-\d.]+%/g) ?? []).length).toBe(120)
})

test('Shape exposes sizing, color, native semantics, and cropped media hooks', async ({ page }) => {
  const shape = page.locator('.shape-demo__large').first()
  await shape.evaluate((element) => {
    element.setAttribute('id', 'shape-image')
    element.style.setProperty('--yam3x-shape-size', '96px')
    element.style.setProperty('--yam3x-shape-container-color', 'rgb(255, 0, 0)')
  })
  await expect(shape).toHaveAttribute('id', 'shape-image')
  await expect(shape).toHaveAttribute('aria-hidden', 'true')
  await expect(shape).not.toHaveAttribute('role')
  await expect(shape).toHaveCSS('width', '96px')
  await expect(shape).toHaveCSS('height', '96px')
  await expect(shape.locator('img')).toHaveCSS('object-fit', 'cover')
  await expect(shape.locator('.yam3x-shape__wrapper')).toHaveCSS(
    'background-color',
    'rgb(255, 0, 0)',
  )
  await shape.evaluate((element) =>
    element.style.setProperty('--yam3x-shape-transition', 'clip-path 1s linear'),
  )
  const mappedTokens = await shape.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      size: styles.getPropertyValue('--_yam3x-shape-size').trim(),
      color: styles.getPropertyValue('--_yam3x-shape-container-color').trim(),
      transition: styles.getPropertyValue('--_yam3x-shape-transition').trim(),
    }
  })
  expect(mappedTokens.size).toBe('96px')
  expect(mappedTokens.color).toBe('rgb(255, 0, 0)')
  expect(mappedTokens.transition).toContain('clip-path 1s linear')
  await expect(shape.locator('.yam3x-shape__wrapper')).toHaveCSS('transition-duration', '1s')
})

test('Shape morph honors reduced motion, hidden state, and forced colors', async ({ page }) => {
  const shape = page.locator('.shape-demo__large').first()
  const wrapper = shape.locator('.yam3x-shape__wrapper')
  // shape.motion.reduced
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() =>
      wrapper.evaluate((element) => {
        const duration = getComputedStyle(element)
          .transitionDuration.split(',')
          .map((value) => Number.parseFloat(value) * (value.includes('ms') ? 1 : 1000))
        return Math.max(...duration)
      }),
    )
    .toBeLessThanOrEqual(10)

  await page.emulateMedia({ forcedColors: 'active' })
  await expect(wrapper).toBeVisible()
  await expect(wrapper).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(wrapper).not.toHaveCSS('background-color', 'rgb(255, 217, 227)')

  await shape.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(shape).toBeHidden()
  await expect(shape).toHaveCSS('display', 'none')
})
