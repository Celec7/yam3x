import { expect, test } from '@playwright/test'

test('SplitPane exposes a named separator and lays out its panes at the selected proportion', async ({
  page,
}) => {
  // split-pane.extension.separator
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  await expect(separator).toHaveAttribute('aria-valuenow', '66')
  await expect(separator).toHaveAttribute('aria-controls', /yam3x-split-pane-start/)
  const geometry = await root.evaluate((element) => {
    const start = element.querySelector<HTMLElement>('.yam3x-split-pane__start')!
    const end = element.querySelector<HTMLElement>('.yam3x-split-pane__end')!
    const rootRect = element.getBoundingClientRect()
    return {
      rootWidth: rootRect.width,
      startWidth: start.getBoundingClientRect().width,
      endWidth: end.getBoundingClientRect().width,
      trackWidth: element.querySelector<HTMLElement>('[role="separator"]')!.getBoundingClientRect()
        .width,
    }
  })
  expect(geometry.trackWidth).toBe(24)
  expect(geometry.startWidth / (geometry.rootWidth - geometry.trackWidth)).toBeCloseTo(0.66, 1)
  expect(geometry.endWidth).toBeGreaterThan(0)
})

test('SplitPane coalesces dense pointer input to the latest frame and settles at the release detent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  const metrics = await root.evaluate((element) => {
    const separator = element.querySelector<HTMLElement>('[role="separator"]')!
    const rootRect = element.getBoundingClientRect()
    const handleRect = separator.getBoundingClientRect()
    let inputs = 0
    let changes = 0
    element.addEventListener('input', () => inputs++)
    element.addEventListener('change', () => changes++)
    const pointer = (type: string, x: number) =>
      separator.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 42,
          pointerType: 'mouse',
          isPrimary: true,
          button: 0,
          clientX: x,
          clientY: handleRect.y + handleRect.height / 2,
        }),
      )
    const startX = handleRect.x + handleRect.width / 2
    const releaseX = rootRect.x + rootRect.width * 0.77
    pointer('pointerdown', startX)
    for (let step = 1; step <= 80; step++)
      pointer('pointermove', startX + ((releaseX - startX) * step) / 80)
    pointer('pointerup', releaseX)
    return { inputs, changes }
  })
  await expect(page.getByRole('separator', { name: 'Main content' })).toHaveAttribute(
    'aria-valuenow',
    '75',
  )
  expect(metrics.inputs).toBeLessThanOrEqual(2)
  expect(metrics.changes).toBe(1)
  await expect(page.getByTestId('split-pane-result')).toContainText('Current ratio: 75% / 25%')
  await expect(root).toHaveClass(/yam3x-split-pane--settling/)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
  const settlingWidth = (await root.locator('.yam3x-split-pane__start').boundingBox())!.width
  const finalWidth = ((await root.boundingBox())!.width - 24) * 0.75
  expect(settlingWidth).toBeGreaterThan(361)
  expect(settlingWidth).toBeLessThan(finalWidth)
  await expect(root).not.toHaveClass(/yam3x-split-pane--settling/)
})

test('SplitPane desktop divider follows physical pointer distance in LTR and RTL', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  const startPane = root.locator('.yam3x-split-pane__start')

  for (const direction of ['ltr', 'rtl'] as const) {
    await separator.scrollIntoViewIfNeeded()
    if (direction === 'rtl') await page.getByRole('checkbox', { name: 'RTL' }).check()
    await expect(page.locator('.split-pane-demo')).toHaveAttribute('dir', direction)
    const start = await startPane.boundingBox()
    const divider = await separator.boundingBox()
    expect(start).not.toBeNull()
    expect(divider).not.toBeNull()
    await page.mouse.move(divider!.x + divider!.width / 2, divider!.y + divider!.height / 2)
    await page.mouse.down()
    await expect(root).toHaveClass(/yam3x-split-pane--dragging/)
    await page.mouse.move(
      divider!.x + divider!.width / 2 + (direction === 'ltr' ? 30 : -30),
      divider!.y + divider!.height / 2,
      { steps: 4 },
    )
    await expect
      .poll(async () => Math.abs((await startPane.boundingBox())!.width - start!.width))
      .toBeGreaterThan(20)
    expect(Math.abs((await startPane.boundingBox())!.width - start!.width)).toBeCloseTo(30, 0)
    await page.mouse.up()
    await expect(root).not.toHaveClass(/yam3x-split-pane--dragging/)
    await expect(root).not.toHaveClass(/yam3x-split-pane--settling/)
    if (direction === 'rtl')
      await expect(separator).toHaveAttribute('aria-valuenow', /(?:71|72|73|74|75)/)
  }
})

