import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { selectM3Option, setM3SliderValue } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/search')
})

test('Search suggestion descriptions keep readable contrast against their result surface', async ({
  page,
}) => {
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  await field.focus()
  const result = page.locator('[data-search-result]').first()
  await expect(result).toBeVisible()
  const contrast = await result.evaluate((element) => {
    const detail = element.querySelector('small')!
    const rgb = (value: string) =>
      value
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
    const luminance = (value: string) => {
      const channels = rgb(value)
        .map((channel) => channel / 255)
        .map((channel) =>
          channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
        )
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
    }
    const foreground = luminance(getComputedStyle(detail).color)
    const background = luminance(getComputedStyle(element).backgroundColor)
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(4.5)
})

async function resizePane(page: Page, width: number): Promise<void> {
  await setM3SliderValue(page.getByRole('slider', { name: 'Search pane width' }), width)
  await expect
    .poll(() =>
      page.locator('.search-demo__pane').evaluate((element) => getComputedStyle(element).width),
    )
    .toBe(`${width}px`)
}

test('auto layout adapts the open Search to the measured content pane and preserves state', async ({
  page,
}) => {
  // search.adaptive.layout
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const frame = root.locator('.yam3x-search__bar-frame')
  const bar = root.locator('.yam3x-search__bar')
  await resizePane(page, 960)
  await expect(frame).toHaveCSS('margin-inline-start', '24px')
  await expect(frame).toHaveCSS('width', '720px')
  await expect(bar).toHaveCSS('height', '56px')
  await expect(bar).toHaveCSS('border-radius', '9999px')
  await field.fill('Material')
  await expect(field).toHaveAttribute('aria-expanded', 'true')
  await expect(root).toHaveAttribute('role', 'dialog')
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect(page.locator('.yam3x-search__scrim')).toBeVisible()
  await expect(page.locator('.yam3x-search__bar-frame')).toHaveCSS('margin-inline-start', '12px')
  await expect(bar).toHaveCSS('height', '56px')
  await expect(bar).toHaveCSS('border-radius', '9999px')
  await expect(page.locator('.yam3x-search__view')).toHaveCSS('position', 'fixed')
  await expect(page.locator('.yam3x-search__view')).toHaveAttribute('popover', 'manual')
  expect(
    await page
      .locator('.yam3x-search__view')
      .evaluate((element) => element.matches(':popover-open')),
  ).toBe(true)

  const queryBeforeResize = await field.inputValue()
  await resizePane(page, 540)
  await expect(root).toHaveAttribute('data-layout', 'fullscreen')
  await expect(field).toHaveValue(queryBeforeResize)
  await field.focus()
  await expect(field).toBeFocused()
  await expect(page.locator('.yam3x-search__view')).toHaveCSS('position', 'fixed')
  const fullscreenRect = await page.locator('.yam3x-search__view').boundingBox()
  expect(fullscreenRect).not.toBeNull()
  expect(fullscreenRect!.x).toBe(0)
  expect(fullscreenRect!.y).toBe(0)
  expect(fullscreenRect!.width).toBe(page.viewportSize()!.width)
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

  await page.keyboard.press('Escape')
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toHaveValue(queryBeforeResize)
  await expect(field).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('auto layout honors the exact compact breakpoint, desktop width cap, and docked scrolling bounds', async ({
  page,
}) => {
  // search.geometry.contained
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const frame = root.locator('.yam3x-search__bar-frame')
  const view = page.locator('.yam3x-search__view')

  await resizePane(page, 599)
  await field.fill('Material')
  await expect(root).toHaveAttribute('data-layout', 'fullscreen')
  await expect(field).toBeFocused()

  await resizePane(page, 600)
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect(field).toHaveValue('Material')
  await field.focus()
  await expect(field).toBeFocused()
  await expect.poll(async () => Math.round((await frame.boundingBox())!.width)).toBe(576)

  await resizePane(page, 1200)
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect.poll(async () => Math.round((await frame.boundingBox())!.width)).toBe(720)
  await expect.poll(async () => Math.round((await view.boundingBox())!.width)).toBe(720)

  await root.locator('.search-demo__results-list').evaluate((element) => {
    ;(element as HTMLElement).style.minHeight = '1000px'
  })
  const scroll = view.locator('.yam3x-search__results-scroll')
  const metrics = await page.evaluate(() => {
    const panel = document
      .querySelector<HTMLElement>('.yam3x-search__view')!
      .getBoundingClientRect()
    const bar = document.querySelector<HTMLElement>('.yam3x-search__bar')!.getBoundingClientRect()
    const scroller = document.querySelector<HTMLElement>('.yam3x-search__results-scroll')!
    return {
      panelHeight: panel.height,
      barHeight: bar.height,
      gap: panel.top - bar.bottom,
      clientHeight: scroller.clientHeight,
      scrollHeight: scroller.scrollHeight,
      viewportHeight: window.innerHeight,
    }
  })
  expect(metrics.panelHeight + metrics.barHeight + metrics.gap).toBeLessThanOrEqual(
    (metrics.viewportHeight * 2) / 3 + 0.1,
  )
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight)
  await scroll.evaluate((element) => {
    ;(element as HTMLElement).scrollTop = 100
  })
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBe(100)
})

test('docked results escape a horizontally scrolling, clipping pane and track their anchor', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const view = page.locator('.yam3x-search__view')
  const viewport = page.locator('.search-demo__viewport')
  await resizePane(page, 1200)
  await field.evaluate((element) =>
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }),
  )
  await field.focus()
  await expect(view).toHaveAttribute('popover', 'manual')
  await expect.poll(() => view.evaluate((element) => element.matches(':popover-open'))).toBe(true)
  await expect(view).toHaveCSS('padding', '0px')
  await expect(view).toHaveCSS('border-top-width', '0px')

  const geometry = await page.evaluate(() => {
    const view = document.querySelector<HTMLElement>('.yam3x-search__view')!
    const clippingPane = document.querySelector<HTMLElement>('.search-demo__viewport')!
    const panel = view.getBoundingClientRect()
    const pane = clippingPane.getBoundingClientRect()
    const x = Math.min(panel.right - 4, pane.right + 4)
    const y = panel.top + 20
    return {
      panelLeft: panel.left,
      panelRight: panel.right,
      anchorLeft: document.querySelector<HTMLElement>('.yam3x-search__bar')!.getBoundingClientRect()
        .left,
      clippingPaneRight: pane.right,
      viewportWidth: window.innerWidth,
      probeIsInViewport: y >= 0 && y < window.innerHeight,
      probeIsOutsidePane: x > pane.right && x < window.innerWidth,
      probeHitsPanel: view.contains(document.elementFromPoint(x, y)),
    }
  })
  const anchorOffset = geometry.panelLeft - geometry.anchorLeft
  expect(geometry.panelRight).toBeGreaterThan(geometry.clippingPaneRight)
  expect(geometry.probeIsOutsidePane).toBe(true)
  expect(geometry.probeIsInViewport).toBe(true)
  expect(geometry.probeHitsPanel).toBe(true)

  await viewport.evaluate((element) => {
    element.scrollLeft += 48
  })
  await expect
    .poll(() =>
      page.evaluate(() => {
        const panel = document
          .querySelector<HTMLElement>('.yam3x-search__view')!
          .getBoundingClientRect()
        const anchor = document
          .querySelector<HTMLElement>('.yam3x-search__bar')!
          .getBoundingClientRect()
        return panel.left - anchor.left
      }),
    )
    .toBeCloseTo(anchorOffset, 0)
})

