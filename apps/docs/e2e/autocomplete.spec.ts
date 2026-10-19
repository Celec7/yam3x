import { expect, test } from '@playwright/test'

test('Autocomplete exposes an editable combobox and keyboard-selectable listbox', async ({
  page,
}) => {
  // autocomplete.a11y.combobox
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })

  await input.focus()
  const listbox = page.getByRole('listbox', { name: 'Fruit suggestions' })
  await expect(listbox).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(5)
  await input.fill('ap')
  await expect(page.getByRole('option')).toHaveCount(2)
  await expect(page.locator('.yam3x-autocomplete__match').first()).toHaveText('Ap')
  await input.press('ArrowDown')
  const activeId = await input.getAttribute('aria-activedescendant')
  expect(activeId).toBeTruthy()
  await expect(page.locator(`#${activeId}`)).toHaveAttribute('aria-selected', 'true')
  await input.press('Enter')

  await expect(input).toHaveValue('Apple')
  await expect(input).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Selected: apple')).toBeVisible()
})

test('filtered options ease into their new positions and reduced motion disables the transition', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  await input.fill('ban')
  await expect(page.getByRole('option')).toHaveCount(1)
  const option = page.getByRole('option', { name: 'Banana' })
  await option.evaluate((element) => element.classList.add('yam3x-autocomplete-option-shifting'))
  await expect(option).toHaveCSS('transition-property', 'transform')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(option).toHaveCSS('transition-property', 'none')
})

test('Autocomplete preserves uncommitted input on Escape and offers a no-results status', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  await input.fill('not a fruit')
  const autocomplete = page.locator('.yam3x-autocomplete').filter({
    has: page.getByRole('combobox', { name: 'Fruit', exact: true }),
  })
  await expect(autocomplete.getByRole('status')).toContainText('No options')
  await input.press('Escape')
  await expect(input).toHaveValue('not a fruit')
  await expect(input).toHaveAttribute('aria-expanded', 'false')
})

test('Autocomplete field width stays bounded when refocusing a populated input', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1633, height: 700 })
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  const field = page.locator('.yam3x-autocomplete__field').first()
  const demo = page.locator('.yam3x-demo').first()
  await input.fill('a')
  const initial = await field.boundingBox()
  const demoBounds = await demo.boundingBox()
  expect(initial).not.toBeNull()
  expect(demoBounds).not.toBeNull()
  const popup = page.getByRole('listbox', { name: 'Fruit suggestions' })

  for (let cycle = 0; cycle < 8; cycle++) {
    await page.getByRole('heading', { name: 'Autocomplete' }).click()
    await expect(popup).toBeHidden()
    await input.click()
    await expect(input).toBeFocused()
    await expect(popup).toBeVisible()
    const current = await field.boundingBox()
    const currentInput = await input.boundingBox()
    expect(current).not.toBeNull()
    expect(currentInput).not.toBeNull()
    expect(Math.abs(current!.width - initial!.width)).toBeLessThanOrEqual(1)
    expect(current!.x + current!.width).toBeLessThanOrEqual(demoBounds!.x + demoBounds!.width - 20)
    expect(currentInput!.x + currentInput!.width).toBeLessThanOrEqual(
      current!.x + current!.width - 46,
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
  const events = page.getByTestId('autocomplete-events')
  await expect(events).toContainText('toggle:open')
  expect((await events.textContent())!.split(',')).toHaveLength(5)
  await expect
    .poll(() => events.evaluate((element) => element.scrollWidth <= element.clientWidth))
    .toBe(true)
})

