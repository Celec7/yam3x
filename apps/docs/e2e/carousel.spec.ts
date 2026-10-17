import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/carousel')
})

test('all six carousel layouts render slides and use their documented snap defaults', async ({
  page,
}) => {
  const layout = page.getByRole('combobox', { name: 'Carousel layout' })
  const carousel = page.getByRole('group', { name: 'Featured places' })
  const track = carousel.locator('.yam3x-carousel__track')

  for (const value of [
    'multi-browse',
    'uncontained',
    'uncontained-multi-aspect-ratio',
    'hero',
    'center-aligned-hero',
  ]) {
    await selectM3Option(page, layout, value)
    await expect(carousel).toHaveClass(new RegExp(`yam3x-carousel--${value}`))
    await expect(carousel.locator('[data-carousel-index]')).toHaveCount(5)
    await expect(track).toHaveCSS(
      'scroll-snap-type',
      value.startsWith('uncontained') ? 'none' : 'x mandatory',
    )
    await expect(carousel.locator('[data-carousel-index]').first()).not.toHaveCSS('width', '0px')
  }
})

test('carousel item colors and focus feedback follow Material component mappings', async ({
  page,
}) => {
  const carousel = page.getByRole('group', { name: 'Featured places' })
  const item = carousel.locator('[data-carousel-index="0"]')
  const modeSwitch = page.getByRole('switch')
  const html = page.locator('html')
  if (await html.evaluate((element) => element.classList.contains('dark'))) await modeSwitch.click()

  const matchesSurfaceRole = () =>
    page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const item = document.querySelector<HTMLElement>('.yam3x-carousel [data-carousel-index="0"]')!
      const hex = root.getPropertyValue('--md-sys-color-surface').trim().replace('#', '')
      const value = Number.parseInt(hex, 16)
      const surface = `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
      return getComputedStyle(item).backgroundColor === surface
    })
  await expect.poll(matchesSurfaceRole).toBe(true)

  await page.getByRole('combobox', { name: 'Carousel layout' }).focus()
  await page.keyboard.press('Tab')
  await expect(item).toBeFocused()
  await expect(item).toHaveCSS('outline-width', '3px')
  await expect(item).toHaveCSS('outline-offset', '2px')
  await expect(item).toHaveCSS('outline-color', 'rgb(98, 92, 113)')
  await page.keyboard.press('ArrowRight')
  const focusedItem = carousel.locator('[data-carousel-index="1"]')
  await expect(focusedItem).toBeFocused()

  await item.hover()
  await expect
    .poll(() => item.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')

  await modeSwitch.click()
  await expect(html).toHaveClass(/dark/)
  await expect.poll(matchesSurfaceRole).toBe(true)
})

test('full-screen is restricted by the demo to portrait compact and medium viewports', async ({
  page,
}) => {
  const layout = page.getByRole('combobox', { name: 'Carousel layout' })
  await page.setViewportSize({ width: 390, height: 844 })
  await layout.click()
  let fullScreen = page.getByRole('option', { name: 'Full-screen' })
  await expect(fullScreen).not.toHaveAttribute('aria-disabled', 'true')
  await fullScreen.click()
  const carousel = page.getByRole('group', { name: 'Featured places' })
  await expect(carousel).toHaveClass(/yam3x-carousel--full-screen/)
  await expect(carousel.locator('.yam3x-carousel__track')).toHaveCSS(
    'scroll-snap-type',
    'y mandatory',
  )

  await page.setViewportSize({ width: 844, height: 390 })
  await layout.click()
  fullScreen = page.getByRole('option', { name: 'Full-screen' })
  await expect(fullScreen).toHaveAttribute('aria-disabled', 'true')
  await fullScreen.press('Escape')
  await expect(carousel).toHaveClass(/yam3x-carousel--hero/)
})

test('reduced motion disables smooth scrolling, parallax, and size expansion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const carousel = page.getByRole('group', { name: 'Featured places' })
  const track = carousel.locator('.yam3x-carousel__track')
  await expect(track).toHaveCSS('scroll-behavior', 'auto')
  const parallax = carousel.locator('[data-yam3x-carousel-parallax]').first()
  await expect(parallax).toHaveCSS('transform', 'none')
  const secondarySlide = carousel.locator('[data-carousel-index="1"]')
  await expect(secondarySlide).toHaveCSS('transform', 'none')
})

test('arrow keys move focus between slides and Browse all exposes every item', async ({ page }) => {
  const carousel = page.getByRole('group', { name: 'Featured places' })
  const first = carousel.locator('[data-carousel-index="0"]')
  const second = carousel.locator('[data-carousel-index="1"]')
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(second).toBeFocused()
  await expect(page.getByText('Current: Garden')).toBeVisible()

  await page.getByRole('button', { name: 'Browse all' }).click()
  const allPlaces = page.getByRole('region', { name: 'All places' })
  await expect(allPlaces.getByText('Coastline')).toBeVisible()
  await expect(allPlaces.getByText('Desert')).toBeVisible()
})

test('actionable items render as buttons and report the activated item', async ({ page }) => {
  await page.getByRole('button', { name: '3 of 5: City at dusk' }).click()
  await expect(page.getByText('Activated: City at dusk')).toBeVisible()
})
