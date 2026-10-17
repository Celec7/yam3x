import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/radio-group')
  await page.getByRole('radiogroup', { name: 'Ringtone' }).waitFor()
})

test('arrow selection updates the model and forwards native input and change events', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const ganymede = group.getByRole('radio', { name: 'Ganymede' })

  await expect(callisto).toBeChecked()
  await group.evaluate((root) => {
    const names: string[] = []
    const record = (name: string) => {
      names.push(name)
      root.setAttribute('data-radio-events', JSON.stringify(names))
    }
    root.addEventListener('input', (event) => {
      record('input')
      root.setAttribute('data-observed-value', (event.target as HTMLInputElement).value)
    })
    root.addEventListener('change', () => record('change'))
  })
  await callisto.focus()
  await callisto.press('ArrowDown')

  await expect(ganymede).toBeChecked()
  expect(JSON.parse((await group.getAttribute('data-radio-events')) ?? '[]')).toEqual([
    'input',
    'change',
  ])
  expect(await group.getAttribute('data-observed-value')).toBe('ganymede')
  await expect(page.getByTestId('radio-value-observed-on-input')).toContainText('ganymede')
})

test('arrow keys select enabled options in sequence, wrap, and skip disabled options', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const ganymede = group.getByRole('radio', { name: 'Ganymede' })
  const luna = group.getByRole('radio', { name: 'Luna' })
  const none = group.getByRole('radio', { name: 'None' })
  const pickup = group.getByRole('radio', { name: 'Pickup (unavailable)' })

  await expect(pickup).toBeDisabled()
  await callisto.focus()
  await callisto.press('ArrowDown')
  await expect(ganymede).toBeChecked()
  await ganymede.press('ArrowDown')
  await expect(luna).toBeChecked()
  await luna.press('ArrowDown')
  await expect(none).toBeChecked()
  await expect(pickup).not.toBeChecked()
})

test('the active radio stays selected when activated again', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  await group.evaluate((root) => {
    const names: string[] = []
    for (const name of ['input', 'change']) {
      root.addEventListener(name, () => {
        names.push(name)
        root.setAttribute('data-radio-events', JSON.stringify(names))
      })
    }
    root.addEventListener('click', () =>
      root.setAttribute(
        'data-click-events',
        String(Number(root.getAttribute('data-click-events') ?? 0) + 1),
      ),
    )
  })
  await callisto.click()
  await expect(callisto).toBeChecked()
  expect(JSON.parse((await group.getAttribute('data-radio-events')) ?? '[]')).toEqual([])
  expect(await group.getAttribute('data-click-events')).toBe('1')
})

test('Tab enters on the selected option and Shift+Tab enters the last option when none is selected', async ({
  page,
}) => {
  const selectedGroup = page.getByRole('radiogroup', { name: 'Ringtone' })
  await selectedGroup.evaluate((root) => {
    const before = document.createElement('button')
    before.textContent = 'before radio group'
    root.before(before)
    before.focus()
  })
  await page.keyboard.press('Tab')
  await expect(selectedGroup.getByRole('radio', { name: 'Callisto' })).toBeFocused()

  const emptyGroup = page.getByRole('radiogroup', { name: 'Browser notifications' })
  await expect(emptyGroup.getByRole('radio', { name: 'On' })).not.toBeChecked()
  await emptyGroup.evaluate((root) => {
    const after = document.createElement('button')
    after.textContent = 'after radio group'
    root.after(after)
    after.focus()
  })
  await page.keyboard.press('Shift+Tab')
  await expect(emptyGroup.getByRole('radio', { name: 'Off' })).toBeFocused()
})

test('required empty groups expose native invalid state and clear it after selection', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Browser notifications' })
  const enabled = group.getByRole('radio', { name: 'On' })
  const disabled = group.getByRole('radio', { name: 'Off' })
  await expect(enabled).toHaveAttribute('required', '')
  await expect(group).toHaveAttribute('aria-required', 'true')
  expect(await enabled.evaluate((input) => (input as HTMLInputElement).validity.valueMissing)).toBe(
    true,
  )
  expect(await enabled.evaluate((input) => (input as HTMLInputElement).checkValidity())).toBe(false)
  await expect(group).toHaveAttribute('aria-invalid', 'true')

  await enabled.press('Space')
  await expect(enabled).toBeChecked()
  expect(await enabled.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(true)
  await expect(group).not.toHaveAttribute('aria-invalid', 'true')
  await expect(disabled).not.toBeChecked()
})

