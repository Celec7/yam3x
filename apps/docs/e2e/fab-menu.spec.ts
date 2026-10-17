import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test('compound FAB menu demo opens, selects an action, and restores trigger focus', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create with composed menu' })
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveCSS('width', '80px')
  await trigger.scrollIntoViewIfNeeded()
  const before = await trigger.boundingBox()
  await trigger.evaluate((element) => {
    const samples: Array<{ width: number; firstOpacity: number; lastOpacity: number }> = []
    const state = window as Window & {
      __compoundFabMenuSamples?: typeof samples
      __compoundFabMenuAnimationDone?: boolean
    }
    state.__compoundFabMenuSamples = samples
    state.__compoundFabMenuAnimationDone = false
    const started = performance.now()
    const sample = () => {
      const actions = document.querySelectorAll<HTMLElement>('[role="menuitem"]')
      if (actions.length)
        samples.push({
          width: element.getBoundingClientRect().width,
          firstOpacity: Number(getComputedStyle(actions[0]!).opacity),
          lastOpacity: Number(getComputedStyle(actions[actions.length - 1]!).opacity),
        })
      if (performance.now() - started < 450) requestAnimationFrame(sample)
      else state.__compoundFabMenuAnimationDone = true
    }
    requestAnimationFrame(sample)
  })
  await trigger.click()

  const menu = page.getByRole('menu', { name: 'Create actions' })
  const actions = page.getByRole('menuitem')
  await expect(menu).toBeVisible()
  await expect(actions).toHaveCount(5)
  await expect(actions.first()).not.toHaveAttribute('aria-checked')
  await expect(actions.first()).toHaveClass(/item--selected/)
  await expect(actions.first()).toHaveAttribute('tabindex', '0')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.waitForFunction(
    () =>
      (window as Window & { __compoundFabMenuAnimationDone?: boolean })
        .__compoundFabMenuAnimationDone,
  )
  const samples = await page.evaluate(
    () =>
      (
        window as Window & {
          __compoundFabMenuSamples?: Array<{
            width: number
            firstOpacity: number
            lastOpacity: number
          }>
        }
      ).__compoundFabMenuSamples ?? [],
  )
  expect(samples.some(({ width }) => width > 56 && width < 80)).toBe(true)
  const opensDown = await menu.evaluate((element) =>
    element.classList.contains('yam3x-floating-action-button-menu__panel--opening-down'),
  )
  expect(
    samples.some(({ firstOpacity, lastOpacity }) =>
      opensDown ? firstOpacity > lastOpacity : lastOpacity > firstOpacity,
    ),
  ).toBe(true)
  const after = await trigger.boundingBox()
  expect(before).not.toBeNull()
  expect(after).not.toBeNull()
  expect(after!.width).toBeCloseTo(56, 0)
  expect(Math.abs(before!.y - after!.y)).toBeLessThanOrEqual(1)

  await actions.nth(1).click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
  await expect(page.getByTestId('fab-menu-composition-result')).toHaveText('Selected: Upload file')
})

