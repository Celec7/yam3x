import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/menu')
})

test('opens a labeled menu at its trigger and initially focuses the first item', async ({
  page,
}) => {
  // menu.a11y.keyboard
  const root = page.locator('.yam3x-menu')
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  await expect(root.getByRole('menu')).toHaveCount(0)
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu).toHaveClass(/yam3x-menu__panel--active/)
  await expect(menu).toHaveCSS('border-radius', '16px')
  await expect(menu.getByRole('menuitem', { name: /Edit/ })).toBeFocused()
  await expect(menu).toHaveCSS('min-width', '112px')
  expect(
    await menu.evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(8)
  expect(
    await menu.evaluate((element) => element.getBoundingClientRect().bottom),
  ).toBeLessThanOrEqual(800)
})

test('show(anchor) supports a separate context-menu invoker', async ({ page }) => {
  const anchor = page.getByRole('button', { name: 'Open context menu' })
  await anchor.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu).toBeVisible()
  const menuId = await menu.getAttribute('id')
  expect(menuId).toBeTruthy()
  await expect(anchor).toHaveAttribute('aria-haspopup', 'menu')
  await expect(anchor).toHaveAttribute('aria-expanded', 'true')
  await expect(anchor).toHaveAttribute('aria-controls', menuId!)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(anchor).toHaveAttribute('aria-expanded', 'false')
  await expect(anchor).not.toHaveAttribute('data-yam3x-pressed')
  await expect(anchor).toBeFocused()
})

test('menu exit motion hides the leaving surface before removing it', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await page.keyboard.press('Escape')

  const leaving = page.locator('.yam3x-menu__panel--closing')
  await expect(leaving).toHaveAttribute('aria-hidden', 'true')
  await expect(leaving).toHaveAttribute('inert', '')
  await expect(leaving).toHaveCSS('animation-name', 'yam3x-menu-exit')
  await expect(menu).toHaveCount(0)
  await expect(leaving).toHaveCount(0)
})

test('submenu exit motion returns focus to its parent item', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const more = page.getByRole('menuitem', { name: 'More actions' })
  await more.press('ArrowRight')
  const submenu = page.locator('.yam3x-menu__panel').nth(1)
  await expect(submenu.getByRole('menuitem', { name: 'Archive' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(submenu).toHaveClass(/yam3x-menu__panel--closing/)
  await expect(submenu).toHaveAttribute('aria-hidden', 'true')
  await expect(more).toBeFocused()
  await expect(submenu).toHaveCount(0)
  await expect(page.getByRole('menu', { name: 'Layer actions' })).toBeVisible()
})

test('keeps the trigger visibly pressed and linked to the open surface', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  const restColor = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor)
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveAttribute('data-yam3x-pressed', '')
  const menuId = await menu.getAttribute('id')
  expect(menuId).toBeTruthy()
  await expect(trigger).toHaveAttribute('aria-controls', menuId!)
  const openColor = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(openColor).not.toBe(restColor)
  await page.keyboard.press('Escape')
  await expect(trigger).not.toHaveAttribute('data-yam3x-pressed')
})

test('trigger arrow keys open the menu at the correct focus edge', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  await trigger.focus()
  await trigger.press('ArrowUp')
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu.getByRole('menuitem', { name: 'More actions' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.press('ArrowDown')
  await expect(menu.getByRole('menuitem', { name: /Edit/ })).toBeFocused()
})

test('arrow navigation includes disabled items without activating them', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const edit = menu.getByRole('menuitem', { name: /Edit/ })
  const copy = menu.getByRole('menuitem', { name: 'Copy' })
  await edit.press('ArrowDown')
  await expect(copy).toBeFocused()
  await expect(copy).toHaveAttribute('aria-disabled', 'true')
  await copy.press('Enter')
  await expect(menu).toBeVisible()
  await expect(page.getByTestId('menu-state')).toContainText('open')
  await copy.press('ArrowDown')
  await expect(menu.getByRole('menuitemcheckbox', { name: /Show grid/ })).toBeFocused()
})

test('dividers separate groups without entering the roving focus sequence', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu.getByRole('separator')).toHaveCount(3)
  await expect(menu.getByRole('separator').first()).not.toHaveAttribute('tabindex')
  const copy = menu.getByRole('menuitem', { name: 'Copy' })
  const grid = menu.getByRole('menuitemcheckbox', { name: /Show grid/ })
  await copy.focus()
  await copy.press('ArrowDown')
  await expect(grid).toBeFocused()
})

