import { expect, test } from '@playwright/test'

test('Select opens an anchored labelled listbox and exposes the current selection', async ({
  page,
}) => {
  // select.a11y.combobox
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  const panel = page.getByRole('listbox', { name: 'Default language' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toHaveAttribute('value', 'TypeScript')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id')) || '')
  await expect(panel.getByRole('option', { name: 'TypeScript' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(trigger).toHaveAttribute('aria-activedescendant', /yam3x-option-/)
  const selected = panel.getByRole('option', { name: 'TypeScript' })
  await expect(selected).toHaveClass(/yam3x-option--active/)
  const activeStyles = await selected.evaluate((element) => ({
    outlineStyle: getComputedStyle(element).outlineStyle,
    focusLayerOpacity: Number(getComputedStyle(element, '::after').opacity),
  }))
  expect(activeStyles.outlineStyle).toBe('none')
  expect(activeStyles.focusLayerOpacity).toBeGreaterThan(0)
  const [triggerBox, panelBox] = await Promise.all([trigger.boundingBox(), panel.boundingBox()])
  expect(triggerBox).not.toBeNull()
  expect(panelBox).not.toBeNull()
  expect(panelBox!.width).toBeCloseTo(triggerBox!.width, 0)
  expect(panelBox!.y).toBeGreaterThan(triggerBox!.y)
  expect(panelBox!.y - (triggerBox!.y + triggerBox!.height)).toBeCloseTo(4, 0)
})

test('Select menu stays opaque above adjacent fields and visually separates option groups', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.click()

  const panel = page.getByRole('listbox', { name: 'Default language' })
  const group = panel.getByRole('group', { name: 'Other' })
  const groupLabel = group.locator('.yam3x-option-group__label')
  const separatorHeight = await groupLabel.evaluate(
    (element) => getComputedStyle(element, '::after').height,
  )
  expect(separatorHeight).toBe('1px')

  const panelBackground = await panel.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  expect(panelBackground.startsWith('rgb(')).toBe(true)
  await groupLabel.click()
  await expect(panel).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Default language' })).toHaveAttribute(
    'value',
    'TypeScript',
  )

  const requiredLabel = page
    .locator('.yam3x-form-field__label')
    .filter({ hasText: 'Required release status' })
  const panelBox = await panel.boundingBox()
  const labelBox = await requiredLabel.boundingBox()
  expect(panelBox).not.toBeNull()
  expect(labelBox).not.toBeNull()
  const labelX = labelBox!.x + labelBox!.width / 2
  const labelY = labelBox!.y + labelBox!.height / 2
  expect(labelX).toBeGreaterThan(panelBox!.x)
  expect(labelX).toBeLessThan(panelBox!.x + panelBox!.width)
  expect(labelY).toBeGreaterThan(panelBox!.y)
  expect(labelY).toBeLessThan(panelBox!.y + panelBox!.height)
  const topmostElementIsInPanel = await page.evaluate(
    ({ x, y, panelId }) => {
      const visible = document.elementFromPoint(x, y)
      return Boolean(visible && document.getElementById(panelId)?.contains(visible))
    },
    { x: labelX, y: labelY, panelId: (await panel.getAttribute('id')) || '' },
  )
  expect(topmostElementIsInPanel).toBe(true)
})

test('Select popup stays visible and anchored through pointer movement and repeated desktop resizes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.click()
  const panel = page.getByRole('listbox', { name: 'Default language' })
  const firstOption = panel.getByRole('option', { name: 'TypeScript' })
  const otherOption = panel.getByRole('option', { name: 'Python' })

  await panel.evaluate((element) => {
    const visibilityChanges: string[] = []
    const observer = new MutationObserver(() =>
      visibilityChanges.push(getComputedStyle(element).visibility),
    )
    observer.observe(element, { attributes: true, attributeFilter: ['style'] })
    ;(
      element as HTMLElement & { visibilityChanges: string[]; stopObserving: () => void }
    ).visibilityChanges = visibilityChanges
    ;(
      element as HTMLElement & { visibilityChanges: string[]; stopObserving: () => void }
    ).stopObserving = () => observer.disconnect()
  })

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await firstOption.hover()
    await otherOption.hover()
    await page.setViewportSize({ width: cycle % 2 ? 1280 : 1279, height: 800 })
    await page.waitForTimeout(60)
  }
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.waitForTimeout(100)

  const stability = await panel.evaluate((element) => {
    const el = element as HTMLElement & { visibilityChanges: string[]; stopObserving: () => void }
    el.stopObserving()
    return {
      visibilityChanges: el.visibilityChanges,
      visibility: getComputedStyle(el).visibility,
      rect: (() => {
        const rect = el.getBoundingClientRect()
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      })(),
    }
  })
  expect(stability.visibility).toBe('visible')
  expect(stability.visibilityChanges.every((value) => value === 'visible')).toBe(true)
  const anchorBox = await trigger.boundingBox()
  expect(anchorBox).not.toBeNull()
  expect(stability.rect.x).toBeCloseTo(anchorBox!.x, 0)
  expect(stability.rect.y).toBeCloseTo(anchorBox!.y + anchorBox!.height + 4, 0)
})

test('Select pointer hover does not auto-scroll the list', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/select')
  await page.getByRole('combobox', { name: 'Default language' }).click()
  const panel = page.getByRole('listbox', { name: 'Default language' })
  await expect(panel).toBeVisible()

  const pointerReachableOptions = await panel.getByRole('option').evaluateAll((elements) => {
    const panelElement = elements[0]?.closest('[role="listbox"]')
    if (!panelElement) return []
    const panelRect = panelElement.getBoundingClientRect()
    const panelStyle = getComputedStyle(panelElement)
    const top =
      panelRect.top + parseFloat(panelStyle.borderTopWidth) + parseFloat(panelStyle.paddingTop)
    const bottom =
      panelRect.bottom -
      parseFloat(panelStyle.borderBottomWidth) -
      parseFloat(panelStyle.paddingBottom)
    return elements
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const y = rect.top + rect.height / 2
        return { x: rect.left + rect.width / 2, y, reachable: y >= top && y <= bottom }
      })
      .filter((option) => option.reachable)
  })
  expect(pointerReachableOptions.length).toBeGreaterThan(1)

  const scrollPositions: number[] = []
  for (const point of pointerReachableOptions) {
    await page.mouse.move(point.x, point.y, { steps: 1 })
    scrollPositions.push(await panel.evaluate((element) => element.scrollTop))
  }
  expect(scrollPositions).toEqual(scrollPositions.map(() => 0))
})

