import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/navigation-rail')
})

test('collapsed rail has Expressive geometry, one current link, badges, and distinct icons', async ({
  page,
}) => {
  // navigation-rail.geometry.collapsed
  const rail = page.getByTestId('navigation-rail')
  await expect(rail.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  await expect(rail).toHaveCSS('width', '96px')
  await expect(rail.locator('.yam3x-navigation-rail__surface')).toHaveCSS('padding-top', '44px')
  await expect(rail.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  await expect(rail.getByRole('link', { name: 'Settings' })).toHaveCount(0)
  await expect(rail.getByRole('link', { name: 'Downloads' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  const indicator = rail.locator(
    '.yam3x-navigation-rail__item[aria-current="page"] .yam3x-navigation-rail__indicator',
  )
  await expect(indicator).toHaveCSS('width', '56px')
  await expect(indicator).toHaveCSS('height', '32px')
  const icon = rail
    .getByRole('link', { name: 'Home' })
    .locator('.yam3x-navigation-rail__icon .yam3x-icon')
  await expect(icon.locator('.yam3x-icon__ligature')).toHaveText('home')
  await expect(rail.getByRole('link', { name: 'Search' })).toHaveAttribute(
    'aria-describedby',
    /badge/,
  )
  await expect(
    rail.getByRole('link', { name: 'Search' }).locator('.yam3x-navigation-rail__badge'),
  ).toHaveText('3')
  const hitAndBadge = await rail.getByRole('link', { name: 'Search' }).evaluate((element) => {
    const hit = element.getBoundingClientRect()
    const badge = element.querySelector('.yam3x-navigation-rail__badge')!.getBoundingClientRect()
    return {
      hitWidth: hit.width,
      badgeRight: badge.right,
      railRight: element.closest('.yam3x-navigation-rail')!.getBoundingClientRect().right,
    }
  })
  expect(hitAndBadge.hitWidth).toBe(95)
  expect(hitAndBadge.badgeRight).toBeLessThanOrEqual(hitAndBadge.railRight)
  await expect(rail.getByRole('link', { name: 'Home' })).toHaveCSS('text-decoration-line', 'none')
})

test('menu expansion reveals secondary destinations and makes the whole row target', async ({
  page,
}) => {
  const rail = page.getByTestId('navigation-rail')
  const menu = rail.getByRole('button', { name: 'Expand navigation' })
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await expect(rail).toHaveCSS('width', '220px')
  await expect(rail.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(rail.getByRole('button', { name: 'Collapse navigation' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  const leadingInsets = await rail.evaluate((element) => {
    const surface = element
      .querySelector('.yam3x-navigation-rail__surface')!
      .getBoundingClientRect()
    const fab = element.querySelector('.rail-demo__fab')!.getBoundingClientRect()
    const indicator = element
      .querySelector('.yam3x-navigation-rail__item .yam3x-navigation-rail__indicator')!
      .getBoundingClientRect()
    return { fab: fab.left - surface.left, indicator: indicator.left - surface.left }
  })
  expect(leadingInsets.fab).toBe(20)
  expect(leadingInsets.indicator).toBe(16)
  const headerGap = await rail.evaluate((element) => {
    const fab = element.querySelector('.yam3x-navigation-rail__fab')!.getBoundingClientRect()
    const first = element.querySelector('.yam3x-navigation-rail__item')!.getBoundingClientRect()
    return first.top - fab.bottom
  })
  expect(headerGap).toBeCloseTo(40, 0)
  expect(
    await rail
      .locator('.yam3x-navigation-rail__nav')
      .evaluate((element) => element.scrollHeight <= element.clientHeight),
  ).toBe(true)
  const search = rail.getByRole('link', { name: 'Search' })
  const geometry = await search.evaluate((element) => {
    const hit = element.getBoundingClientRect()
    const pill = element.querySelector('.yam3x-navigation-rail__indicator')!.getBoundingClientRect()
    const content = element.querySelector('.yam3x-navigation-rail__content')!
    const contentStyle = getComputedStyle(content)
    return {
      hit: hit.width,
      pill: pill.width,
      height: pill.height,
      paddingInlineStart: contentStyle.paddingInlineStart,
      paddingInlineEnd: contentStyle.paddingInlineEnd,
    }
  })
  expect(geometry.hit).toBe(219)
  expect(geometry.hit).toBeGreaterThan(geometry.pill + 15)
  expect(geometry.height).toBe(56)
  expect(geometry.paddingInlineStart).toBe('16px')
  expect(geometry.paddingInlineEnd).toBe('16px')
  await search.click()
  await expect(search).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('navigation-rail-events')).toHaveText(
    'beforeinput → input → change',
  )
  await rail.getByRole('button', { name: 'Collapse navigation' }).click()
  await expect(rail).toHaveCSS('width', '96px')
})

test('menu toggle and destination icons share the project alignment axis', async ({ page }) => {
  const rail = page.getByTestId('navigation-rail')
  const menuIcon = rail.locator('.yam3x-navigation-rail__menu .yam3x-icon')
  const selectedIcon = rail.locator('[aria-current="page"] .yam3x-navigation-rail__icon')
  const axisOffset = async () => {
    const [menu, item] = await Promise.all([menuIcon.boundingBox(), selectedIcon.boundingBox()])
    return Math.abs(menu!.x + menu!.width / 2 - (item!.x + item!.width / 2))
  }

  expect(await axisOffset()).toBeLessThan(1)
  await rail.getByRole('button', { name: 'Expand navigation' }).click()
  await expect.poll(axisOffset).toBeLessThan(1)
})

test('a short rail scrolls destinations while keeping menu and FAB available', async ({ page }) => {
  const rail = page.getByTestId('navigation-rail')
  await rail.getByRole('button', { name: 'Expand navigation' }).click()
  await page.locator('.rail-demo__frame').evaluate((element) => {
    ;(element as HTMLElement).style.height = '300px'
  })
  const destinations = rail.locator('.yam3x-navigation-rail__nav')
  expect(
    await destinations.evaluate((element) => element.scrollHeight > element.clientHeight),
  ).toBe(true)
  await destinations.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(rail.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(rail.getByRole('button', { name: 'Collapse navigation' })).toBeVisible()
  await expect(rail.getByRole('button', { name: 'Create new content' })).toBeVisible()
})

test('arrows move focus, Space activates, cancellation blocks selection, disabled is skipped', async ({
  page,
}) => {
  // navigation-rail.a11y.keyboard
  const rail = page.getByTestId('navigation-rail')
  const home = rail.getByRole('link', { name: 'Home' })
  const search = rail.getByRole('link', { name: 'Search' })
  const saved = rail.getByRole('link', { name: 'Saved' })
  await home.focus()
  await home.press('ArrowDown')
  await expect(search).toBeFocused()
  await expect(home).toHaveAttribute('aria-current', 'page')
  await search.press('Space')
  await expect(search).toHaveAttribute('aria-current', 'page')
  await search.press('ArrowDown')
  await expect(saved).toBeFocused()
  await saved.press('ArrowDown')
  await expect(home).toBeFocused()
  await rail.evaluate((element) =>
    element.addEventListener('beforeinput', (event) => event.preventDefault()),
  )
  await saved.click()
  await expect(search).toHaveAttribute('aria-current', 'page')
})

test('modal expansion traps focus and closes on Escape or scrim', async ({ page }) => {
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'Navigation rail expansion' }),
    'modal',
  )
  const rail = page.getByTestId('navigation-rail')
  await rail.getByRole('button', { name: 'Expand navigation' }).click()
  await expect(rail.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true')
  await expect(rail.locator('.yam3x-navigation-rail__scrim')).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await rail.getByRole('link', { name: 'Settings' }).focus()
  await page.keyboard.press('Tab')
  await expect(rail.getByRole('button', { name: 'Collapse navigation' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(rail.locator('[role="dialog"]')).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(rail.getByRole('button', { name: 'Expand navigation' })).toBeFocused()
  await rail.getByRole('button', { name: 'Expand navigation' }).click()
  await rail.locator('.yam3x-navigation-rail__scrim').dispatchEvent('click')
  await expect(rail.locator('[role="dialog"]')).toHaveCount(0)
})

test('an external menu can reveal a hidden modal rail and regain focus on close', async ({
  page,
}) => {
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'Navigation rail expansion' }),
    'modal',
  )
  await page.getByRole('checkbox', { name: 'Hide when collapsed' }).check()
  const rail = page.getByTestId('navigation-rail')
  const opener = page.getByRole('button', { name: 'Open navigation' })
  await expect(rail).toBeHidden()
  await opener.click()
  await expect(rail.locator('[role="dialog"]')).toBeVisible()
  await expect(rail.getByRole('button', { name: 'Create new content' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(rail).toBeHidden()
  await expect(opener).toBeFocused()
})

test('press ripple stays in the pill and disabled item cannot ripple', async ({ page }) => {
  const rail = page.getByTestId('navigation-rail')
  const search = rail.getByRole('link', { name: 'Search' })
  await search.scrollIntoViewIfNeeded()
  const box = await search.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 14)
  await page.mouse.down()
  await expect(search.locator('.yam3x-ripple--visible')).toHaveCount(1)
  const geometry = await search.evaluate((element) => {
    const indicator = element
      .querySelector('.yam3x-navigation-rail__indicator')!
      .getBoundingClientRect()
    const container = element.querySelector('.yam3x-ripple-container')!.getBoundingClientRect()
    return {
      indicator: indicator.width,
      container: container.width,
      offset: container.left - indicator.left,
    }
  })
  expect(geometry.container).toBe(geometry.indicator)
  expect(geometry.offset).toBe(0)
  await page.mouse.up()
  await expect(search.locator('.yam3x-ripple')).toHaveCount(0)
  const disabled = rail.getByRole('link', { name: 'Downloads' })
  await disabled.dispatchEvent('pointerdown', {
    pointerId: 11,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
  })
  await expect(disabled.locator('.yam3x-ripple')).toHaveCount(0)
})

test('RTL, text scaling, reduced motion, and forced colors remain usable', async ({ page }) => {
  const rail = page.getByTestId('navigation-rail')
  await rail.evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await expect(rail).toHaveCSS('width', '96px')
  await expect(rail.locator('.yam3x-navigation-rail__surface')).toHaveCSS('padding-top', '44px')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  await expect(rail.locator('.yam3x-navigation-rail__label').first()).toHaveCSS('font-size', '24px')
  expect(
    await rail
      .getByRole('link', { name: 'Home' })
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThan(64)
  for (const label of await rail.locator('.yam3x-navigation-rail__label').all()) {
    expect(
      await label.evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
    ).toBe(true)
  }
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  expect(
    await rail.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.00001)
  await expect(
    rail.getByRole('link', { name: 'Home' }).locator('.yam3x-navigation-rail__indicator'),
  ).toHaveCSS('border-top-style', 'solid')
})

test('auto mode responds to viewport width and manual expansion persists until reset', async ({
  page,
}) => {
  // navigation-rail.adaptive.layout
  const rail = page.getByTestId('navigation-rail')
  await page.setViewportSize({ width: 800, height: 800 })
  await selectM3Option(page, page.getByRole('combobox', { name: 'Navigation rail mode' }), 'auto')
  await expect(rail).toHaveCSS('width', '96px')
  await page.setViewportSize({ width: 1100, height: 800 })
  await expect(rail).toHaveCSS('width', '220px')
  await rail.getByRole('button', { name: 'Collapse navigation' }).click()
  await expect(rail).toHaveCSS('width', '96px')
  await page.setViewportSize({ width: 800, height: 800 })
  await expect(rail).toHaveCSS('width', '96px')
  await selectM3Option(
    page,
    page.getByRole('combobox', { name: 'Navigation rail mode' }),
    'collapsed',
  )
  await selectM3Option(page, page.getByRole('combobox', { name: 'Navigation rail mode' }), 'auto')
  await page.setViewportSize({ width: 1100, height: 800 })
  await expect(rail).toHaveCSS('width', '220px')
})

test('active and inactive icons retain 3:1 contrast in light and dark schemes', async ({
  page,
}) => {
  // navigation-rail.color.contrast
  const luminance = (color: string) => {
    const channels = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((value) => {
        const normalized = value / 255
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
      })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const contrast = (first: string, second: string) => {
    const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a)
    return (high + 0.05) / (low + 0.05)
  }
  const rail = page.getByTestId('navigation-rail')
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark)
    const colors = await rail.evaluate((element) => {
      const current = element.querySelector('[aria-current="page"]')!
      const inactive = element.querySelector('a:not([aria-current]):not([aria-disabled])')!
      return {
        container: getComputedStyle(element.querySelector('.yam3x-navigation-rail__surface')!)
          .backgroundColor,
        indicator: getComputedStyle(current.querySelector('.yam3x-navigation-rail__indicator')!)
          .backgroundColor,
        activeIcon: getComputedStyle(current.querySelector('.yam3x-navigation-rail__icon')!).color,
        inactiveIcon: getComputedStyle(inactive.querySelector('.yam3x-navigation-rail__icon')!)
          .color,
      }
    })
    expect(contrast(colors.activeIcon, colors.indicator)).toBeGreaterThanOrEqual(3)
    expect(contrast(colors.inactiveIcon, colors.container)).toBeGreaterThanOrEqual(3)
  }
})

test('component colors follow the official expressive rail roles and geometry', async ({
  page,
}) => {
  const rail = page.getByTestId('navigation-rail')
  const readMappings = () =>
    rail.evaluate((element) => {
      const current = element.querySelector('[aria-current="page"]')!
      const inactive = element.querySelector('a:not([aria-current]):not([aria-disabled])')!
      const badge = inactive.querySelector('.yam3x-navigation-rail__badge')!
      const color = (name: string) => {
        const probe = document.createElement('span')
        probe.style.color = `var(--md-sys-color-${name})`
        element.append(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      return {
        surface: getComputedStyle(element.querySelector('.yam3x-navigation-rail__surface')!)
          .backgroundColor,
        surfaceRole: color('surface-container'),
        indicator: getComputedStyle(current.querySelector('.yam3x-navigation-rail__indicator')!)
          .backgroundColor,
        indicatorRole: color('secondary-container'),
        activeIcon: getComputedStyle(current.querySelector('.yam3x-navigation-rail__icon')!).color,
        activeIconRole: color('on-secondary-container'),
        activeLabel: getComputedStyle(current.querySelector('.yam3x-navigation-rail__label')!)
          .color,
        activeLabelRole: color('secondary'),
        inactiveIcon: getComputedStyle(inactive.querySelector('.yam3x-navigation-rail__icon')!)
          .color,
        inactiveLabel: getComputedStyle(inactive.querySelector('.yam3x-navigation-rail__label')!)
          .color,
        inactiveRole: color('on-surface-variant'),
        badge: getComputedStyle(badge).backgroundColor,
        badgeRole: color('error'),
        badgeContent: getComputedStyle(badge).color,
        badgeContentRole: color('on-error'),
      }
    })
  const colors = await readMappings()
  expect(colors.surface).toBe(colors.surfaceRole)
  expect(colors.indicator).toBe(colors.indicatorRole)
  expect(colors.activeIcon).toBe(colors.activeIconRole)
  expect(colors.activeLabel).toBe(colors.activeLabelRole)
  expect(colors.inactiveIcon).toBe(colors.inactiveRole)
  expect(colors.inactiveLabel).toBe(colors.inactiveRole)
  expect(colors.badge).toBe(colors.badgeRole)
  expect(colors.badgeContent).toBe(colors.badgeContentRole)

  const inactive = rail.getByRole('link', { name: 'Search' })
  const active = rail.getByRole('link', { name: 'Home' })
  const stateLayer = (item: typeof active) =>
    item.locator('.yam3x-navigation-rail__indicator').evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return { color: style.backgroundColor, opacity: style.opacity }
    })
  await inactive.hover()
  expect(await stateLayer(inactive)).toEqual({ color: colors.inactiveRole, opacity: '0.08' })
  await inactive.focus()
  expect(await stateLayer(inactive)).toEqual({ color: colors.inactiveRole, opacity: '0.1' })
  await active.hover()
  expect(await stateLayer(active)).toEqual({ color: colors.activeIconRole, opacity: '0.08' })
  await active.focus()
  expect(await stateLayer(active)).toEqual({ color: colors.activeIconRole, opacity: '0.1' })

  await rail.getByRole('button', { name: 'Expand navigation' }).click()
  const indicator = rail.locator(
    '.yam3x-navigation-rail__item[aria-current="page"] .yam3x-navigation-rail__indicator',
  )
  await expect
    .poll(() => indicator.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(56)
  const expanded = await rail.evaluate((element) => {
    const current = element.querySelector('[aria-current="page"]')!
    const content = current.querySelector('.yam3x-navigation-rail__content')!
    const indicator = current.querySelector('.yam3x-navigation-rail__indicator')!
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-on-secondary-container)'
    element.append(probe)
    const labelRole = getComputedStyle(probe).color
    probe.remove()
    return {
      label: getComputedStyle(current.querySelector('.yam3x-navigation-rail__label')!).color,
      labelRole,
      leadingInset: content.getBoundingClientRect().left - current.getBoundingClientRect().left,
      gap: getComputedStyle(content).gap,
      indicatorHeight: indicator.getBoundingClientRect().height,
    }
  })
  expect(expanded.label).toBe(expanded.labelRole)
  expect(expanded.leadingInset).toBe(16)
  expect(expanded.gap).toBe('8px')
  expect(expanded.indicatorHeight).toBe(56)
})
