import { expect, test, type Page } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 })
  await page.goto('/components/split-button')
})

const mainDemo = (page: Page) => page.locator('.split-demo')

test('keeps primary and menu actions independent and exposes the group and popup names', async ({
  page,
}) => {
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  await expect(primary).toHaveAttribute('type', 'button')
  await expect(more).toHaveAttribute('aria-haspopup', 'menu')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(group.getByRole('menu')).toHaveCount(0)
  const idleColor = await more.evaluate((element) => getComputedStyle(element).backgroundColor)
  await more.hover()
  await expect(more).toHaveCSS('border-top-left-radius', '12px')

  await primary.click()
  await expect(page.getByTestId('split-button-state')).toContainText('Primary action run 1 ')
  await expect(more).toHaveAttribute('aria-expanded', 'false')

  await more.click()
  const menu = page.getByRole('menu', { name: 'Save options' })
  await expect(menu).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  const menuId = await menu.getAttribute('id')
  expect(menuId).toBeTruthy()
  await expect(more).toHaveAttribute('aria-controls', menuId!)
  await expect(more).toHaveCSS('background-color', idleColor)
  const popupBounds = await menu.boundingBox()
  const triggerBounds = await more.boundingBox()
  const expandedIconOffset = await more
    .locator('.yam3x-split-button__chevron .yam3x-icon')
    .evaluate((icon) => {
      const iconRect = icon.getBoundingClientRect()
      const buttonRect = icon.closest('button')!.getBoundingClientRect()
      return iconRect.top + iconRect.height / 2 - buttonRect.top - buttonRect.height / 2
    })
  expect(Math.abs(expandedIconOffset)).toBeLessThan(0.1)
  expect(Math.abs(popupBounds!.x - triggerBounds!.x)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(popupBounds!.y - triggerBounds!.y - triggerBounds!.height - 4),
  ).toBeLessThanOrEqual(1)
  await expect(menu.getByRole('menuitemradio', { name: 'Save document' })).toBeFocused()
  await expect
    .poll(() => more.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await more.hover()
  await expect
    .poll(() => more.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await expect(more.locator('.yam3x-split-button__chevron')).toHaveCSS(
    'transform',
    'matrix(-1, 0, 0, -1, 0, 0)',
  )

  await page.keyboard.press('Escape')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeFocused()
  await expect(page.getByTestId('split-button-state')).toContainText('open → closed')
})

test('keeps each segment at a 48px target and separates their visual surfaces by 2px', async ({
  page,
}) => {
  // split-button.a11y.target
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  const geometry = await Promise.all(
    [primary, more].map((button) =>
      button.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const target = getComputedStyle(element, '::before')
        return {
          width: rect.width,
          height: rect.height,
          targetWidth: parseFloat(target.width),
          targetHeight: parseFloat(target.height),
        }
      }),
    ),
  )
  expect(geometry[0]!.height).toBe(40)
  expect(geometry[1]!.height).toBe(40)
  await expect(group).toHaveCSS('column-gap', '2px')
  expect(geometry[0]!.targetWidth).toBeGreaterThanOrEqual(48)
  expect(geometry[0]!.targetHeight).toBeGreaterThanOrEqual(48)
  expect(geometry[1]!.targetWidth).toBeGreaterThanOrEqual(48)
  expect(geometry[1]!.targetHeight).toBeGreaterThanOrEqual(48)
  const bounds = await Promise.all([primary.boundingBox(), more.boundingBox()])
  expect(bounds[1]!.x).toBeGreaterThan(bounds[0]!.x + bounds[0]!.width)
  expect(Math.abs(bounds[1]!.x - bounds[0]!.x - bounds[0]!.width - 2)).toBeLessThanOrEqual(0.5)
})

