import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/app-bar')
})

test('four current variants keep their geometry, headline hierarchy, and Search action', async ({
  page,
}) => {
  // app-bar.variants.geometry
  const bar = page.getByTestId('app-bar')
  await expect(bar).toHaveAttribute('role', 'banner')
  await expect(bar).toHaveAttribute('data-variant', 'search')
  await expect(bar).toHaveCSS('border-radius', '0px')
  await expect(page.getByRole('button', { name: 'Search inbox' })).toBeVisible()
  await expect(page.locator('.yam3x-app-bar__search-container')).toHaveCSS('min-height', '56px')
  await expect(page.locator('.yam3x-app-bar__search-container')).toHaveCSS(
    'border-radius',
    '9999px',
  )
  const searchGlyph = page.locator('.yam3x-app-bar__search-glyph')
  await expect(searchGlyph).toHaveClass(/yam3x-icon/)
  await expect(searchGlyph.locator('.yam3x-icon__ligature')).toHaveText('search')
  await expect(searchGlyph).toHaveCSS('font-family', /Material Symbols Outlined/)
  await expect(page.locator('.yam3x-app-bar__search-trailing')).toHaveCSS('gap', '0px')
  const loadedSearchSymbol = await page.evaluate(async () => {
    await document.fonts.load('24px "Material Symbols Outlined"', 'search')
    return document.fonts.check('24px "Material Symbols Outlined"', 'search')
  })
  expect(loadedSearchSymbol).toBe(true)
  await page.getByRole('button', { name: 'Search inbox' }).click()
  await expect(page.getByRole('status')).toContainText('Search view opened')
  const searchContainer = page.locator('.yam3x-app-bar__search-container')
  const surfaceContainerHighest = await page.evaluate(() => {
    const sample = document.createElement('span')
    sample.style.backgroundColor = 'var(--md-sys-color-surface-container-highest)'
    document.body.append(sample)
    const color = getComputedStyle(sample).backgroundColor
    sample.remove()
    return color
  })
  const scroll = page.getByTestId('app-bar-scroll')
  await scroll.evaluate((element) => {
    element.scrollTop = 80
  })
  await expect(bar).toHaveAttribute('data-scrolled', 'true')
  await expect(searchContainer).toHaveCSS('background-color', surfaceContainerHighest)
  await expect(bar).toHaveCSS('box-shadow', 'none')
  await scroll.evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(bar).not.toHaveAttribute('data-scrolled')

  const variant = page.getByRole('combobox', { name: 'App bar type' })
  await selectM3Option(page, variant, 'small')
  await expect(bar).toHaveAttribute('data-variant', 'small')
  await expect(bar).toHaveCSS('border-radius', '0px')
  await expect(page.locator('.yam3x-app-bar__small-row')).toHaveCSS('min-height', '64px')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('font-size', '22px')
  await expect(page.locator('.yam3x-app-bar__subtitle')).toHaveCSS('font-size', '12px')
  await expect(page.locator('.yam3x-app-bar__small-row .yam3x-app-bar__title')).toContainText(
    'YAM3X',
  )
  await expect(page.locator('.yam3x-app-bar__small-row .yam3x-app-bar__title')).not.toContainText(
    'Inbox',
  )

  await selectM3Option(page, variant, 'medium-flexible')
  await expect(bar).toHaveCSS('border-radius', '0px')
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '136px')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('font-size', '28px')
  await expect(page.locator('.yam3x-app-bar__subtitle')).toHaveCSS('font-size', '14px')

  await selectM3Option(page, variant, 'large-flexible')
  await expect(bar).toHaveCSS('border-radius', '0px')
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '176px')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('font-size', '36px')
  await expect(page.locator('.yam3x-app-bar__subtitle')).toHaveCSS('font-size', '16px')
})

