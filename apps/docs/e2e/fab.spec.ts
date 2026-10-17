import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/fab')
})

test('disabled-interactive FAB remains focusable and blocks activation', async ({ page }) => {
  await page.getByText('Compatibility example: unavailable FAB', { exact: true }).click()
  const fab = page.getByRole('button', { name: 'Cannot create project; sign in first' })
  await expect(fab).toHaveAttribute('aria-disabled', 'true')
  await expect(fab).toHaveJSProperty('disabled', false)
  await fab.focus()
  await expect(fab).toBeFocused()

  await fab.evaluate((element) => {
    element.addEventListener('click', () => element.setAttribute('data-activated', 'true'))
  })
  await fab.click({ force: true })
  await expect(fab).not.toHaveAttribute('data-activated', 'true')
})

test('FAB honors size, shape, variant, elevation, and hover-state CSS properties', async ({
  page,
}) => {
  const fab = page.locator('#fab-example-create')
  const centers = await fab.evaluate((element) => {
    const centerX = (target: Element) => {
      const bounds = target.getBoundingClientRect()
      return bounds.left + bounds.width / 2
    }
    return {
      button: centerX(element),
      iconContainer: centerX(element.querySelector('.yam3x-fab__icon')!),
      icon: centerX(element.querySelector('.yam3x-fab__icon .yam3x-icon')!),
    }
  })
  expect(Math.abs(centers.iconContainer - centers.button)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(centers.icon - centers.button)).toBeLessThanOrEqual(0.5)
  await fab.evaluate((element) => {
    const style = (element.parentElement as HTMLElement).style
    style.setProperty('--yam3x-floating-action-button-container-height', '64px')
    style.setProperty('--yam3x-floating-action-button-shape', '18px')
    style.setProperty(
      '--yam3x-primary-container-floating-action-button-container-color',
      'rgb(1, 2, 3)',
    )
    style.setProperty(
      '--yam3x-primary-container-floating-action-button-hover-container-elevation',
      '0 0 0 2px rgb(4, 5, 6)',
    )
    style.setProperty(
      '--yam3x-primary-container-floating-action-button-hover-state-layer-opacity',
      '20%',
    )
  })
  await expect(fab).toHaveCSS('height', '64px')
  await expect(fab).toHaveCSS('border-radius', '18px')
  await expect(fab).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await fab.hover()
  await expect(fab).toHaveCSS('box-shadow', 'rgb(4, 5, 6) 0px 0px 0px 2px')
  await expect
    .poll(() => fab.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.2')
})

test('FAB demo shows the default, medium, and large icon-only sizes', async ({ page }) => {
  for (const [id, size, height, icon] of [
    ['fab-example-default', 'default', '56px', '24px'],
    ['fab-example-create', 'medium', '80px', '28px'],
    ['fab-example-large', 'large', '96px', '36px'],
  ] as const) {
    const fab = page.locator(`#${id}`)
    await expect(fab).toBeVisible()
    await expect(fab).toHaveClass(new RegExp(`yam3x-floating-action-button--${size}`))
    await expect(fab).toHaveCSS('height', height)
    await expect(fab.locator('.yam3x-fab__icon')).toHaveCSS('width', icon)
  }
})

test('Extended FAB geometry and typography follow the three expressive size roles', async ({
  page,
}) => {
  await page.goto('/components/extended-fab')
  for (const [id, height, iconSize, radius, spacing, fontSize, fontWeight, tokenLineHeight] of [
    ['extended-fab-example-small', '56px', '24px', '16px', '16px', '16px', '500', 24],
    ['extended-fab-example-medium', '80px', '28px', '20px', '26px', '22px', '400', 28],
    ['extended-fab-example-large', '96px', '36px', '28px', '28px', '24px', '400', 32],
  ] as const) {
    const fab = page.locator(`#${id}`)
    await expect(fab).toBeVisible()
    await expect(fab).toHaveClass(new RegExp(`yam3x-extended-fab--${id.split('-').at(-1)}`))
    await expect(fab).toHaveCSS('height', height)
    await expect(fab).toHaveCSS('border-radius', radius)
    await expect(fab).toHaveCSS('padding-inline-start', spacing)
    await expect(fab).toHaveCSS('padding-inline-end', spacing)
    await expect(fab.locator('.yam3x-fab__icon')).toHaveCSS('width', iconSize)
    await expect(fab).toHaveCSS('font-size', fontSize)
    await expect(fab).toHaveCSS('font-weight', fontWeight)
    expect(
      await fab.evaluate((element) => {
        const lineHeight = getComputedStyle(element)
          .getPropertyValue('--_yam3x-fab-line-height')
          .trim()
        const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
        return Number.parseFloat(lineHeight) * (lineHeight.endsWith('rem') ? rootFontSize : 1)
      }),
    ).toBe(tokenLineHeight)
  }
})

test('Extended FAB keeps independent spacing overrides and system shape mapping', async ({
  page,
}) => {
  await page.goto('/components/extended-fab')
  const fab = page.locator('#extended-fab-example-medium')
  await fab.evaluate((element) => {
    const style = (element.parentElement as HTMLElement).style
    style.setProperty('--md-sys-shape-corner-large-increased', '24px')
    style.setProperty('--yam3x-extended-fab-leading-space', '10px')
    style.setProperty('--yam3x-extended-fab-trailing-space', '30px')
  })
  await expect(fab).toHaveCSS('border-radius', '24px')
  await expect(fab).toHaveCSS('padding-inline-start', '10px')
  await expect(fab).toHaveCSS('padding-inline-end', '30px')

  await fab.evaluate((element) => {
    const style = (element.parentElement as HTMLElement).style
    style.setProperty('--yam3x-extended-fab-medium-shape', '32px')
    style.setProperty('--yam3x-extended-fab-medium-leading-space', '12px')
    style.setProperty('--yam3x-extended-fab-medium-trailing-space', '34px')
  })
  await expect(fab).toHaveCSS('border-radius', '32px')
  await expect(fab).toHaveCSS('padding-inline-start', '12px')
  await expect(fab).toHaveCSS('padding-inline-end', '34px')
})

test('Extended FAB collapses its label visually while keeping the action name available', async ({
  page,
}) => {
  await page.goto('/components/extended-fab')
  const fab = page.locator('#extended-fab-example-small')
  const expanded = page.getByRole('checkbox', { name: 'Expanded' })

  await expect(fab).toHaveClass(/yam3x-extended-fab--expanded/)
  await expect(fab).toHaveAccessibleName('Create')
  await expanded.uncheck()
  await expect(fab).toHaveClass(/yam3x-extended-fab--collapsed/)
  await expect(fab).toHaveAccessibleName('Create')
  await expect(fab.locator('.yam3x-fab__label')).toHaveCSS('width', '1px')
  const textOnlyFab = page.locator('#extended-fab-example-no-icon')
  await expect(textOnlyFab.locator('.yam3x-fab__icon')).toHaveCount(0)
  await expect(textOnlyFab).toHaveClass(/yam3x-extended-fab--expanded/)
  await expect(textOnlyFab).toHaveAccessibleName('Save draft')
  await expect(textOnlyFab.locator('.yam3x-fab__label')).toBeVisible()
  await expanded.check()
  await expect(fab).toHaveClass(/yam3x-extended-fab--expanded/)
})

test('the Extended FAB catalog entry opens its bilingual page', async ({ page }) => {
  for (const [catalog, expectedPath] of [
    ['/components/', '/components/extended-fab'],
    ['/zh/components/', '/zh/components/extended-fab'],
  ] as const) {
    await page.goto(catalog)
    await page.locator('#VPContent').getByRole('link', { name: 'Extended FABs' }).click()
    await expect(page).toHaveURL(
      new RegExp(`${expectedPath.replaceAll('/', '\\/').replace('#', '\\#')}$`),
    )
    await expect(page.getByRole('heading', { name: 'Extended FABs' })).toBeVisible()
  }
})