test('Select keeps combobox focus, navigates enabled items, and commits with Enter', async ({
  page,
}) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowDown')
  const javascript = page.getByRole('option', { name: 'JavaScript' })
  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    (await javascript.getAttribute('id')) || '',
  )
  await expect(javascript).toHaveClass(/yam3x-option--active/)
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('value', 'JavaScript')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.select-demo output')).toContainText('change:javascript')
})

test('Select supports Home, End, type-ahead, and wraps through enabled options', async ({
  page,
}) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.focus()
  await page.keyboard.press('End')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    (await page.getByRole('option', { name: 'Rust' }).getAttribute('id')) || '',
  )
  await page.keyboard.press('ArrowDown')
  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    (await page.getByRole('option', { name: 'TypeScript' }).getAttribute('id')) || '',
  )
  await page.keyboard.press('Home')
  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    (await page.getByRole('option', { name: 'TypeScript' }).getAttribute('id')) || '',
  )
  await page.keyboard.press('j')
  const javascript = page.getByRole('option', { name: 'JavaScript' })
  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    (await javascript.getAttribute('id')) || '',
  )
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('value', 'JavaScript')
})

test('Select cancellation retains the value and multi-select stays open and submits each value', async ({
  page,
}) => {
  // select.extension.multiple
  await page.goto('/components/select')
  const single = page.getByRole('combobox', { name: 'Default language' })
  await single.evaluate((element) =>
    element.addEventListener('beforeinput', (event) => event.preventDefault(), { once: true }),
  )
  await single.click()
  await page.getByRole('option', { name: 'JavaScript' }).click()
  await expect(single).toHaveAttribute('value', 'TypeScript')
  await expect(single).toHaveAttribute('aria-expanded', 'true')

  await page.getByRole('button', { name: 'Release channels' }).click()
  const multi = page.getByRole('button', { name: 'Release channels' })
  await page.getByRole('option', { name: 'Beta' }).click()
  await expect(multi).toHaveAttribute('aria-expanded', 'true')
  await expect(multi).toHaveAttribute('value', 'Stable, Beta')
  await expect(page.getByRole('listbox', { name: 'Release channels' })).toHaveAttribute(
    'aria-multiselectable',
    'true',
  )
  const submitted = await page
    .locator('#select-demo-form')
    .evaluate((form) => new FormData(form as HTMLFormElement).getAll('channels'))
  expect(submitted).toEqual(['stable', 'beta'])
})