test('SplitPane can be grabbed again during detent settlement without a position jump', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  const startPane = root.locator('.yam3x-split-pane__start')
  await separator.scrollIntoViewIfNeeded()
  const initialDivider = await separator.boundingBox()
  expect(initialDivider).not.toBeNull()
  const centerY = initialDivider!.y + initialDivider!.height / 2
  await page.mouse.move(initialDivider!.x + initialDivider!.width / 2, centerY)
  await page.mouse.down()
  await page.mouse.move(initialDivider!.x + initialDivider!.width / 2 + 40, centerY, { steps: 4 })
  await page.mouse.up()
  await expect(root).toHaveClass(/yam3x-split-pane--settling/)
  await page.waitForTimeout(45)

  const beforeGrab = await startPane.boundingBox()
  const movingDivider = await separator.boundingBox()
  expect(beforeGrab).not.toBeNull()
  expect(movingDivider).not.toBeNull()
  const pointerX = movingDivider!.x + movingDivider!.width / 2
  const pointerY = movingDivider!.y + movingDivider!.height / 2
  await page.mouse.move(pointerX, pointerY)
  await root.evaluate((element) => {
    element.addEventListener(
      'pointerdown',
      () => {
        element.dataset.startWidthAtGrab = `${element.querySelector('.yam3x-split-pane__start')!.getBoundingClientRect().width}`
      },
      { capture: true, once: true },
    )
  })
  await page.mouse.down()
  await expect(root).toHaveClass(/yam3x-split-pane--dragging/)
  const widthAtGrab = Number(await root.getAttribute('data-start-width-at-grab'))
  expect((await startPane.boundingBox())!.width).toBeCloseTo(widthAtGrab, 0)
  await page.mouse.move(pointerX + 20, pointerY, { steps: 3 })
  expect((await startPane.boundingBox())!.width - widthAtGrab).toBeCloseTo(20, 0)
  await page.mouse.up()
})

test('SplitPane restores the drag-start value on pointer cancellation and honors beforeinput cancellation', async ({
  page,
}) => {
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  await root.evaluate((element) => {
    const separator = element.querySelector<HTMLElement>('[role="separator"]')!
    const rect = separator.getBoundingClientRect()
    const rootRect = element.getBoundingClientRect()
    const pointer = (type: string, x: number) =>
      separator.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 43,
          pointerType: 'mouse',
          isPrimary: true,
          button: 0,
          clientX: x,
          clientY: rect.y + rect.height / 2,
        }),
      )
    const startX = rect.x + rect.width / 2
    pointer('pointerdown', startX)
    pointer('pointermove', startX + rootRect.width / 10)
  })
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
  await root.evaluate((element) => {
    const separator = element.querySelector<HTMLElement>('[role="separator"]')!
    const rect = separator.getBoundingClientRect()
    separator.dispatchEvent(
      new PointerEvent('pointercancel', {
        bubbles: true,
        pointerId: 43,
        clientX: rect.x,
        clientY: rect.y,
      }),
    )
  })
  await expect(page.getByRole('separator', { name: 'Main content' })).toHaveAttribute(
    'aria-valuenow',
    '66',
  )

  await root.evaluate((element) => {
    element.addEventListener('beforeinput', (event) => event.preventDefault(), { once: true })
    const separator = element.querySelector<HTMLElement>('[role="separator"]')!
    const rect = separator.getBoundingClientRect()
    const rootRect = element.getBoundingClientRect()
    const startX = rect.x + rect.width / 2
    const pointer = (type: string, x: number) =>
      separator.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 44,
          pointerType: 'mouse',
          isPrimary: true,
          button: 0,
          clientX: x,
          clientY: rect.y + rect.height / 2,
        }),
      )
    pointer('pointerdown', startX)
    pointer('pointermove', startX + rootRect.width / 12)
    pointer('pointerup', startX + rootRect.width / 12)
  })
  await expect(page.getByRole('separator', { name: 'Main content' })).toHaveAttribute(
    'aria-valuenow',
    '66',
  )
})

