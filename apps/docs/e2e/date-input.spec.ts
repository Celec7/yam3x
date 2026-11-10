import { expect, test } from '@playwright/test'

test.describe('DateInput', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/date-input')
  })

  test('orders accessible date segments by locale and commits through native form data', async ({
    page,
  }) => {
    const group = page.getByRole('group', { name: 'Event date' })
    const form = group.locator('xpath=ancestor::form')
    await expect(group.getByRole('spinbutton')).toHaveCount(3)
    await expect(group.getByRole('spinbutton').allTextContents()).resolves.toEqual(['', '', ''])
    const month = group.getByRole('spinbutton', { name: 'Month' })
    await expect(month).toHaveAttribute('tabindex', '0')
    await expect(group.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('tabindex', '-1')
    await expect(group.getByRole('spinbutton', { name: 'Year' })).toHaveAttribute('tabindex', '-1')
    await month.fill('12')
    const day = group.getByRole('spinbutton', { name: 'Day' })
    await expect(day).toBeFocused()
    await day.fill('31')
    const year = group.getByRole('spinbutton', { name: 'Year' })
    await expect(year).toBeFocused()
    await year.fill('2026')
    await expect(page.getByTestId('date-input-date-value')).toHaveText('2026-12-31')
    await expect
      .poll(() => form.evaluate((element) => (element as HTMLFormElement).checkValidity()))
      .toBe(true)

    await page.getByRole('button', { name: 'Submit date' }).click()
    await expect(page.getByTestId('date-input-events')).toContainText('input')
    await expect(page.getByTestId('date-input-events')).toContainText('change')
    const serialized = await page.getByTestId('date-input-submitted').textContent()
    expect(serialized).toMatch(/^2026-12-3[01]T/)
    const localDate = await page.evaluate((value) => {
      const date = new Date(value!)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }, serialized)
    expect(localDate).toBe('2026-12-31')
  })

  test('aligns the outlined field, hint, and focus with the shared text-field states', async ({
    page,
  }) => {
    const group = page.getByRole('group', { name: 'Event date' })
    const describedBy = await group.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const supporting = page.locator(`[id="${describedBy}"]`)
    await expect(supporting).toHaveText('Choose a date; each segment accepts keyboard entry.')
    const first = group.getByRole('spinbutton', { name: 'Month' })
    expect(await first.getAttribute('aria-describedby')).toBe(describedBy)
    const before = await group.evaluate((element) => {
      const style = getComputedStyle(element)
      const label = element.parentElement!.querySelector<HTMLElement>(
        '.yam3x-date-input-field__label',
      )!
      return {
        padding: style.paddingInlineStart,
        labelSize: getComputedStyle(label).fontSize,
        labelWeight: getComputedStyle(label).fontWeight,
      }
    })
    await first.focus()
    const focused = await group.evaluate((element) => {
      const style = getComputedStyle(element)
      const label = element.parentElement!.querySelector<HTMLElement>(
        '.yam3x-date-input-field__label',
      )!
      return {
        padding: style.paddingInlineStart,
        outlineWidth: style.outlineWidth,
        outlineOffset: style.outlineOffset,
        outlineColor: style.outlineColor,
        labelColor: getComputedStyle(label).color,
      }
    })
    expect(focused.padding).toBe(before.padding)
    expect(focused.outlineWidth).toBe('3px')
    expect(focused.outlineOffset).toBe('-3px')
    const primary = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--md-sys-color-primary)'
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    })
    expect(focused.outlineColor).toBe(primary)
    expect(focused.labelColor).toBe(primary)
    expect(before.labelSize).toBe('14px')
    expect(before.labelWeight).toBe('500')
    const placeholder = await first.evaluate(
      (element) => getComputedStyle(element, '::placeholder').color,
    )
    const onPrimaryContainer = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--md-sys-color-on-primary-container)'
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    })
    expect(placeholder).toBe(onPrimaryContainer)

    await page.getByRole('button', { name: 'Submit date' }).click()
    const alert = page.getByRole('alert').filter({ hasText: 'This field is required.' })
    await expect(alert).toBeVisible()
    const error = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--md-sys-color-error)'
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    })
    await expect(group.locator('..').locator('.yam3x-date-input-field__label')).toHaveCSS(
      'color',
      error,
    )
    await first.focus()
    await expect(group).toHaveCSS('outline-color', error)
    await expect(alert).toHaveAttribute('role', 'alert')
    expect(await group.getAttribute('aria-describedby')).toBe(await alert.getAttribute('id'))
    await expect(supporting).toHaveText(/This field is required\./)
  })

  test('supports time fields, period changes, arrow adjustment and 24-hour seconds', async ({
    page,
  }) => {
    const time = page.getByRole('group', { name: 'Start time' })
    const hour = time.getByRole('spinbutton', { name: 'Hour' })
    await expect(hour).toHaveValue('11')
    await hour.focus()
    await page.keyboard.press('ArrowUp')
    await expect(hour).toHaveValue('12')
    await expect(time.getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute(
      'aria-valuetext',
      'PM',
    )
    await expect(page.getByTestId('date-input-time-value')).toHaveText('12:15')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('PageDown')
    await expect(hour).toHaveValue('08')
    await expect(time.getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute(
      'aria-valuetext',
      'AM',
    )
    await expect(page.getByTestId('date-input-time-value')).toHaveText('8:15')
    await page.keyboard.press('PageUp')
    await expect(hour).toHaveValue('01')
    await expect(time.getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute(
      'aria-valuetext',
      'PM',
    )

    const dateTime = page.getByRole('group', { name: 'Reminder time' })
    await expect(dateTime.getByRole('spinbutton')).toHaveCount(6)
    await expect(dateTime.getByRole('spinbutton', { name: 'Second' })).toHaveValue('30')
    await expect(dateTime.getByRole('spinbutton', { name: 'Period' })).toHaveCount(0)
    await expect(dateTime.getByRole('spinbutton', { name: 'Hour' })).toHaveAttribute(
      'aria-valuemax',
      '23',
    )
  })

  test('reports required, impossible and bounded values through visible and native validity', async ({
    page,
  }) => {
    const group = page.getByRole('group', { name: 'Event date' })
    const form = group.locator('xpath=ancestor::form')
    await form
      .locator('button[type="submit"]')
      .evaluate((element: HTMLButtonElement) => element.form?.requestSubmit())
    await expect(group).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('This field is required.')).toBeVisible()
    await expect(page.getByTestId('date-input-events')).toContainText('invalid:valueMissing')

    await group.getByRole('spinbutton', { name: 'Year' }).fill('2025')
    await group.getByRole('spinbutton', { name: 'Month' }).fill('02')
    await group.getByRole('spinbutton', { name: 'Day' }).fill('29')
    await expect(group).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Enter a valid date or time.')).toBeVisible()
    const validity = await group
      .locator('input[required]')
      .evaluate((input: HTMLInputElement) => input.validity.valid)
    expect(validity).toBe(false)
  })

  test('resets the controlled value and accepts a corrected constrained date', async ({ page }) => {
    const dateGroup = page.getByRole('group', { name: 'Event date' })
    await dateGroup.getByRole('spinbutton', { name: 'Year' }).fill('2026')
    await dateGroup.getByRole('spinbutton', { name: 'Month' }).fill('12')
    await dateGroup.getByRole('spinbutton', { name: 'Day' }).fill('31')
    await expect(page.getByTestId('date-input-date-value')).toHaveText('2026-12-31')
    await page.getByRole('button', { name: 'Reset date' }).click()
    await expect(page.getByTestId('date-input-date-value')).toHaveText('No value selected')
    await expect(dateGroup.getByRole('spinbutton', { name: 'Year' })).toHaveValue('')
    await expect(page.getByTestId('date-input-submitted')).toHaveText('Not submitted')

    const limited = page.getByRole('group', { name: 'Date with limits' })
    await limited.getByRole('spinbutton', { name: 'Year' }).fill('2026')
    await limited.getByRole('spinbutton', { name: 'Month' }).fill('10')
    await limited.getByRole('spinbutton', { name: 'Day' }).fill('09')
    await expect(limited).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Date is too early.')).toBeVisible()

    await limited.getByRole('spinbutton', { name: 'Day' }).fill('15')
    await expect(page.getByText('Date or time is unavailable.')).toBeVisible()
    await limited.getByRole('spinbutton', { name: 'Day' }).fill('16')
    await expect(limited).not.toHaveAttribute('aria-invalid', 'true')
    const limitedLocalDate = await page.evaluate(() => {
      const date = new Date(
        document.querySelector('[data-testid="date-input-limited-value"]')!.textContent!,
      )
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })
    expect(limitedLocalDate).toBe('2026-10-16')

    const limitedTime = page.getByRole('group', { name: 'Time with limits' })
    const hour = limitedTime.getByRole('spinbutton', { name: 'hour' })
    const minute = limitedTime.getByRole('spinbutton', { name: 'minute' })
    await hour.fill('08')
    await expect(limitedTime).toHaveAttribute('aria-invalid', 'true')
    await hour.fill('09')
    await minute.fill('45')
    await expect(page.getByText('Date or time is unavailable.')).toBeVisible()
    await minute.fill('46')
    await expect(limitedTime).not.toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('date-input-limited-time-value')).toHaveText('09:46')
  })

  test('keeps readonly values stable and lets parents cancel beforeinput', async ({ page }) => {
    const readonly = page.getByRole('group', { name: 'Read-only input' })
    const readonlyYear = readonly.getByRole('spinbutton', { name: 'Year' })
    await expect(readonlyYear).toHaveAttribute('readonly', '')
    await readonlyYear.focus()
    await page.keyboard.press('ArrowUp')
    await expect(readonlyYear).toHaveValue('2026')
    await expect(readonly).not.toHaveAttribute('aria-invalid', 'true')

    const year = page
      .getByRole('group', { name: 'Event date' })
      .getByRole('spinbutton', { name: 'Year' })
    await year.focus()
    await page.getByRole('button', { name: 'Cancel next input event' }).click()
    await year.focus()
    await page.keyboard.type('2')
    await expect(year).toHaveValue('')
    await expect(page.getByTestId('date-input-events')).toContainText('beforeinput:true')
  })

  test('keeps localized segments usable in RTL and at narrow desktop widths', async ({ page }) => {
    const rtl = page.getByRole('group', { name: 'Right-to-left date' })
    await expect(rtl).toHaveAttribute('dir', 'rtl')
    const rtlInputs = rtl.getByRole('spinbutton')
    await expect(rtlInputs).toHaveCount(3)
    const localizedLabels = await rtlInputs.evaluateAll((inputs) =>
      inputs.map((input) => input.getAttribute('aria-label')),
    )
    expect(localizedLabels.every(Boolean)).toBe(true)
    expect(new Set(localizedLabels).size).toBe(3)

    await page.setViewportSize({ width: 320, height: 800 })
    const geometry = await rtl.evaluate((element) => {
      const root = element as HTMLElement
      const bounds = root.getBoundingClientRect()
      const inputs = [...root.querySelectorAll<HTMLInputElement>('.yam3x-date-input__segment')]
      return {
        rootWidth: bounds.width,
        scrollWidth: root.scrollWidth,
        targetHeights: inputs.map((input) => input.getBoundingClientRect().height),
        fullyVisible: inputs.every(
          (input) =>
            input.getBoundingClientRect().left >= bounds.left &&
            input.getBoundingClientRect().right <= bounds.right,
        ),
      }
    })
    expect(geometry.rootWidth).toBeLessThanOrEqual(320)
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.rootWidth)
    expect(geometry.targetHeights.every((height) => height >= 48)).toBe(true)
    expect(geometry.fullyVisible).toBe(true)
  })

  test('applies pinned enabled, disabled, focus and focus-container hooks', async ({ page }) => {
    const time = page.getByRole('group', { name: 'Start time' })
    const input = time.getByRole('spinbutton', { name: 'Hour' })
    const root = time
    await root.evaluate((element) => {
      const style = (element as HTMLElement).style
      style.setProperty('--yam3x-date-input-color', 'rgb(1, 2, 3)')
      style.setProperty('--yam3x-date-input-focused-container-color', 'rgb(4, 5, 6)')
      style.setProperty('--yam3x-date-input-focused-color', 'rgb(7, 8, 9)')
    })
    await expect(input).toHaveCSS('color', 'rgb(1, 2, 3)')
    await input.focus()
    await expect(input).toHaveCSS('background-color', 'rgb(4, 5, 6)')
    await expect(input).toHaveCSS('color', 'rgb(7, 8, 9)')

    const disabled = page.getByRole('group', { name: 'Disabled input' })
    await disabled.evaluate((element) => {
      const style = (element as HTMLElement).style
      style.setProperty('--yam3x-date-input-disabled-color', 'rgb(10, 11, 12)')
      style.setProperty('--yam3x-date-input-disabled-opacity', '0.5')
    })
    const disabledHour = disabled.locator('input').first()
    await expect(disabledHour).toBeDisabled()
    await expect(disabledHour).toHaveCSS('color', 'rgb(10, 11, 12)')
    await expect(disabledHour).toHaveCSS('opacity', '0.5')
    const disabledField = disabled.locator('..')
    const mixes = await disabled.evaluate((element) => {
      const field = element.parentElement!
      const labelProbe = document.createElement('span')
      labelProbe.style.color = 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)'
      const borderProbe = document.createElement('span')
      borderProbe.style.borderTopColor =
        'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)'
      field.append(labelProbe, borderProbe)
      const values = {
        label: getComputedStyle(labelProbe).color,
        border: getComputedStyle(borderProbe).borderTopColor,
      }
      labelProbe.remove()
      borderProbe.remove()
      return values
    })
    await expect(disabledField.locator('.yam3x-date-input-field__label')).toHaveCSS(
      'color',
      mixes.label,
    )
    await expect(disabled.locator('.yam3x-date-input__literal').first()).toHaveCSS(
      'color',
      mixes.label,
    )
    await expect(disabled).toHaveCSS('border-top-color', mixes.border)
  })

  test('preserves visible focus and error cues in forced colors', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    const group = page.getByRole('group', { name: 'Event date' })
    await page.getByRole('button', { name: 'Submit date' }).click()
    await expect(group).toHaveAttribute('aria-invalid', 'true')
    const year = group.getByRole('spinbutton', { name: 'Year' })
    await year.focus()
    await expect(year).toHaveCSS('forced-color-adjust', 'none')
    const styles = await group.evaluate((element) => {
      const input = element.querySelector<HTMLInputElement>('.yam3x-date-input__segment:focus')!
      const root = element as HTMLElement
      return {
        border: getComputedStyle(root).borderTopColor,
        focusFill: getComputedStyle(input).backgroundColor,
      }
    })
    expect(styles.border).not.toBe('rgba(0, 0, 0, 0)')
    expect(styles.focusFill).not.toBe('rgba(0, 0, 0, 0)')
  })
})