test('Home, End, typeahead, Space, and Tab follow menu keyboard behavior', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const edit = menu.getByRole('menuitem', { name: /Edit/ })
  const copy = menu.getByRole('menuitem', { name: 'Copy' })
  const more = menu.getByRole('menuitem', { name: 'More actions' })

  await copy.focus()
  await page.keyboard.press('Home')
  await expect(edit).toBeFocused()
  await page.keyboard.press('End')
  await expect(more).toBeFocused()
  await more.evaluate((element) =>
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true })),
  )
  await expect(edit).toBeFocused()

  const grid = menu.getByRole('menuitemcheckbox', { name: /Show grid/ })
  await grid.focus()
  await page.keyboard.press('Space')
  await expect(grid).toHaveAttribute('aria-checked', 'false')
  await expect(menu).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Tab and Shift+Tab leave the menu in document order', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  const nextTrigger = page.getByRole('button', { name: 'Open grouped menu' })
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })

  await page.keyboard.press('Tab')
  await expect(menu).toHaveCount(0)
  await expect(nextTrigger).toBeFocused()

  await nextTrigger.press('Shift+Tab')
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(menu.getByRole('menuitem', { name: /Edit/ })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('scrolls long menus and scrolls focused items into view', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const initial = await menu.evaluate((element) => ({
    height: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(initial.scrollHeight).toBeGreaterThan(initial.height)
  await menu.getByRole('menuitem', { name: 'More actions' }).focus()
  expect(await menu.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
})

test('checkbox selections are independent and keep the menu open', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const grid = page.getByRole('menuitemcheckbox', { name: /Show grid/ })
  const guides = page.getByRole('menuitemcheckbox', { name: /Show guides/ })
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await guides.click()
  await expect(guides).toHaveAttribute('aria-checked', 'true')
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('menu', { name: 'Layer actions' })).toBeVisible()
  await grid.click()
  await expect(grid).toHaveAttribute('aria-checked', 'false')
})

test('radio items are exclusive within a group and close after selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const comfortable = page.getByRole('menuitemradio', { name: 'Comfortable' })
  const compact = page.getByRole('menuitemradio', { name: 'Compact' })
  await expect(comfortable).toHaveAttribute('aria-checked', 'true')
  await compact.click()
  await expect(page.getByRole('menu', { name: 'Layer actions' })).toHaveCount(0)
  await expect(page.getByTestId('menu-state')).toContainText('Compact')
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  await expect(page.getByRole('menuitemradio', { name: 'Compact' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByRole('menuitemradio', { name: 'Comfortable' })).toHaveAttribute(
    'aria-checked',
    'false',
  )
})

test('link menu items keep native navigation and close after activation', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await menu.getByRole('menuitem', { name: 'Help' }).click()
  await expect(page).toHaveURL(/#menu-help$/)
  await expect(menu).toHaveCount(0)
})

test('opens submenus beside the parent and Escape returns focus one level at a time', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const more = menu.getByRole('menuitem', { name: 'More actions' })
  await more.focus()
  await more.press('ArrowRight')
  const submenu = page.getByRole('menu').nth(1)
  await expect(submenu.getByRole('menuitem', { name: 'Archive' })).toBeFocused()
  await expect(menu).toHaveClass(/yam3x-menu__panel--inactive/)
  await expect(menu).toHaveCSS('border-radius', '8px')
  await expect(submenu).toHaveClass(/yam3x-menu__panel--active/)
  await expect(submenu).toHaveCSS('border-radius', '16px')
  const rects = await Promise.all([menu.boundingBox(), submenu.boundingBox()])
  expect(rects[1]!.x).toBeGreaterThanOrEqual(rects[0]!.x + rects[0]!.width - 1)
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open layer actions' })).toBeFocused()
})

test('opens and activates submenu actions with pointer input', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const rootMenu = page.getByRole('menu', { name: 'Layer actions' })
  await rootMenu.getByRole('menuitem', { name: 'More actions' }).click()

  const archive = page.getByRole('menu').nth(1).getByRole('menuitem', { name: 'Archive' })
  await expect(archive).toBeVisible()
  await archive.hover()
  await expect(rootMenu).toHaveCSS('border-radius', '8px')
  await expect(page.getByRole('menu').nth(1)).toHaveCSS('border-radius', '16px')
  await archive.click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(page.getByTestId('menu-events')).toContainText('Archive')
})

test('hover feedback keeps a selected radio item container visible', async ({ page }) => {
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark)
    for (const variant of ['standard', 'vibrant']) {
      await selectM3Option(page, page.getByRole('combobox', { name: 'Menu color' }), variant)
      await page.getByRole('button', { name: 'Open layer actions' }).click()
      const comfortable = page.getByRole('menuitemradio', { name: 'Comfortable' })
      const restBackground = await comfortable.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      expect(restBackground).not.toBe('rgba(0, 0, 0, 0)')

      await comfortable.hover()

      const hoverBackground = await comfortable.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      expect(hoverBackground).not.toBe('rgba(0, 0, 0, 0)')
      expect(hoverBackground).not.toBe(restBackground)
      await page.keyboard.press('Escape')
    }
  }
})

