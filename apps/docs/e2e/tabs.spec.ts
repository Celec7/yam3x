import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/tabs')
})

test('primary geometry, selection, panel association, and Vue selection events', async ({
  page,
}) => {
  // tabs.geometry.primary
  const tabs = page.getByTestId('tabs')
  const tablist = tabs.getByRole('tablist', { name: 'Media categories' })
  const videos = tablist.getByRole('tab', { name: 'Videos' })
  const photos = tablist.getByRole('tab', { name: 'Photos' })
  await expect(tablist).toBeVisible()
  await expect(videos).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.locator('.yam3x-tabs__strip')).toHaveCSS('height', '64px')
  await expect(tabs.locator('.yam3x-tabs__indicator')).toHaveCSS('height', '3px')
  const badgeOverlap = await tabs.evaluate((element) => {
    const photos = [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (tab) => tab.getAttribute('aria-label') === 'Photos',
    )!
    const icon = photos.querySelector('.tabs-demo__tab-icon')!.getBoundingClientRect()
    const badge = photos.querySelector('.yam3x-tabs__badge')!.getBoundingClientRect()
    return Math.round(icon.right - badge.left)
  })
  expect(badgeOverlap).toBe(6)
  const panelId = await videos.getAttribute('aria-controls')
  await expect(tabs.locator(`#${panelId}`)).toBeVisible()
  await expect(tabs.getByRole('tabpanel')).toHaveCount(1)
  await photos.click()
  await expect(photos).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.getByRole('tabpanel')).toContainText('Photos content')
  await expect(page.getByTestId('tabs-events')).toHaveText('model:photos → select:photos')
  await expect(photos.locator('[data-selected="true"]')).toBeVisible()
  await expect(videos.locator('[data-selected="true"]')).toHaveCount(0)
  await photos.click()
  await expect(page.getByTestId('tabs-events')).toHaveText(
    'model:photos → select:photos → select:photos',
  )
  await videos.click()
  await expect(videos).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('tabs-events')).toHaveText(
    'model:photos → select:photos → select:photos → model:videos → select:videos',
  )
})

test('arrows move focus, Space selects, disabled item is skipped, and RTL reverses direction', async ({
  page,
}) => {
  // tabs.a11y.keyboard
  const tabs = page.getByTestId('tabs')
  const videos = tabs.getByRole('tab', { name: 'Videos' })
  const photos = tabs.getByRole('tab', { name: 'Photos' })
  const audio = tabs.getByRole('tab', { name: 'Audio' })
  await expect(audio).toBeDisabled()
  await videos.focus()
  await videos.press('ArrowRight')
  await expect(photos).toBeFocused()
  await expect(videos).toHaveAttribute('aria-selected', 'true')
  await photos.press('Space')
  await expect(photos).toHaveAttribute('aria-selected', 'true')
  await photos.press('ArrowRight')
  await expect(videos).toBeFocused()
  await tabs.evaluate((element) => ((element as HTMLElement).dir = 'rtl'))
  await videos.press('ArrowLeft')
  await expect(photos).toBeFocused()
  await photos.press('Home')
  await expect(videos).toBeFocused()
})

test('secondary, scrollable, after header, and pagination retain the active panel', async ({
  page,
}) => {
  const tabs = page.getByTestId('tabs')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab type' }), 'secondary')
  await expect(tabs.locator('.yam3x-tabs__strip')).toHaveCSS('height', '48px')
  await expect(tabs.locator('.yam3x-tabs__indicator')).toHaveCSS('height', '2px')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab layout' }), 'auto')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab count' }), '7')
  await expect(tabs).toHaveClass(/yam3x-tabs--scrollable/)
  await expect(tabs.locator('.yam3x-tabs__strip')).toHaveCSS('padding-left', '52px')
  await tabs.evaluate((element) =>
    element.style.setProperty('--md-sys-density-spacing-scale', '0.5'),
  )
  await expect(tabs.locator('.yam3x-tabs__strip')).toHaveCSS('padding-left', '52px')
  await tabs.evaluate((element) => element.style.removeProperty('--md-sys-density-spacing-scale'))
  const next = tabs.getByRole('button', { name: 'Next page' })
  await expect(next).toBeVisible()
  await next.click()
  await expect
    .poll(() => tabs.locator('.yam3x-tabs__scrollport').evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  await tabs.getByRole('tab', { name: 'History' }).click()
  await expect(tabs.getByRole('tabpanel')).toContainText('History content')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab bar position' }), 'after')
  await expect(tabs).toHaveClass(/yam3x-tabs--header-after/)
  await expect(tabs.locator('.yam3x-tabs__header')).toHaveCSS('order', '1')
  await expect(tabs.getByRole('tabpanel')).toContainText('History content')
  await page.getByRole('checkbox', { name: 'Hide pagination buttons' }).check()
  await expect(next).toHaveCount(0)
})

