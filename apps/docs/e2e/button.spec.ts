import { expect, test } from '@playwright/test'

test('ToggleButton swaps its decorative icon and label when selected', async ({ page }) => {
  await page.goto('/components/button')
  const favorite = page.locator('.yam3x-demo').last().locator('.yam3x-button').first()

  await expect(favorite).toHaveAttribute('aria-pressed', 'false')
  await expect(favorite.locator('.yam3x-button__label')).toHaveText('Favorite')
  const unselectedIcon = await favorite.locator('.yam3x-button__icon').innerHTML()
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite.locator('.yam3x-button__label')).toHaveText('Favorited')
  expect(await favorite.locator('.yam3x-button__icon').innerHTML()).not.toBe(unselectedIcon)
  await expect(favorite.locator('.yam3x-button__icon[aria-hidden="true"]')).toHaveCount(1)
  await expect(
    page
      .getByRole('link', { name: 'View components', exact: true })
      .locator('[data-icon="trailing"]'),
  ).toBeVisible()
})

test('button examples expose five visual variants and an accessible toggle state', async ({
  page,
}) => {
  await page.goto('/components/button')
  const variants = page.locator('.yam3x-demo__row').first().locator('.yam3x-button')
  // button.style.variants
  await expect(variants).toHaveCount(5)
  for (const [index, variant] of [
    'filled',
    'filled-tonal',
    'elevated',
    'outlined',
    'text',
  ].entries()) {
    await expect(variants.nth(index)).toHaveClass(new RegExp(`yam3x-button--${variant}`))
  }

  const favorite = page.locator('.yam3x-demo').last().locator('.yam3x-button').first()
  // button.toggle.aria-state
  await expect(favorite).toHaveAttribute('aria-pressed', 'false')
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
})

test('button example shows all expressive sizes, icon spacing, and square shape', async ({
  page,
}) => {
  await page.goto('/components/button')
  const sizes = page.locator('.yam3x-demo__row').nth(1).locator('.yam3x-button')
  await expect(sizes).toHaveCount(6)
  for (const [index, height] of ['32px', '40px', '56px', '96px', '136px'].entries()) {
    await expect(sizes.nth(index)).toHaveCSS('min-height', height)
    const spacing = await sizes.nth(index).evaluate((button) => {
      const icon = button.querySelector('.yam3x-button__icon')!.getBoundingClientRect()
      const label = button.querySelector('.yam3x-button__label')!.getBoundingClientRect()
      return label.left - icon.right
    })
    expect(spacing).toBeCloseTo([4, 8, 8, 12, 16][index]!, 0)
  }
  await expect(sizes.nth(5)).toHaveClass(/yam3x-button--square/)
})

test('Button typography and toggle shape follow size and state tokens', async ({ page }) => {
  await page.goto('/components/button')
  const sizes = page.locator('.yam3x-demo__row').nth(1).locator('.yam3x-button')
  for (const [index, [fontSize, weight]] of [
    ['14px', '500'],
    ['14px', '500'],
    ['16px', '500'],
    ['24px', '400'],
    ['32px', '400'],
  ].entries()) {
    await expect(sizes.nth(index)).toHaveCSS('font-size', fontSize)
    await expect(sizes.nth(index)).toHaveCSS('font-weight', weight)
  }

  const toggles = page.locator('.yam3x-demo').last().locator('.yam3x-demo__row').first()
  const round = toggles.locator('.yam3x-button').first()
  const square = toggles.locator('.yam3x-button').last()
  await expect(round).toHaveCSS('border-radius', '20px')
  await expect(square).toHaveCSS('border-radius', '12px')
  await round.click()
  await square.click()
  await expect(round).toHaveCSS('border-radius', '12px')
  await expect(square).toHaveCSS('border-radius', '20px')
  await square.hover()
  await page.mouse.down()
  await expect(square).toHaveCSS('border-radius', '8px')
  await page.mouse.up()
})