test('Search label maintains at least 3:1 contrast in light and dark themes', async ({ page }) => {
  // app-bar.search.contrast
  const search = page.locator('.yam3x-app-bar__search-trigger')
  const contrast = () =>
    search.evaluate((element) => {
      const parse = (value: string) => {
        const parts = value.match(/[\d.]+/g)?.map(Number) ?? []
        return parts
          .slice(0, 3)
          .map((channel) => {
            const normalized = channel / 255
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4
          })
          .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
      }
      const foreground = parse(getComputedStyle(element).color)
      const background = parse(getComputedStyle(element.parentElement!).backgroundColor)
      const [lighter, darker] =
        foreground > background ? [foreground, background] : [background, foreground]
      return (lighter + 0.05) / (darker + 0.05)
    })

  expect(await contrast()).toBeGreaterThanOrEqual(3)
  await page.locator('html').evaluate((element) => element.classList.add('dark'))
  expect(await contrast()).toBeGreaterThanOrEqual(3)
})

test('app bar fills the full-width page shell supplied by the consumer', async ({ page }) => {
  const geometry = await page.locator('.app-bar-demo__frame').evaluate((frame) => {
    const shell = document.createElement('div')
    shell.style.cssText = 'position:fixed;inset-inline:0;top:0;width:100vw;visibility:hidden'
    const bar = frame.querySelector('.yam3x-app-bar')!.cloneNode(true) as HTMLElement
    shell.append(bar)
    document.body.append(shell)
    const result = {
      viewport: document.documentElement.clientWidth,
      shell: shell.getBoundingClientRect().width,
      bar: bar.getBoundingClientRect().width,
    }
    shell.remove()
    return result
  })

  expect(geometry.shell).toBe(geometry.viewport)
  expect(geometry.bar).toBe(geometry.shell)
})

test('flexible headlines wrap to two lines, while Small stays on one line', async ({ page }) => {
  // app-bar.flexible.headlines
  const widthControl = page.getByRole('slider', { name: 'Available app bar width' })
  await widthControl.press('Home')
  const variant = page.getByRole('combobox', { name: 'App bar type' })
  await selectM3Option(page, variant, 'medium-flexible')
  const title = page.locator('.yam3x-app-bar__title')
  await title.evaluate((element) => {
    element.textContent =
      'Inbox: recent mail and calendar updates from every workspace, ready for quick action. This intentionally long title checks that flexible headlines wrap.'
  })
  const flexible = await title.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
    lineClamp: getComputedStyle(element).webkitLineClamp,
    whiteSpace: getComputedStyle(element).whiteSpace,
  }))
  expect(flexible.lineClamp).toBe('2')
  expect(flexible.whiteSpace).toBe('normal')
  expect(flexible.height).toBeGreaterThan(flexible.lineHeight)
  expect(flexible.height).toBeLessThanOrEqual(flexible.lineHeight * 2 + 1)

  await selectM3Option(page, variant, 'small')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('white-space', 'nowrap')
})

test('Search width tracks its remaining slot across compact, medium, and desktop widths', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1000 })
  const widthControl = page.getByRole('slider', { name: 'Available app bar width' })
  const frame = page.locator('.app-bar-demo__frame')
  const measure = async () =>
    page.getByTestId('app-bar').evaluate((element) => {
      const available = element
        .querySelector('.yam3x-app-bar__search-space')!
        .getBoundingClientRect()
      const field = element
        .querySelector('.yam3x-app-bar__search-container')!
        .getBoundingClientRect()
      return {
        available: available.width,
        field: field.width,
        centerDelta: Math.abs(
          (available.left + available.right) / 2 - (field.left + field.right) / 2,
        ),
      }
    })
  const setWidth = async (value: number) => {
    await widthControl.press('Home')
    const steps = (value - 320) / 10
    for (let index = 0; index < steps; index++) await widthControl.press('ArrowRight')
    await expect(frame).toHaveCSS('width', `${value}px`)
  }

  await setWidth(320)
  const compact = await measure()
  expect(compact.available).toBeLessThan(312)
  expect(Math.abs(compact.field - compact.available)).toBeLessThan(1)

  await setWidth(500)
  const medium = await measure()
  expect(medium.available).toBeGreaterThan(312)
  expect(medium.available).toBeLessThan(624)
  expect(Math.abs(medium.field - 312)).toBeLessThan(1)

  await setWidth(960)
  const desktop = await measure()
  expect(desktop.available).toBeGreaterThan(624)
  expect(Math.abs(desktop.field - desktop.available / 2)).toBeLessThan(1)
  expect(desktop.centerDelta).toBeLessThan(1)
})