test('documented CSS hooks, forced colors, and hidden state affect rendered parts', async ({
  page,
}) => {
  const tabs = page.getByTestId('tabs')
  await tabs.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-tabs-active-indicator-color', 'rgb(1, 2, 3)')
    style.setProperty('--yam3x-tabs-primary-active-indicator-thickness', '5px')
    style.setProperty('--yam3x-tab-selected-color', 'rgb(4, 5, 6)')
    style.setProperty('--yam3x-tab-font-size', '18px')
    style.setProperty('--yam3x-tab-spacing', '11px')
  })
  await expect(tabs.locator('.yam3x-tabs__indicator')).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(tabs.locator('.yam3x-tabs__indicator')).toHaveCSS('height', '5px')
  await expect(tabs.getByRole('tab', { name: 'Videos' })).toHaveCSS('color', 'rgb(4, 5, 6)')
  await expect(tabs.getByRole('tab', { name: 'Videos' })).toHaveCSS('font-size', '18px')
  await expect(tabs.locator('.yam3x-tabs__content').first()).toHaveCSS('column-gap', '11px')
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  expect(
    await tabs
      .locator('.yam3x-tabs__indicator')
      .evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.00001)
  await tabs.getByRole('tab', { name: 'Videos' }).focus()
  await expect(tabs.getByRole('tab', { name: 'Videos' })).toHaveCSS('outline-width', '3px')
  await tabs.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(tabs).toBeHidden()
  await expect(page.getByRole('tablist', { name: 'Media categories' })).toHaveCount(0)
})

test('Expressive tab states use their mapped label colors and focus geometry', async ({ page }) => {
  // tabs.states.colors
  const tabs = page.getByTestId('tabs')
  const videos = tabs.getByRole('tab', { name: 'Videos' })
  const photos = tabs.getByRole('tab', { name: 'Photos' })
  const systemColors = await tabs.evaluate((element) => {
    const style = getComputedStyle(element)
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-primary)'
    element.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()
    return {
      onSurface: style.color,
      primary,
    }
  })

  await photos.hover()
  await expect(photos).toHaveCSS('color', systemColors.onSurface)
  await expect(photos.locator('.yam3x-tabs__state')).toHaveCSS('opacity', '0.08')
  await videos.focus()
  await videos.press('ArrowRight')
  await expect(photos).toBeFocused()
  await expect(photos).toHaveCSS('color', systemColors.onSurface)
  await expect(photos.locator('.yam3x-tabs__state')).toHaveCSS('opacity', '0.1')
  await expect(photos).toHaveCSS('outline-offset', '-3px')
  await photos.press('Space')
  await expect(photos).toHaveAttribute('aria-selected', 'true')
  await expect(photos).toHaveCSS('color', systemColors.primary)
  await expect(photos.locator('.yam3x-tabs__state')).toHaveCSS('opacity', '0.1')

  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab type' }), 'secondary')
  await expect(photos).toHaveCSS('color', systemColors.onSurface)
  await videos.hover()
  await expect(videos).toHaveCSS('color', systemColors.onSurface)
})