test('morphs inner corners and centers the open chevron', async ({ page }) => {
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  await expect(primary).toHaveCSS('border-top-right-radius', '4px')
  await expect(more).toHaveCSS('border-top-left-radius', '4px')

  await primary.focus()
  await expect(primary).toBeFocused()
  await expect(primary).toHaveCSS('border-top-right-radius', '12px')
  await primary.evaluate((element) => element.blur())
  await primary.hover()
  await expect(primary).toHaveCSS('border-top-right-radius', '12px')
  await expect
    .poll(() => primary.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await page.mouse.down()
  await expect(primary).toHaveCSS('border-top-right-radius', '12px')
  await expect
    .poll(() => primary.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.1')
  await page.mouse.move(0, 0)
  await page.mouse.up()
  await primary.evaluate((element) => element.blur())

  await page.mouse.move(0, 0)
  await expect(primary).toHaveCSS('border-top-right-radius', '4px')
  await expect(group).toHaveCSS('column-gap', '2px')
  await more.click()
  await expect(more.locator('.yam3x-split-button__chevron')).toHaveCSS(
    'transform',
    'matrix(-1, 0, 0, -1, 0, 0)',
  )
})

test('mirrors the controls in RTL while keeping primary-first keyboard order', async ({ page }) => {
  await page.getByLabel('RTL').check()
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  const primaryBounds = await primary.boundingBox()
  const moreBounds = await more.boundingBox()
  expect(primaryBounds!.x).toBeGreaterThan(moreBounds!.x)
  const rtlIconOffset = await more
    .locator('.yam3x-split-button__chevron .yam3x-icon')
    .evaluate((icon) => {
      const iconRect = icon.getBoundingClientRect()
      const buttonRect = icon.closest('button')!.getBoundingClientRect()
      return iconRect.left + iconRect.width / 2 - buttonRect.left - buttonRect.width / 2
    })
  expect(rtlIconOffset).toBe(1)
  await primary.focus()
  await page.keyboard.press('Tab')
  await expect(more).toBeFocused()
})

test('Space and Enter activate only the focused segment, and icon-only primaries need their own name', async ({
  page,
}) => {
  // split-button.a11y.keyboard
  const primary = mainDemo(page).getByRole('button', { name: 'Save', exact: true })
  const more = mainDemo(page).getByRole('button', { name: 'More Save options' })
  await primary.focus()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('split-button-state')).toContainText('Primary action run 1 ')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu', { name: 'Save options' })).toBeVisible()

  const iconOnly = page.getByRole('button', { name: 'Create blank document', exact: true })
  const iconOnlyMore = page.getByRole('button', { name: 'More Create blank document options' })
  await expect(iconOnly).toBeVisible()
  await expect(iconOnly.locator('.yam3x-icon')).toHaveAttribute('aria-hidden', 'true')
  await expect(iconOnlyMore).toHaveAttribute('aria-haspopup', 'menu')
})

test('sizes change with the responsive example and all five explicit sizes stay supported', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const split = mainDemo(page).getByRole('group', { name: 'Save actions' })
  await expect(split).toHaveAttribute('data-size', 'large')
  await page.getByLabel('Adjust size to window width').uncheck()
  await selectM3Option(page, page.getByLabel('Split button size'), 'extra-small')
  await expect(split).toHaveAttribute('data-size', 'extra-small')
  await expect(split.getByRole('button', { name: 'Save', exact: true })).toHaveCSS('height', '32px')
  await expect(split.getByRole('button', { name: 'More Save options' })).toHaveCSS('height', '32px')
  await selectM3Option(page, page.getByLabel('Split button size'), 'extra-large')
  await expect(split).toHaveAttribute('data-size', 'extra-large')
  await expect(split.getByRole('button', { name: 'Save', exact: true })).toHaveCSS(
    'height',
    '136px',
  )
})