test('FAB menu opens from its FAB, keeps the close button anchored, and follows 56px close-button specs', async ({
  page,
}) => {
  // fab-menu.geometry.close
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toHaveAttribute('aria-controls', /-menu$/)
  await expect(trigger).toHaveCSS('width', '80px')
  await trigger.scrollIntoViewIfNeeded()
  const before = await trigger.boundingBox()
  await trigger.evaluate((element) => {
    const samples: Array<{ width: number; firstOpacity: number; lastOpacity: number }> = []
    const start = performance.now()
    const sampleState = window as Window & {
      __fabMenuAnimationSamples?: typeof samples
      __fabMenuAnimationDone?: boolean
    }
    sampleState.__fabMenuAnimationSamples = samples
    sampleState.__fabMenuAnimationDone = false
    const sample = () => {
      const menuItems = document.querySelectorAll<HTMLElement>('.yam3x-fab-menu__item')
      if (menuItems.length)
        samples.push({
          width: element.getBoundingClientRect().width,
          firstOpacity: Number(getComputedStyle(menuItems[0]!).opacity),
          lastOpacity: Number(getComputedStyle(menuItems[menuItems.length - 1]!).opacity),
        })
      if (performance.now() - start < 400) requestAnimationFrame(sample)
      else sampleState.__fabMenuAnimationDone = true
    }
    requestAnimationFrame(sample)
  })
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Create actions' })
  await expect(menu).toBeVisible()
  await expect(page.getByRole('menuitem')).toHaveCount(5)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.waitForFunction(
    () => (window as Window & { __fabMenuAnimationDone?: boolean }).__fabMenuAnimationDone,
  )
  const samples = await page.evaluate(
    () =>
      (
        window as Window & {
          __fabMenuAnimationSamples?: Array<{
            width: number
            firstOpacity: number
            lastOpacity: number
          }>
        }
      ).__fabMenuAnimationSamples ?? [],
  )
  expect(samples.some(({ width }) => width > 56 && width < 80)).toBe(true)
  expect(samples.some(({ firstOpacity, lastOpacity }) => lastOpacity > firstOpacity)).toBe(true)
  await expect
    .poll(() => trigger.evaluate((element) => element.getBoundingClientRect().width))
    .toBe(56)
  const after = await trigger.boundingBox()
  expect(before).not.toBeNull()
  expect(after).not.toBeNull()
  expect(Math.abs(before!.x + before!.width - (after!.x + after!.width))).toBeLessThanOrEqual(1)
  expect(Math.abs(before!.y - after!.y)).toBeLessThanOrEqual(1)
  const finalItem = await page.getByRole('menuitem', { name: 'Create share link' }).boundingBox()
  const triggerBox = await trigger.boundingBox()
  expect(finalItem).not.toBeNull()
  expect(triggerBox).not.toBeNull()
  expect(Math.abs(triggerBox!.y - (finalItem!.y + finalItem!.height + 8))).toBeLessThanOrEqual(1)
  await expect(menu).toHaveCSS('gap', '4px')
})

test('FAB menu implements roving keyboard navigation, close restoration, and Tab dismissal', async ({
  page,
}) => {
  // fab-menu.a11y.keyboard
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.focus()
  await trigger.press('Enter')
  const actions = page.getByRole('menuitem')
  await expect(trigger).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(actions.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(actions.nth(1)).toBeFocused()
  await page.keyboard.press('End')
  await expect(actions.nth(4)).toBeFocused()
  await expect(actions.nth(3)).toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('Home')
  await expect(actions.nth(0)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.press('Enter')
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('menu')).toBeHidden()
})

test('FAB menu presents pill stacks and baseline Web menus with distinct spacing', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.click()
  const pillMenu = page.getByRole('menu')
  const pillAction = page.getByRole('menuitem', { name: 'Take photo' })
  await expect(pillMenu).toHaveCSS('gap', '4px')
  await expect(pillAction).toHaveCSS('font-size', '16px')
  await expect(pillAction).toHaveCSS('padding-inline-start', '24px')
  await expect(pillAction).not.toHaveAttribute('aria-checked')
  await trigger.click()
  await selectM3Option(page, page.getByLabel('FAB menu presentation'), 'web-menu')
  await trigger.click()
  const webMenu = page.getByRole('menu')
  const webAction = page.getByRole('menuitem', { name: 'Take photo' })
  await expect(webMenu).toHaveClass(/panel--web-menu/)
  await expect(webMenu).toHaveCSS('gap', '0px')
  await expect(webMenu).toHaveCSS('min-width', '112px')
  await expect(webMenu).toHaveCSS('border-top-left-radius', '4px')
  await expect(webAction).toHaveCSS('min-height', '48px')
  await expect(webAction).toHaveCSS('padding-inline-start', '12px')
  await expect(webAction).not.toHaveAttribute('aria-checked')
  await expect(webAction).toHaveClass(/item--selected/)
  const selectedColors = await webAction.evaluate((element) => {
    const styles = getComputedStyle(element)
    const expectedColors = document.createElement('span')
    expectedColors.style.backgroundColor = styles
      .getPropertyValue('--_yam3x-fab-menu-item-selected-container')
      .trim()
    expectedColors.style.color = styles.getPropertyValue('--_yam3x-fab-menu-item-color').trim()
    document.body.append(expectedColors)
    const expectedStyles = getComputedStyle(expectedColors)
    const selectedBackground = expectedStyles.backgroundColor
    const itemColor = expectedStyles.color
    expectedColors.remove()
    const icon = element.querySelector<HTMLElement>('.yam3x-icon, svg')
    const expectedIcon = document.createElement('span')
    expectedIcon.style.color = styles.getPropertyValue('--_yam3x-fab-menu-item-icon-color').trim()
    document.body.append(expectedIcon)
    const expectedIconColor = getComputedStyle(expectedIcon).color
    expectedIcon.remove()
    return {
      background: styles.backgroundColor,
      color: styles.color,
      selectedBackground,
      itemColor,
      iconColor: icon ? getComputedStyle(icon).color : null,
      expectedIconColor,
    }
  })
  expect(selectedColors.background).toBe(selectedColors.selectedBackground)
  expect(selectedColors.color).toBe(selectedColors.itemColor)
  expect(selectedColors.iconColor).toBe(selectedColors.expectedIconColor)
})

