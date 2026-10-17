import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/tooltip')
})

test('plain tooltip labels an icon control with specified geometry and reading time', async ({
  page,
}) => {
  // tooltip.geometry.plain
  const trigger = page.getByRole('button', { name: 'Help' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: /^Help/ })
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-tooltip-/)
  await trigger.hover()
  await expect(tooltip).toBeVisible()
  const id = await tooltip.getAttribute('id')
  expect(id).toBeTruthy()
  await expect(trigger).toHaveAttribute('aria-describedby', new RegExp(`(?:^|\\s)${id}(?:$|\\s)`))
  await expect(tooltip).toHaveCSS('min-height', '24px')
  await expect(tooltip).toHaveCSS('padding', '4px 8px')
  await expect(tooltip).toHaveCSS('border-radius', '4px')
  await expect
    .poll(() => tooltip.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(24)
  const roleColors = await tooltip.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.backgroundColor = 'var(--md-sys-color-inverse-surface)'
    probe.style.color = 'var(--md-sys-color-inverse-on-surface)'
    document.body.append(probe)
    const expected = {
      background: getComputedStyle(probe).backgroundColor,
      color: getComputedStyle(probe).color,
    }
    const actual = {
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }
    probe.remove()
    return { expected, actual }
  })
  expect(roleColors.actual).toEqual(roleColors.expected)
  await page.waitForTimeout(180)
  const geometry = await Promise.all([
    trigger.evaluate((element) => element.getBoundingClientRect().top),
    tooltip.evaluate((element) => element.getBoundingClientRect().bottom),
  ])
  expect(geometry[0] - geometry[1]).toBeCloseTo(4, 0)

  await tooltip.hover()
  await expect(tooltip).toBeVisible()
  await page.mouse.move(4, 4)
  await page.waitForTimeout(1200)
  await expect(tooltip).toBeVisible()
  await page.waitForTimeout(500)
  await expect(tooltip).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-describedby', new RegExp(id!))
})

test('keyboard-visible focus opens a plain tooltip and Escape dismisses it', async ({ page }) => {
  // tooltip.a11y.keyboard
  const trigger = page.getByRole('button', { name: 'Help' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: /^Help/ })
  await trigger.focus()
  await expect(tooltip).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-tooltip-/)
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-tooltip-/)
})

test('an unspecified plain tooltip in a header defaults below its target', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Toolbar actions' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: /^Toolbar actions/ })
  await trigger.hover()
  await expect(tooltip).toBeVisible()
  await page.waitForTimeout(180)
  const [triggerRect, tooltipRect] = await Promise.all([
    trigger.evaluate((element) => element.getBoundingClientRect()),
    tooltip.evaluate((element) => element.getBoundingClientRect()),
  ])
  expect(tooltipRect.top).toBeGreaterThanOrEqual(triggerRect.bottom)
  expect(tooltipRect.top - triggerRect.bottom).toBeCloseTo(8, 0)
})