test('all four variants use the shared Button and IconButton color roles', async ({ page }) => {
  // split-button.color.roles
  const variantSelect = page.getByLabel('Split button color')
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const rolePairs = {
    filled: ['primary', 'on-primary'],
    'filled-tonal': ['secondary-container', 'on-secondary-container'],
    elevated: ['surface-container-low', 'primary'],
    outlined: [null, 'on-surface-variant'],
  } as const
  for (const [variant, [containerRole, contentRole]] of Object.entries(rolePairs)) {
    await selectM3Option(page, variantSelect, variant)
    await expect
      .poll(() =>
        group.evaluate(
          (element, [backgroundRole, foregroundRole]) => {
            const [leading, trailing] = Array.from(
              element.querySelectorAll<HTMLElement>(
                '.yam3x-split-button__primary, .yam3x-split-button__menu',
              ),
            )
            if (!leading || !trailing) return null

            const resolveToken = (property: 'backgroundColor' | 'color', value: string) => {
              const probe = document.createElement('span')
              probe.style[property] = value
              document.body.append(probe)
              const resolved = getComputedStyle(probe)[property]
              probe.remove()
              return resolved
            }
            const expectedBackground = resolveToken(
              'backgroundColor',
              backgroundRole ? `var(--md-sys-color-${backgroundRole})` : 'transparent',
            )
            const expectedForeground = resolveToken(
              'color',
              `var(--md-sys-color-${foregroundRole})`,
            )
            const leadingStyle = getComputedStyle(leading)
            const trailingStyle = getComputedStyle(trailing)
            return {
              matches:
                leadingStyle.backgroundColor === expectedBackground &&
                trailingStyle.backgroundColor === expectedBackground &&
                leadingStyle.color === expectedForeground &&
                trailingStyle.color === expectedForeground,
              expectedBackground,
              expectedForeground,
              leadingBackground: leadingStyle.backgroundColor,
              trailingBackground: trailingStyle.backgroundColor,
              leadingColor: leadingStyle.color,
              trailingColor: trailingStyle.color,
            }
          },
          [containerRole, contentRole] as const,
        ),
      )
      .toMatchObject({ matches: true })
  }
})

test('round and square shapes keep their outer corners and shared inner corners', async ({
  page,
}) => {
  const shape = mainDemo(page).getByLabel('Split button shape')
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  await selectM3Option(page, shape, 'square')
  await expect(primary).toHaveCSS('border-top-left-radius', '12px')
  await expect(primary).toHaveCSS('border-top-right-radius', '4px')
  await expect(more).toHaveCSS('border-top-left-radius', '4px')
  await expect(more).toHaveCSS('border-top-right-radius', '12px')
  await selectM3Option(page, shape, 'round')
  await expect(primary).toHaveCSS('border-top-left-radius', '20px')
  await expect(more).toHaveCSS('border-top-right-radius', '20px')
})

test('opens custom popups with an anchor and closes them back to the menu control', async ({
  page,
}) => {
  // split-button.menu.placement
  const insert = page
    .getByRole('group')
    .filter({ has: page.getByRole('button', { name: 'Insert' }) })
  const more = insert.getByRole('button', { name: 'More insert options' })
  await expect(more).toHaveAttribute('aria-haspopup', 'true')
  await more.click()
  const popup = page.getByRole('group', { name: 'Insert options' })
  await expect(popup).toBeVisible()
  await expect(popup).toHaveAttribute('id', 'insert-popup')
  await expect(more).toHaveAttribute('aria-controls', 'insert-popup')
  await expect(more).toHaveAttribute('aria-haspopup', 'true')
  await expect(popup).toContainText('Anchor: Connected')
  const popupBounds = await popup.boundingBox()
  const triggerBounds = await more.boundingBox()
  expect(Math.abs(popupBounds!.x - triggerBounds!.x)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(popupBounds!.y - triggerBounds!.y - triggerBounds!.height - 4),
  ).toBeLessThanOrEqual(1)
  await popup.getByRole('button', { name: 'Insert table' }).click()
  await expect(popup).toHaveCount(0)
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeFocused()
})

test('v-model:open can open and close the menu from outside the split button', async ({ page }) => {
  const openMenu = page.getByRole('button', { name: 'Open menu externally' })
  const closeMenu = page.getByRole('button', { name: 'Close menu externally' })
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const more = group.getByRole('button', { name: 'More Save options' })
  await openMenu.click()
  const menu = page.getByRole('menu', { name: 'Save options' })
  await expect(menu).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  const popupBounds = await menu.boundingBox()
  const triggerBounds = await more.boundingBox()
  expect(Math.abs(popupBounds!.x - triggerBounds!.x)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(popupBounds!.y - triggerBounds!.y - triggerBounds!.height - 4),
  ).toBeLessThanOrEqual(1)
  await closeMenu.click()
  await expect(menu).toHaveCount(0)
  await expect(more).toHaveAttribute('aria-expanded', 'false')
})