test('teleported FAB menus inherit nested System tokens and follow theme updates while open', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  await selectM3Option(page, page.getByLabel('FAB menu presentation'), 'web-menu')
  const host = page.locator('.fab-menu-demo__menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  const panel = page.locator('.yam3x-fab-menu__panel')

  await host.evaluate((element) => {
    const themeRoot = document.createElement('div')
    themeRoot.dataset.theme = 'light'
    themeRoot.style.setProperty('--md-sys-color-surface-container', 'rgb(9, 18, 27)')
    element.before(themeRoot)
    themeRoot.append(element)
  })
  await trigger.click()
  await expect(panel).toHaveCSS('background-color', 'rgb(9, 18, 27)')

  await host.evaluate((element) => {
    element.parentElement!.style.setProperty('--md-sys-color-surface-container', 'rgb(31, 42, 53)')
  })
  await expect(panel).toHaveCSS('background-color', 'rgb(31, 42, 53)')
})

test('FAB menu preserves disabled actions, native links, selection events, and outside activation', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.click()
  const disabled = page.getByRole('menuitem', { name: 'Unavailable' })
  await expect(disabled).toBeDisabled()
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await expect(disabled).toHaveCSS('opacity', '1')
  await disabled.click({ force: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const link = page.getByRole('menuitem', { name: 'Create share link' })
  await expect(link).toHaveAttribute('href', '#fab-menu-link')
  await link.click()
  await expect(page).toHaveURL(/#fab-menu-link$/)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByTestId('fab-menu-result')).toHaveText('Selected: Create share link')

  await trigger.click()
  await page.getByRole('heading', { name: 'FAB menu' }).click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('disabled FAB menu actions share styling and keyboard behavior across both APIs', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')

  const convenienceTrigger = page.getByRole('button', { name: 'Create', exact: true })
  await convenienceTrigger.click()
  const convenienceDisabled = page.getByRole('menuitem', { name: 'Unavailable' })
  await expect(convenienceDisabled).toBeDisabled()
  await expect(convenienceDisabled).toHaveAttribute('aria-disabled', 'true')
  await expect(convenienceDisabled).toHaveAttribute('tabindex', '-1')
  const convenienceColors = await convenienceDisabled.evaluate((element) => {
    const styles = getComputedStyle(element)
    return { backgroundColor: styles.backgroundColor, color: styles.color }
  })
  await convenienceDisabled.click({ force: true })
  await expect(convenienceTrigger).toHaveAttribute('aria-expanded', 'true')
  await convenienceTrigger.focus()
  await convenienceTrigger.press('ArrowDown')
  const convenienceItems = page.getByRole('menuitem')
  await expect(convenienceItems.nth(0)).toBeFocused()
  await convenienceItems.nth(0).press('ArrowDown')
  await expect(convenienceItems.nth(1)).toBeFocused()
  await convenienceItems.nth(1).press('ArrowDown')
  await expect(convenienceItems.nth(2)).toBeFocused()
  await convenienceItems.nth(2).press('ArrowDown')
  await expect(convenienceItems.nth(4)).toBeFocused()
  await page.keyboard.press('Escape')

  const compoundTrigger = page.getByRole('button', {
    name: 'Create with composed menu',
    exact: true,
  })
  await compoundTrigger.click()
  const compoundDisabled = page.getByRole('menuitem', { name: 'Unavailable' })
  await expect(compoundDisabled).toBeDisabled()
  await expect(compoundDisabled).toHaveAttribute('aria-disabled', 'true')
  await expect(compoundDisabled).toHaveAttribute('tabindex', '-1')
  await expect(compoundDisabled).toHaveCSS('background-color', convenienceColors.backgroundColor)
  await expect(compoundDisabled).toHaveCSS('color', convenienceColors.color)
  await compoundDisabled.click({ force: true })
  await expect(compoundTrigger).toHaveAttribute('aria-expanded', 'true')
  await compoundTrigger.focus()
  await compoundTrigger.press('ArrowDown')
  const compoundItems = page.getByRole('menuitem')
  await expect(compoundItems.nth(0)).toBeFocused()
  await compoundItems.nth(0).press('ArrowDown')
  await expect(compoundItems.nth(1)).toBeFocused()
  await compoundItems.nth(1).press('ArrowDown')
  await expect(compoundItems.nth(2)).toBeFocused()
  await compoundItems.nth(2).press('ArrowDown')
  await expect(compoundItems.nth(4)).toBeFocused()
  await page.keyboard.press('Escape')
})

test('FAB menu keeps cancelable visibility requests and aligns its surface to the close button', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const host = page.locator('.fab-menu-demo__menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await host.evaluate((element) => {
    element.addEventListener(
      'beforetoggle',
      (event) => {
        if ((event as CustomEvent<{ expanded: boolean }>).detail.expanded) event.preventDefault()
      },
      { once: true },
    )
  })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('menu')).toBeHidden()

  for (const alignment of ['start', 'center', 'end'] as const) {
    await selectM3Option(page, page.getByLabel('Menu alignment'), alignment)
    await trigger.click()
    const first = page.getByRole('menuitem').first()
    await expect(first).toHaveCSS('opacity', '1')
    const [surface, button, action] = await Promise.all([
      page.getByRole('menu').boundingBox(),
      trigger.boundingBox(),
      first.boundingBox(),
    ])
    expect(surface).not.toBeNull()
    expect(button).not.toBeNull()
    expect(action).not.toBeNull()
    const surfaceEdge =
      alignment === 'start'
        ? surface!.x
        : alignment === 'end'
          ? surface!.x + surface!.width
          : surface!.x + surface!.width / 2
    const buttonEdge =
      alignment === 'start'
        ? button!.x
        : alignment === 'end'
          ? button!.x + button!.width
          : button!.x + button!.width / 2
    expect(Math.abs(surfaceEdge - buttonEdge)).toBeLessThanOrEqual(2)
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }
})