test('only one tooltip is open, and placement flips away from the viewport edge', async ({
  page,
}) => {
  const help = page.getByRole('button', { name: 'Help' })
  const info = page.getByRole('button', { name: 'More information' })
  const first = page.getByRole('tooltip').filter({ hasText: /^Help/ })
  const second = page.getByRole('tooltip').filter({ hasText: /^More info/ })
  await help.hover()
  await expect(first).toBeVisible()
  await info.hover()
  await expect(second).toBeVisible()
  await expect(first).toBeHidden()
  await info.evaluate((element) => {
    element.style.backgroundColor = 'rgb(103, 80, 164)'
  })
  await page.waitForTimeout(180)
  const visibleBoundaryGap = await Promise.all([
    info.evaluate((element) => element.getBoundingClientRect().bottom),
    second.evaluate((element) => element.getBoundingClientRect().top),
  ])
  expect(visibleBoundaryGap[1] - visibleBoundaryGap[0]).toBeCloseTo(4, 0)

  await info.evaluate((element) => {
    element.style.position = 'fixed'
    element.style.inset = 'auto 4px 4px auto'
  })
  await info.hover()
  const [triggerRect, tooltipRect] = await Promise.all([
    info.evaluate((element) => element.getBoundingClientRect().toJSON()),
    second.evaluate((element) => element.getBoundingClientRect().toJSON()),
  ])
  const horizontalShift = await second.evaluate((element) => {
    const tooltipRect = element.getBoundingClientRect()
    const anchorRect = document.querySelector('#tooltip-info-trigger')!.getBoundingClientRect()
    const centeredLeft = (anchorRect.left + anchorRect.right - tooltipRect.width) / 2
    return tooltipRect.left - centeredLeft
  })
  expect(tooltipRect.bottom).toBeLessThanOrEqual(triggerRect.top + 1)
  expect(tooltipRect.right).toBeLessThanOrEqual(1272)
  expect(Math.abs(horizontalShift / 8 - Math.round(horizontalShift / 8))).toBeLessThan(0.02)
})

test('cancelable beforetoggle prevents opening and accepted toggles are forwarded', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Help' })
  const tooltip = page.locator('.yam3x-tooltip__surface').first()
  await tooltip.evaluate((element) => {
    element.addEventListener('beforetoggle', (event) => event.preventDefault(), { once: true })
  })
  await trigger.hover()
  await expect(tooltip).toBeHidden()
  await page.mouse.move(4, 4)
  await trigger.hover()
  await expect(tooltip).toBeVisible()
})

test('transient rich tooltip exposes tooltip semantics and its subhead and body description', async ({
  page,
}) => {
  // tooltip.a11y.semantics
  const trigger = page.getByRole('button', { name: 'Sync status' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: 'The last sync' })
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-rich-tooltip-/)
  await trigger.hover()
  await expect(tooltip).toBeVisible()
  await expect(tooltip).toContainText('Sync complete')
  await expect(tooltip).toHaveCSS('border-radius', '12px')
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-rich-tooltip-/)
  await expect(tooltip).toHaveCSS('padding-block-start', '12px')
  await expect(tooltip).toHaveCSS('padding-inline', '16px')
  await expect(tooltip).toHaveCSS('padding-block-end', '8px')
  const typeMetrics = await tooltip.evaluate((element) => {
    const subhead = getComputedStyle(element.querySelector('.yam3x-rich-tooltip__subhead')!)
    const content = getComputedStyle(element.querySelector('.yam3x-rich-tooltip__content')!)
    const subheadProbe = document.createElement('span')
    const contentProbe = document.createElement('span')
    subheadProbe.style.lineHeight = 'var(--md-sys-typescale-label-large-line-height)'
    contentProbe.style.lineHeight = 'var(--md-sys-typescale-body-medium-line-height)'
    document.body.append(subheadProbe, contentProbe)
    const expectedSubheadLineHeight = Number.parseFloat(getComputedStyle(subheadProbe).lineHeight)
    const expectedContentLineHeight = Number.parseFloat(getComputedStyle(contentProbe).lineHeight)
    subheadProbe.remove()
    contentProbe.remove()
    return {
      subhead: {
        fontSize: subhead.fontSize,
        fontWeight: subhead.fontWeight,
        lineHeight: Number.parseFloat(subhead.lineHeight),
        expectedLineHeight: expectedSubheadLineHeight,
        tracking: subhead.letterSpacing,
      },
      content: {
        fontSize: content.fontSize,
        fontWeight: content.fontWeight,
        lineHeight: Number.parseFloat(content.lineHeight),
        expectedLineHeight: expectedContentLineHeight,
        tracking: content.letterSpacing,
      },
    }
  })
  expect(typeMetrics.subhead.fontSize).toBe('14px')
  expect(typeMetrics.subhead.fontWeight).toBe('500')
  expect(typeMetrics.subhead.lineHeight).toBeCloseTo(typeMetrics.subhead.expectedLineHeight, 2)
  expect(typeMetrics.subhead.tracking).toBe('0.1px')
  expect(typeMetrics.content.fontSize).toBe('14px')
  expect(typeMetrics.content.fontWeight).toBe('400')
  expect(typeMetrics.content.lineHeight).toBeCloseTo(typeMetrics.content.expectedLineHeight, 2)
  expect(typeMetrics.content.tracking).toBe('0.25px')
  const roleColors = await tooltip.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.backgroundColor = 'var(--md-sys-color-surface-container)'
    probe.style.color = 'var(--md-sys-color-on-surface-variant)'
    document.body.append(probe)
    const expected = {
      background: getComputedStyle(probe).backgroundColor,
      foreground: getComputedStyle(probe).color,
    }
    const rootStyle = getComputedStyle(element)
    const actual = {
      background: rootStyle.backgroundColor,
      foreground: rootStyle.color,
      subhead: getComputedStyle(element.querySelector('.yam3x-rich-tooltip__subhead')!).color,
      content: getComputedStyle(element.querySelector('.yam3x-rich-tooltip__content')!).color,
    }
    probe.remove()
    return { expected, actual }
  })
  expect(roleColors.actual).toEqual({
    background: roleColors.expected.background,
    foreground: roleColors.expected.foreground,
    subhead: roleColors.expected.foreground,
    content: roleColors.expected.foreground,
  })
  await expect(tooltip).not.toHaveCSS('box-shadow', 'none')

  const centered = await Promise.all([
    trigger.evaluate((element) => element.getBoundingClientRect()),
    tooltip.evaluate((element) => element.getBoundingClientRect()),
  ])
  expect(
    Math.abs(
      (centered[0].left + centered[0].right) / 2 - (centered[1].left + centered[1].right) / 2,
    ),
  ).toBeLessThan(1)
})