test('button shape transitions use the spring approximation for the official press parameters', async ({
  page,
}) => {
  await page.goto('/components/button')
  const button = page.locator('.yam3x-demo__row').first().locator('.yam3x-button').first()
  await expect(button).toHaveCSS('transition-duration', /0\.178s/)
  await expect(button).toHaveCSS('transition-timing-function', /linear\(/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(button).toHaveCSS('transition-property', 'none')
})

test('default and toggle color roles match Material in light and dark themes', async ({ page }) => {
  await page.goto('/components/button')
  // button.color.roles
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const regularButtons = page.locator('.yam3x-demo__row').first().locator('.yam3x-button')
  const expected = [
    ['primary', 'on-primary'],
    ['secondary-container', 'on-secondary-container'],
    ['surface-container-low', 'primary'],
    ['transparent', 'on-surface-variant'],
    ['transparent', 'primary'],
  ] as const
  const favorite = page.locator('.yam3x-demo').last().locator('.yam3x-button').first()
  const cssColor = async (token: string) =>
    token === 'transparent'
      ? 'rgba(0, 0, 0, 0)'
      : page.evaluate((role) => {
          const hex = getComputedStyle(document.documentElement)
            .getPropertyValue(`--md-sys-color-${role}`)
            .trim()
            .slice(1)
          const value = Number.parseInt(hex, 16)
          return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
        }, token)

  const modeSwitch = page.getByRole('switch')
  const expectColors = async () => {
    for (const [index, roles] of expected.entries()) {
      await expect(regularButtons.nth(index)).toHaveCSS(
        'background-color',
        await cssColor(roles[0]),
      )
      await expect(regularButtons.nth(index)).toHaveCSS('color', await cssColor(roles[1]))
    }
    await expect(favorite).toHaveCSS('background-color', await cssColor('surface-container'))
    await expect(favorite).toHaveCSS('color', await cssColor('on-surface-variant'))
    await favorite.click()
    await expect(favorite).toHaveCSS('background-color', await cssColor('primary'))
    await expect(favorite).toHaveCSS('color', await cssColor('on-primary'))
    await favorite.click()
  }
  await expectColors()
  await modeSwitch.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expectColors()
})

test('Button color follows System updates and allows a Component override', async ({ page }) => {
  await page.goto('/components/button')
  const filled = page.locator('.yam3x-demo__row').first().locator('.yam3x-button').first()
  await page.locator('html').evaluate((element) => {
    element.style.setProperty('--md-sys-color-primary', '#112233')
  })
  await expect(filled).toHaveCSS('background-color', 'rgb(17, 34, 51)')

  await filled.evaluate((element) => {
    element.style.setProperty('--yam3x-button-container-color', '#445566')
  })
  await expect(filled).toHaveCSS('background-color', 'rgb(68, 85, 102)')
})

test('disabled button colors follow Material on-surface opacity roles in both themes', async ({
  page,
}) => {
  await page.goto('/components/button')
  // button.color.disabled-state
  const disabledButtons = page.locator('.yam3x-demo button.yam3x-button:disabled')
  const modeSwitch = page.getByRole('switch')
  await expect(disabledButtons).toHaveCount(5)

  for (let mode = 0; mode < 2; mode++) {
    const expected = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent)'
      probe.style.color = 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)'
      probe.style.borderColor =
        'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)'
      document.body.append(probe)
      const style = getComputedStyle(probe)
      const values = {
        container: style.backgroundColor,
        label: style.color,
        outline: style.borderColor,
      }
      probe.remove()
      return values
    })

    for (const button of await disabledButtons.all()) {
      const variant = await button.getAttribute('class')
      await expect(button).toHaveCSS('color', expected.label)
      await expect(button).toHaveCSS('box-shadow', 'none')
      if (variant?.includes('outlined'))
        await expect(button).toHaveCSS('border-color', expected.outline)
      if (
        variant?.includes('filled') ||
        variant?.includes('tonal') ||
        variant?.includes('elevated')
      ) {
        await expect(button).toHaveCSS('background-color', expected.container)
      } else {
        await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      }
    }
    if (mode === 0) await modeSwitch.click()
  }
})

test('disabledInteractive buttons remain focusable but cannot activate', async ({ page }) => {
  await page.goto('/components/button')
  const button = page.getByRole('button', { name: 'Submitting', exact: true })
  const activations = page.getByRole('status', { name: 'Disabled button activations' })

  await expect(button).toHaveAttribute('aria-disabled', 'true')
  await expect(button).not.toHaveAttribute('disabled')
  await expect(button).toHaveJSProperty('tabIndex', 0)
  await button.focus()
  await expect(button).toBeFocused()
  await page.keyboard.press('Space')
  await button.click({ force: true })
  await expect(activations).toContainText('0')
  await expect(button.locator('.yam3x-ripple')).toHaveCount(0)
  await button.evaluate((element) => {
    const form = document.createElement('form')
    form.id = 'disabled-interactive-form'
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      form.dataset.submitted = 'true'
    })
    element.before(form)
    form.append(element)
    element.setAttribute('type', 'submit')
  })
  await button.click({ force: true })
  await expect(page.locator('#disabled-interactive-form')).not.toHaveAttribute('data-submitted')
})