test('submenu triggers reference uniquely identified child menus', async ({ page }) => {
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const more = menu.getByRole('menuitem', { name: 'More actions' })
  await more.press('ArrowRight')
  const submenu = page.getByRole('menu').nth(1)
  const submenuId = await submenu.getAttribute('id')
  const moreId = await more.getAttribute('id')

  expect(submenuId).toBeTruthy()
  expect(moreId).toBeTruthy()
  await expect(more).toHaveAttribute('aria-controls', submenuId!)
  await expect(submenu).toHaveAttribute('aria-labelledby', moreId!)
  const ids = await page
    .locator('[id]')
    .evaluateAll((elements) => elements.map((element) => element.id))
  expect(new Set(ids).size).toBe(ids.length)
})

test('outside click closes; beforetoggle and beforeselect can cancel', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  await trigger.evaluate((element) =>
    element
      .closest('.yam3x-menu')!
      .addEventListener('beforetoggle', (event) => event.preventDefault(), { once: true }),
  )
  await trigger.click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await trigger.evaluate((element) =>
    element
      .closest('.yam3x-menu')!
      .addEventListener('beforeselect', (event) => event.preventDefault(), { once: true }),
  )
  await menu.getByRole('menuitem', { name: /Edit/ }).click()
  await expect(menu).toBeVisible()
  await expect(page.getByTestId('menu-events')).not.toContainText('Edit')
  await trigger.evaluate((element) =>
    element.closest('.yam3x-menu')!.addEventListener(
      'beforetoggle',
      (event) => {
        if ((event as CustomEvent).detail.open === false) event.preventDefault()
      },
      { once: true },
    ),
  )
  await trigger.click()
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('heading', { name: 'Menu' }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('placement flips at the viewport edge and RTL reverses submenu direction', async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 520 })
  const trigger = page.getByRole('button', { name: 'Open layer actions' })
  await trigger.evaluate((element) => {
    element.setAttribute('style', 'position:fixed;right:8px;bottom:8px')
  })
  await trigger.click()
  const rootMenu = page.getByRole('menu', { name: 'Layer actions' })
  const triggerRect = await trigger.boundingBox()
  const menuRect = await rootMenu.boundingBox()
  expect(menuRect!.x + menuRect!.width).toBeLessThanOrEqual(700)
  expect(menuRect!.y).toBeLessThan(triggerRect!.y)
  await page
    .locator('.yam3x-menu')
    .first()
    .evaluate((element) => {
      ;(element as HTMLElement).dir = 'rtl'
    })
  const more = rootMenu.getByRole('menuitem', { name: 'More actions' })
  await more.press('ArrowLeft')
  const submenu = page.getByRole('menu').nth(1)
  await expect(submenu.getByRole('menuitem', { name: 'Archive' })).toBeFocused()
  const rects = await Promise.all([rootMenu.boundingBox(), submenu.boundingBox()])
  expect(rects[1]!.x + rects[1]!.width).toBeLessThanOrEqual(rects[0]!.x + 1)
})