test('flexible variants collapse after the selected scroll target moves and expand at the top', async ({
  page,
}) => {
  // app-bar.scroll.collapse
  const bar = page.getByTestId('app-bar')
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'App bar type' }),
    'medium-flexible',
  )
  const subtitleToggle = page.getByRole('checkbox', { name: 'Show subtitle' })
  await subtitleToggle.uncheck()
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '112px')
  await subtitleToggle.check()
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '136px')
  const label = page.locator('.yam3x-app-bar__label')
  const expandedLabel = await label.boundingBox()
  expect(expandedLabel).not.toBeNull()
  const scroll = page.getByTestId('app-bar-scroll')
  await scroll.evaluate((element) => {
    element.scrollTop = 120
  })
  await expect(bar).toHaveAttribute('data-scrolled', 'true')
  await expect(bar).toHaveAttribute('data-collapsed', 'true')
  await page.waitForTimeout(100)
  const intermediateLabel = await label.boundingBox()
  expect(intermediateLabel).not.toBeNull()
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '64px')
  const collapsedLabel = await label.boundingBox()
  expect(collapsedLabel).not.toBeNull()
  const collapsedBar = await page.locator('.yam3x-app-bar__flexible').boundingBox()
  expect(collapsedBar?.height).toBe(64)
  await expect(bar).toHaveCSS('box-shadow', 'none')
  expect(intermediateLabel!.y).toBeGreaterThan(Math.min(expandedLabel!.y, collapsedLabel!.y))
  expect(intermediateLabel!.y).toBeLessThan(Math.max(expandedLabel!.y, collapsedLabel!.y))
  await scroll.evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(bar).not.toHaveAttribute('data-collapsed')
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '136px')

  await selectM3Option(page, page.getByRole('combobox', { name: 'App bar type' }), 'large-flexible')
  await page.getByRole('checkbox', { name: 'Show subtitle' }).uncheck()
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '152px')
  await page.getByRole('checkbox', { name: 'Show subtitle' }).check()
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('min-height', '176px')
  const largeTitle = page.locator('.yam3x-app-bar__title')
  await page.getByRole('slider', { name: 'Available app bar width' }).press('Home')
  await largeTitle.evaluate((element) => {
    element.textContent = 'Inbox: recent mail and updates from every workspace'
  })
  const twoLineTitleHeight = await largeTitle.evaluate(
    (element) => element.getBoundingClientRect().height,
  )
  expect(twoLineTitleHeight).toBeGreaterThan(44)
  expect((await page.locator('.yam3x-app-bar__flexible').boundingBox())!.height).toBeGreaterThan(
    176,
  )
})

