import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.describe('Time picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 5, 13, 7))
  })

  test('commits dial selection and restores focus to the trigger', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(dialog).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger).toHaveAttribute('aria-controls', (await dialog.getAttribute('id')) ?? '')
    await expect(dialog.locator('.yam3x-time-picker__dial')).toHaveCSS('width', '256px')
    const hourSelector = dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]')
    const minuteSelector = dialog.locator('.yam3x-time-picker__selector[aria-label="Minute"]')
    const hourBox = await hourSelector.boundingBox()
    const minuteBox = await minuteSelector.boundingBox()
    expect(hourBox).not.toBeNull()
    expect(minuteBox).not.toBeNull()
    expect(hourBox!.width).toBe(114)
    expect(hourBox!.height).toBe(80)
    expect(minuteBox!.width).toBe(96)
    expect(minuteBox!.height).toBe(80)
    await expect(dialog.getByRole('radiogroup', { name: 'AM or PM' })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: '20 hours of 24' })).toBeEnabled()
    await dialog.getByRole('button', { name: '20 hours of 24' }).click()
    await dialog.getByRole('button', { name: '00 minutes of 60' }).click()
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText(/Last submitted: 08:00 PM/)).toBeVisible()
    await expect(trigger).toBeFocused()
  })

  test('activates dial values and localized period options from the keyboard', async ({ page }) => {
    // time-picker.a11y.keyboard
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const eight = dialog.getByRole('button', { name: '8 hours of 12', exact: true })
    await eight.focus()
    await page.keyboard.press('Enter')
    await expect(dialog.getByRole('group', { name: 'Minute' })).toBeVisible()
    await dialog.getByRole('button', { name: '00 minutes of 60' }).click()

    const period = dialog.getByRole('radiogroup', { name: 'AM or PM' })
    const am = period.getByRole('radio', { name: 'AM' })
    const pm = period.getByRole('radio', { name: 'PM' })
    await expect(pm).toHaveAttribute('aria-checked', 'true')
    await am.focus()
    await page.keyboard.press('Space')
    await expect(am).toHaveAttribute('aria-checked', 'true')
    await expect(dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]')).toContainText(
      '8',
    )
    await page.keyboard.press('ArrowRight')
    await expect(pm).toBeFocused()
    await expect(pm).toHaveAttribute('aria-checked', 'true')
  })

  test('cancel discards a draft and Escape closes the modal', async ({ page }) => {
    await page.goto('/components/time-picker')
    const initialValue = (await page
      .locator('.time-picker-example > p')
      .first()
      .textContent())!.split(' · ')[0]!
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    await dialog.getByRole('button', { name: '2 hours of 12', exact: true }).click()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('.time-picker-example > p').first()).toContainText(initialValue)
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('edits localized 12-hour time, period and optional seconds together', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    await page.getByLabel('Show seconds').check()
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const hourSelector = dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]')
    await expect
      .poll(async () => (await hourSelector.boundingBox())?.width ?? 0)
      .toBeGreaterThan(95)
    const hourBox = await hourSelector.boundingBox()
    const period = dialog.getByRole('radiogroup', { name: 'AM or PM' })
    const periodBox = await period.boundingBox()
    expect(hourBox).not.toBeNull()
    expect(periodBox).not.toBeNull()
    expect(hourBox!.width).toBe(96)
    expect(hourBox!.height).toBe(80)
    expect(periodBox!.width).toBe(52)
    expect(periodBox!.height).toBe(80)
    await dialog.getByRole('button', { name: 'Enter time manually' }).click()
    await expect(period.getByRole('radio', { name: 'PM' })).toHaveAttribute('aria-checked', 'true')
    await dialog.getByRole('textbox', { name: 'Hour' }).fill('01')
    await dialog.getByRole('textbox', { name: 'Minute' }).fill('08')
    await dialog.getByRole('textbox', { name: 'Second' }).fill('09')
    await expect(dialog.getByRole('textbox', { name: 'Second' })).toHaveValue('09')
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText(/Last submitted: 01:08:09 PM/)).toBeVisible()
  })

  test('fills both AM/PM segments evenly in composable controls', async ({ page }) => {
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    const composition = page.locator('details.time-picker-example__composition')
    await composition.locator('summary').click()

    const periodGroups = composition.locator('.yam3x-time-picker__period')
    await expect(periodGroups).toHaveCount(2)
    for (const period of await periodGroups.all()) {
      const groupBox = await period.boundingBox()
      const amBox = await period.getByRole('radio', { name: 'AM' }).boundingBox()
      const pmBox = await period.getByRole('radio', { name: 'PM' }).boundingBox()
      expect(groupBox).not.toBeNull()
      expect(amBox).not.toBeNull()
      expect(pmBox).not.toBeNull()
      expect(Math.abs(amBox!.height - pmBox!.height)).toBeLessThanOrEqual(1)
      expect(Math.abs(amBox!.height + pmBox!.height - groupBox!.height)).toBeLessThanOrEqual(2)
    }
  })

  test('manual input exposes labeled fields and prevents a bound-invalid commit', async ({
    page,
  }) => {
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    await dialog.getByRole('button', { name: 'Enter time manually' }).click()
    const hour = dialog.getByRole('textbox', { name: 'Hour' })
    const minute = dialog.getByRole('textbox', { name: 'Minute' })
    await expect(hour).toBeVisible()
    await hour.fill('07')
    await minute.fill('30')
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeDisabled()
    await expect(dialog.getByRole('alert')).toContainText('outside the allowed range')
    await hour.fill('08')
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeEnabled()
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText(/Last submitted: 08:30/)).toBeVisible()
  })

  test('localizes dial value and mode-toggle names and places input labels below fields', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/zh/components/time-picker')
    const trigger = page.getByRole('button', { name: /提醒时间/ })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: '提醒时间' })
    await expect(
      dialog.locator('.yam3x-time-picker__dial-item[data-dial-value="13"]'),
    ).toHaveAttribute('aria-label', '13 小时，共 24 小时')
    await dialog.getByRole('button', { name: '手动输入时间' }).click()
    const hour = dialog.getByRole('textbox', { name: '小时' })
    const inputBox = await hour.boundingBox()
    const labelBox = await dialog.locator('.yam3x-time-picker__input-label').first().boundingBox()
    expect(inputBox).not.toBeNull()
    expect(labelBox).not.toBeNull()
    expect(labelBox!.y).toBeGreaterThanOrEqual(inputBox!.y + inputBox!.height)
    const useDial = dialog.getByRole('button', { name: '使用时钟表盘' })
    await expect(useDial).toHaveAttribute('title', '使用时钟表盘')
    await useDial.click()
    await expect(dialog.getByRole('button', { name: '手动输入时间' })).toBeVisible()
  })

  test('uses horizontal dial layout when desktop height is constrained and input-only on a compact viewport', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 480 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    await page.getByRole('button', { name: /Reminder time/ }).click()
    let dialog = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(dialog).toHaveClass(/is-horizontal/)
    await expect(dialog).not.toHaveClass(/is-input-only/)
    await expect(dialog.locator('.yam3x-time-picker__dial')).toHaveCSS('width', '256px')
    let period = dialog.getByRole('radiogroup', { name: 'AM or PM' })
    await expect(period).toBeVisible()
    await expect
      .poll(async () => {
        const box = await period.boundingBox()
        return box && [box.width, box.height]
      })
      .toEqual([216, 38])
    await expect
      .poll(() => dialog.evaluate((element) => element.scrollHeight - element.clientHeight))
      .toBe(0)
    await page.keyboard.press('Escape')

    await page.setViewportSize({ width: 390, height: 390 })
    await page.getByRole('button', { name: /Reminder time/ }).click()
    dialog = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(dialog).toHaveClass(/is-input-only/)
    await expect(dialog.locator('.yam3x-time-picker__dial')).toBeHidden()
    await expect(dialog.getByRole('textbox', { name: 'Hour' })).toBeVisible()
    period = dialog.getByRole('radiogroup', { name: 'AM or PM' })
    await expect(period).toBeVisible()
    await expect
      .poll(async () => {
        const box = await period.boundingBox()
        return box && [box.width, box.height]
      })
      .toEqual([52, 72])
    await expect
      .poll(() => dialog.evaluate((element) => element.scrollHeight - element.clientHeight))
      .toBe(0)
  })

  test('allows pointer drag on the desktop dial and commits the selected hour', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const dial = dialog.locator('.yam3x-time-picker__dial')
    await dial.locator('.yam3x-time-picker__dial-item[data-dial-value="12"]').click()
    await dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]').click()
    const selector = dialog.locator('.yam3x-time-picker__dial-selector')
    await expect(selector).toHaveCSS('left', '128px')
    await expect(selector).toHaveCSS('top', '192px')
    const rect = await dial.boundingBox()
    expect(rect).not.toBeNull()
    const x = rect!.x + rect!.width / 2 + Math.sin((2 * Math.PI) / 3) * 104
    const y = rect!.y + rect!.height / 2 - Math.cos((2 * Math.PI) / 3) * 104
    await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + rect!.height / 2)
    await page.mouse.down()
    await page.mouse.move(x, y, { steps: 6 })
    const surface = dialog
    await expect(surface).toHaveClass(/is-dragging/)
    await expect
      .poll(() =>
        selector.evaluate((element) => Number.parseFloat((element as HTMLElement).style.left)),
      )
      .toBeCloseTo(218, 0)
    await expect(selector).toHaveCSS('top', '180px')
    await expect(selector).toHaveCSS('transition-duration', '0s')
    await page.mouse.up()
    await expect(surface).not.toHaveClass(/is-dragging/)
    await expect(dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]')).toContainText(
      '09',
    )
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText(/Last submitted: 09:/)).toBeVisible()
  })

  test('keeps the standalone dial selector from transitioning behind fast pointer movement', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    const composition = page.locator('.time-picker-example__composition')
    await composition.locator('summary').click()
    const standalone = composition.locator('.yam3x-time-picker__surface--inline').first()
    const dial = standalone.locator('.yam3x-time-picker__dial')
    await dial.scrollIntoViewIfNeeded()
    const rect = await dial.boundingBox()
    expect(rect).not.toBeNull()
    const centerX = rect!.x + rect!.width / 2
    const centerY = rect!.y + rect!.height / 2
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 90, centerY, { steps: 2 })
    await expect(standalone.locator('.yam3x-time-picker__control')).toHaveClass(/is-dragging/)
    await expect(standalone).toHaveClass(/is-dragging/)
    await expect(standalone.locator('.yam3x-time-picker__dial-selector')).toHaveCSS(
      'transition-duration',
      '0s',
    )
    await page.mouse.move(centerX, centerY - 100, { steps: 2 })
    await page.mouse.up()
    await expect(standalone).not.toHaveClass(/is-dragging/)
    await expect(composition.locator('p').last()).toContainText('Current value:')
    const timeInput = composition.locator('.yam3x-time-picker__surface--inline').nth(1)
    await timeInput.getByRole('textbox', { name: 'Hour' }).fill('19')
    await timeInput.getByRole('textbox', { name: 'Minute' }).fill('45')
    await expect(
      standalone.locator('.yam3x-time-picker__selector[aria-label="Hour"]'),
    ).toContainText('19')
    await expect(composition.locator('p').last()).toContainText('7:45 PM')
  })

  test('keeps the docked panel inside the desktop viewport and dismisses it predictably', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Presentation'), 'docked')
    const root = page.locator('.yam3x-time-picker').first()
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await root.evaluate((element) => {
      Object.assign((element as HTMLElement).style, {
        position: 'fixed',
        inset: 'auto auto 16px 16px',
        zIndex: '999',
      })
    })
    await trigger.click()
    const panel = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(panel).toBeVisible()
    await expect(panel).toHaveCSS('position', 'fixed')
    const geometry = await panel.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const triggerRect = document
        .querySelector('.yam3x-time-picker__trigger')!
        .getBoundingClientRect()
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        triggerTop: triggerRect.top,
        width: innerWidth,
        height: innerHeight,
      }
    })
    expect(geometry.left).toBeGreaterThanOrEqual(0)
    expect(geometry.top).toBeGreaterThanOrEqual(0)
    expect(geometry.right).toBeLessThanOrEqual(geometry.width)
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.height)
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.triggerTop)
    await page.mouse.click(1100, 100)
    await expect(panel).toBeHidden()

    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('switches a space-constrained docked dial to complete input controls instead of clipping it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 735, height: 536 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Presentation'), 'docked')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    await page.getByRole('button', { name: /Reminder time/ }).click()

    const panel = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(panel).toHaveClass(/is-input-only/)
    await expect(panel.locator('.yam3x-time-picker__dial')).toBeHidden()
    const hourInput = panel.getByRole('textbox', { name: 'Hour' })
    await expect(hourInput).toBeVisible()
    await expect(hourInput).toBeFocused()
    await expect(panel.getByRole('textbox', { name: 'Minute' })).toBeVisible()
    await expect
      .poll(() => panel.evaluate((element) => element.scrollHeight - element.clientHeight))
      .toBe(0)

    await page.setViewportSize({ width: 1280, height: 1200 })
    await expect(panel).not.toHaveClass(/is-input-only/)
    await expect(panel.locator('.yam3x-time-picker__dial')).toBeVisible()
    await expect(panel.locator('.yam3x-time-picker__selector[aria-pressed="true"]')).toBeFocused()
    await expect(panel.getByRole('button', { name: 'Enter time manually' })).toBeVisible()
  })

  test('keeps docked manual entry attached to its trigger and removes duplicate time controls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Presentation'), 'docked')
    await selectM3Option(page, page.getByLabel('Time format'), '24')

    const root = page.locator('.yam3x-time-picker').first()
    await root.evaluate((element) => {
      Object.assign((element as HTMLElement).style, {
        position: 'fixed',
        inset: 'auto auto 16px 16px',
        zIndex: '999',
      })
    })
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await trigger.click()
    const panel = page.getByRole('dialog', { name: 'Reminder time' })
    await expect(panel.locator('.yam3x-time-picker__dial')).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Enter time manually' })).toBeVisible()
    await panel.getByRole('button', { name: 'Enter time manually' }).click()

    const hour = panel.getByRole('textbox', { name: 'Hour' })
    const minute = panel.getByRole('textbox', { name: 'Minute' })
    await expect(hour).toBeFocused()
    await expect(panel.locator('.yam3x-time-picker__selector')).toHaveCount(0)
    const modeToggle = panel.getByRole('button', { name: 'Use clock dial' })
    await expect(modeToggle).toBeVisible()
    await expect(modeToggle).toHaveAttribute('title', 'Use clock dial')
    await hour.fill('17')
    await minute.fill('45')

    await expect
      .poll(() =>
        panel.evaluate((element) => {
          const panelRect = element.getBoundingClientRect()
          const triggerRect = document
            .querySelector('.yam3x-time-picker__trigger')!
            .getBoundingClientRect()
          return Math.round(triggerRect.top - panelRect.bottom)
        }),
      )
      .toBe(8)
    await expect
      .poll(() => panel.evaluate((element) => element.scrollHeight - element.clientHeight))
      .toBe(0)
    await modeToggle.click()
    await expect(panel.locator('.yam3x-time-picker__selector')).toHaveCount(2)
    await expect(panel.getByRole('button', { name: 'Enter time manually' })).toHaveAttribute(
      'title',
      'Enter time manually',
    )
    await panel.getByRole('button', { name: 'Enter time manually' }).click()
    await panel.getByRole('button', { name: 'OK' }).click()
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page.getByText(/Last submitted: 05:45 PM/)).toBeVisible()
  })

  test('inherits RTL layout while keeping time values and dial progression chronological', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    const root = page.locator('.yam3x-time-picker').first()
    await root.evaluate((element) => {
      element.setAttribute('dir', 'rtl')
    })
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const headerValue = dialog.locator('.yam3x-time-picker__header-value')
    await expect(headerValue).toHaveCSS('direction', 'rtl')
    const hourBox = await dialog
      .locator('.yam3x-time-picker__selector[aria-label="Hour"]')
      .boundingBox()
    const minuteBox = await dialog
      .locator('.yam3x-time-picker__selector[aria-label="Minute"]')
      .boundingBox()
    const periodBox = await dialog.getByRole('radiogroup', { name: 'AM or PM' }).boundingBox()
    expect(hourBox).not.toBeNull()
    expect(minuteBox).not.toBeNull()
    expect(periodBox).not.toBeNull()
    expect(periodBox!.x).toBeLessThan(hourBox!.x)
    expect(hourBox!.x).toBeLessThan(minuteBox!.x)

    const hour = dialog.locator('.yam3x-time-picker__selector[aria-label="Hour"]')
    await dialog.locator('.yam3x-time-picker__dial-item[aria-pressed="true"]').focus()
    await page.keyboard.press('ArrowUp')
    await expect(hour).toContainText('07')
    const ok = dialog.getByRole('button', { name: 'OK' })
    await hour.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(ok).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(hour).toBeFocused()

    await dialog.getByRole('button', { name: 'Enter time manually' }).click()
    const hourInput = dialog.getByRole('textbox', { name: 'Hour' })
    const minuteInput = dialog.getByRole('textbox', { name: 'Minute' })
    const hourInputBox = await hourInput.boundingBox()
    const minuteInputBox = await minuteInput.boundingBox()
    expect(hourInputBox).not.toBeNull()
    expect(minuteInputBox).not.toBeNull()
    expect(hourInputBox!.x).toBeLessThan(minuteInputBox!.x)
  })

  test('honors reduced motion and forced-colors focus treatment', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
    await page.goto('/components/time-picker')
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const selected = dialog.locator('.yam3x-time-picker__selector[aria-pressed="true"]')
    await selected.focus()
    await expect(selected).toHaveCSS('transition-duration', '0s')
    await expect(selected).toHaveCSS('forced-color-adjust', 'none')
    const highlight = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.backgroundColor = 'Highlight'
      document.body.append(probe)
      const color = getComputedStyle(probe).backgroundColor
      probe.remove()
      return color
    })
    await expect(selected).toHaveCSS('background-color', highlight)
  })

  test('uses the Material dial and selection roles in light and dark themes', async ({ page }) => {
    // time-picker.color.roles
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '24')
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const face = dialog.locator('.yam3x-time-picker__dial')
    const selected = dialog.locator('.yam3x-time-picker__selector[aria-pressed="true"]')
    const colors = async () =>
      page.evaluate(() => {
        const resolve = (token: string) => {
          const probe = document.createElement('span')
          probe.style.backgroundColor = `var(${token})`
          document.body.append(probe)
          const color = getComputedStyle(probe).backgroundColor
          probe.remove()
          return color
        }
        return {
          primaryContainer: resolve('--md-sys-color-primary-container'),
          onPrimaryContainer: resolve('--md-sys-color-on-primary-container'),
          surfaceHighest: resolve('--md-sys-color-surface-container-highest'),
        }
      })

    let roles = await colors()
    await expect(face).toHaveCSS('background-color', roles.surfaceHighest)
    await expect(selected).toHaveCSS('background-color', roles.primaryContainer)
    await expect(selected).toHaveCSS('color', roles.onPrimaryContainer)
    await expect(face).toHaveCSS('width', '256px')
    await expect(face).toHaveCSS('height', '256px')
    await expect(dialog.locator('.yam3x-time-picker__selector').first()).toHaveCSS('width', '114px')
    await expect(dialog.locator('.yam3x-time-picker__selector').first()).toHaveCSS('height', '80px')
    const lightFace = await face.evaluate((element) => getComputedStyle(element).backgroundColor)
    const lightSelection = await selected.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('switch', { name: 'Switch to dark theme' }).click()
    await trigger.click()
    roles = await colors()
    await expect(face).toHaveCSS('background-color', roles.surfaceHighest)
    await expect(selected).toHaveCSS('background-color', roles.primaryContainer)
    await expect(selected).toHaveCSS('color', roles.onPrimaryContainer)
    await expect(face).not.toHaveCSS('background-color', lightFace)
    await expect(selected).not.toHaveCSS('background-color', lightSelection)
  })

  test('maps Input token roles and official field dimensions', async ({ page }) => {
    await page.goto('/components/time-picker')
    await selectM3Option(page, page.getByLabel('Time format'), '12')
    await page.getByRole('button', { name: /Reminder time/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const roles = await page.evaluate(() => {
      const resolve = (token: string) => {
        const probe = document.createElement('span')
        probe.style.color = `var(${token})`
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      return {
        onSurfaceVariant: resolve('--md-sys-color-on-surface-variant'),
        tertiaryContainer: resolve('--md-sys-color-tertiary-container'),
        onTertiaryContainer: resolve('--md-sys-color-on-tertiary-container'),
      }
    })
    const selectedPeriod = dialog.locator('.yam3x-time-picker__period button[aria-checked="true"]')
    await expect(selectedPeriod).toHaveCSS('background-color', roles.tertiaryContainer)
    await expect(selectedPeriod).toHaveCSS('color', roles.onTertiaryContainer)
    await expect(dialog.locator('.yam3x-time-picker__period')).toHaveCSS('width', '52px')
    await expect(dialog.locator('.yam3x-time-picker__period')).toHaveCSS('height', '80px')

    await dialog.getByRole('button', { name: 'Enter time manually' }).click()
    const hour = dialog.getByRole('textbox', { name: 'Hour' })
    await expect(hour).toHaveCSS('width', '96px')
    await expect(hour).toHaveCSS('height', '72px')
    await expect(dialog.locator('.yam3x-time-picker__period')).toHaveCSS('height', '72px')
    await expect(dialog.locator('.yam3x-time-picker__input-label').first()).toHaveCSS(
      'color',
      roles.onSurfaceVariant,
    )
  })

  test('traps keyboard focus within the modal and returns it to the trigger', async ({ page }) => {
    await page.goto('/components/time-picker')
    const trigger = page.getByRole('button', { name: /Reminder time/ })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Reminder time' })
    const first = dialog.locator('.yam3x-time-picker__selector[aria-pressed="true"]')
    const last = dialog.getByRole('button', { name: 'OK' })
    await expect(first).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(last).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})