test('Select multiple uses a focused multi-select listbox and returns focus on Escape', async ({
  page,
}) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('button', { name: 'Release channels' })
  await trigger.click()
  const listbox = page.getByRole('listbox', { name: 'Release channels' })
  const stable = listbox.getByRole('option', { name: 'Stable' })
  const beta = listbox.getByRole('option', { name: 'Beta' })

  await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
  await expect(stable).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(beta).toBeFocused()
  await page.keyboard.press('Space')
  await expect(beta).toHaveAttribute('aria-selected', 'true')
  await expect(listbox).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-description', 'Stable, Beta')
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.keyboard.press('Tab')
  await expect(listbox).toBeHidden()
  await expect(trigger).not.toBeFocused()
})

test('Select Escape retains a pending single choice, Tab leaves the trigger, and disabled choices cannot commit', async ({
  page,
}) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('value', 'TypeScript')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  const disabled = page.getByRole('option', { name: 'Unavailable' })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await disabled.click({ force: true })
  await expect(trigger).toHaveAttribute('value', 'TypeScript')

  await trigger.click()
  await page.keyboard.press('Tab')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('button', { name: 'Release channels' })).toBeFocused()
})

test('Select preserves the initial value through native form reset and validates required state', async ({
  page,
}) => {
  await page.goto('/components/select')
  const form = page.locator('#select-demo-form')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.click()
  await page.getByRole('option', { name: 'Rust' }).click()
  await expect(trigger).toHaveAttribute('value', 'Rust')
  await form.evaluate((element) => (element as HTMLFormElement).reset())
  await expect(trigger).toHaveAttribute('value', 'TypeScript')
  const validity = await form.evaluate((element) => (element as HTMLFormElement).checkValidity())
  expect(validity).toBe(false)
})

test('Select associates its native value with a form outside the component subtree', async ({
  page,
}) => {
  await page.goto('/components/select')
  const externalForm = page.locator('#external-select-form')
  const native = page.locator('.select-demo select[form="external-select-form"]')
  await expect(native).toHaveValue('external')
  const entries = await externalForm.evaluate((form) => [
    ...new FormData(form as HTMLFormElement).entries(),
  ])
  expect(entries).toEqual([['external-choice', 'external']])
})

test('Select required state fails native form validation until an option is chosen', async ({
  page,
}) => {
  await page.goto('/components/select')
  const form = page.locator('#select-demo-form')
  const trigger = page.getByRole('combobox', { name: 'Required release status' })
  const initiallyValid = await form.evaluate((element) =>
    (element as HTMLFormElement).checkValidity(),
  )
  expect(initiallyValid).toBe(false)
  await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  const field = page.locator('.yam3x-form-field').filter({ has: trigger })
  await expect(field.locator('.yam3x-form-field__error')).toContainText('Please select')
  await trigger.click()
  await page.getByRole('option', { name: 'Draft' }).click()
  await expect(field.locator('.yam3x-form-field__error')).toHaveCount(0)
  await expect(trigger).not.toHaveAttribute('aria-invalid')
  const selectedValid = await form.evaluate((element) =>
    (element as HTMLFormElement).checkValidity(),
  )
  expect(selectedValid).toBe(true)
})