test('scroll behavior presets pin, hide and reveal, or collapse flexible variants', async ({
  page,
}) => {
  const bar = page.getByTestId('app-bar')
  const scroll = page.getByTestId('app-bar-scroll')
  const variant = page.getByRole('combobox', { name: 'App bar type' })
  const behavior = page.getByRole('combobox', { name: 'Scroll behavior' })

  await selectM3Option(page, variant, 'medium-flexible')
  await expect(bar).toHaveAttribute('data-scroll-behavior', 'exit-until-collapsed')
  await scroll.evaluate((element) => {
    element.scrollTop = 80
  })
  await expect(bar).toHaveAttribute('data-collapsed', 'true')

  await scroll.evaluate((element) => {
    element.scrollTop = 0
  })
  await selectM3Option(page, variant, 'small')
  await expect(bar).toHaveAttribute('data-scroll-behavior', 'pinned')
  await scroll.evaluate((element) => {
    element.scrollTop = 80
  })
  await expect(bar).toHaveAttribute('data-scrolled', 'true')
  await expect(bar).not.toHaveAttribute('data-hidden')

  await selectM3Option(page, behavior, 'enter-always')
  await scroll.evaluate((element) => {
    element.scrollTop = 140
  })
  await expect(bar).toHaveAttribute('data-hidden', 'true')
  await scroll.evaluate((element) => {
    element.scrollTop = 40
  })
  await expect(bar).not.toHaveAttribute('data-hidden')
  await expect(bar).toHaveCSS('position', 'sticky')
  await scroll.evaluate((element) => {
    element.scrollTop = 0
  })
})

test('keyboard order, centered labels, and RTL preserve action placement', async ({ page }) => {
  // app-bar.a11y.keyboard
  const leading = page.getByRole('button', { name: 'Open navigation' })
  const search = page.getByRole('button', { name: 'Search inbox' })
  const voice = page.getByRole('button', { name: 'Voice search' })
  const help = page.getByRole('button', { name: 'Help' })
  await leading.focus()
  await page.keyboard.press('Tab')
  await expect(search).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(voice).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(help).toBeFocused()

  await selectM3Option(page, page.getByRole('combobox', { name: 'Title alignment' }), 'centered')
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'App bar type' }),
    'medium-flexible',
  )
  const title = page.locator('.yam3x-app-bar__label')
  await expect(title).toHaveCSS('text-align', 'center')
  await page.getByRole('checkbox', { name: 'RTL' }).check()
  const positions = await page.getByTestId('app-bar').evaluate((element) => {
    const leadingBounds = element.querySelector('.yam3x-app-bar__leading')!.getBoundingClientRect()
    const trailingBounds = element
      .querySelector('.yam3x-app-bar__trailing')!
      .getBoundingClientRect()
    return {
      leadingCenter: (leadingBounds.left + leadingBounds.right) / 2,
      trailingCenter: (trailingBounds.left + trailingBounds.right) / 2,
    }
  })
  expect(positions.leadingCenter).toBeGreaterThan(positions.trailingCenter)
})

test('m3e custom properties, reduced motion, and forced colors remain usable', async ({ page }) => {
  const bar = page.getByTestId('app-bar')
  await selectM3Option(page, page.getByRole('combobox', { name: 'App bar type' }), 'small')
  await bar.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-app-bar-small-container-height', '72px')
    style.setProperty('--yam3x-app-bar-small-heading-padding-left', '9px')
    style.setProperty('--yam3x-app-bar-small-title-text-font-size', '24px')
    style.setProperty('--yam3x-app-bar-small-subtitle-text-tracking', '1px')
    style.setProperty('--yam3x-app-bar-title-text-color', 'rgb(1, 2, 3)')
  })
  await expect(page.locator('.yam3x-app-bar__small-row')).toHaveCSS('min-height', '72px')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('font-size', '24px')
  await expect(page.locator('.yam3x-app-bar__title')).toHaveCSS('color', 'rgb(1, 2, 3)')
  await expect(page.locator('.yam3x-app-bar__label')).toHaveCSS('padding-left', '9px')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'App bar type' }),
    'medium-flexible',
  )
  await expect(page.locator('.yam3x-app-bar__flexible')).toHaveCSS('transition-property', 'none')
  await page.emulateMedia({ forcedColors: 'active' })
  await selectM3Option(page, page.getByRole('combobox', { name: 'App bar type' }), 'search')
  await expect(bar).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('.yam3x-app-bar__search-container')).toHaveCSS('border-width', '1px')
})