test('honors CSS hooks, reduced motion, and forced colors', async ({ page }) => {
  const root = page.locator('.yam3x-menu').first()
  await root.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-menu-container-min-width', '180px')
    style.setProperty('--yam3x-menu-container-padding-block', '10px')
    style.setProperty('--yam3x-menu-container-shape', '14px')
    style.setProperty('--yam3x-menu-active-container-shape', '14px')
    style.setProperty('--yam3x-menu-inactive-container-shape', '7px')
    style.setProperty('--yam3x-menu-item-container-height', '52px')
    style.setProperty('--yam3x-menu-item-icon-label-space', '18px')
    style.setProperty('--yam3x-menu-item-shape', '9px')
    style.setProperty('--yam3x-menu-item-focus-ring-shape', '6px')
    style.setProperty('--yam3x-menu-item-label-text-font-size', '16px')
  })
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu).toHaveCSS('min-width', '180px')
  await expect(menu).toHaveCSS('padding-top', '10px')
  await expect(menu).toHaveCSS('border-radius', '14px')
  await expect(menu).toHaveCSS('transition-property', 'border-radius')
  const item = menu.getByRole('menuitem', { name: /Edit/ })
  await expect(item).toHaveCSS('height', '52px')
  await expect(item).toHaveCSS('gap', '18px')
  await expect(item).toHaveCSS('transition-property', 'border-radius, background-color, color')
  await expect(item).toHaveCSS('border-radius', '9px')
  expect(await item.evaluate((element) => getComputedStyle(element, '::after').borderRadius)).toBe(
    '6px',
  )
  const surfaceContainerLow = await menu.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.backgroundColor = 'var(--md-sys-color-surface-container-low)'
    document.body.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  })
  await expect(menu).toHaveCSS('background-color', surfaceContainerLow)
  await menu.getByRole('menuitem', { name: 'More actions' }).press('ArrowRight')
  const submenu = page.getByRole('menu').nth(1)
  await expect(menu).toHaveCSS('border-radius', '7px')
  await expect(submenu).toHaveCSS('border-radius', '14px')
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await expect(menu).toHaveCSS('animation-name', 'none')
  await expect(menu).toHaveCSS('transition-property', 'none')
  await expect(item).toHaveCSS('transition-property', 'none')
  await expect(menu).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(menu.getByRole('menuitemcheckbox', { name: /Show grid/ })).toHaveCSS(
    'border-top-style',
    'solid',
  )
})

test('menu typography follows the shared System type roles', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--md-sys-typescale-label-large-font-size', '18px')
    document.documentElement.style.setProperty('--md-sys-typescale-body-small-font-size', '13px')
  })
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  await expect(menu.locator('.yam3x-menu__body').first()).toHaveCSS('font-size', '18px')
  await menu
    .locator('.yam3x-menu__body')
    .first()
    .evaluate((body) => {
      const element = document.createElement('span')
      element.className = 'yam3x-menu__supporting'
      element.textContent = 'Supporting text'
      body.append(element)
    })
  await expect(menu.locator('.yam3x-menu__supporting')).toHaveCSS('font-size', '13px')
})

test('composed menu triggers keep their secondary-container color pairing', async ({ page }) => {
  const expected = await page.evaluate(() => {
    const probe = document.createElement('div')
    document.body.append(probe)
    probe.style.backgroundColor = 'var(--md-sys-color-secondary-container)'
    const background = getComputedStyle(probe).backgroundColor
    probe.style.color = 'var(--md-sys-color-on-secondary-container)'
    const foreground = getComputedStyle(probe).color
    probe.remove()
    return { background, foreground }
  })
  for (const label of ['Open grouped menu', 'Open context menu']) {
    const trigger = page.getByRole('button', { name: label })
    await expect(trigger).toHaveCSS('background-color', expected.background)
    await expect(trigger).toHaveCSS('color', expected.foreground)
  }
})

test('selected and unselected item foregrounds keep 3:1 contrast in standard and vibrant menus', async ({
  page,
}) => {
  // menu.color.contrast
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

  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark)
    for (const variant of ['standard', 'vibrant']) {
      await selectM3Option(page, page.getByRole('combobox', { name: 'Menu color' }), variant)
      await page.getByRole('button', { name: 'Open layer actions' }).click()
      const menu = page.getByRole('menu', { name: 'Layer actions' })
      const colors = () =>
        menu.evaluate((element) => {
          const selected = element.querySelector('[aria-checked="true"]')!
          const unselected = element.querySelector(
            '.yam3x-menu__item:not(.yam3x-menu__item--selected):not([aria-disabled])',
          )!
          return {
            selectedForeground: getComputedStyle(selected).color,
            selectedBackground: getComputedStyle(selected).backgroundColor,
            unselectedForeground: getComputedStyle(unselected).color,
            menuBackground: getComputedStyle(element).backgroundColor,
          }
        })
      await expect
        .poll(async () => {
          const current = await colors()
          return Math.min(
            contrast(current.selectedForeground, current.selectedBackground),
            contrast(current.unselectedForeground, current.menuBackground),
          )
        })
        .toBeGreaterThanOrEqual(3)
      await page.keyboard.press('Escape')
    }
  }
})