test('RTL indicator stays under selected tab and item removal reconciles the model', async ({
  page,
}) => {
  const tabs = page.getByTestId('tabs')
  await tabs.evaluate((element) => ((element as HTMLElement).dir = 'rtl'))
  const photos = tabs.getByRole('tab', { name: 'Photos' })
  await photos.click()
  await expect
    .poll(() =>
      tabs.evaluate((element) => {
        const tab = element.querySelectorAll('.yam3x-tabs__tab')[1].getBoundingClientRect()
        const label = element.querySelectorAll('.yam3x-tabs__label')[1].getBoundingClientRect()
        const indicator = element.querySelector('.yam3x-tabs__indicator')!.getBoundingClientRect()
        return (
          indicator.left >= tab.left &&
          indicator.right <= tab.right &&
          indicator.width >= 24 &&
          Math.abs((indicator.left + indicator.right) / 2 - (label.left + label.right) / 2) < 1
        )
      }),
    )
    .toBe(true)
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab count' }), '7')
  await tabs.getByRole('tab', { name: 'History' }).click()
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: History')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab count' }), '3')
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Videos')
  await expect(tabs.getByRole('tabpanel')).toContainText('Videos content')
  await expect(tabs.getByRole('button', { name: 'Next page' })).toHaveCount(0)
})

test('hover and press feedback occupy the same tab bounds', async ({ page }) => {
  const tab = page.getByTestId('tabs').getByRole('tab', { name: 'Photos' })
  await tab.hover()
  const hover = await tab.evaluate((element) => {
    const base = element.getBoundingClientRect()
    const layer = element.querySelector('.yam3x-tabs__state')!.getBoundingClientRect()
    return {
      left: layer.left - base.left,
      top: layer.top - base.top,
      width: layer.width,
      height: layer.height,
      baseWidth: base.width,
      baseHeight: base.height,
    }
  })
  expect(hover).toEqual({
    left: 0,
    top: 0,
    width: hover.baseWidth,
    height: hover.baseHeight,
    baseWidth: hover.baseWidth,
    baseHeight: hover.baseHeight,
  })
  const box = await tab.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await expect(tab.locator('.yam3x-ripple--visible')).toHaveCount(1)
  const ripple = await tab.locator('.yam3x-ripple-container').evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const parent = element.parentElement!.getBoundingClientRect()
    return {
      x: rect.x - parent.x,
      y: rect.y - parent.y,
      width: rect.width,
      height: rect.height,
      parentWidth: parent.width,
      parentHeight: parent.height,
    }
  })
  expect(ripple).toEqual({
    x: 0,
    y: 0,
    width: ripple.parentWidth,
    height: ripple.parentHeight,
    parentWidth: ripple.parentWidth,
    parentHeight: ripple.parentHeight,
  })
  await expect
    .poll(() =>
      tab
        .locator('.yam3x-ripple--visible')
        .evaluate((element) => getComputedStyle(element).opacity),
    )
    .toBe('0.1')
  const pressed = await tab.evaluate((element) => {
    const stateLayer = getComputedStyle(element, '::after')
    const ripple = element.querySelector('.yam3x-ripple--visible')
    const rippleStyle = ripple ? getComputedStyle(ripple) : null
    return {
      stateLayerContent: stateLayer.content,
      rippleOpacity: rippleStyle?.opacity,
      rippleColor: rippleStyle?.backgroundColor,
    }
  })
  const primary = await page.getByTestId('tabs').evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-primary)'
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  expect(pressed).toEqual({
    stateLayerContent: 'none',
    rippleOpacity: '0.1',
    rippleColor: primary,
  })
  await page.mouse.up()
  await expect(tab.locator('.yam3x-ripple')).toHaveCount(0)
  const disabled = page.getByTestId('tabs').getByRole('tab', { name: 'Audio' })
  await disabled.dispatchEvent('pointerdown', {
    pointerType: 'mouse',
    pointerId: 9,
    isPrimary: true,
    button: 0,
  })
  await expect(disabled.locator('.yam3x-ripple')).toHaveCount(0)
})