test('query submission, arrow navigation, selection, clear, and back preserve native input behavior', async ({
  page,
}) => {
  // search.behavior.query
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const root = page.getByTestId('search')
  await resizePane(page, 960)
  await field.focus()
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await page.keyboard.press('ArrowDown')
  const firstResult = page.locator('[data-search-result]').first()
  await expect(firstResult).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('[data-search-result]').nth(1)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(firstResult).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(field).toHaveValue('Material 3 expressive search')
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toBeFocused()

  await field.click()
  await expect(field).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(field).toHaveValue('')
  await expect(field).toBeFocused()
  await expect(field).toHaveAttribute('aria-expanded', 'true')

  await field.fill('keyboard')
  await field.press('Enter')
  await expect(page.getByText('Searching: keyboard')).toBeVisible()
  await expect(field).not.toBeFocused()
  await expect(field).toHaveValue('keyboard')
  await expect(
    page.getByRole('region', { name: 'Search messages suggestions and results' }),
  ).toHaveAttribute('aria-live', 'polite')
  await page.keyboard.press('Escape')
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toBeFocused()

  await field.fill('keep me')
  await field.click()
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(field).toHaveValue('keep me')
  await expect(field).toBeFocused()
})

test('Search dialog semantics, DOM tab order, focus containment, and native text entry are accessible', async ({
  page,
}) => {
  // search.a11y.focus
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const view = page.locator('.yam3x-search__view')
  const back = page.getByRole('button', { name: 'Back' })
  const voice = page.getByRole('button', { name: 'Voice search' })
  const filter = page.getByRole('button', { name: 'Filter search' })

  await field.focus()
  await expect(root).toHaveAttribute('role', 'dialog')
  await expect(root).toHaveAttribute('aria-modal', 'true')
  await expect(root).toHaveAccessibleName('Search messages')
  await expect(field).toHaveAttribute('aria-label', 'Search messages')
  await expect(field).toHaveAttribute('placeholder', 'Search messages')
  await expect(field).toHaveAttribute('aria-haspopup', 'dialog')
  const resultsId = await view.getAttribute('id')
  expect(resultsId).toBeTruthy()
  await expect(field).toHaveAttribute('aria-controls', resultsId!)
  await expect(view).toHaveAttribute('aria-live', 'polite')
  await expect(view).toHaveAttribute('aria-relevant', 'additions text')

  await field.fill('query')
  await field.press('Space')
  await expect(field).toHaveValue('query ')
  await page.keyboard.press('Shift+Tab')
  await expect(back).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(field).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Clear' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(voice).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(filter).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-search-result]').first()).toBeFocused()
  await page.locator('[data-search-result]').last().focus()
  await page.keyboard.press('Tab')
  await expect(back).toBeFocused()
})