test('SplitPane keyboard resizing follows direction, detents, and collapse-restore semantics', async ({
  page,
}) => {
  // split-pane.extension.keyboard
  await page.goto('/components/split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  await separator.focus()
  await page.keyboard.press('ArrowRight')
  await expect(separator).toHaveAttribute('aria-valuenow', '75')
  await page.keyboard.press('Enter')
  await expect(separator).toHaveAttribute('aria-valuenow', '25')
  await page.keyboard.press('Enter')
  await expect(separator).toHaveAttribute('aria-valuenow', '75')
  await page.keyboard.press('Home')
  await expect(separator).toHaveAttribute('aria-valuenow', '25')
  await page.keyboard.press('End')
  await expect(separator).toHaveAttribute('aria-valuenow', '75')
  await page.getByRole('checkbox', { name: 'RTL' }).check()
  await expect(page.locator('.split-pane-demo')).toHaveAttribute('dir', 'rtl')
  await separator.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowLeft')
  await expect(separator).toHaveAttribute('aria-valuenow', '50')
  await page.keyboard.press('ArrowLeft')
  await expect(separator).toHaveAttribute('aria-valuenow', '66')
  await page.keyboard.press('ArrowLeft')
  await expect(separator).toHaveAttribute('aria-valuenow', '75')
  await page.keyboard.press('ArrowRight')
  await expect(separator).toHaveAttribute('aria-valuenow', '66')
})

test('SplitPane auto orientation follows compact, medium, and expanded supporting-pane layouts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 700 })
  await page.goto('/components/split-pane')
  const root = page.locator('.yam3x-split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  await expect(root).toHaveClass(/yam3x-split-pane--vertical/)
  await expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
  await expect(root.getByRole('heading', { name: 'Main content' })).toBeVisible()
  await expect(root.getByRole('heading', { name: 'Supporting content' })).toBeVisible()
  await page.setViewportSize({ width: 840, height: 700 })
  await expect(root).toHaveClass(/yam3x-split-pane--horizontal/)
  await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  await page.setViewportSize({ width: 800, height: 700 })
  await expect(root).toHaveClass(/yam3x-split-pane--vertical/)
  await page.setViewportSize({ width: 599, height: 700 })
  await expect(root).toHaveClass(/yam3x-split-pane--vertical/)
  await expect(page.getByRole('separator', { name: 'Main content' })).toHaveCount(0)
  await expect(root.locator('.yam3x-split-pane__start')).toHaveCSS('display', 'block')
  await expect(root.locator('.yam3x-split-pane__end')).toHaveCSS('display', 'none')
  await page.getByRole('button', { name: 'Show supporting (compact)' }).click()
  await expect(root.locator('.yam3x-split-pane__start')).toHaveCSS('display', 'none')
  await expect(root.locator('.yam3x-split-pane__end')).toHaveCSS('display', 'block')
  await expect(root.getByRole('heading', { name: 'Supporting content' })).toBeVisible()
  await page.getByRole('button', { name: 'Show primary (compact)' }).click()
  await page.getByRole('checkbox', { name: 'Show supporting pane' }).uncheck()
  await expect(page.getByRole('separator')).toHaveCount(0)
  await expect(root.locator('.yam3x-split-pane__start')).toHaveCSS('display', 'block')
  await expect(root.locator('.yam3x-split-pane__start')).toHaveCSS('flex-grow', '1')
  await page.getByRole('checkbox', { name: 'Show main pane' }).uncheck()
  await page.getByRole('checkbox', { name: 'Show supporting pane' }).check()
  await expect(root.locator('.yam3x-split-pane__end')).toHaveCSS('flex-grow', '1')
  await expect(root.getByRole('heading', { name: 'Supporting content' })).toBeVisible()
})

test('SplitPane disables resizing and renders every documented handle style hook', async ({
  page,
}) => {
  await page.goto('/components/split-pane')
  const separator = page.getByRole('separator', { name: 'Main content' })
  await page.getByRole('checkbox', { name: 'Disable dragging' }).check()
  await expect(separator).toHaveAttribute('aria-disabled', 'true')
  await expect(separator).toHaveAttribute('tabindex', '-1')
  await page.getByRole('checkbox', { name: 'Disable dragging' }).uncheck()

  const hooks = [
    '--yam3x-split-pane-drag-handle-color',
    '--yam3x-split-pane-drag-handle-container-width',
    '--yam3x-split-pane-drag-handle-focus-color',
    '--yam3x-split-pane-drag-handle-focus-opacity',
    '--yam3x-split-pane-drag-handle-height',
    '--yam3x-split-pane-drag-handle-hover-color',
    '--yam3x-split-pane-drag-handle-hover-opacity',
    '--yam3x-split-pane-drag-handle-pressed-color',
    '--yam3x-split-pane-drag-handle-pressed-height',
    '--yam3x-split-pane-drag-handle-pressed-shape',
    '--yam3x-split-pane-drag-handle-pressed-width',
    '--yam3x-split-pane-drag-handle-shape',
    '--yam3x-split-pane-drag-handle-width',
  ]
  const inheritedHooks = await separator.evaluate((element) => {
    const root = element.parentElement!
    const handle = element.querySelector<HTMLElement>('.yam3x-split-pane__handle')!
    const hooks = [
      '--yam3x-split-pane-drag-handle-color',
      '--yam3x-split-pane-drag-handle-container-width',
      '--yam3x-split-pane-drag-handle-focus-color',
      '--yam3x-split-pane-drag-handle-focus-opacity',
      '--yam3x-split-pane-drag-handle-height',
      '--yam3x-split-pane-drag-handle-hover-color',
      '--yam3x-split-pane-drag-handle-hover-opacity',
      '--yam3x-split-pane-drag-handle-pressed-color',
      '--yam3x-split-pane-drag-handle-pressed-height',
      '--yam3x-split-pane-drag-handle-pressed-shape',
      '--yam3x-split-pane-drag-handle-pressed-width',
      '--yam3x-split-pane-drag-handle-shape',
      '--yam3x-split-pane-drag-handle-width',
    ]
    for (const hook of hooks)
      root.style.setProperty(
        hook,
        hook.endsWith('opacity')
          ? '0.24'
          : hook.endsWith('color')
            ? 'rgb(1, 2, 3)'
            : hook.endsWith('shape')
              ? '8px'
              : '60px',
      )
    root.style.setProperty('--yam3x-split-pane-drag-handle-container-width', '32px')
    root.style.setProperty('--yam3x-split-pane-drag-handle-width', '8px')
    root.style.setProperty('--yam3x-split-pane-drag-handle-height', '60px')
    root.style.setProperty('--yam3x-split-pane-drag-handle-pressed-width', '14px')
    root.style.setProperty('--yam3x-split-pane-drag-handle-pressed-height', '54px')
    return hooks.map((hook) => getComputedStyle(handle).getPropertyValue(hook).trim())
  })
  expect(inheritedHooks).toHaveLength(hooks.length)
  expect(inheritedHooks.every(Boolean)).toBe(true)
  await expect
    .poll(() => separator.evaluate((element) => element.getBoundingClientRect().width))
    .toBe(32)
  const handle = separator.locator('.yam3x-split-pane__handle')
  await separator.scrollIntoViewIfNeeded()
  const box = await separator.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await expect(page.locator('.yam3x-split-pane')).toHaveClass(/yam3x-split-pane--dragging/)
  await expect
    .poll(() => handle.evaluate((element) => getComputedStyle(element).width))
    .toBe('14px')
  await expect
    .poll(() => handle.evaluate((element) => getComputedStyle(element).height))
    .toBe('54px')
  expect(await handle.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgb(1, 2, 3)',
  )
  await page.mouse.up()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    Number(
      (await handle.evaluate((element) => getComputedStyle(element).transitionDuration)).replace(
        's',
        '',
      ),
    ),
  ).toBeLessThanOrEqual(0.00001)
  await page.emulateMedia({ forcedColors: 'active' })
  await page.getByRole('button', { name: 'Expand main pane' }).focus()
  await page.keyboard.press('Tab')
  await expect(separator).toBeFocused()
  expect(await separator.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
  expect(await separator.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
    'solid',
  )
  expect(await handle.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
    'rgb(1, 2, 3)',
  )
})

test('SplitPane maps handle styling through root System token aliases', async ({ page }) => {
  await page.goto('/components/split-pane')
  const mapping = await page.locator('.yam3x-split-pane').evaluate((root) => {
    const rootStyle = getComputedStyle(root)
    const handle = root.querySelector<HTMLElement>('.yam3x-split-pane__handle')!
    const handleStyle = getComputedStyle(handle)
    const separator = root.querySelector<HTMLElement>('[role="separator"]')!
    const separatorStyle = getComputedStyle(separator)
    const system = (name: string) => rootStyle.getPropertyValue(name).trim()
    return {
      outline: [
        system('--_yam3x-split-pane-system-color-outline'),
        system('--md-sys-color-outline'),
      ],
      onSurface: [
        system('--_yam3x-split-pane-system-color-on-surface'),
        system('--md-sys-color-on-surface'),
      ],
      primary: [
        system('--_yam3x-split-pane-system-color-primary'),
        system('--md-sys-color-primary'),
      ],
      mediumCorner: [
        system('--_yam3x-split-pane-system-shape-corner-medium'),
        system('--md-sys-shape-corner-medium'),
      ],
      defaultSpatial: [
        system('--_yam3x-split-pane-system-motion-default-spatial'),
        system('--md-sys-motion-spring-default-spatial'),
      ],
      fastEffects: [
        system('--_yam3x-split-pane-system-motion-fast-effects'),
        system('--md-sys-motion-spring-fast-effects'),
      ],
      hoverOpacity: [
        system('--_yam3x-split-pane-system-state-hover-opacity'),
        system('--md-sys-state-hover-opacity'),
      ],
      focusOpacity: [
        system('--_yam3x-split-pane-system-state-focus-opacity'),
        system('--md-sys-state-focus-opacity'),
      ],
      handleColor: handleStyle.backgroundColor,
      focusOutline: separatorStyle.outlineColor,
      handleTransitionDuration: handleStyle.transitionDuration,
    }
  })
  const systemMappings = [
    mapping.outline,
    mapping.onSurface,
    mapping.primary,
    mapping.mediumCorner,
    mapping.defaultSpatial,
    mapping.fastEffects,
    mapping.hoverOpacity,
    mapping.focusOpacity,
  ]
  for (const pair of systemMappings) expect(pair[0]).toBe(pair[1])
  expect(mapping.handleColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(mapping.focusOutline).not.toBe('')
  expect(
    mapping.handleTransitionDuration.split(',').every((duration) => duration.trim() === '0.15s'),
  ).toBe(true)
})