test('Select forwards FormField naming, required, and explicit control ids', async ({ page }) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await expect(trigger).toHaveAttribute('aria-labelledby', /yam3x-form-field-label/)
  await expect(trigger).toHaveAttribute('aria-required', 'true')
  await expect(trigger).toHaveAttribute('id', /yam3x-select-/)
  await expect(trigger).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  const native = page.locator('.select-demo select[name="language"]')
  await expect(native).toHaveAttribute('required', '')
  await expect(native).toHaveAttribute('aria-hidden', 'true')
})

test('Select mirrors popup positioning and text in RTL and resizes with its desktop anchor', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/select')
  await page.locator('.select-demo').evaluate((element) => {
    element.setAttribute('dir', 'rtl')
  })
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  await trigger.click()
  const panel = page.getByRole('listbox', { name: 'Default language' })
  const [triggerBox, panelBox] = await Promise.all([trigger.boundingBox(), panel.boundingBox()])
  expect(panelBox!.width).toBeCloseTo(triggerBox!.width, 0)
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(triggerBox!.x + triggerBox!.width + 1)
  await page.setViewportSize({ width: 360, height: 700 })
  await expect.poll(async () => (await panel.boundingBox())?.width ?? 0).toBeLessThanOrEqual(344)
  await expect(trigger).toHaveAttribute('value', 'TypeScript')
})

test('Select applies its component-level shape, icon, and disabled color values', async ({
  page,
}) => {
  await page.goto('/components/select')
  const field = page.locator('.select-demo .yam3x-select').first()
  await field.evaluate((element) => {
    element.style.setProperty('--yam3x-select-container-shape', '14px')
    element.style.setProperty('--yam3x-select-icon-size', '32px')
    element.style.setProperty('--yam3x-select-panel-max-width', '160px')
  })
  await expect(field).toHaveCSS('border-radius', '14px')
  await expect(field.locator('.yam3x-select__arrow')).toHaveCSS('width', '32px')
  await field.getByRole('combobox').click()
  await expect(page.getByRole('listbox')).toHaveCSS('max-width', '160px')
  await field.getByRole('combobox').press('Escape')
  const disabled = page.locator('.select-demo .yam3x-select').last()
  await disabled.evaluate((element) => {
    element.classList.add('yam3x-select--disabled')
    element.style.setProperty('--yam3x-select-disabled-color', 'rgb(255, 0, 0)')
    element.style.setProperty('--yam3x-select-disabled-color-opacity', '100%')
  })
  expect(await disabled.evaluate((element) => getComputedStyle(element).color)).toMatch(
    /(?:255, 0, 0|srgb 1 0 0)/,
  )
})

test('Select honors reduced motion and keeps focus visible in forced colors', async ({ page }) => {
  await page.goto('/components/select')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const trigger = page.getByRole('combobox', { name: 'Default language' })
  const duration = await trigger.evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration.split(',').map((value) => parseFloat(value))).toContain(0)
  await page.emulateMedia({ forcedColors: 'active' })
  await trigger.focus()
  await expect(trigger).toHaveCSS('outline-style', 'solid')
})

test('Select blocks disabled triggers and announces an empty option list', async ({ page }) => {
  await page.goto('/components/select')
  const disabled = page.getByRole('combobox', { name: 'Disabled' })
  await expect(disabled).toBeDisabled()
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await disabled.click({ force: true })
  await expect(disabled).toHaveAttribute('aria-expanded', 'false')

  const empty = page.getByRole('combobox', { name: 'No options' })
  await empty.click()
  const listbox = page.getByRole('listbox', { name: 'No options' })
  await expect(listbox.getByRole('status')).toHaveText('No options available')
  await expect(listbox.getByRole('option')).toHaveCount(0)
})

test('Select multi-selection toggles from focused list options without closing', async ({
  page,
}) => {
  await page.goto('/components/select')
  const trigger = page.getByRole('button', { name: 'Release channels' })
  await trigger.focus()
  await page.keyboard.press('Space')
  const stable = page.getByRole('option', { name: 'Stable' })
  await expect(stable).toBeFocused()
  await page.keyboard.press('ArrowDown')
  const beta = page.getByRole('option', { name: 'Beta' })
  await expect(beta).toBeFocused()
  await page.keyboard.press('Space')
  await expect(beta).toHaveAttribute('aria-selected', 'true')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(beta).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-description', 'Stable, Beta')
})
