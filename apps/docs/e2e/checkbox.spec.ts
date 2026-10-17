import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/checkbox')
  await page.getByRole('checkbox', { name: 'Indeterminate state example' }).waitFor()
})

test('renders mixed state as a dash and activating its label checks it once', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Indeterminate state example' })
  const root = checkbox.locator('xpath=ancestor::div[contains(@class,"yam3x-checkbox")]')

  // checkbox.state.indeterminate-mark
  await expect(checkbox).toHaveJSProperty('indeterminate', true)
  await expect(root.locator('.yam3x-checkbox__icon path')).toHaveAttribute('d', 'M3.6 9h10.8')
  // checkbox.a11y.label-activation
  await page.getByText('Indeterminate state example', { exact: true }).click()
  await expect(checkbox).toBeChecked()
  await expect(checkbox).toHaveJSProperty('indeterminate', false)
  await expect(root.locator('.yam3x-checkbox__icon path')).toHaveAttribute(
    'd',
    'M3.6 9 7.2 12.6 14.4 5.4',
  )
})

test('click can cancel activation and accepted native changes bubble in order', async ({
  page,
}) => {
  const checkbox = page.getByRole('checkbox', { name: 'Receive product updates' })
  const result = await checkbox.evaluate((input) => {
    const nativeInput = input as HTMLInputElement
    const events: string[] = []
    const root = nativeInput.closest('.yam3x-checkbox')!
    const cancel = (event: Event) => event.preventDefault()
    root.addEventListener('click', cancel, { capture: true, once: true })
    for (const name of ['click', 'input', 'change']) {
      root.addEventListener(name, () => events.push(name))
    }
    nativeInput.click()
    const cancelled = nativeInput.checked
    events.length = 0
    nativeInput.click()
    return { cancelled, events }
  })

  expect(result.cancelled).toBe(true)
  expect(result.events).toEqual(['click', 'input', 'change'])
  await expect(checkbox).not.toBeChecked()
})

test('hover and label press feedback stay centered on the checkbox touch target', async ({
  page,
}) => {
  const checkbox = page.getByRole('checkbox', { name: 'Accept the terms of use' })
  const root = checkbox.locator('xpath=ancestor::div[contains(@class,"yam3x-checkbox")]')
  const control = checkbox.locator('xpath=..')
  const outline = control.locator('.yam3x-checkbox__outline')
  const initialOutlineColor = await outline.evaluate((node) => getComputedStyle(node).borderColor)

  await page.getByText('Accept the terms of use', { exact: true }).hover()
  await expect
    .poll(() => outline.evaluate((node) => getComputedStyle(node).borderColor))
    .not.toBe(initialOutlineColor)
  await page.mouse.down()
  const ripple = root.locator('.yam3x-ripple--visible')
  await expect(ripple).toHaveCount(1)
  const target = await control.boundingBox()
  const wave = await ripple.boundingBox()
  expect(target).not.toBeNull()
  expect(wave).not.toBeNull()
  expect(Math.abs(wave!.x + wave!.width / 2 - (target!.x + target!.width / 2))).toBeLessThan(1)
  expect(Math.abs(wave!.y + wave!.height / 2 - (target!.y + target!.height / 2))).toBeLessThan(1)
  await page.mouse.up()
  await expect(checkbox).toBeChecked()
})

test('short Space presses retain the m3e minimum pressed feedback duration', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Accept the terms of use' })
  const elapsed = await checkbox.evaluate(async (input) => {
    const control = input.parentElement!
    input.focus()
    const startedAt = performance.now()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }))
    if (!control.hasAttribute('data-yam3x-pressed')) return 0
    await new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        if (!control.hasAttribute('data-yam3x-pressed')) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(control, { attributes: true, attributeFilter: ['data-yam3x-pressed'] })
    })
    return performance.now() - startedAt
  })

  expect(elapsed).toBeGreaterThanOrEqual(210)
})