test('Search bar uses the shared hover state layer, press ripple, and visible focus ring', async ({
  page,
}) => {
  // search.state.focus
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const bar = root.locator('.yam3x-search__bar')

  await bar.hover()
  const expectedHoverOpacity = await root.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue('--md-sys-state-hover-opacity')),
  )
  await expect
    .poll(() =>
      bar.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::after').opacity)),
    )
    .toBeCloseTo(expectedHoverOpacity, 2)

  const bounds = await bar.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2)
  await page.mouse.down()
  await expect(bar).toHaveAttribute('data-yam3x-pressed', '')
  await expect(bar.locator('.yam3x-ripple--visible')).toHaveCount(1)
  await page.mouse.up()

  await field.focus()
  await expect(bar).toHaveCSS('outline-width', '3px')
  await expect(bar).toHaveCSS('outline-style', 'solid')
})

test('Search exit animates out, becomes inert immediately, and can reverse when reopened', async ({
  page,
}) => {
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const view = page.locator('.yam3x-search__view')
  await resizePane(page, 960)
  await field.focus()
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect(view).toHaveCSS('opacity', '1')
  const entryTransform = await view.evaluate((element) => getComputedStyle(element).transform)

  await page.keyboard.press('Escape')
  await expect(root).not.toHaveAttribute('data-open', 'true')
  await expect(view).toHaveAttribute('aria-hidden', 'true')
  await expect(view).toHaveAttribute('inert', '')
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect
    .poll(() =>
      view.evaluate(
        (element, startTransform) => getComputedStyle(element).transform !== startTransform,
        entryTransform,
      ),
    )
    .toBe(true)

  await field.click()
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect(view).not.toHaveAttribute('aria-hidden', 'true')
  await expect(view).not.toHaveAttribute('inert', '')
  await expect.poll(() => view.evaluate((element) => element.matches(':popover-open'))).toBe(true)
  await expect(view).toHaveCSS('opacity', '1')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('Escape')
  await expect(view).toHaveCount(0)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await resizePane(page, 480)
  await field.click()
  await expect(root).toHaveAttribute('data-layout', 'fullscreen')
  await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  await expect(view).toHaveAttribute('aria-hidden', 'true')
  await expect
    .poll(() =>
      view.evaluate((element) => {
        const opacity = Number.parseFloat(getComputedStyle(element).opacity)
        return opacity > 0 && opacity < 1
      }),
    )
    .toBe(true)
  await expect(view).toHaveCount(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await field.click()
  await expect(root).toHaveAttribute('data-layout', 'fullscreen')
  await page.keyboard.press('Escape')
  await expect(view).toHaveCount(0)
})

test('docked scrim dismisses Search without activating covered page controls', async ({ page }) => {
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const backgroundAction = page.getByRole('button', { name: 'Page action' })
  const output = page.locator('.search-demo__page-content output')
  const initialOutput = await output.innerText()
  await resizePane(page, 960)
  await field.fill('preserve this')
  const bounds = await backgroundAction.boundingBox()
  expect(bounds).not.toBeNull()
  await page.evaluate(() => {
    document.body.dataset.clickTargets = ''
    document.addEventListener(
      'click',
      (event) => {
        const target = event.target as Element
        document.body.dataset.clickTargets += `${target.className?.toString() || target.tagName};`
      },
      true,
    )
  })
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2)
  expect(await page.locator('body').getAttribute('data-click-targets')).toBe('yam3x-search__scrim;')
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toHaveValue('preserve this')
  await expect(field).toBeFocused()
  await expect(output).toHaveText(initialOutput)
  await expect(backgroundAction).not.toBeFocused()
  await expect(page.getByRole('combobox', { name: 'Search layout' })).toContainText('Adaptive')
})