test('FAB menu remains within desktop and narrow viewport bounds while preserving its anchor', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.scrollIntoViewIfNeeded()
  const closed = await trigger.boundingBox()
  await trigger.click()
  await expect(page.getByRole('menuitem').last()).toHaveCSS('opacity', '1')
  const panel = await page.getByRole('menu').boundingBox()
  const opened = await trigger.boundingBox()
  expect(closed).not.toBeNull()
  expect(opened).not.toBeNull()
  expect(panel).not.toBeNull()
  expect(Math.abs(closed!.x + closed!.width - (opened!.x + opened!.width))).toBeLessThanOrEqual(1)
  expect(panel!.x).toBeGreaterThanOrEqual(16)
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(344)
  expect(panel!.y).toBeGreaterThanOrEqual(16)
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(624)
})

test('FAB menu keeps the close trigger separate from a scrolling action list in a short landscape viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 320 })
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()

  const menu = page.getByRole('menu')
  const lastAction = page.getByRole('menuitem', { name: 'Create share link' })
  await expect(menu).toHaveCSS('overflow-y', 'auto')
  await expect(menu).toHaveCSS('scrollbar-width', 'none')
  const [menuBox, triggerBox] = await Promise.all([menu.boundingBox(), trigger.boundingBox()])
  expect(menuBox).not.toBeNull()
  expect(triggerBox).not.toBeNull()
  const opensDown = await menu.evaluate((element) =>
    element.classList.contains('yam3x-fab-menu__panel--opening-down'),
  )
  const nearestActionBox = await lastAction.boundingBox()
  expect(nearestActionBox).not.toBeNull()
  if (opensDown)
    expect(nearestActionBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height - 1)
  else expect(nearestActionBox!.y + nearestActionBox!.height).toBeLessThanOrEqual(triggerBox!.y + 1)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('End')
  await expect(lastAction).toBeFocused()
  const [actionBox, updatedTriggerBox, scrollState] = await Promise.all([
    lastAction.boundingBox(),
    trigger.boundingBox(),
    menu.evaluate((element) => ({
      scrollTop: element.scrollTop,
      max: element.scrollHeight - element.clientHeight,
    })),
  ])
  expect(scrollState.max).toBeGreaterThan(0)
  expect(scrollState.scrollTop).toBeGreaterThan(0)
  expect(actionBox).not.toBeNull()
  expect(updatedTriggerBox).not.toBeNull()
  if (opensDown)
    expect(actionBox!.y).toBeGreaterThanOrEqual(
      updatedTriggerBox!.y + updatedTriggerBox!.height - 1,
    )
  else expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(updatedTriggerBox!.y + 1)
  await trigger.click()

  const composedTrigger = page.getByRole('button', { name: 'Create with composed menu' })
  await composedTrigger.scrollIntoViewIfNeeded()
  await composedTrigger.click()
  const composedMenu = page.getByRole('menu', { name: 'Create actions' })
  const composedLastAction = page.getByRole('menuitem', { name: 'Create share link' })
  await expect(composedMenu).toHaveCSS('overflow-y', 'auto')
  await expect(composedMenu).toHaveCSS('scrollbar-width', 'none')
  await expect(page.getByRole('menuitem')).toHaveCount(5)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('End')
  await expect(composedLastAction).toBeFocused()
  const [composedOpensDown, composedTriggerBox] = await Promise.all([
    composedMenu.evaluate((element) =>
      element.classList.contains('yam3x-floating-action-button-menu__panel--opening-down'),
    ),
    composedTrigger.boundingBox(),
  ])
  const composedNearestActionBox = await composedLastAction.boundingBox()
  expect(composedTriggerBox).not.toBeNull()
  expect(composedNearestActionBox).not.toBeNull()
  if (composedOpensDown)
    expect(composedNearestActionBox!.y + composedNearestActionBox!.height).toBeGreaterThanOrEqual(
      composedTriggerBox!.y + composedTriggerBox!.height - 1,
    )
  else
    expect(composedNearestActionBox!.y + composedNearestActionBox!.height).toBeLessThanOrEqual(
      composedTriggerBox!.y + 1,
    )
  await page.keyboard.press('Escape')
})