test('checkbox maps geometry and selected colors through Component tokens', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Receive product updates' })
  const root = checkbox.locator('xpath=ancestor::div[contains(@class,"yam3x-checkbox")]')
  const box = root.locator('.yam3x-checkbox__box')

  await expect(checkbox).toBeChecked()
  const mappedStyles = await root.evaluate((element) => {
    const resolveColor = (token: string) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${token})`
      element.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }
    const box = element.querySelector<HTMLElement>('.yam3x-checkbox__box')!
    const input = element.querySelector<HTMLInputElement>('.yam3x-checkbox__input')!
    const outline = element.querySelector<HTMLElement>('.yam3x-checkbox__outline')!
    const background = element.querySelector<HTMLElement>('.yam3x-checkbox__background')!
    const icon = element.querySelector<HTMLElement>('.yam3x-checkbox__icon')!
    const label = element.querySelector<HTMLElement>('.yam3x-checkbox__label-text')!
    return {
      boxSize: box.getBoundingClientRect().width,
      boxShape: getComputedStyle(box).borderRadius,
      targetSize: input.getBoundingClientRect().width,
      outlineWidth: getComputedStyle(outline).borderTopWidth,
      outlineColor: getComputedStyle(outline).borderTopColor,
      selectedContainer: getComputedStyle(background).backgroundColor,
      selectedIcon: getComputedStyle(icon).color,
      labelColor: getComputedStyle(label).color,
      systemOutline: resolveColor('--md-sys-color-on-surface-variant'),
      systemContainer: resolveColor('--md-sys-color-primary'),
      systemIcon: resolveColor('--md-sys-color-on-primary'),
      systemLabel: resolveColor('--md-sys-color-on-surface'),
    }
  })
  expect(mappedStyles.boxSize).toBe(18)
  expect(mappedStyles.boxShape).toBe('2px')
  expect(mappedStyles.targetSize).toBe(48)
  expect(mappedStyles.outlineWidth).toBe('2px')
  expect(mappedStyles.outlineColor).toBe(mappedStyles.systemOutline)
  expect(mappedStyles.selectedContainer).toBe(mappedStyles.systemContainer)
  expect(mappedStyles.selectedIcon).toBe(mappedStyles.systemIcon)
  expect(mappedStyles.labelColor).toBe(mappedStyles.systemLabel)

  await checkbox.focus()
  const focusStyles = await box.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: style.outlineWidth, offset: style.outlineOffset }
  })
  expect(focusStyles.width).toBe('2px')
  expect(focusStyles.offset).toBe('4px')
})

test('required checkbox participates in FormData, constraint validation, and form reset', async ({
  page,
}) => {
  const checkbox = page.getByRole('checkbox', { name: 'Accept the terms of use' })
  const form = page.locator('#checkbox-example-form')

  await expect(checkbox).toHaveAttribute('required', '')
  expect(
    await checkbox.evaluate((input) => (input as HTMLInputElement).validity.valueMissing),
  ).toBe(true)
  expect(await form.evaluate((node) => new FormData(node as HTMLFormElement).has('terms'))).toBe(
    false,
  )
  await page.getByText('Accept the terms of use', { exact: true }).click()
  await expect(checkbox).toBeChecked()
  expect(await form.evaluate((node) => new FormData(node as HTMLFormElement).get('terms'))).toBe(
    'accepted',
  )

  await page.getByRole('button', { name: 'Reset form' }).click()
  await expect(checkbox).not.toBeChecked()
  expect(await form.evaluate((node) => (node as HTMLFormElement).checkValidity())).toBe(false)
  expect(await form.evaluate((node) => new FormData(node as HTMLFormElement).has('terms'))).toBe(
    false,
  )
})

test('disabled checkbox has no hover or ripple feedback, including at 2x text', async ({
  page,
}) => {
  await page.goto('/components/checkbox')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  const checkbox = page.getByRole('checkbox', { name: 'Disabled and invalid' })
  const control = checkbox.locator('xpath=..')

  await expect(checkbox).toBeDisabled()
  await control.hover({ force: true })
  await page.mouse.down()
  await expect(control.locator('.yam3x-ripple')).toHaveCount(0)
  await page.mouse.up()
  // checkbox.a11y.target
  const bounds = await checkbox.boundingBox()
  expect(bounds?.width).toBeGreaterThanOrEqual(48)
  expect(bounds?.height).toBeGreaterThanOrEqual(48)
})

test('error treatment remains visible when a checkbox is disabled', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Disabled and invalid' })
  const root = checkbox.locator('xpath=ancestor::div[contains(@class,"yam3x-checkbox")]')
  const outline = root.locator('.yam3x-checkbox__outline')
  const description = page.getByText('The error message remains visible', { exact: true })
  const errorColor = await root.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--md-sys-color-error').trim(),
  )
  const rgb = await page.evaluate((value) => {
    const probe = document.createElement('span')
    probe.style.color = value
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, errorColor)

  await expect(checkbox).toBeDisabled()
  await expect(checkbox).toHaveAttribute('aria-invalid', 'true')
  await expect(outline).toHaveCSS('border-top-color', rgb)
  await expect(description).toHaveCSS('color', rgb)
})

test('focus, forced colors, and reduced motion preserve a visible checkbox state', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  const checkbox = page.getByRole('checkbox', { name: 'Accept the terms of use' })
  await checkbox.focus()
  const root = checkbox.locator('xpath=ancestor::div[contains(@class,"yam3x-checkbox")]')
  const box = root.locator('.yam3x-checkbox__box')

  await expect(box).toHaveCSS('outline-style', 'solid')
  expect(await box.evaluate((element) => getComputedStyle(element).outlineColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  )
  const transitionDuration = await root.locator('.yam3x-checkbox__background').evaluate((element) =>
    Math.max(
      ...getComputedStyle(element)
        .transitionDuration.split(',')
        .map((value) => parseFloat(value)),
    ),
  )
  expect(transitionDuration).toBeLessThan(0.01)
})