test('full-screen and docked overrides, divided style, RTL, reduced motion, and forced colors work', async ({
  page,
}) => {
  const layout = page.getByRole('combobox', { name: 'Search layout' })
  const variant = page.getByRole('combobox', { name: 'Search style' })
  const direction = page.getByRole('combobox', { name: 'Search text direction' })
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const root = page.getByTestId('search')

  await resizePane(page, 480)
  await selectM3Option(page, layout, 'fullscreen')
  await field.focus()
  await expect(root).toHaveAttribute('data-layout', 'fullscreen')
  await expect(page.locator('.yam3x-search__view')).toHaveCSS('border-radius', '0px')
  await page.keyboard.press('Escape')

  await selectM3Option(page, layout, 'docked')
  await selectM3Option(page, variant, 'divided')
  await selectM3Option(page, direction, 'rtl')
  await resizePane(page, 960)
  await field.click()
  await expect(root).toHaveAttribute('data-layout', 'docked')
  await expect(root.locator('.yam3x-search__view')).toHaveClass(/yam3x-search__view--divided/)
  await expect(root.locator('.yam3x-search__view')).toHaveCSS('border-radius', '28px')
  const iconPosition = await root.evaluate((element) => {
    const leading = element.querySelector('.yam3x-search__leading')!.getBoundingClientRect()
    const trailing = element.querySelector('.yam3x-search__trailing')!.getBoundingClientRect()
    const bar = element.querySelector('.yam3x-search__bar-frame')!.getBoundingClientRect()
    const results = element.querySelector('.yam3x-search__view')!.getBoundingClientRect()
    return {
      leading: leading.left,
      trailing: trailing.left,
      barLeft: bar.left,
      barRight: bar.right,
      resultsLeft: results.left,
      resultsRight: results.right,
    }
  })
  expect(iconPosition.leading).toBeGreaterThan(iconPosition.trailing)
  expect(iconPosition.resultsLeft).toBeCloseTo(iconPosition.barLeft, 0)
  expect(iconPosition.resultsRight).toBeCloseTo(iconPosition.barRight, 0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(root.locator('.yam3x-search__view')).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(root.locator('.yam3x-search__bar')).toHaveCSS('border-top-style', 'solid')
  await expect(root.locator('.yam3x-search__view')).toHaveCSS('border-top-style', 'solid')
})

test('disabled Search cannot open and the component maps shared System tokens to its styles', async ({
  page,
}) => {
  const root = page.getByTestId('search')
  const field = page.getByRole('searchbox', { name: 'Search messages' })
  const disabledToggle = page.getByRole('checkbox', { name: 'Disable Search' })

  await disabledToggle.check()
  await expect(field).toBeDisabled()
  await field.focus()
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await disabledToggle.uncheck()

  await resizePane(page, 960)
  await root.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--md-sys-color-surface-container-high', 'rgb(1, 2, 3)')
    style.setProperty('--md-sys-color-surface-container-low', 'rgb(4, 5, 6)')
    style.setProperty('--md-sys-color-on-surface', 'rgb(7, 8, 9)')
    style.setProperty('--md-sys-color-on-surface-variant', 'rgb(10, 11, 12)')
    style.setProperty('--md-sys-color-secondary', 'rgb(13, 14, 15)')
    style.setProperty('--md-sys-typescale-body-large-font-family', 'monospace')
    style.setProperty('--md-sys-typescale-body-large-font-size', '18px')
    style.setProperty('--md-sys-typescale-body-large-font-weight', '500')
    style.setProperty('--md-sys-typescale-body-large-line-height', '26px')
    style.setProperty('--md-sys-typescale-body-large-tracking', '1px')
  })
  await field.focus()

  const bar = root.locator('.yam3x-search__bar')
  const leading = root.locator('.yam3x-search__leading')
  const trailing = root.locator('.yam3x-search__trailing')
  const placeholder = await field.evaluate((element) => {
    const style = getComputedStyle(element, '::placeholder')
    return {
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
    }
  })
  await expect(bar).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(bar).toHaveCSS('color', 'rgb(7, 8, 9)')
  await expect(leading).toHaveCSS('color', 'rgb(7, 8, 9)')
  await expect(trailing).toHaveCSS('color', 'rgb(10, 11, 12)')
  await expect(field).toHaveCSS('font-family', 'monospace')
  await expect(field).toHaveCSS('font-size', '18px')
  await expect(field).toHaveCSS('font-weight', '500')
  await expect(field).toHaveCSS('line-height', '26px')
  await expect(field).toHaveCSS('letter-spacing', '1px')
  expect(placeholder).toEqual({
    color: 'rgb(10, 11, 12)',
    fontSize: '18px',
    fontWeight: '500',
    letterSpacing: '1px',
  })
  await expect(bar).toHaveCSS('outline-width', '3px')
  await expect(bar).toHaveCSS('outline-offset', '2px')
  await expect(bar).toHaveCSS('outline-color', 'rgb(13, 14, 15)')
  await expect(root.locator('.yam3x-search__view')).toHaveCSS('background-color', 'rgb(1, 2, 3)')

  await page.keyboard.press('Escape')
  const layout = page.getByRole('combobox', { name: 'Search layout' })
  await selectM3Option(page, layout, 'fullscreen')
  await field.focus()
  await expect(root.locator('.yam3x-search__view')).toHaveCSS('background-color', 'rgb(4, 5, 6)')
})