test('required radios submit one value and form reset restores the initial selection', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Delivery address' })
  const home = group.getByRole('radio', { name: 'Home address' })
  const office = group.getByRole('radio', { name: 'Office address' })
  const form = page.locator('#radio-group-example-form')

  await expect(home).toBeChecked()
  await expect(home).toHaveAttribute('required', '')
  expect(await home.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(true)
  await office.click()
  await expect(office).toBeChecked()
  expect(await form.evaluate((node) => new FormData(node as HTMLFormElement).get('delivery'))).toBe(
    'office',
  )

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(home).toBeChecked()
  expect(await form.evaluate((node) => new FormData(node as HTMLFormElement).get('delivery'))).toBe(
    'home',
  )
})

test('radio options associate descriptions, keep the group vertical, and support an external form', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const none = group.getByRole('radio', { name: 'None' })
  await expect(group).toHaveAttribute('aria-describedby')
  await expect(callisto).toHaveAttribute('aria-describedby')
  const noneRoot = none.locator('xpath=ancestor::div[contains(@class,"yam3x-radio-button")]')
  const callistoRoot = callisto.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const noneBox = await noneRoot.boundingBox()
  const callistoBox = await callistoRoot.boundingBox()
  expect(noneBox).not.toBeNull()
  expect(callistoBox).not.toBeNull()
  expect(callistoBox!.y).toBeGreaterThan(noneBox!.y)

  const externalForm = page.locator('#radio-group-external-form')
  const externalGroup = page.getByRole('radiogroup', { name: 'External form field' })
  await externalGroup.getByRole('radio', { name: 'Comfortable' }).click()
  expect(
    await externalForm.evaluate((node) => new FormData(node as HTMLFormElement).get('layout')),
  ).toBe('comfortable')
})

test('an unnamed group still uses native group navigation without submitting an invented field', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Radio group without submitted value' })
  const first = group.getByRole('radio', { name: 'Option one' })
  const second = group.getByRole('radio', { name: 'Option two' })
  const form = page.locator('#radio-group-unnamed-form')

  await first.focus()
  await first.press('ArrowDown')
  await expect(second).toBeChecked()
  expect(
    await form.evaluate((node) => [...new FormData(node as HTMLFormElement).entries()]),
  ).toEqual([])
})

test('a group-level disabled state disables all native radio controls', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Unavailable options' })
  const selected = group.getByRole('radio', { name: 'Option one' })
  await expect(selected).toBeChecked()
  await expect(selected).toBeDisabled()
  await expect(group.getByRole('radio', { name: 'Option two' })).toBeDisabled()
  expect(
    await page
      .locator('#radio-group-disabled-form')
      .evaluate((node) => new FormData(node as HTMLFormElement).has('unavailable')),
  ).toBe(false)
})

test('pressed state layers map selected and unselected radios to their official color roles', async ({
  page,
}) => {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--md-sys-color-primary', 'rgb(101, 102, 103)')
    document.documentElement.style.setProperty('--md-sys-color-on-surface', 'rgb(11, 12, 13)')
  })

  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const selected = group.getByRole('radio', { name: 'Callisto' })
  const unselected = group.getByRole('radio', { name: 'None' })

  await expect(selected.locator('xpath=..')).toHaveCSS('--yam3x-ripple-color', 'rgb(11, 12, 13)')
  await expect(unselected.locator('xpath=..')).toHaveCSS(
    '--yam3x-ripple-color',
    'rgb(101, 102, 103)',
  )
})

test('radio icon, state layer, and target use the specified geometry', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const option = callisto.locator('xpath=ancestor::div[contains(@class,"yam3x-radio-button")]')
  const target = option.locator('.yam3x-radio-button__target')
  const state = option.locator('.yam3x-radio-button__state')
  const icon = state.locator('.yam3x-radio-button__icon')
  const unselectedLabel = group
    .getByRole('radio', { name: 'None' })
    .locator('xpath=ancestor::div[contains(@class,"yam3x-radio-button")]')
    .locator('.yam3x-radio-button__text')

  await expect(callisto).toHaveJSProperty('checked', true)
  await expect(target).toHaveCSS('width', '48px')
  await expect(target).toHaveCSS('height', '48px')
  await expect(state).toHaveCSS('width', '40px')
  await expect(state).toHaveCSS('height', '40px')
  await expect(icon).toHaveCSS('width', '20px')
  await expect(icon).toHaveCSS('height', '20px')
  await expect(option.locator('.yam3x-radio-button__text')).toHaveCSS(
    'color',
    await unselectedLabel.evaluate((element) => getComputedStyle(element).color),
  )
})