test('vertical menu spacing follows the current expressive measurements', async ({ page }) => {
  // menu.geometry.items
  await page.getByRole('button', { name: 'Open layer actions' }).click()
  const menu = page.getByRole('menu', { name: 'Layer actions' })
  const item = menu.getByRole('menuitem', { name: /Edit/ })
  const middleItem = menu.getByRole('menuitem', { name: 'Copy' })
  const lastItem = menu.getByRole('menuitem', { name: 'More actions' })
  const selectedItem = menu.getByRole('menuitemradio', { name: 'Comfortable' })
  const groupLabel = menu.locator('.yam3x-menu__group-label').first()
  const divider = menu.getByRole('separator').first()

  await expect(menu).toHaveCSS('border-radius', '16px')
  await expect(menu).toHaveCSS('padding-inline-start', '4px')
  await expect(menu).toHaveCSS('padding-inline-end', '4px')
  await expect(menu).toHaveCSS('padding-block-start', '2px')
  await expect(item).toHaveCSS('height', '44px')
  await expect(item).toHaveCSS('gap', '12px')
  await expect(item).toHaveCSS('padding-inline-start', '16px')
  await expect(item).toHaveCSS('padding-inline-end', '16px')
  await expect(item).toHaveCSS('border-start-start-radius', '12px')
  await expect(item).toHaveCSS('border-end-start-radius', '4px')
  await expect(middleItem).toHaveCSS('border-radius', '4px')
  await expect(lastItem).toHaveCSS('border-start-start-radius', '4px')
  await expect(lastItem).toHaveCSS('border-end-start-radius', '12px')
  await expect(selectedItem).toHaveCSS('border-radius', '12px')
  await expect(groupLabel).toHaveCSS('min-height', '32px')
  await expect(groupLabel).toHaveCSS('padding-inline-start', '12px')
  await expect(groupLabel).toHaveCSS('padding-inline-end', '4px')
  await expect(divider).toHaveCSS('height', '1px')
  const outlineVariant = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.color = 'var(--md-sys-color-outline-variant)'
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  // menu.color.divider
  await expect(divider).toHaveCSS('background-color', outlineVariant)
  await expect(divider).toHaveCSS('margin-block-start', '2px')
  await expect(divider).toHaveCSS('margin-block-end', '2px')
  await expect(divider).toHaveCSS('margin-inline-start', '12px')
  await expect(divider).toHaveCSS('margin-inline-end', '12px')
  const iconGeometry = await item.evaluate((element) => {
    const leading = element.querySelector('.yam3x-menu__leading')!
    const body = element.querySelector('.yam3x-menu__body')!
    return {
      iconWidth: leading.getBoundingClientRect().width,
      bodyOffset: body.getBoundingClientRect().left - element.getBoundingClientRect().left,
    }
  })
  expect(iconGeometry).toEqual({ iconWidth: 20, bodyOffset: 48 })

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  const focusedGeometry = await item.evaluate((element) => {
    const itemStyle = getComputedStyle(element)
    const focusRingStyle = getComputedStyle(element, '::after')
    return {
      itemRadii: [
        itemStyle.borderStartStartRadius,
        itemStyle.borderStartEndRadius,
        itemStyle.borderEndStartRadius,
        itemStyle.borderEndEndRadius,
      ],
      focusRingRadii: [
        focusRingStyle.borderStartStartRadius,
        focusRingStyle.borderStartEndRadius,
        focusRingStyle.borderEndStartRadius,
        focusRingStyle.borderEndEndRadius,
      ],
      focusRingWidth: focusRingStyle.borderTopWidth,
    }
  })
  expect(focusedGeometry.itemRadii).toEqual(['12px', '12px', '4px', '4px'])
  expect(focusedGeometry.focusRingRadii).toEqual(focusedGeometry.itemRadii)
  expect(focusedGeometry.focusRingWidth).toBe('3px')
})