test('Autocomplete commits pointer choice and keeps the popup aligned to the full field', async ({
  page,
}) => {
  // autocomplete.extension.value-commit
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  const field = page.locator('.yam3x-autocomplete__field').first()
  await field.evaluate((element) => {
    ;(element as HTMLElement).style.width = '420px'
  })
  await input.fill('ap')
  const popup = page.getByRole('listbox', { name: 'Fruit suggestions' })
  await expect(popup).toBeVisible()
  await expect(popup.locator('[role="option"]')).toHaveCount(2)
  await expect
    .poll(() => popup.evaluate((element) => element.getBoundingClientRect().width))
    .toBe(280)
  await field.evaluate((element) => {
    ;(element as HTMLElement).style.width = '240px'
  })
  await expect
    .poll(async () => {
      const fieldBox = await field.boundingBox()
      const popupBox = await popup.boundingBox()
      return fieldBox && popupBox ? Math.abs(fieldBox.width - popupBox.width) : Infinity
    })
    .toBeLessThanOrEqual(1)
  const [fieldBox, popupBox] = await Promise.all([field.boundingBox(), popup.boundingBox()])
  expect(fieldBox).not.toBeNull()
  expect(popupBox).not.toBeNull()
  expect(Math.abs(fieldBox!.width - popupBox!.width)).toBeLessThanOrEqual(1)

  await page.getByRole('option', { name: 'Apricot' }).click()
  await expect(input).toHaveValue('Apricot')
  await expect(page.getByText('Selected: apricot')).toBeVisible()
})

test('Autocomplete pointer hover does not auto-scroll the list', async ({ page }) => {
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  const root = page.locator('.yam3x-autocomplete').first()
  await root.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty('--yam3x-autocomplete-popup-max-height', '130px')
  })
  await input.focus()
  const popup = page.getByRole('listbox', { name: 'Fruit suggestions' })
  await expect(popup).toBeVisible()

  const pointerReachableOptions = await popup.getByRole('option').evaluateAll((elements) => {
    const listbox = elements[0]?.closest('[role="listbox"]')
    if (!listbox) return []
    const rect = listbox.getBoundingClientRect()
    const style = getComputedStyle(listbox)
    const top = rect.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop)
    const bottom =
      rect.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom)
    return elements
      .map((element) => {
        const option = element.getBoundingClientRect()
        const y = option.top + option.height / 2
        return { x: option.left + option.width / 2, y, reachable: y >= top && y <= bottom }
      })
      .filter((option) => option.reachable)
  })
  expect(pointerReachableOptions.length).toBeGreaterThan(1)

  const scrollPositions: number[] = []
  for (const point of pointerReachableOptions) {
    await page.mouse.move(point.x, point.y, { steps: 1 })
    scrollPositions.push(await popup.evaluate((element) => element.scrollTop))
  }
  expect(scrollPositions).toEqual(scrollPositions.map(() => 0))
})

test('Autocomplete arrow navigation skips disabled options and outside pointer closes the listbox', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  await page.getByRole('button', { name: 'Show Fruit suggestions' }).click()
  await expect(input).toHaveAttribute('aria-expanded', 'true')
  const options = page.getByRole('option')
  await input.press('ArrowDown')
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true')
  await input.press('ArrowDown')
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')
  await input.press('ArrowDown')
  await expect(options.nth(2)).toHaveAttribute('aria-selected', 'true')
  await input.press('ArrowDown')
  await expect(options.nth(3)).toHaveAttribute('aria-selected', 'true')
  await input.press('ArrowDown')
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('heading', { name: 'Autocomplete' }).click()
  await expect(input).toHaveAttribute('aria-expanded', 'false')
})