test('radio icon and label colors follow shared System roles', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  await group.evaluate((element) => {
    const root = element as HTMLElement
    root.style.setProperty('--md-sys-color-primary', 'rgb(101, 102, 103)')
    root.style.setProperty('--md-sys-color-on-surface-variant', 'rgb(111, 112, 113)')
    root.style.setProperty('--md-sys-color-on-surface', 'rgb(121, 122, 123)')
  })

  const selected = group.getByRole('radio', { name: 'Callisto' })
  const unselected = group.getByRole('radio', { name: 'None' })
  const selectedRoot = selected.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const unselectedRoot = unselected.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  await expect(selectedRoot.locator('.yam3x-radio-button__state')).toHaveCSS(
    'color',
    'rgb(101, 102, 103)',
  )
  await expect(unselectedRoot.locator('.yam3x-radio-button__state')).toHaveCSS(
    'color',
    'rgb(111, 112, 113)',
  )
  await expect(selectedRoot.locator('.yam3x-radio-button__text')).toHaveCSS(
    'color',
    'rgb(121, 122, 123)',
  )
  await expect(unselectedRoot.locator('.yam3x-radio-button__text')).toHaveCSS(
    'color',
    'rgb(121, 122, 123)',
  )
})

test('radio typography follows shared System type roles', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--md-sys-typescale-body-large-font-size', '18px')
    document.documentElement.style.setProperty('--md-sys-typescale-body-medium-font-size', '13px')
    document.documentElement.style.setProperty('--md-sys-typescale-title-small-font-size', '19px')
  })

  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  await expect(group.locator('.yam3x-radio-group__label')).toHaveCSS('font-size', '19px')
  await expect(group.locator('.yam3x-radio-group__description')).toHaveCSS('font-size', '13px')
  const option = group
    .getByRole('radio', { name: 'Callisto' })
    .locator('xpath=ancestor::div[contains(@class,"yam3x-radio-button")]')
  await expect(option.locator('.yam3x-radio-button__text')).toHaveCSS('font-size', '18px')
  await expect(option.locator('.yam3x-radio-button__description')).toHaveCSS('font-size', '13px')
})

test('label hover and press ripple use the centered state layer and disabled options stay quiet', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const none = group.getByRole('radio', { name: 'None' })
  const option = none.locator('xpath=ancestor::div[contains(@class,"yam3x-radio-button")]')
  const target = option.locator('.yam3x-radio-button__target')
  const state = option.locator('.yam3x-radio-button__state')

  await option.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--md-sys-color-on-surface-variant', 'rgb(8, 9, 10)')
    host.style.setProperty('--md-sys-color-on-surface', 'rgb(11, 12, 13)')
    host.style.setProperty('--md-sys-color-primary', 'rgb(17, 18, 19)')
  })
  await expect(state).toHaveCSS('color', 'rgb(8, 9, 10)')
  await page.getByText('None', { exact: true }).hover()
  await expect
    .poll(() => state.evaluate((element) => getComputedStyle(element, '::after').backgroundColor))
    .toBe('rgb(11, 12, 13)')
  await expect
    .poll(() => state.evaluate((element) => Number(getComputedStyle(element, '::after').opacity)))
    .toBeGreaterThan(0)

  await none.focus()
  await expect
    .poll(() => state.evaluate((element) => getComputedStyle(element, '::after').backgroundColor))
    .toBe('rgb(11, 12, 13)')

  const targetBox = await target.boundingBox()
  expect(targetBox).not.toBeNull()
  await page.mouse.down()
  const ripple = state.locator('.yam3x-ripple--visible')
  await expect(ripple).toHaveCount(1)
  await expect(ripple).toHaveCSS('background-color', 'rgb(17, 18, 19)')
  const rippleBox = await ripple.boundingBox()
  expect(rippleBox).not.toBeNull()
  expect(
    Math.abs(rippleBox!.x + rippleBox!.width / 2 - (targetBox!.x + targetBox!.width / 2)),
  ).toBeLessThan(1)
  expect(
    Math.abs(rippleBox!.y + rippleBox!.height / 2 - (targetBox!.y + targetBox!.height / 2)),
  ).toBeLessThan(1)
  await page.mouse.up()
  await expect(none).toBeChecked()

  const disabled = group.getByRole('radio', { name: 'Pickup (unavailable)' })
  await expect(disabled).toBeDisabled()
  await disabled.locator('xpath=..').hover({ force: true })
  await page.mouse.down()
  await expect(disabled.locator('xpath=..').locator('.yam3x-ripple')).toHaveCount(0)
  await page.mouse.up()
})

test('short Space activation retains the pinned m3e pressed feedback duration', async ({
  page,
}) => {
  const radio = page.getByRole('radio', { name: 'Callisto' })
  const elapsed = await radio.evaluate(async (input) => {
    const target = input.parentElement!
    input.focus()
    const startedAt = performance.now()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }))
    if (!target.hasAttribute('data-yam3x-pressed')) return 0
    await new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        if (!target.hasAttribute('data-yam3x-pressed')) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(target, { attributes: true, attributeFilter: ['data-yam3x-pressed'] })
    })
    return performance.now() - startedAt
  })
  expect(elapsed).toBeGreaterThanOrEqual(210)
})