test('disabledInteractive links keep link semantics and suppress navigation', async ({ page }) => {
  await page.goto('/components/button')
  const link = page.getByRole('link', { name: 'Link unavailable', exact: true })

  await expect(link).toHaveAttribute('aria-disabled', 'true')
  await expect(link).toHaveAttribute('tabindex', '0')
  await expect(link).not.toHaveAttribute('href')
  await link.focus()
  await expect(link).toBeFocused()
  await link.click({ force: true })
  await expect(page).toHaveURL('/components/button')
})

test('button labels remain fully visible at 2x text size and fit a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/button')
  // button.label.single-line
  await page.addStyleTag({
    content:
      '.yam3x-demo .yam3x-button { font-size: 28px !important; line-height: 40px !important; }',
  })
  const buttons = page.locator('.yam3x-demo .yam3x-button')

  for (const button of await buttons.all()) {
    const dimensions = await button.locator('.yam3x-button__label').evaluate((label) => ({
      scrollWidth: label.scrollWidth,
      clientWidth: label.clientWidth,
      scrollHeight: label.scrollHeight,
      clientHeight: label.clientHeight,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
    expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight)
  }
  expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
    390,
  )
})

test('small visual buttons keep a 48px interactive target', async ({ page }) => {
  await page.goto('/components/button')
  const button = page.locator('.yam3x-demo__row').first().locator('.yam3x-button').first()

  // button.a11y.small-hit-target
  const target = await button.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    const targetStyle = getComputedStyle(element, '::before')
    const x = bounds.left + bounds.width / 2
    return {
      width: Number.parseFloat(targetStyle.width),
      height: Number.parseFloat(targetStyle.height),
      topHit: document.elementFromPoint(x, bounds.top - 1) === element,
      bottomHit: document.elementFromPoint(x, bounds.bottom + 1) === element,
    }
  })

  expect(target.width).toBeGreaterThanOrEqual(48)
  expect(target.height).toBeGreaterThanOrEqual(48)
  expect(target.topHit).toBe(true)
  expect(target.bottomHit).toBe(true)
})

test('round button shape uses half the control height at rest', async ({ page }) => {
  await page.goto('/components/button')
  const button = page.locator('.yam3x-demo__row').first().locator('.yam3x-button').first()
  // button.shape.round-rest
  await expect(button).toHaveCSS('border-radius', '20px')
})

test('leading and trailing button icons stay on the correct inline edge in RTL', async ({
  page,
}) => {
  await page.goto('/components/button')
  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
  const favorite = page.locator('.yam3x-demo').last().locator('.yam3x-button').first()
  const link = page.getByRole('link', { name: 'View components', exact: true })
  const positions = async (button: typeof favorite) =>
    button.evaluate((element) => {
      const icon = element
        .querySelector<HTMLElement>('.yam3x-button__icon')!
        .getBoundingClientRect()
      const label = element
        .querySelector<HTMLElement>('.yam3x-button__label')!
        .getBoundingClientRect()
      return { iconCenter: icon.x + icon.width / 2, labelCenter: label.x + label.width / 2 }
    })

  const leading = await positions(favorite)
  const trailing = await positions(link)
  expect(leading.iconCenter).toBeGreaterThan(leading.labelCenter)
  expect(trailing.iconCenter).toBeLessThan(trailing.labelCenter)
})

test('button focus stays visible in forced colors and disabled controls remain inert', async ({
  page,
}) => {
  await page.goto('/components/button')
  await page.emulateMedia({ forcedColors: 'active' })
  const button = page.getByRole('button', { name: 'Save', exact: true })
  // button.a11y.visible-focus
  await button.focus()
  await expect(button).toHaveCSS('outline-style', 'solid')
  const disabled = page.getByRole('button', { name: 'Submitting', exact: true })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await expect(disabled).toHaveCSS('box-shadow', 'none')
})