test('FAB menu changes opening direction after scrolling for both APIs', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 720 })
  await page.goto('/components/fab-menu')

  async function expectDirectionToTrackScroll(triggerName: string, menuName: string) {
    const trigger = page.getByRole('button', { name: triggerName, exact: true })
    await trigger.scrollIntoViewIfNeeded()
    const [scrollNearBottom, scrollNearTop, documentTop] = await trigger.evaluate((element) => {
      const top = window.scrollY + element.getBoundingClientRect().top
      const nearBottom = Math.max(0, top - 500)
      const nearTop = Math.max(0, top - 30)
      window.scrollTo(0, nearBottom)
      return [nearBottom, nearTop, top]
    })
    await trigger.click()

    const menu = page.getByRole('menu', { name: menuName })
    await expect(menu).toHaveClass(/opening-up/)
    const twoItemThreshold = await menu.evaluate((element) => {
      const height = element.firstElementChild?.getBoundingClientRect().height ?? 0
      const styles = getComputedStyle(element)
      const gap = Number.parseFloat(styles.rowGap) || Number.parseFloat(styles.gap) || 0
      const margin =
        Number.parseFloat(styles.getPropertyValue('--_yam3x-fab-menu-window-margin')) || 16
      return { threshold: 2 * height + gap, margin }
    })
    await page.evaluate(
      ({ top, documentTop }) => window.scrollTo(0, Math.max(0, documentTop - top)),
      { top: twoItemThreshold.margin + twoItemThreshold.threshold + 1, documentTop },
    )
    await expect(menu).toHaveClass(/opening-up/)
    await page.evaluate(
      ({ top, documentTop }) => window.scrollTo(0, Math.max(0, documentTop - top)),
      { top: twoItemThreshold.margin + twoItemThreshold.threshold - 1, documentTop },
    )
    await expect(menu).toHaveClass(/opening-down/)
    await page.evaluate((top) => window.scrollTo(0, top), scrollNearTop)
    await expect(menu).toHaveClass(/opening-down/)
    await page.evaluate((top) => window.scrollTo(0, top), scrollNearBottom)
    await expect(menu).toHaveClass(/opening-up/)
    await trigger.click()
  }

  await expectDirectionToTrackScroll('Create', 'Create actions')
  await expectDirectionToTrackScroll('Create with composed menu', 'Create actions')
})