test('RTL keeps radio labels beside the icon and reverses horizontal arrow direction', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const ganymede = group.getByRole('radio', { name: 'Ganymede' })
  await group.evaluate((root) => {
    root.setAttribute('dir', 'rtl')
  })
  const callistoRoot = callisto.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const iconBox = await callistoRoot.locator('.yam3x-radio-button__state').boundingBox()
  const labelBox = await callistoRoot.locator('.yam3x-radio-button__text').boundingBox()
  expect(iconBox).not.toBeNull()
  expect(labelBox).not.toBeNull()
  expect(iconBox!.x).toBeGreaterThan(labelBox!.x)

  await callisto.focus()
  await callisto.press('ArrowLeft')
  await expect(ganymede).toBeChecked()
})

test('selected, disabled, and invalid states use their System color roles', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Ringtone' })
  const callisto = group.getByRole('radio', { name: 'Callisto' })
  const callistoRoot = callisto.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const callistoTarget = callistoRoot.locator('.yam3x-radio-button__target')
  const callistoState = callistoRoot.locator('.yam3x-radio-button__state')
  await callistoRoot.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--md-sys-color-primary', 'rgb(18, 19, 20)')
    host.style.setProperty('--md-sys-color-on-surface', 'rgb(24, 25, 26)')
  })
  await callisto.hover()
  await expect
    .poll(() =>
      callistoState.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
    )
    .toBe('rgb(18, 19, 20)')
  await callisto.focus()
  await expect
    .poll(() =>
      callistoState.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
    )
    .toBe('rgb(18, 19, 20)')
  await callistoTarget.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    element.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 41,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        clientX: bounds.left + 20,
        clientY: bounds.top + 20,
      }),
    )
  })
  await expect
    .poll(() =>
      callistoState
        .locator('.yam3x-ripple')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(24, 25, 26)')

  const invalidGroup = page.getByRole('radiogroup', {
    name: 'Payment method (validation error example)',
  })
  await expect(invalidGroup).toHaveAttribute('aria-invalid', 'true')
  const invalidRadio = invalidGroup.getByRole('radio', { name: 'Bank card' })
  const invalidRoot = invalidRadio.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const invalidTarget = invalidRoot.locator('.yam3x-radio-button__target')
  const invalidState = invalidRoot.locator('.yam3x-radio-button__state')
  await invalidRoot.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--md-sys-color-error', 'rgb(31, 32, 33)')
  })
  await expect(invalidState).toHaveCSS('color', 'rgb(31, 32, 33)')
  await page.getByText('Bank card', { exact: true }).hover()
  await expect
    .poll(() =>
      invalidState.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
    )
    .toBe('rgb(31, 32, 33)')
  await invalidRadio.focus()
  await expect
    .poll(() =>
      invalidState.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
    )
    .toBe('rgb(31, 32, 33)')
  await invalidTarget.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    element.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 42,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        clientX: bounds.left + 20,
        clientY: bounds.top + 20,
      }),
    )
  })
  await expect
    .poll(() =>
      invalidState
        .locator('.yam3x-ripple')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(31, 32, 33)')

  const disabled = group.getByRole('radio', { name: 'Pickup (unavailable)' })
  const disabledRoot = disabled.locator(
    'xpath=ancestor::div[contains(@class,"yam3x-radio-button")]',
  )
  const disabledState = disabledRoot.locator('.yam3x-radio-button__state')
  await disabledRoot.evaluate((element) =>
    (element as HTMLElement).style.setProperty('--md-sys-color-on-surface', 'rgb(51, 52, 53)'),
  )
  const disabledColor = await disabledState.evaluate((element) => getComputedStyle(element).color)
  expect(disabledColor).toContain('0.38)')
  expect(disabledColor).toContain('0.2 0.203922 0.207843')
})

test('keyboard focus and reduced motion remain visible in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  const radio = page.getByRole('radio', { name: 'Callisto' })
  await radio.focus()
  const state = radio.locator('xpath=..').locator('.yam3x-radio-button__state')

  await expect(state).toHaveCSS('outline-style', 'solid')
  expect(await state.evaluate((element) => getComputedStyle(element).outlineColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  )
  const transitionDuration = await state.evaluate(
    (element) => getComputedStyle(element, '::after').transitionDuration,
  )
  expect(
    Math.max(...transitionDuration.split(',').map((value) => Number.parseFloat(value))),
  ).toBeLessThan(0.001)
})