test('selection uses directional expressive motion and reduced motion suppresses it', async ({
  page,
}) => {
  // tabs.motion.selection
  const tabs = page.getByTestId('tabs')
  const indicator = tabs.locator('.yam3x-tabs__indicator')
  const expectedDuration = await tabs.evaluate((element) => {
    const value = getComputedStyle(element)
      .getPropertyValue('--md-sys-motion-duration-slow-spatial')
      .trim()
    const duration = Number.parseFloat(value)
    return value.endsWith('ms') ? duration / 1000 : duration
  })
  const actualDurations = await indicator.evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(',')
      .map((value) => Number.parseFloat(value)),
  )
  expect(actualDurations).toEqual([expectedDuration, expectedDuration])
  const restingWidth = await indicator.evaluate((element) => element.getBoundingClientRect().width)
  await tabs.getByRole('tab', { name: 'Photos' }).click()
  await expect(tabs).toHaveClass(/yam3x-tabs--motion-end/)
  const movingWidth = await indicator.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      if (animation instanceof CSSTransition) animation.currentTime = 150
    }
    return element.getBoundingClientRect().width
  })
  expect(Math.abs(movingWidth - restingWidth)).toBeGreaterThan(0.25)
  await expect(tabs.locator('.yam3x-tabs__panel--enter-end')).toHaveCSS(
    'animation-name',
    'yam3x-tabs-enter-end',
  )
  await expect(tabs.locator('.yam3x-tabs__panel--leave-end')).toHaveCSS(
    'animation-name',
    'yam3x-tabs-leave-end',
  )
  await expect(tabs.locator('.yam3x-tabs__panel--leave-end')).toHaveAttribute('aria-hidden', 'true')
  await expect(tabs.getByRole('tabpanel')).toHaveCount(1)
  await expect(tabs.locator('.yam3x-tabs__panel--leave-end')).toHaveCount(0)
  await tabs.getByRole('tab', { name: 'Videos' }).click()
  await expect(tabs).toHaveClass(/yam3x-tabs--motion-start/)
  await expect(tabs.locator('.yam3x-tabs__panel--enter-start')).toHaveCSS(
    'animation-name',
    'yam3x-tabs-enter-start',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await tabs.getByRole('tab', { name: 'Photos' }).click()
  await expect(tabs.locator('.yam3x-tabs__panel--enter-end')).toHaveCount(0)
  expect(
    await indicator.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.00001)
})

test('touch swipe skips disabled tabs and leaves interactive content alone', async ({ page }) => {
  const tabs = page.getByTestId('tabs')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab count' }), '7')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab layout' }), 'auto')
  await expect(tabs).toHaveClass(/yam3x-tabs--scrollable/)
  const scrollport = tabs.locator('.yam3x-tabs__scrollport')
  const firstScrollableTab = tabs.getByRole('tab', { name: 'Videos' })
  await expect(firstScrollableTab).toHaveCSS('max-width', 'none')
  await expect(firstScrollableTab.locator('.yam3x-tabs__label')).toHaveCSS('overflow', 'visible')
  const swipe = async (
    from: number,
    to: number,
    target = '.yam3x-tabs__panel:not([style*="display: none"])',
  ) => {
    await tabs.evaluate(
      (element, args) => {
        const node = element.querySelector(args.target)!
        node.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            pointerType: 'touch',
            pointerId: 7,
            clientX: args.from,
            clientY: 100,
          }),
        )
        node.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            pointerType: 'touch',
            pointerId: 7,
            clientX: args.to,
            clientY: 104,
          }),
        )
      },
      { from, to, target },
    )
  }
  await swipe(200, 100)
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Videos')
  await scrollport.evaluate((element) => element.scrollBy({ left: 200 }))
  await expect.poll(() => scrollport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  await selectM3Option(page, page.getByRole('combobox', { name: 'Tab layout' }), 'fixed')
  await swipe(200, 100)
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Photos')
  await swipe(200, 100)
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Documents')
  await swipe(200, 100, '.yam3x-tabs__panel:not([style*="display: none"]) button')
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Documents')
  await page.getByRole('checkbox', { name: 'Disable content swiping' }).check()
  await swipe(200, 100)
  await expect(page.getByTestId('tabs-selection')).toHaveText('Current: Documents')
})
