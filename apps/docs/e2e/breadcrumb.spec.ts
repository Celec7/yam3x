import { expect, test } from '@playwright/test'

test('exposes a labelled ordered navigation trail with native links and current-page semantics', async ({
  page,
}) => {
  // breadcrumb.extension.navigation-semantics
  await page.goto('/components/breadcrumb')

  const navigation = page.getByRole('navigation', { name: 'Page path' })
  const list = navigation.getByRole('list')
  const items = list.getByRole('listitem')
  await expect(items).toHaveCount(3)
  await expect(items.nth(0).getByRole('link', { name: 'Get started' })).toHaveAttribute(
    'href',
    '/guide/installation',
  )
  await expect(items.nth(1).getByRole('link', { name: 'Components' })).toHaveAttribute(
    'href',
    '/components/',
  )
  await expect(
    items.nth(2).getByRole('link', { name: 'Interaction and selection' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('.yam3x-breadcrumb__separator')).toHaveCount(2)
  await expect(navigation.locator('.yam3x-breadcrumb__separator[aria-hidden="true"]')).toHaveCount(
    2,
  )

  const firstLink = items.nth(0).getByRole('link')
  await firstLink.focus()
  await expect(firstLink).toBeFocused()
  await expect(firstLink).toHaveCSS('outline-style', 'solid')
})

test('keeps icon-only names, disabled text, and custom separators accessible', async ({ page }) => {
  await page.goto('/components/breadcrumb')
  const navigation = page.getByRole('navigation', { name: 'Supporting states example' })
  const items = navigation.getByRole('listitem')
  await expect(items.nth(0).getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(items.nth(0).locator('.yam3x-breadcrumb__label')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(items.nth(0).locator('.yam3x-breadcrumb__icon .yam3x-icon')).toBeVisible()
  await expect(items.nth(1).locator('.yam3x-breadcrumb__item')).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await expect(items.nth(1).getByRole('link')).toHaveCount(0)
  await expect(items.nth(2).locator('.yam3x-breadcrumb__item')).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(navigation.locator('.yam3x-breadcrumb__separator').first()).toContainText('/')
})

test('keeps a current destination operable when it is represented by a native link', async ({
  page,
}) => {
  await page.goto('/components/breadcrumb')
  const navigation = page.getByRole('navigation', { name: 'Page path' })
  const current = navigation.getByRole('listitem').nth(2).getByRole('link')
  await expect(current).toHaveAttribute('aria-current', 'page')
  await expect(current).toHaveAttribute('href', '/components/segmented-button')
  await expect(current).toHaveCSS('cursor', 'pointer')
  await current.hover()
  await expect
    .poll(() => current.evaluate((element) => getComputedStyle(element, '::before').opacity))
    .toBe('0.08')
})

test('contains narrow paths locally, supports wrapping, and mirrors separators in RTL', async ({
  page,
}) => {
  // breadcrumb.extension.narrow-layout
  await page.setViewportSize({ width: 800, height: 700 })
  await page.goto('/components/breadcrumb')
  const frame = page.locator('.breadcrumb-demo__frame').first()
  const navigation = page.getByRole('navigation', { name: 'Page path' })
  await frame.evaluate((element) => {
    element.style.inlineSize = '260px'
  })

  const list = navigation.getByRole('list')
  await expect
    .poll(() => list.evaluate((element) => element.scrollWidth > element.clientWidth))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('checkbox', { name: 'Allow path wrapping' }).check()
  await expect
    .poll(() => list.evaluate((element) => getComputedStyle(element).flexWrap))
    .toBe('wrap')
  await expect
    .poll(() => list.evaluate((element) => element.scrollWidth <= element.clientWidth))
    .toBe(true)

  await frame.evaluate((element) => {
    element.setAttribute('dir', 'rtl')
  })
  const separator = navigation.locator('.yam3x-breadcrumb__separator-icon').first()
  await expect
    .poll(() => separator.evaluate((element) => getComputedStyle(element).transform))
    .toBe('matrix(-1, 0, 0, -1, 0, 0)')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
})

test('honors m3e item and separator style hooks and accessibility media modes', async ({
  page,
}) => {
  await page.goto('/components/breadcrumb')
  const navigation = page.getByRole('navigation', { name: 'Page path' })
  const iconNavigation = page.getByRole('navigation', { name: 'Supporting states example' })
  const link = navigation.getByRole('link').first()
  const properties: Record<string, string> = {
    '--yam3x-breadcrumb-item-container-height': '44px',
    '--yam3x-breadcrumb-item-disabled-color': 'rgb(1, 2, 3)',
    '--yam3x-breadcrumb-item-disabled-opacity': '50%',
    '--yam3x-breadcrumb-item-icon-color': 'rgb(4, 5, 6)',
    '--yam3x-breadcrumb-item-icon-focus-state-layer-color': 'rgb(7, 8, 9)',
    '--yam3x-breadcrumb-item-icon-hover-state-layer-color': 'rgb(10, 11, 12)',
    '--yam3x-breadcrumb-item-icon-label-space': '5px',
    '--yam3x-breadcrumb-item-icon-padding-inline': '3px',
    '--yam3x-breadcrumb-item-icon-pressed-state-layer-color': 'rgb(13, 14, 15)',
    '--yam3x-breadcrumb-item-icon-size': '18px',
    '--yam3x-breadcrumb-item-label-color': 'rgb(16, 17, 18)',
    '--yam3x-breadcrumb-item-label-focus-state-layer-color': 'rgb(19, 20, 21)',
    '--yam3x-breadcrumb-item-label-font-size': '16px',
    '--yam3x-breadcrumb-item-label-font-weight': '600',
    '--yam3x-breadcrumb-item-label-hover-state-layer-color': 'rgb(22, 23, 24)',
    '--yam3x-breadcrumb-item-label-line-height': '24px',
    '--yam3x-breadcrumb-item-label-padding-inline': '10px',
    '--yam3x-breadcrumb-item-label-pressed-state-layer-color': 'rgb(25, 26, 27)',
    '--yam3x-breadcrumb-item-label-tracking': '0.5px',
    '--yam3x-breadcrumb-item-last-color': 'rgb(28, 29, 30)',
    '--yam3x-breadcrumb-item-shape': '12px',
    '--yam3x-breadcrumb-separator-icon-size': '14px',
  }
  await navigation.evaluate((element, values) => {
    for (const [name, value] of Object.entries(values)) element.style.setProperty(name, value)
  }, properties)
  await iconNavigation.evaluate((element) => {
    element.style.setProperty('--yam3x-breadcrumb-item-icon-size', '18px')
    element.style.setProperty('--yam3x-breadcrumb-item-icon-color', 'rgb(4, 5, 6)')
    element.style.setProperty('--yam3x-breadcrumb-item-icon-padding-inline', '3px')
    element.style.setProperty('--yam3x-breadcrumb-item-icon-label-space', '5px')
    element.style.setProperty('--yam3x-breadcrumb-item-disabled-color', 'rgb(1, 2, 3)')
    element.style.setProperty('--yam3x-breadcrumb-item-disabled-opacity', '50%')
    element.style.setProperty('--yam3x-breadcrumb-item-last-color', 'rgb(28, 29, 30)')
    element.style.setProperty(
      '--yam3x-breadcrumb-item-icon-hover-state-layer-color',
      'rgb(10, 11, 12)',
    )
    element.style.setProperty(
      '--yam3x-breadcrumb-item-icon-focus-state-layer-color',
      'rgb(7, 8, 9)',
    )
    element.style.setProperty(
      '--yam3x-breadcrumb-item-icon-pressed-state-layer-color',
      'rgb(13, 14, 15)',
    )
  })

  await expect
    .poll(() =>
      navigation
        .locator('.yam3x-breadcrumb__item--link')
        .first()
        .evaluate((element) => getComputedStyle(element).color),
    )
    .toBe('rgb(16, 17, 18)')
  await expect
    .poll(() =>
      iconNavigation
        .locator('.yam3x-breadcrumb__item--current')
        .evaluate((element) => getComputedStyle(element).color),
    )
    .toBe('rgb(28, 29, 30)')

  const styles = await navigation.evaluate((nav) => {
    const first = nav.querySelector<HTMLElement>('.yam3x-breadcrumb__item--link')!
    const last = nav.querySelector<HTMLElement>('.yam3x-breadcrumb__item--current')!
    const separatorIcon = nav.querySelector<HTMLElement>('.yam3x-breadcrumb__separator-icon')!
    const firstStyle = getComputedStyle(first)
    const lastStyle = getComputedStyle(last)
    const separatorStyle = getComputedStyle(separatorIcon)
    return {
      height: firstStyle.height,
      shape: firstStyle.borderStartStartRadius,
      labelColor: firstStyle.color,
      labelFont: [
        firstStyle.fontSize,
        firstStyle.fontWeight,
        firstStyle.lineHeight,
        firstStyle.letterSpacing,
        firstStyle.paddingInlineStart,
      ],
      currentLinkColor: lastStyle.color,
      separatorSize: separatorStyle.inlineSize,
      hoverColor: getComputedStyle(first, '::before').backgroundColor,
      labelGap: firstStyle.columnGap,
    }
  })
  expect(styles.height).toBe('44px')
  expect(styles.shape).toBe('12px')
  expect(styles.labelColor).toBe('rgb(16, 17, 18)')
  expect(styles.labelFont).toEqual(['16px', '600', '24px', '0.5px', '10px'])
  expect(styles.currentLinkColor).toBe('rgb(16, 17, 18)')
  expect(styles.separatorSize).toBe('14px')
  expect(styles.hoverColor).toBe('rgb(22, 23, 24)')
  expect(styles.labelGap).toBe('5px')

  const iconEffects = await iconNavigation.evaluate((element) => {
    const iconOnly = element.querySelector<HTMLElement>('.yam3x-breadcrumb__item--icon-only')!
    const icon = iconOnly.querySelector<HTMLElement>('.yam3x-breadcrumb__icon')!
    const disabled = element.querySelector<HTMLElement>('.yam3x-breadcrumb__item--disabled')!
    return {
      size: getComputedStyle(icon).fontSize,
      color: getComputedStyle(icon).color,
      padding: getComputedStyle(iconOnly).paddingInlineStart,
      labelGap: getComputedStyle(element.querySelector('.yam3x-breadcrumb__item--current')!)
        .columnGap,
      disabled: getComputedStyle(disabled).color,
      hoverColor: getComputedStyle(iconOnly, '::before').backgroundColor,
      currentColor: getComputedStyle(element.querySelector('.yam3x-breadcrumb__item--current')!)
        .color,
    }
  })
  expect(iconEffects).toMatchObject({
    size: '18px',
    color: 'rgb(4, 5, 6)',
    padding: '3px',
    labelGap: '5px',
    hoverColor: 'rgb(10, 11, 12)',
    currentColor: 'rgb(28, 29, 30)',
  })
  expect(iconEffects.disabled).toMatch(/0\.5\)$/)

  const iconOnly = iconNavigation.locator('.yam3x-breadcrumb__item--icon-only')
  await iconOnly.focus()
  await expect
    .poll(() => iconOnly.evaluate((element) => element.matches(':focus-visible')))
    .toBe(true)
  await expect
    .poll(() =>
      iconOnly.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
    )
    .toBe('rgb(7, 8, 9)')
  await iconOnly.evaluate((element) => element.setAttribute('data-yam3x-pressed', ''))
  await expect
    .poll(() =>
      iconOnly.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
    )
    .toBe('rgb(13, 14, 15)')
  await iconOnly.evaluate((element) => element.removeAttribute('data-yam3x-pressed'))

  await link.hover()
  await expect
    .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').opacity))
    .toBe('0.08')
  await link.focus()
  await expect.poll(() => link.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
  await expect
    .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').backgroundColor))
    .toBe('rgb(19, 20, 21)')
  await link.evaluate((element) => element.setAttribute('data-yam3x-pressed', ''))
  await expect
    .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').backgroundColor))
    .toBe('rgb(25, 26, 27)')
  await link.evaluate((element) => element.removeAttribute('data-yam3x-pressed'))
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await expect
    .poll(() =>
      link.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element, '::before').transitionDuration),
      ),
    )
    .toBeLessThan(0.001)
  await link.focus()
  await expect(link).toHaveCSS('outline-style', 'solid')
})

test('maps breadcrumb links to System color and Label Large tokens', async ({ page }) => {
  await page.goto('/components/breadcrumb')
  const navigation = page.getByRole('navigation', { name: 'Page path' })
  const link = navigation.getByRole('link').first()
  const systemTypography = await navigation.evaluate((element) => {
    const probe = document.createElement('span')
    const style = probe.style
    style.color = 'var(--md-sys-color-primary)'
    style.fontSize = 'var(--md-sys-typescale-label-large-size)'
    style.fontWeight = 'var(--md-sys-typescale-label-large-weight)'
    style.lineHeight = 'var(--md-sys-typescale-label-large-line-height)'
    style.letterSpacing = 'var(--md-sys-typescale-label-large-tracking)'
    element.append(probe)
    const computed = getComputedStyle(probe)
    const values = [
      computed.color,
      computed.fontSize,
      computed.fontWeight,
      computed.lineHeight,
      computed.letterSpacing,
    ]
    probe.remove()
    return values
  })

  await expect(link).toHaveCSS('color', systemTypography[0])
  await expect(link).toHaveCSS('font-size', systemTypography[1])
  await expect(link).toHaveCSS('font-weight', systemTypography[2])
  await expect(link).toHaveCSS('line-height', systemTypography[3])
  await expect(link).toHaveCSS('letter-spacing', systemTypography[4])
})