test('actionable rich tooltip opens transiently on hover, then click pins it for its actions', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'New sharing features' })
  const dialog = page.getByRole('dialog', { name: 'New sharing settings' })
  await expect(trigger).not.toHaveAttribute('aria-describedby')
  await trigger.hover()
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.waitForTimeout(180)
  const desktopAlignment = await Promise.all([
    trigger.evaluate((element) => element.getBoundingClientRect()),
    dialog.evaluate((element) => element.getBoundingClientRect()),
  ])
  expect(
    Math.abs(
      (desktopAlignment[0].left + desktopAlignment[0].right) / 2 -
        (desktopAlignment[1].left + desktopAlignment[1].right) / 2,
    ),
  ).toBeLessThan(1)
  await page.mouse.move(4, 4)
  await page.waitForTimeout(1600)
  await expect(dialog).toBeHidden()

  await trigger.click()
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(180)
  const actionLayout = await dialog.evaluate((root) => {
    const row = root.querySelector('.yam3x-rich-tooltip__actions')!
    const body = root.querySelector('.yam3x-rich-tooltip__content')!
    const buttons = [...row.querySelectorAll('button')]
    const textRect = (element: Element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const rect = range.getBoundingClientRect()
      return { left: rect.left, right: rect.right }
    }
    const bodyRect = textRect(body)
    const firstRect = textRect(buttons[0].querySelector('.yam3x-button__label')!)
    const secondRect = textRect(buttons[1].querySelector('.yam3x-button__label')!)
    const containerRect = root.getBoundingClientRect()
    const lastActionRect = buttons.at(-1)!.getBoundingClientRect()
    const colorProbe = document.createElement('span')
    colorProbe.style.color = 'var(--md-sys-color-primary)'
    document.body.append(colorProbe)
    const actionColor = getComputedStyle(buttons[0]).color
    const primaryColor = getComputedStyle(colorProbe).color
    colorProbe.remove()
    return {
      justifyContent: getComputedStyle(row).justifyContent,
      bodyLeft: bodyRect.left,
      firstTextLeft: firstRect.left,
      visibleTextGap: secondRect.left - firstRect.right,
      bottomGap: containerRect.bottom - lastActionRect.bottom,
      touchTargetHeight: Number.parseFloat(getComputedStyle(buttons.at(-1)!, '::before').height),
      actionColor,
      primaryColor,
    }
  })
  expect(actionLayout.justifyContent).toBe('flex-start')
  expect(actionLayout.firstTextLeft).toBeCloseTo(actionLayout.bodyLeft, 0)
  expect(actionLayout.visibleTextGap).toBeCloseTo(32, 0)
  expect(actionLayout.bottomGap).toBeCloseTo(8, 0)
  expect(actionLayout.touchTargetHeight).toBeGreaterThanOrEqual(48)
  expect(actionLayout.actionColor).toBe(actionLayout.primaryColor)
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const text = await dialog
    .getByText('Adjust image quality and manage storage for shared albums.')
    .getAttribute('id')
  await expect(dialog).toHaveAttribute('aria-describedby', text!)
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Later' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await dialog.getByRole('button', { name: 'Learn more' }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.getByText('Selected: Learn more')).toBeVisible()
})

