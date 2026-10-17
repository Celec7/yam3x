import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test('FormField associates and sizes its slotted native input', async ({ page }) => {
  // form-field.a11y.label
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo .yam3x-form-field').first()
  const input = field.locator('input')
  const label = field.locator('label')
  await expect(label).toHaveText('Email *')
  const id = await input.getAttribute('id')
  expect(id).toBeTruthy()
  await expect(label).toHaveAttribute('for', id!)
  await expect(input).toHaveAttribute('aria-labelledby', (await label.getAttribute('id')) || '')
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  const amount = page.locator('.form-field-demo__amount')
  const amountInput = amount.locator('input')
  await expect(amountInput).toHaveAttribute('aria-describedby', /amount-prefix-description/)
  await expect(amountInput).toHaveAttribute('aria-describedby', /amount-suffix-description/)
  await expect(amountInput).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  await expect(field.locator('.yam3x-form-field__hint')).toBeVisible()
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS('height', '56px')
  const prefix = field.locator('.yam3x-form-field__prefix')
  const assertLabelClearsPrefix = async () => {
    const [prefixBox, labelBox] = await Promise.all([prefix.boundingBox(), label.boundingBox()])
    expect(prefixBox).not.toBeNull()
    expect(labelBox).not.toBeNull()
    expect(labelBox!.x).toBeGreaterThanOrEqual(prefixBox!.x + prefixBox!.width + 16)
  }
  await assertLabelClearsPrefix()
  await label.click()
  await expect(input).toBeFocused()
  await expect(field).toHaveClass(/yam3x-form-field--floating/)
  await assertLabelClearsPrefix()
  await prefix.evaluate((element) => {
    ;(element as HTMLElement).style.width = '40px'
  })
  await expect
    .poll(async () => {
      const [prefixBox, labelBox] = await Promise.all([prefix.boundingBox(), label.boundingBox()])
      return prefixBox && labelBox ? labelBox.x - prefixBox.x - prefixBox.width : -1
    })
    .toBeGreaterThanOrEqual(16)
  await input.fill('person@example.com')
  await input.blur()
  await expect(field).toHaveClass(/yam3x-form-field--populated/)
  await expect(field).toHaveClass(/yam3x-form-field--floating/)
})

test('FormField label floating and subscript visibility modes stay synchronized with accessibility', async ({
  page,
}) => {
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo__main-field')
  const input = field.locator('input')
  const hint = field.locator('.yam3x-form-field__hint')
  await input.blur()
  await selectM3Option(page, page.getByLabel('Supporting text'), 'auto')
  await expect(hint).toBeHidden()
  await expect(input).not.toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  await input.focus()
  await expect(hint).toBeVisible()
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  await input.blur()
  await expect(hint).toBeHidden()
  await selectM3Option(page, page.getByLabel('Label'), 'always')
  await expect(field).toHaveClass(/yam3x-form-field--floating/)
  await selectM3Option(page, page.getByLabel('Supporting text'), 'always')
  await expect(field.locator('.yam3x-form-field__subscript')).toHaveClass(
    /yam3x-form-field__subscript--sr-only/,
  )
  await input.focus()
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
})

test('FormField exposes native validation errors and replaces the hint', async ({ page }) => {
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo .yam3x-form-field').first()
  const input = field.locator('input')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(field).toHaveClass(/yam3x-form-field--invalid/)
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-error/)
  await expect(field.locator('.yam3x-form-field__error')).toBeVisible()
  await expect(field.locator('.form-field-demo__error-icon')).toBeVisible()
  await expect(field.locator('.yam3x-form-field__error')).toContainText(
    'Enter a valid email address',
  )
  await expect(field.locator('.yam3x-form-field__hint')).toHaveCount(0)
  await input.fill('person@example.com')
  await expect(field).not.toHaveClass(/yam3x-form-field--invalid/)
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
})

test('FormField variants, wrapping, RTL, focus, and reduced motion work on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo .yam3x-form-field').first()
  await selectM3Option(page, page.getByLabel('Appearance'), 'filled')
  await expect(field).toHaveClass(/yam3x-form-field--filled/)
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'border-bottom-width',
    '1px',
  )
  await page.locator('.form-field-demo').evaluate((element) => {
    element.setAttribute('dir', 'rtl')
  })
  await expect(field.locator('.yam3x-form-field__label')).toHaveCSS('inset-inline-start', '52px')
  const [prefixBox, labelBox] = await Promise.all([
    field.locator('.yam3x-form-field__prefix').boundingBox(),
    field.locator('.yam3x-form-field__label').boundingBox(),
  ])
  expect(prefixBox).not.toBeNull()
  expect(labelBox).not.toBeNull()
  expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(prefixBox!.x - 16)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const duration = await field
    .locator('.yam3x-form-field__label')
    .evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration.split(',').map((value) => parseFloat(value))).toContain(0)
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'border-top-color',
    'rgb(0, 0, 0)',
  )
})