test('FAB menu supports cancelable action selection without closing prematurely', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const host = page.locator('.fab-menu-demo__menu')
  await host.evaluate((element) => {
    element.addEventListener('beforeselect', (event) => {
      if ((event as CustomEvent<{ item: { value: string } }>).detail.item.value === 'photo')
        event.preventDefault()
    })
  })
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Take photo' }).click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('fab-menu-result')).toHaveText('No action selected')
  await page.getByRole('menuitem', { name: 'Upload file' }).click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByTestId('fab-menu-result')).toHaveText('Selected: Upload file')
})

test('FAB menu variants, sizes, RTL placement, reduced motion, and forced colors render accessibly', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  const size = page.getByLabel('Trigger FAB size')
  for (const [name, width] of [
    ['small', 40],
    ['default', 56],
    ['medium', 80],
    ['large', 96],
  ] as const) {
    await selectM3Option(page, size, name)
    await expect(trigger).toHaveCSS('width', `${width}px`)
    await trigger.click()
    await expect
      .poll(() => trigger.evaluate((element) => element.getBoundingClientRect().width))
      .toBe(56)
    await trigger.click()
    await expect
      .poll(() => trigger.evaluate((element) => element.getBoundingClientRect().width))
      .toBe(width)
  }
  await selectM3Option(page, size, 'large')
  await selectM3Option(page, page.getByLabel('FAB Menu color'), 'tertiary')
  await trigger.click()
  const item = page.getByRole('menuitem', { name: 'Take photo' })
  const tertiaryContainer = await page.locator('.vp-doc').evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.backgroundColor = 'var(--md-sys-color-tertiary-container)'
    element.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  })
  await expect(item).toHaveCSS('background-color', tertiaryContainer)
  await page.locator('.fab-menu-demo').evaluate((element) => {
    element.setAttribute('dir', 'rtl')
  })
  await expect
    .poll(() =>
      page
        .locator('.yam3x-fab-menu__panel')
        .evaluate((element) => getComputedStyle(element).direction),
    )
    .toBe('rtl')
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const transitionSeconds = await trigger.evaluate((element) =>
    Math.max(
      ...getComputedStyle(element)
        .transitionDuration.split(',')
        .map((value) => Number.parseFloat(value)),
    ),
  )
  expect(transitionSeconds).toBeLessThanOrEqual(0.00002)
  await expect(item).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(item).toHaveCSS('color', 'rgb(0, 0, 0)')
})