test('expressive gaps separate group surfaces without separator semantics', async ({ page }) => {
  await selectM3Option(page, page.getByRole('combobox', { name: 'Menu color' }), 'vibrant')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  const trigger = page.getByRole('button', { name: 'Open grouped menu' })
  await trigger.evaluate((element) =>
    (element.closest('.yam3x-menu') as HTMLElement).style.setProperty(
      '--yam3x-menu-inactive-container-shape',
      '7px',
    ),
  )
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Grouped actions' })
  const groups = menu.locator('.yam3x-menu__group')

  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const menuId = await menu.getAttribute('id')
  expect(menuId).toBeTruthy()
  await expect(trigger).toHaveAttribute('aria-controls', menuId!)
  await expect(menu).toBeVisible()
  await expect(groups).toHaveCount(2)
  await expect(menu).toHaveCSS('row-gap', '0px')
  await expect(menu.getByRole('separator')).toHaveCount(1)
  await expect(menu.locator('.yam3x-menu__gap')).toHaveCount(1)
  await expect(menu.locator('.yam3x-menu__gap')).toHaveAttribute('aria-hidden', 'true')
  await expect(menu.locator('.yam3x-menu__gap')).not.toHaveAttribute('role', 'separator')
  await expect(groups.nth(0)).toHaveCSS('display', 'flex')
  await expect(groups.nth(1)).toHaveCSS('display', 'flex')
  await expect(groups.nth(0)).toHaveCSS('border-radius', '8px')
  await expect(groups.nth(1)).toHaveCSS('border-radius', '8px')
  await expect(groups.nth(0)).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(menu.locator('.yam3x-menu__gap')).toHaveCSS('height', '2px')
  await expect(groups.nth(0)).toHaveCSS('padding', '2px')
  await expect(groups.nth(1)).toHaveCSS('padding', '2px')
  await expect(menu.getByRole('menuitem', { name: 'Rename' })).toHaveCSS(
    'border-start-start-radius',
    '12px',
  )
  await expect(menu.getByRole('menuitem', { name: 'Rename' })).toHaveCSS(
    'border-end-start-radius',
    '4px',
  )
  await expect(menu.getByRole('menuitem', { name: 'Export' })).toHaveCSS('border-radius', '4px')
  const iconRow = menu.getByRole('menuitem', { name: 'Rename' })
  const plainRow = menu.getByRole('menuitem', { name: 'Duplicate layer' })
  const plainGeometry = await plainRow.evaluate((element) => {
    const body = element.querySelector('.yam3x-menu__body')!
    return {
      bodyOffset: body.getBoundingClientRect().left - element.getBoundingClientRect().left,
      leadingCount: element.querySelectorAll('.yam3x-menu__leading').length,
      trailingCount: element.querySelectorAll('.yam3x-menu__trailing-icon').length,
    }
  })
  const iconBodyOffset = await iconRow.evaluate(
    (element) =>
      element.querySelector('.yam3x-menu__body')!.getBoundingClientRect().left -
      element.getBoundingClientRect().left,
  )
  expect(plainGeometry).toEqual({ bodyOffset: 16, leadingCount: 0, trailingCount: 0 })
  expect(iconBodyOffset).toBe(48)
  await expect(
    menu.getByRole('menuitem', { name: 'Export' }).locator('.yam3x-menu__trailing-icon'),
  ).toHaveCount(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(menu).toHaveCSS('transition-property', 'none')
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--md-sys-density-spacing-scale', '0.75')
  })
  await expect(menu.locator('.yam3x-menu__gap')).toHaveCSS('height', '2px')
  await expect(groups.nth(0)).toHaveCSS('padding', '2px')
})

test('scrollable gap groups fall back to separators', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open grouped menu' })
  await trigger.evaluate((element) =>
    (element.closest('.yam3x-menu') as HTMLElement).style.setProperty(
      '--yam3x-menu-container-max-height',
      '120px',
    ),
  )
  await trigger.click()
  const menu = page.getByRole('menu', { name: 'Grouped actions' })
  const groups = menu.locator('.yam3x-menu__group')

  await expect(menu).toHaveClass(/yam3x-menu__panel--scrollable/)
  await expect(menu).toHaveCSS('row-gap', '0px')
  await expect(groups).toHaveCount(2)
  await expect(groups.first()).toHaveCSS('display', 'contents')
  await expect(menu.locator('.yam3x-menu__gap')).toBeHidden()
  await expect(menu.locator('.yam3x-menu__gap-divider')).toHaveAttribute('role', 'separator')
  await expect(menu.getByRole('separator')).toHaveCount(2)
  await expect(menu.getByRole('menuitem')).toHaveCount(4)
})