test('FormField keeps existing accessible descriptions and preserves form values and reset', async ({
  page,
}) => {
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo .yam3x-form-field').first()
  const input = field.locator('input')
  await input.evaluate((element) => {
    element.setAttribute('aria-describedby', 'consumer-description')
    const description = document.createElement('span')
    description.id = 'consumer-description'
    description.textContent = 'Consumer provided instructions'
    element.closest('form')!.append(description)
  })
  await expect(input).toHaveAttribute('aria-describedby', /consumer-description/)
  await expect(input).toHaveAttribute('aria-describedby', /yam3x-form-field-hint/)
  await input.fill('keep-me@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.locator('.form-field-demo output')).toContainText('keep-me@example.com')
  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(input).toHaveValue('')
  await expect(field).not.toHaveClass(/yam3x-form-field--invalid/)
})

test('FormField follows native disabled and read-only states and supports documented overrides', async ({
  page,
}) => {
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo__main-field')
  const input = field.locator('input')
  const disabledField = page.locator('.form-field-demo__disabled')
  const readonlyField = page.locator('.form-field-demo__readonly')
  await expect(disabledField).toHaveClass(/yam3x-form-field--disabled/)
  await expect(readonlyField).toHaveClass(/yam3x-form-field--readonly/)
  await expect(readonlyField.locator('input')).toHaveAttribute('id', 'readonly-field-id')
  await expect(readonlyField.locator('label')).toHaveAttribute('for', 'readonly-field-id')
  await expect(readonlyField.locator('input')).toHaveAttribute(
    'aria-describedby',
    /yam3x-form-field-hint/,
  )

  await field.evaluate((element) => {
    element.style.setProperty('--yam3x-form-field-outline-color', 'rgb(7, 8, 9)')
    element.style.setProperty('--yam3x-form-field-container-shape', '18px')
  })
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'border-top-color',
    'rgb(7, 8, 9)',
  )
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'border-top-left-radius',
    '18px',
  )

  await input.focus()
  await field.evaluate((element) => {
    element.style.setProperty('--yam3x-form-field-focused-outline-color', 'rgb(11, 12, 13)')
    element.style.setProperty('--yam3x-form-field-focused-color', 'rgb(14, 15, 16)')
  })
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'border-top-color',
    'rgb(11, 12, 13)',
  )
  await expect(field.locator('.yam3x-form-field__label')).toHaveCSS('color', 'rgb(14, 15, 16)')

  await input.blur()
  await page.getByRole('button', { name: 'Submit' }).click()
  await field.evaluate((element) =>
    element.style.setProperty('--yam3x-form-field-invalid-color', 'rgb(17, 18, 19)'),
  )
  await expect(field.locator('.yam3x-form-field__subscript')).toHaveCSS('color', 'rgb(17, 18, 19)')

  await selectM3Option(page, page.getByLabel('Appearance'), 'filled')
  await field.evaluate((element) =>
    element.style.setProperty('--yam3x-form-field-container-color', 'rgb(20, 21, 22)'),
  )
  await expect(field.locator('.yam3x-form-field__container')).toHaveCSS(
    'background-color',
    'rgb(20, 21, 22)',
  )
})

test('FormField uses the specified focus geometry, hover label, and error hover state', async ({
  page,
}) => {
  // form-field.geometry.focus-indicator, form-field.color.hover, form-field.color.error
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo__main-field')
  const input = field.locator('input')
  const container = field.locator('.yam3x-form-field__container')
  const label = field.locator('.yam3x-form-field__label')
  const systemOnSurface = await field.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = getComputedStyle(element).getPropertyValue('--md-sys-color-on-surface')
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })

  await input.focus()
  await expect(container).toHaveCSS('border-top-width', '3px')
  await input.blur()
  const labelBeforeHover = await label.evaluate((element) => getComputedStyle(element).color)
  await container.hover()
  await expect(label).toHaveCSS('color', systemOnSurface)
  expect(labelBeforeHover).not.toBe(systemOnSurface)

  await container.evaluate((element) => element.dispatchEvent(new MouseEvent('mouseleave')))
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(field).toHaveClass(/yam3x-form-field--invalid/)
  const supporting = field.locator('.yam3x-form-field__subscript')
  const baseError = await supporting.evaluate((element) => getComputedStyle(element).color)
  await container.hover()
  const hoverError = await container.evaluate((element) => getComputedStyle(element).borderTopColor)
  const hoverLabel = await label.evaluate((element) => getComputedStyle(element).color)
  expect(hoverError).not.toBe(baseError)
  expect(hoverLabel).not.toBe(baseError)
  await expect(supporting).toHaveCSS('color', baseError)

  await input.blur()
  await selectM3Option(page, page.getByLabel('Appearance'), 'filled')
  await container.hover()
  await expect
    .poll(() => container.evaluate((element) => getComputedStyle(element, '::before').opacity))
    .toBe('0.08')
  await input.focus()
  await expect(container).toHaveCSS('border-bottom-width', '3px')
})

