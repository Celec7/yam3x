import { expect, test } from '@playwright/test'

test('passive cards stay inert while actionable cards expose pointer and keyboard feedback', async ({
  page,
}) => {
  await page.goto('/components/card')
  const passive = page.locator('.yam3x-demo .yam3x-card').first()
  await expect(passive).toHaveJSProperty('tagName', 'DIV')
  await expect(passive).not.toHaveAttribute('tabindex')
  await passive.click()
  await expect(page.getByText('Passive card activations 0 ', { exact: true })).toBeVisible()
  const restingLayer = await passive.evaluate(
    (element) => getComputedStyle(element, '::after').opacity,
  )
  await passive.hover()
  await expect
    .poll(() => passive.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe(restingLayer)

  // card.behavior.actionable
  const actionable = page.getByRole('button', { name: 'Open reading plan', exact: true })
  await expect(actionable).toHaveCSS('padding', '0px')
  await actionable.hover()
  await expect
    .poll(() => actionable.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await expect(actionable).not.toHaveCSS('box-shadow', 'none')
  // card.a11y.visible-focus
  await actionable.focus()
  await expect(actionable).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Space')
  await expect(page.getByText('Card opened 1 ', { exact: true })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Card opened 2 ', { exact: true })).toBeVisible()
})

test('card variants follow theme roles and structured slots preserve layout and padding', async ({
  page,
}) => {
  await page.goto('/components/card')
  await page.locator('.yam3x-demo .yam3x-card--elevated').waitFor()
  const modeSwitch = page.getByRole('switch')
  const html = page.locator('html')
  if (await html.evaluate((element) => element.classList.contains('dark'))) await modeSwitch.click()

  // card.color.roles
  const readRoles = () =>
    page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const color = (role: string) => root.getPropertyValue(`--md-sys-color-${role}`).trim()
      const background = (variant: string) =>
        getComputedStyle(document.querySelector(`.yam3x-demo .yam3x-card--${variant}`)!)
          .backgroundColor
      const parse = (hex: string) => {
        const value = Number.parseInt(hex.replace('#', ''), 16)
        return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
      }
      return {
        filled: background('filled') === parse(color('surface-container-highest')),
        elevated: background('elevated') === parse(color('surface-container-low')),
        outlined: background('outlined') === parse(color('surface')),
      }
    })
  await expect.poll(readRoles).toEqual({ filled: true, elevated: true, outlined: true })

  const horizontal = page.locator('.yam3x-demo .yam3x-card--horizontal')
  await expect(horizontal).toHaveClass(/yam3x-card--inline/)
  await expect(horizontal).toHaveCSS('display', 'inline-flex')
  await expect(horizontal).toHaveCSS('flex-direction', 'row')
  await expect(horizontal.locator('.yam3x-card__header')).toHaveCSS('margin-block-start', '16px')
  await expect(horizontal.locator('.yam3x-card__content')).toHaveCSS('margin-block', '16px')
  await expect(horizontal.locator('.yam3x-card__content')).toHaveCSS('padding', '0px')
  const defaultSlot = page
    .locator('.yam3x-demo .yam3x-card--filled')
    .first()
    .locator('.yam3x-card__content')
  await expect(defaultSlot).toHaveCSS('padding', '16px')

  await modeSwitch.click()
  await expect(html).toHaveClass(/dark/)
  await expect.poll(readRoles).toEqual({ filled: true, elevated: true, outlined: true })

  await page.addStyleTag({
    content: '.yam3x-demo .yam3x-card { --yam3x-card-padding: 24px; --yam3x-card-shape: 6px; }',
  })
  const filled = page.locator('.yam3x-demo .yam3x-card--filled').first()
  await expect.poll(readRoles).toEqual({ filled: true, elevated: true, outlined: true })
  await expect(filled).toHaveCSS('border-radius', '6px')
  await expect(horizontal.locator('.yam3x-card__content')).toHaveCSS('margin-block', '24px')

  const actionable = page.getByRole('button', { name: 'Open reading plan', exact: true })
  await actionable.hover()
  await expect
    .poll(() => actionable.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await expect(actionable).not.toHaveCSS('box-shadow', 'none')
})

test('disabledInteractive cards keep focus with native button and link semantics but do not activate', async ({
  page,
}) => {
  await page.goto('/components/card')
  const button = page.getByRole('button', { name: 'Processing', exact: true })
  await expect(button).toHaveAttribute('aria-disabled', 'true')
  await expect(button).not.toHaveAttribute('disabled')
  await expect(button).toHaveJSProperty('tabIndex', 0)
  await button.focus()
  await expect(button).toBeFocused()
  await button.click({ force: true })
  await expect(page.getByText('Disabled card activations 0 ', { exact: true })).toBeVisible()
  await expect(button.locator('.yam3x-ripple')).toHaveCount(0)

  const link = page.getByRole('link', { name: 'Unavailable card link', exact: true })
  await expect(link).toHaveAttribute('aria-disabled', 'true')
  await expect(link).toHaveAttribute('role', 'link')
  await expect(link).not.toHaveAttribute('href')
  await expect(link).toHaveJSProperty('tabIndex', 0)
  await link.click({ force: true })
  await expect(page).toHaveURL('/components/card')
})

test('actionable cards retain native submit, reset, name, and value form behavior', async ({
  page,
}) => {
  await page.goto('/components/card')
  await page.getByRole('button', { name: 'Submit card form', exact: true }).click()
  await expect(page.getByText('Form submission value: intent=open', { exact: true })).toBeVisible()

  const field = page.getByRole('textbox', { name: 'Reset test content' })
  await field.fill('Updated value')
  await page.getByRole('button', { name: 'Reset card form', exact: true }).click()
  await expect(field).toHaveValue('Default value')
})

test('cards preserve contrast and focus visibility in forced colors and stop transitions for reduced motion', async ({
  page,
}) => {
  await page.goto('/components/card')
  await page.locator('.yam3x-demo .yam3x-card--elevated').waitFor()
  const button = page.getByRole('button', { name: 'Open reading plan', exact: true })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() =>
      button.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
    )
    .toBeLessThanOrEqual(0.01)

  await page.emulateMedia({ forcedColors: 'active' })
  await button.focus()
  const systemColors = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.outlineColor = 'Highlight'
    probe.style.borderColor = 'CanvasText'
    document.body.append(probe)
    const style = getComputedStyle(probe)
    const values = { focus: style.outlineColor, boundary: style.borderColor }
    probe.remove()
    return values
  })
  await expect(button).toHaveCSS('outline-color', systemColors.focus)
  await expect(button).toHaveCSS('border-color', systemColors.boundary)
  await expect(button).toHaveCSS('outline-style', 'solid')
})