test('FAB menu M3 customization hooks affect the rendered items and menu geometry', async ({
  page,
}) => {
  await page.goto('/components/fab-menu')
  const trigger = page.getByRole('button', { name: 'Create', exact: true })
  await trigger.focus()
  await trigger.press('Enter')
  const host = page.locator('.fab-menu-demo__menu')
  const panel = page.locator('.yam3x-fab-menu__panel')
  const item = page.getByRole('menuitem', { name: 'Take photo' })
  const hooks: Array<{
    name: string
    value: string
    selector: string
    property: string
    expected?: string
  }> = [
    {
      name: '--yam3x-fab-menu-spacing',
      value: '10px',
      selector: '.yam3x-fab-menu__panel',
      property: 'gap',
      expected: '10px',
    },
    {
      name: '--yam3x-fab-menu-max-width',
      value: '220px',
      selector: '.yam3x-fab-menu__panel',
      property: 'max-width',
    },
    {
      name: '--yam3x-primary-fab-color',
      value: 'rgb(21, 22, 23)',
      selector: '.yam3x-fab-menu__item',
      property: 'color',
      expected: 'rgb(21, 22, 23)',
    },
    {
      name: '--yam3x-primary-fab-container-color',
      value: 'rgb(31, 32, 33)',
      selector: '.yam3x-fab-menu__item',
      property: 'background-color',
      expected: 'rgb(31, 32, 33)',
    },
    {
      name: '--yam3x-primary-fab-hover-color',
      value: 'rgb(41, 42, 43)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-primary-fab-focus-color',
      value: 'rgb(51, 52, 53)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-primary-fab-ripple-color',
      value: 'rgb(61, 62, 63)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-ripple-color',
    },
    {
      name: '--yam3x-secondary-fab-color',
      value: 'rgb(71, 72, 73)',
      selector: '.yam3x-fab-menu__item',
      property: 'color',
    },
    {
      name: '--yam3x-secondary-fab-container-color',
      value: 'rgb(81, 82, 83)',
      selector: '.yam3x-fab-menu__item',
      property: 'background-color',
    },
    {
      name: '--yam3x-secondary-fab-hover-color',
      value: 'rgb(91, 92, 93)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-secondary-fab-focus-color',
      value: 'rgb(101, 102, 103)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-secondary-fab-ripple-color',
      value: 'rgb(111, 112, 113)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-ripple-color',
    },
    {
      name: '--yam3x-tertiary-fab-color',
      value: 'rgb(121, 122, 123)',
      selector: '.yam3x-fab-menu__item',
      property: 'color',
    },
    {
      name: '--yam3x-tertiary-fab-container-color',
      value: 'rgb(131, 132, 133)',
      selector: '.yam3x-fab-menu__item',
      property: 'background-color',
    },
    {
      name: '--yam3x-tertiary-fab-hover-color',
      value: 'rgb(141, 142, 143)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-tertiary-fab-focus-color',
      value: 'rgb(151, 152, 153)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-state-layer-color',
    },
    {
      name: '--yam3x-tertiary-fab-ripple-color',
      value: 'rgb(161, 162, 163)',
      selector: '.yam3x-fab-menu__item',
      property: '--yam3x-ripple-color',
    },
    {
      name: '--yam3x-fab-menu-item-height',
      value: '64px',
      selector: '.yam3x-fab-menu__item',
      property: 'min-height',
      expected: '64px',
    },
    {
      name: '--yam3x-fab-menu-item-font-size',
      value: '18px',
      selector: '.yam3x-fab-menu__item',
      property: 'font-size',
      expected: '18px',
    },
    {
      name: '--yam3x-fab-menu-item-font-weight',
      value: '600',
      selector: '.yam3x-fab-menu__item',
      property: 'font-weight',
      expected: '600',
    },
    {
      name: '--yam3x-fab-menu-item-line-height',
      value: '26px',
      selector: '.yam3x-fab-menu__item',
      property: 'line-height',
      expected: '26px',
    },
    {
      name: '--yam3x-fab-menu-item-tracking',
      value: '1px',
      selector: '.yam3x-fab-menu__item',
      property: 'letter-spacing',
      expected: '1px',
    },
    {
      name: '--yam3x-fab-menu-item-shape',
      value: '12px',
      selector: '.yam3x-fab-menu__item',
      property: 'border-top-left-radius',
      expected: '12px',
    },
    {
      name: '--yam3x-fab-menu-item-leading-space',
      value: '21px',
      selector: '.yam3x-fab-menu__item',
      property: 'padding-inline-start',
      expected: '21px',
    },
    {
      name: '--yam3x-fab-menu-item-trailing-space',
      value: '22px',
      selector: '.yam3x-fab-menu__item',
      property: 'padding-inline-end',
      expected: '22px',
    },
    {
      name: '--yam3x-fab-menu-item-top-space',
      value: '11px',
      selector: '.yam3x-fab-menu__item',
      property: 'padding-top',
      expected: '11px',
    },
    {
      name: '--yam3x-fab-menu-item-bottom-space',
      value: '13px',
      selector: '.yam3x-fab-menu__item',
      property: 'padding-bottom',
      expected: '13px',
    },
    {
      name: '--yam3x-fab-menu-item-spacing',
      value: '15px',
      selector: '.yam3x-fab-menu__item',
      property: 'gap',
      expected: '15px',
    },
    {
      name: '--yam3x-fab-menu-item-icon-size',
      value: '30px',
      selector: '.fab-menu-demo__item-icon',
      property: 'width',
      expected: '30px',
    },
  ]
  for (const hook of hooks) {
    const variant = hook.name.match(/^--yam3x-(primary|secondary|tertiary)-fab-/)?.[1]
    if (variant) {
      await selectM3Option(page, page.getByLabel('FAB Menu color'), variant)
      await trigger.click()
      await expect(item).toBeVisible()
    }
    await host.evaluate(
      (element, [name, value]) => {
        ;(element as HTMLElement).style.setProperty(name, value)
      },
      [hook.name, hook.value],
    )
    const target =
      hook.selector === '.yam3x-fab-menu__panel'
        ? panel
        : hook.selector === '.fab-menu-demo__item-icon'
          ? item.locator('.fab-menu-demo__item-icon')
          : item
    if (hook.name.endsWith('-focus-color')) {
      await page.mouse.move(0, 0)
      await trigger.focus()
      if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.press('Enter')
      await expect(page.getByRole('menu')).toBeVisible()
      await page.keyboard.press('ArrowDown')
      await expect(item).toBeFocused()
    }
    if (hook.name.endsWith('-hover-color')) {
      await item.evaluate((element) => element.blur())
      await item.hover()
    }
    if (hook.expected) await expect(target).toHaveCSS(hook.property as never, hook.expected)
    else {
      await expect
        .poll(() =>
          target.evaluate(
            (element, property) => getComputedStyle(element).getPropertyValue(property),
            hook.property,
          ),
        )
        .toContain(hook.value)
    }
  }
  const disabled = page.getByRole('menuitem', { name: 'Unavailable' })
  const originalDisabledBackground = await disabled.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  const originalDisabledColor = await disabled.evaluate(
    (element) => getComputedStyle(element).color,
  )
  await host.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-fab-menu-item-disabled-container-color',
      'rgb(171, 172, 173)',
    ),
  )
  await expect
    .poll(() => disabled.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(originalDisabledBackground)
  await host.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-fab-menu-item-disabled-container-opacity',
      '100%',
    ),
  )
  await expect
    .poll(() => disabled.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toContain('0.670588')
  await host.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--yam3x-fab-menu-item-disabled-color',
      'rgb(181, 182, 183)',
    ),
  )
  await expect
    .poll(() => disabled.evaluate((element) => getComputedStyle(element).color))
    .not.toBe(originalDisabledColor)
  await host.evaluate((element) =>
    (element as HTMLElement).style.setProperty('--yam3x-fab-menu-item-disabled-opacity', '100%'),
  )
  await expect
    .poll(() => disabled.evaluate((element) => getComputedStyle(element).color))
    .toContain('0.709804')
})