test('Autocomplete native required, selection required, form data, reset, and input slot work together', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  await page
    .getByText('Validation and custom input examples', { exact: true })
    .evaluate((element) => (element as HTMLElement).click())
  const form = page.locator('#autocomplete-validation')
  const required = form.getByRole('combobox', { name: 'Required fruit' })
  await expect(required).toHaveJSProperty('required', true)
  expect(await required.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(
    false,
  )

  await required.fill('not a fruit')
  expect(await required.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(
    false,
  )
  await required.fill('ap')
  await required.press('ArrowDown')
  await required.press('Enter')
  await expect(required).toHaveValue('Apple')
  expect(await required.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(
    true,
  )
  expect(
    await form.evaluate((element) => new FormData(element as HTMLFormElement).get('fruit')),
  ).toBe('Apple')

  await form.evaluate((element: HTMLFormElement) => {
    element.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    element.reset()
  })
  await expect(required).toHaveValue('Apple')
  await expect(page.getByTestId('required-selection')).toHaveText('apple')
  expect(
    await form.evaluate((element: HTMLFormElement) => new FormData(element).get('fruit')),
  ).toBe('Apple')
  await form.getByRole('button', { name: 'Reset' }).click()
  await expect(required).toHaveValue('')
  await expect(page.getByTestId('required-selection')).toHaveText('None')

  const customInput = page.getByRole('combobox', { name: 'Custom input' })
  await customInput.fill('ban')
  await expect(page.getByRole('option', { name: 'Banana' })).toBeVisible()

  const prefixInput = page.getByRole('combobox', { name: 'Prefix fruit' })
  await prefixInput.fill('b')
  await expect(page.getByRole('option')).toHaveCount(2)
  const prefixHost = page.locator('.yam3x-autocomplete').filter({ has: prefixInput })
  await expect(prefixHost.locator('.yam3x-autocomplete__live')).toContainText('2 fruits available')

  const automaticInput = page.getByRole('combobox', { name: 'Auto activate fruit' })
  await automaticInput.fill('ap')
  const activeId = await automaticInput.getAttribute('aria-activedescendant')
  await expect(page.locator(`#${activeId}`)).toHaveAttribute('aria-label', 'Apple')
  await expect(automaticInput).toHaveValue('ap')
  await expect(page.getByTestId('automatic-selection')).toHaveText('None')
  await automaticInput.press('Enter')
  await expect(page.getByTestId('automatic-selection')).toHaveText('apple')

  const loadingInput = page.getByRole('combobox', { name: 'Loading fruit' })
  await loadingInput.focus()
  const loadingPopup = page.getByRole('listbox', { name: 'Loading fruit suggestions' })
  await expect(loadingPopup).toHaveAttribute('aria-busy', 'true')
  await expect(loadingPopup.getByRole('option')).toHaveCount(0)
  await expect(loadingPopup).toHaveClass(/autocomplete-demo-panel/)
  const loadingHost = page.locator('.yam3x-autocomplete').filter({ has: loadingInput })
  await expect(loadingHost.locator('.yam3x-autocomplete__live')).toContainText(
    'Loading fruit options',
  )
})

test('Autocomplete filter modes and custom predicates operate on visible labels', async ({
  page,
}) => {
  // autocomplete.material.filtering
  await page.goto('/components/autocomplete')
  await page
    .getByText('Validation and custom input examples', { exact: true })
    .evaluate((element) => (element as HTMLElement).click())

  const suffix = page.getByRole('combobox', { name: 'Suffix fruit' })
  await suffix.fill('e')
  const suffixHost = page.locator('.yam3x-autocomplete').filter({ has: suffix })
  await expect(suffixHost.getByRole('option')).toHaveCount(1)
  await expect(suffixHost.getByRole('option', { name: 'Apple' })).toBeVisible()

  const unrestricted = page.getByRole('combobox', { name: 'Unfiltered fruit' })
  await unrestricted.fill('no-match')
  const unrestrictedHost = page.locator('.yam3x-autocomplete').filter({ has: unrestricted })
  await expect(unrestrictedHost.getByRole('option')).toHaveCount(5)

  const sensitive = page.getByRole('combobox', { name: 'Case-sensitive fruit' })
  const sensitiveHost = page.locator('.yam3x-autocomplete').filter({ has: sensitive })
  await sensitive.fill('ap')
  await expect(sensitiveHost.getByRole('option')).toHaveCount(0)
  await sensitive.fill('Ap')
  await expect(sensitiveHost.getByRole('option')).toHaveCount(2)

  const custom = page.getByRole('combobox', { name: 'Custom-filtered fruit' })
  const customHost = page.locator('.yam3x-autocomplete').filter({ has: custom })
  await custom.fill('Apple')
  await expect(customHost.getByRole('option')).toHaveCount(1)
  await expect(customHost.getByRole('option')).toHaveAttribute('aria-label', 'Apple')
})

test('Autocomplete supports cancelable beforeselect without committing a choice', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const host = page.locator('.yam3x-autocomplete').first()
  const input = host.getByRole('combobox', { name: 'Fruit' })
  await input.fill('ap')
  await host.evaluate((element) =>
    element.addEventListener('beforeselect', (event) => event.preventDefault(), { once: true }),
  )
  await page.getByRole('option', { name: 'Apple' }).click()
  await expect(input).toHaveValue('ap')
  await expect(page.getByText('Selected: None')).toBeVisible()
  await page.getByRole('option', { name: 'Apple' }).click()
  await expect(input).toHaveValue('Apple')
  await expect(page.getByText('Selected: apple')).toBeVisible()
})

test('Autocomplete reacts to live option updates and native disabled/read-only states', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  await page
    .getByText('Validation and custom input examples', { exact: true })
    .evaluate((element) => (element as HTMLElement).click())
  const dynamic = page.getByRole('combobox', { name: 'Dynamic fruit' })
  await dynamic.fill('ap')
  const dynamicHost = page.locator('.yam3x-autocomplete').filter({ has: dynamic })
  await expect(dynamicHost.getByRole('option', { name: 'Apple' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('button', { name: 'Disable Apple' }).click()
  await dynamic.press('ArrowDown')
  await expect(dynamic).toHaveAttribute('aria-expanded', 'true')
  await expect(dynamicHost.getByRole('option', { name: 'Apple' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await expect(dynamicHost.getByRole('option', { name: 'Apricot' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await dynamic.press('Enter')
  await expect(dynamic).toHaveValue('Apricot')

  const disabled = page.getByRole('combobox', { name: 'Disabled fruit' })
  await expect(disabled).toBeDisabled()
  await disabled.focus()
  await expect(disabled).toHaveAttribute('aria-expanded', 'false')
  const readonly = page.getByRole('combobox', { name: 'Readonly fruit' })
  await expect(readonly).toHaveJSProperty('readOnly', true)
  await readonly.focus()
  await expect(readonly).toHaveAttribute('aria-expanded', 'false')
  const hiddenNoData = page.getByRole('combobox', { name: 'Hidden no-data' })
  await hiddenNoData.fill('missing')
  await expect(hiddenNoData).toHaveAttribute('aria-expanded', 'false')
  const hiddenLoading = page.getByRole('combobox', { name: 'Hidden loading' })
  await hiddenLoading.focus()
  await expect(hiddenLoading).toHaveAttribute('aria-expanded', 'false')

  const indicator = page.getByRole('combobox', { name: 'Hidden selection indicator' })
  await indicator.fill('Apple')
  await indicator.press('ArrowDown')
  await indicator.press('Enter')
  const indicatorHost = page.locator('.yam3x-autocomplete').filter({ has: indicator })
  await expect(indicatorHost.locator('.yam3x-autocomplete__option--selected')).toHaveCount(1)
  await expect(indicatorHost.locator('.yam3x-autocomplete__check')).toHaveCount(0)
})

test('Autocomplete uses theme roles, mirrors RTL placement, flips above, and honors motion/forced colors', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  const field = page.locator('.yam3x-autocomplete__field').first()
  const popup = page.getByRole('listbox', { name: 'Fruit suggestions' }).first()

  const themedColors: Array<{ foreground: string; background: string; contrast: number }> = []
  for (const dark of [false, true]) {
    const html = page.locator('html')
    const isDark = await html.evaluate((element) => element.classList.contains('dark'))
    if (isDark !== dark) {
      await page.getByRole('switch', { name: `Switch to ${dark ? 'dark' : 'light'} theme` }).click()
      await expect(html).toHaveClass(dark ? /dark/ : /^(?!.*dark).*$/)
    }
    await input.fill('ap')
    await input.press('ArrowDown')
    await input.press('Enter')
    const colors = await page.evaluate(() => {
      const option = document.querySelector<HTMLElement>('.yam3x-autocomplete__option--selected')!
      const actual = getComputedStyle(option)
      const content = getComputedStyle(
        option.querySelector<HTMLElement>('.yam3x-autocomplete__option-content')!,
      )
      const resolve = (token: string) => {
        const probe = document.createElement('span')
        probe.style.color = `var(${token})`
        document.body.append(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      const toLinear = (channel: number) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      }
      const luminance = (color: string) => {
        const values = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
        return (
          0.2126 * toLinear(values[0]!) +
          0.7152 * toLinear(values[1]!) +
          0.0722 * toLinear(values[2]!)
        )
      }
      const foreground = content.color
      const background = actual.backgroundColor
      const first = luminance(foreground),
        second = luminance(background)
      return {
        foreground,
        background,
        expectedForeground: resolve('--md-sys-color-on-tertiary-container'),
        expectedBackground: resolve('--md-sys-color-tertiary-container'),
        contrast: (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
      }
    })
    expect(colors.contrast).toBeGreaterThanOrEqual(4.5)
    expect(colors.foreground).toBe(colors.expectedForeground)
    expect(colors.background).toBe(colors.expectedBackground)
    themedColors.push(colors)
  }
  await page.setViewportSize({ width: 420, height: 320 })
  await field.evaluate((element) => {
    Object.assign((element as HTMLElement).style, {
      position: 'fixed',
      bottom: '8px',
      left: '20px',
      width: '240px',
      zIndex: '2',
    })
  })
  await input.fill('ap')
  await expect(popup).toBeVisible()
  const bounds = await Promise.all([field.boundingBox(), popup.boundingBox()])
  expect(bounds[0]).not.toBeNull()
  expect(bounds[1]).not.toBeNull()
  expect(bounds[1]!.y + bounds[1]!.height).toBeLessThanOrEqual(bounds[0]!.y)

  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await expect
    .poll(async () => {
      const fieldBox = await field.boundingBox()
      const popupBox = await popup.boundingBox()
      return fieldBox && popupBox
        ? Math.abs(popupBox.x + popupBox.width - (fieldBox.x + fieldBox.width))
        : Infinity
    })
    .toBeLessThanOrEqual(1)

  await input.press('ArrowDown')
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const activeOption = popup.locator('.yam3x-autocomplete__option--active')
  await expect(activeOption).toHaveCSS('transition-property', 'none')
  await expect(activeOption).toHaveCSS('outline-style', 'solid')
})

test('Autocomplete maps standard and vibrant menu colors from the active theme', async ({
  page,
}) => {
  // autocomplete.material.color-mappings
  await page.goto('/components/autocomplete')
  const input = page.getByRole('combobox', { name: 'Fruit' })
  const colorVariant = page.getByRole('combobox', { name: 'Suggestion color' })

  for (const [variant, popupToken, backgroundToken, foregroundToken, statusToken] of [
    [
      'standard',
      '--md-sys-color-surface-container-low',
      '--md-sys-color-tertiary-container',
      '--md-sys-color-on-tertiary-container',
      '--md-sys-color-on-surface-variant',
    ],
    [
      'vibrant',
      '--md-sys-color-tertiary-container',
      '--md-sys-color-tertiary',
      '--md-sys-color-on-tertiary',
      '--md-sys-color-on-tertiary-container',
    ],
  ]) {
    if (variant === 'vibrant') {
      await colorVariant.click()
      await page.getByRole('option', { name: 'Vibrant' }).click()
    }
    await input.fill('ap')
    const popupColor = await page
      .getByRole('listbox', { name: 'Fruit suggestions' })
      .evaluate((element) => getComputedStyle(element).backgroundColor)
    const expectedPopup = await page.evaluate((token) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${token})`
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }, popupToken)
    expect(popupColor).toBe(expectedPopup)
    await input.fill('no match')
    const status = page
      .getByRole('listbox', { name: 'Fruit suggestions' })
      .locator('.yam3x-autocomplete__status')
    const expectedStatus = await page.evaluate((token) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${token})`
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }, statusToken)
    await expect(status).toHaveCSS('color', expectedStatus)
    await input.fill('ap')
    await input.press('ArrowDown')
    await input.press('Enter')

    const colors = await page.evaluate(() => {
      const option = document.querySelector<HTMLElement>('.yam3x-autocomplete__option--selected')!
      return {
        background: getComputedStyle(option).backgroundColor,
        foreground: getComputedStyle(
          option.querySelector<HTMLElement>('.yam3x-autocomplete__option-content')!,
        ).color,
      }
    })
    const expected = await page.evaluate(
      ([background, foreground]) => {
        const resolve = (token: string) => {
          const probe = document.createElement('span')
          probe.style.color = `var(${token})`
          document.body.append(probe)
          const value = getComputedStyle(probe).color
          probe.remove()
          return value
        }
        return { background: resolve(background), foreground: resolve(foreground) }
      },
      [backgroundToken, foregroundToken],
    )

    expect(colors).toEqual(expected)
    await input.fill('')
  }
})

test('Autocomplete exposes documented geometry and shape CSS overrides', async ({ page }) => {
  await page.goto('/components/autocomplete')
  const root = page.locator('.yam3x-autocomplete').first()
  await root.evaluate((element) => {
    const hooks: Record<string, string> = {
      '--yam3x-autocomplete-popup-shape': '22px',
      '--yam3x-autocomplete-popup-min-width': '150px',
      '--yam3x-autocomplete-popup-max-width': '230px',
      '--yam3x-autocomplete-popup-max-height': '120px',
      '--yam3x-autocomplete-popup-padding-block': '6px',
      '--yam3x-autocomplete-popup-padding-inline': '10px',
      '--yam3x-autocomplete-popup-elevation': 'none',
      '--yam3x-autocomplete-option-container-height': '60px',
      '--yam3x-autocomplete-option-shape': '6px',
      '--yam3x-autocomplete-option-selected-shape': '20px',
      '--yam3x-autocomplete-option-first-child-shape': '14px',
      '--yam3x-autocomplete-option-last-child-shape': '16px',
      '--yam3x-autocomplete-option-label-text-font-size': '18px',
    }
    for (const [name, value] of Object.entries(hooks))
      (element as HTMLElement).style.setProperty(name, value)
  })

  const input = page.getByRole('combobox', { name: 'Fruit' })
  await input.fill('ap')
  const popup = page.getByRole('listbox', { name: 'Fruit suggestions' })
  await expect(popup).toHaveCSS('border-radius', '22px')
  await expect(popup).toHaveCSS('padding-top', '6px')
  await expect(popup).toHaveCSS('padding-inline-start', '10px')
  await expect(popup).toHaveCSS('gap', '0px')
  await expect(popup).toHaveCSS('box-shadow', 'none')
  await expect(popup).toHaveCSS('max-height', '120px')
  await expect(popup).toHaveCSS('max-width', '230px')
  await expect(popup).toHaveCSS('min-width', '150px')
  await expect
    .poll(() => popup.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThanOrEqual(230)

  const apple = page.getByRole('option', { name: 'Apple' })
  const apricot = page.getByRole('option', { name: 'Apricot' })
  await expect(apple).toHaveCSS('height', '60px')
  await expect(apple.locator('.yam3x-autocomplete__option-content')).toHaveCSS('font-size', '18px')
  await expect(apricot).toHaveCSS('border-start-start-radius', '4px')
  await expect(apple).toHaveCSS('border-start-start-radius', '14px')
  await expect(apple).toHaveCSS('border-end-start-radius', '4px')
  await expect(apricot).toHaveCSS('border-start-start-radius', '4px')
  await expect(apricot).toHaveCSS('border-end-end-radius', '16px')
  await input.fill('')
  await expect(page.getByRole('option', { name: 'Banana' })).toHaveCSS('border-radius', '6px')
  await input.fill('ap')
  await input.press('ArrowDown')
  await input.press('Enter')
  await page.getByRole('button', { name: 'Show Fruit suggestions' }).click()
  const selectedApple = page.getByRole('option', { name: 'Apple' })
  await expect(selectedApple).toHaveCSS('border-start-start-radius', '20px')
  await expect(selectedApple).toHaveCSS('border-end-end-radius', '20px')
})