test('FormField text and outline keep Material color contrast in light and dark themes', async ({
  page,
}) => {
  // form-field.color.contrast
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo__main-field')
  const contrast = (foreground: string, background: string) => {
    const luminance = (value: string) => {
      const channels = value
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
        })
      return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
    }
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    return (lighter + 0.05) / (darker + 0.05)
  }
  for (const theme of ['light', 'dark']) {
    await page
      .locator('html')
      .evaluate((element, dark) => element.classList.toggle('dark', dark), theme === 'dark')
    await page.locator('.form-field-demo__main-field input').focus()
    const colors = await field.evaluate((element) => {
      const root = document.documentElement
      const getRole = (name: string) => getComputedStyle(root).getPropertyValue(name).trim()
      const normalize = (value: string) => {
        const probe = document.createElement('span')
        probe.style.color = value
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      const label = element.querySelector('.yam3x-form-field__label')!
      const container = element.querySelector('.yam3x-form-field__container')!
      return {
        label: getComputedStyle(label).color,
        surface: normalize(getRole('--md-sys-color-surface') || '#fff'),
        outline: getComputedStyle(container).borderTopColor,
      }
    })
    expect(
      contrast(colors.label, colors.surface),
      `${theme} label contrast`,
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(colors.outline, colors.surface),
      `${theme} outline contrast`,
    ).toBeGreaterThanOrEqual(3)
    await page.getByRole('button', { name: 'Validate input' }).click()
    const errorColors = await field.evaluate((element) => {
      const root = document.documentElement
      const getRole = (name: string) => getComputedStyle(root).getPropertyValue(name).trim()
      const normalize = (value: string) => {
        const probe = document.createElement('span')
        probe.style.color = value
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      return {
        text: getComputedStyle(element.querySelector('.yam3x-form-field__error')!).color,
        surface: normalize(getRole('--md-sys-color-surface') || '#fff'),
      }
    })
    expect(
      contrast(errorColors.text, errorColors.surface),
      `${theme} error contrast`,
    ).toBeGreaterThanOrEqual(4.5)
    await page.getByRole('button', { name: 'Reset' }).click()
  }
})

test('FormField remains contained on small screens and keeps suffix actions keyboardable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/form-field')
  const field = page.locator('.form-field-demo__main-field')
  const input = field.locator('input')
  const clearButton = page.getByRole('button', { name: 'Clear email' })
  await expect(clearButton).toHaveCount(0)
  await input.fill('name@example.com')
  await expect(clearButton).toBeVisible()
  await expect(clearButton).toHaveClass(/yam3x-icon-button--standard/)
  await expect(clearButton).toHaveCSS('border-top-width', '0px')
  await expect(clearButton).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)')
  await expect(clearButton.locator('.yam3x-icon__ligature')).toHaveText('close')
  const [containerBox, clearButtonBox] = await Promise.all([
    field.locator('.yam3x-form-field__container').boundingBox(),
    clearButton.boundingBox(),
  ])
  expect(containerBox).not.toBeNull()
  expect(clearButtonBox).not.toBeNull()
  expect(clearButtonBox!.x).toBeGreaterThanOrEqual(containerBox!.x)
  expect(clearButtonBox!.y).toBeGreaterThanOrEqual(containerBox!.y)
  expect(clearButtonBox!.x + clearButtonBox!.width).toBeLessThanOrEqual(
    containerBox!.x + containerBox!.width,
  )
  expect(clearButtonBox!.y + clearButtonBox!.height).toBeLessThanOrEqual(
    containerBox!.y + containerBox!.height,
  )
  await clearButton.hover()
  await expect(clearButton).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)')
  await input.focus()
  await page.keyboard.press('Tab')
  await expect(clearButton).toBeFocused()
  await expect(clearButton).toHaveCSS('outline-width', '3px')
  await page.keyboard.press('Space')
  await expect(input).toHaveValue('')
  await expect(input).toBeFocused()
  await expect(clearButton).toHaveCount(0)

  const geometry = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
    fieldRight: document.querySelector('.form-field-demo__main-field')!.getBoundingClientRect()
      .right,
  }))
  expect(geometry.fieldRight).toBeLessThanOrEqual(geometry.viewport)
  expect(geometry.page).toBeLessThanOrEqual(geometry.viewport)

  await page.getByRole('button', { name: 'Validate input' }).click()
  const error = field.locator('.yam3x-form-field__error')
  await expect(error).toBeVisible()
})