test('disables each segment independently and disables both from the root prop', async ({
  page,
}) => {
  const primaryDisabled = page.getByRole('button', { name: 'Primary action disabled', exact: true })
  const relatedOptions = page.getByRole('button', { name: 'More Primary action disabled options' })
  const mainAction = page.getByRole('button', { name: 'Menu disabled', exact: true })
  const menuDisabled = page.getByRole('button', { name: 'More Menu disabled options' })
  const allDisabledMain = page.getByRole('button', { name: 'All disabled', exact: true })
  const allDisabledMenu = page.getByRole('button', { name: 'More All disabled options' })
  await expect(primaryDisabled).toBeDisabled()
  await expect(relatedOptions).toBeEnabled()
  await relatedOptions.click()
  await expect(page.getByRole('menu', { name: 'Primary action disabled options' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(mainAction).toBeEnabled()
  await expect(menuDisabled).toBeDisabled()
  await expect(allDisabledMain).toBeDisabled()
  await expect(allDisabledMenu).toBeDisabled()
  await expect(allDisabledMenu).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('menu', { name: 'All disabled options' })).toHaveCount(0)
})

test('composition keeps caller spacing and centers the menu icon while open', async ({ page }) => {
  const group = page.locator('.split-composition-demo').getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More save options' })
  const icon = more.locator('.yam3x-split-button__chevron .yam3x-icon')

  await expect(group).toHaveCSS('column-gap', '4px')
  const restingOffset = await icon.evaluate((element) => {
    const iconRect = element.getBoundingClientRect()
    const buttonRect = element.closest('button')!.getBoundingClientRect()
    return iconRect.left + iconRect.width / 2 - buttonRect.left - buttonRect.width / 2
  })
  expect(Math.abs(restingOffset)).toBeGreaterThan(0.1)

  await more.click()
  await expect(page.getByRole('menu', { name: 'Save options' })).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  const openOffset = await icon.evaluate((element) => {
    const iconRect = element.getBoundingClientRect()
    const buttonRect = element.closest('button')!.getBoundingClientRect()
    return iconRect.left + iconRect.width / 2 - buttonRect.left - buttonRect.width / 2
  })
  expect(Math.abs(openOffset)).toBeLessThan(0.1)
  await page.keyboard.press('Escape')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(primary).toBeVisible()
})

test('keeps native primary form behavior and prevents the menu segment from submitting', async ({
  page,
}) => {
  const form = page.locator('form')
  const primary = form.getByRole('button', { name: 'Submit', exact: true })
  const more = form.getByRole('button', { name: 'More Submit options' })
  await expect(primary).toHaveAttribute('type', 'submit')
  await expect(primary).toHaveAttribute('name', 'action')
  await expect(primary).toHaveAttribute('value', 'primary')
  await more.click()
  await expect(page.getByRole('menu', { name: 'Submit options' })).toBeVisible()
  await expect(form.locator('output')).toHaveText('Form submitted 0')
  await page.keyboard.press('Escape')
  await primary.click()
  await expect(form.locator('output')).toHaveText('Form submitted 1')
})

test('forwards a primary href as a native link and keeps it independent from the menu', async ({
  page,
}) => {
  const primary = page.getByRole('link', { name: 'View help', exact: true })
  const more = page.getByRole('button', { name: 'More View help options' })
  await expect(primary).toHaveAttribute('href', '/components/split-button#api')
  await primary.click()
  await expect(page).toHaveURL(/\/components\/split-button#api$/)
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeEnabled()
})

test('reduced motion and forced colors preserve feedback and segment boundaries', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const group = mainDemo(page).getByRole('group', { name: 'Save actions' })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More Save options' })
  await more.focus()
  const style = await more.evaluate((element) => ({
    transition: getComputedStyle(element.querySelector('.yam3x-split-button__chevron')!)
      .transitionDuration,
    outline: getComputedStyle(element).outlineWidth,
    background: getComputedStyle(element).backgroundColor,
  }))
  expect(style.transition.split(',').every((value) => parseFloat(value) <= 0.001)).toBe(true)
  expect(style.outline).not.toBe('0px')
  expect(style.background).not.toBe('rgba(0, 0, 0, 0)')
  await expect(primary).toHaveCSS('outline-width', '1px')
})

test('composes layout, primary action, and checked menu trigger independently', async ({
  page,
}) => {
  const group = page
    .locator('.split-composition-demo')
    .getByRole('group', { name: 'Save actions', exact: true })
  const primary = group.getByRole('button', { name: 'Save', exact: true })
  const more = group.getByRole('button', { name: 'More save options' })
  await expect(primary).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await more.click()
  await expect(page.getByRole('menu', { name: 'Save options' })).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeFocused()
})