test('keyboard focus reveals an actionable rich tooltip and preserves linear focus order', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'New sharing features' })
  const dialog = page.getByRole('dialog', { name: 'New sharing settings' })
  await trigger.focus()
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Later' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('touch and hold reveals an actionable rich tooltip transiently', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'New sharing features' })
  const dialog = page.getByRole('dialog', { name: 'New sharing settings' })
  await trigger.evaluate(async (element) => {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
    await new Promise((resolve) => window.setTimeout(resolve, 550))
    element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }))
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(1600)
  await expect(dialog).toBeHidden()
})

test('rich tooltip defaults to the trailing edge on touch-first viewports', async ({ browser }) => {
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4174/components/tooltip')
    const trigger = page.getByRole('button', { name: 'New sharing features' })
    const dialog = page.getByRole('dialog', { name: 'New sharing settings' })
    await trigger.evaluate((element) => {
      Object.assign((element as HTMLElement).style, {
        position: 'fixed',
        inset: '100px 16px auto auto',
      })
    })
    await trigger.click()
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(180)
    const [triggerRect, dialogRect] = await Promise.all([
      trigger.evaluate((element) => element.getBoundingClientRect()),
      dialog.evaluate((element) => element.getBoundingClientRect()),
    ])
    expect(Math.abs(dialogRect.right - triggerRect.right)).toBeLessThan(1)
    expect(dialogRect.top - triggerRect.bottom).toBeCloseTo(8, 0)
  } finally {
    await context.close()
  }
})

test('persistent rich tooltip opens on click and closes on an outside interaction', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Show persistent tooltip' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: 'tooltip closes' })
  await trigger.click()
  await expect(tooltip).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-rich-tooltip-/)
  await page.getByRole('heading', { name: 'Tooltips' }).click()
  await expect(tooltip).toBeHidden()
})

test('documented CSS overrides customize tooltip colors, shapes, widths, and elevation', async ({
  page,
}) => {
  const plain = page.getByRole('button', { name: 'More information' })
  await plain.hover()
  const plainTooltip = page.getByRole('tooltip').filter({ hasText: /^More info/ })
  const plainStyles = await plainTooltip.evaluate((element) => {
    const style = element as HTMLElement
    const values: Record<string, string> = {
      '--yam3x-tooltip-max-width': '180px',
      '--yam3x-tooltip-shape': '9px',
      '--yam3x-tooltip-container-color': 'rgb(1, 2, 3)',
      '--yam3x-tooltip-supporting-text-color': 'rgb(4, 5, 6)',
    }
    Object.entries(values).forEach(([name, value]) => style.style.setProperty(name, value))
    const computed = getComputedStyle(style)
    return {
      maxWidth: computed.maxWidth,
      minHeight: computed.minHeight,
      shape: computed.borderRadius,
      background: computed.backgroundColor,
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
    }
  })
  expect(plainStyles).toEqual({
    maxWidth: '180px',
    minHeight: '24px',
    shape: '9px',
    background: 'rgb(1, 2, 3)',
    color: 'rgb(4, 5, 6)',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '16px',
  })

  const richTrigger = page.getByRole('button', { name: 'New sharing features' })
  await richTrigger.click()
  const rich = page.getByRole('dialog', { name: 'New sharing settings' })
  const richStyles = await rich.evaluate((element) => {
    const root = element as HTMLElement
    const subhead = root.querySelector('.yam3x-rich-tooltip__subhead')!
    const content = root.querySelector('.yam3x-rich-tooltip__content')!
    const actions = root.querySelector('.yam3x-rich-tooltip__actions')!
    const rootStyle = root.style
    const values: Record<string, string> = {
      '--yam3x-rich-tooltip-max-width': '290px',
      '--yam3x-rich-tooltip-shape': '18px',
      '--yam3x-rich-tooltip-container-color': 'rgb(7, 8, 9)',
      '--yam3x-rich-tooltip-subhead-color': 'rgb(10, 11, 12)',
      '--yam3x-rich-tooltip-supporting-text-color': 'rgb(13, 14, 15)',
      '--yam3x-rich-tooltip-elevation': '0 2px 4px rgb(7 8 9 / 0.5)',
    }
    Object.entries(values).forEach(([name, value]) => rootStyle.setProperty(name, value))
    const style = getComputedStyle(root)
    const subheadStyle = getComputedStyle(subhead)
    const contentStyle = getComputedStyle(content)
    const actionStyle = getComputedStyle(actions)
    return {
      paddingTop: style.paddingBlockStart,
      paddingBottom: style.paddingBlockEnd,
      paddingInline: style.paddingInline,
      maxWidth: style.maxWidth,
      shape: style.borderRadius,
      background: style.backgroundColor,
      subheadColor: subheadStyle.color,
      contentColor: contentStyle.color,
      subheadFontSize: subheadStyle.fontSize,
      contentFontSize: contentStyle.fontSize,
      actionInset: actionStyle.marginInlineStart,
      shadow: style.boxShadow,
    }
  })
  expect(richStyles).toEqual({
    paddingTop: '12px',
    paddingBottom: '0px',
    paddingInline: '16px',
    maxWidth: '290px',
    shape: '18px',
    background: 'rgb(7, 8, 9)',
    subheadColor: 'rgb(10, 11, 12)',
    subheadFontSize: '14px',
    contentColor: 'rgb(13, 14, 15)',
    contentFontSize: '14px',
    actionInset: '-12px',
    shadow: 'rgba(7, 8, 9, 0.5) 0px 2px 4px 0px',
  })
})

test('long plain tooltip text remains available through viewport-bounded scrolling', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'More information' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: /^More info/ })
  await trigger.hover()
  await tooltip.evaluate((element) => {
    element.textContent = `More info. ${'More supplemental detail. '.repeat(500)}End of tooltip content.`
  })
  await expect(tooltip).toHaveCSS('overflow-y', 'auto')
  const dimensions = await tooltip.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    text: element.textContent,
  }))
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight)
  expect(dimensions.text).toContain('End of tooltip content.')
})

test('forced-color tooltips stay readable, and reduced motion removes transitions', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Help' })
  const tooltip = page.getByRole('tooltip').filter({ hasText: /^Help/ })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await trigger.hover()
  await expect(tooltip).toBeVisible()
  await expect(tooltip).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(tooltip).toHaveCSS('color', 'rgb(0, 0, 0)')
  await expect(tooltip).toHaveCSS('border-top-width', '1px')
  const duration = await tooltip.evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(Math.max(...duration.split(',').map((value) => Number.parseFloat(value)))).toBeLessThan(
    0.001,
  )
})
