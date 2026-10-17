import { expect, test } from '@playwright/test'

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 6, 12))
    await page.goto('/components/calendar')
  })

  test('renders localized weekday headers and a semantic date grid at Material width', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    await expect(calendar).toBeVisible()
    await expect(calendar).toHaveCSS('width', '360px')
    await expect(calendar.getByRole('columnheader')).toHaveCount(7)
    await expect(calendar.getByRole('row')).toHaveCount(6)
    await expect(calendar.getByRole('columnheader').allTextContents()).resolves.toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])
    const selected = calendar.locator('.yam3x-calendar__day[aria-current="date"]')
    await expect(selected).toHaveAttribute('aria-current', 'date')
    await expect(selected).toHaveAttribute('aria-pressed', 'true')
    await expect(selected).toHaveCSS('width', '48px')
    await expect
      .poll(() => selected.evaluate((element) => getComputedStyle(element, '::before').inset))
      .toBe('4px')
  })

  test('calendar.typography.date-labels uses the Material Date picker text role', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const weekday = calendar.getByRole('columnheader').first()
    const date = calendar.getByRole('button', { name: /October 8, 2026/ })
    const systemLineHeight = await calendar.evaluate((element) => {
      const probe = document.createElement('span')
      probe.style.lineHeight = 'var(--md-sys-typescale-body-large-line-height)'
      element.append(probe)
      const lineHeight = getComputedStyle(probe).lineHeight
      probe.remove()
      return lineHeight
    })
    for (const element of [weekday, date]) {
      await expect(element).toHaveCSS('font-size', '16px')
      await expect(element).toHaveCSS('font-weight', '400')
      await expect(element).toHaveCSS('line-height', systemLineHeight)
      await expect(element).toHaveCSS('letter-spacing', '0.5px')
    }
  })

  test('supports month paging and controlled selection without moving page content', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    await calendar.getByRole('button', { name: /Next month/ }).click()
    await expect(calendar.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    await calendar.getByRole('button', { name: /November 12, 2026/ }).click()
    await expect(page.getByText('Current selection: 2026-11-12')).toBeVisible()
  })

  test('supports range selection and restarts a completed range', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Date range' })
    const start = calendar.locator('[data-date="2026-10-08"]').locator('xpath=..')
    await calendar.getByRole('button', { name: /October 8, 2026/ }).click()
    await expect(calendar).not.toHaveClass(/has-complete-range/)
    await expect(start).toHaveCSS('background-image', 'none')
    await calendar.getByRole('button', { name: /October 12, 2026/ }).click()
    await expect(calendar).toHaveClass(/has-complete-range/)
    await expect(start).toHaveCSS('background-image', /linear-gradient/)
    await expect(start).toHaveCSS('background-size', '100% 40px')
    const interior = calendar.locator('[data-date="2026-10-10"]').locator('xpath=..')
    await expect(interior).toHaveCSS('background-size', '100% 40px')
    await expect(page.getByText('Date range: 2026-10-08 → 2026-10-12')).toBeVisible()
    await calendar.getByRole('button', { name: /October 16, 2026/ }).click()
    const restarted = calendar.locator('[data-date="2026-10-16"]').locator('xpath=..')
    await expect(restarted).toHaveCSS('background-image', 'none')
    await expect(page.getByText('Date range: 2026-10-16 → End date')).toBeVisible()
  })

  test('keeps the second calendar range start circular until an end date is chosen', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Date range' })
    await expect(calendar).toBeVisible()
    await expect(calendar.getByRole('columnheader')).toHaveCount(7)
    await expect(calendar.getByRole('columnheader').allTextContents()).resolves.toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])

    await calendar.getByRole('button', { name: /October 16, 2026/ }).click()

    const cell = calendar.locator('[data-date="2026-10-16"]').locator('xpath=..')
    const day = cell.getByRole('button')
    await expect(calendar).not.toHaveClass(/has-complete-range/)
    await expect(cell).toHaveClass(/is-range-start/)
    await expect(cell).toHaveCSS('background-image', 'none')
    await expect
      .poll(() => day.evaluate((element) => getComputedStyle(element, '::before').inset))
      .toBe('4px')
    await expect(day).toHaveCSS('width', '48px')
    await expect(day).toHaveCSS('height', '48px')
  })

  test('disables out-of-range dates and marks special dates without disabling them', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Restricted dates' })
    const special = calendar.getByRole('button', { name: /October 15, 2026/ })
    await expect(special).toHaveAttribute('data-special', 'true')
    await expect(special).toBeEnabled()
    await expect(calendar.getByRole('button', { name: /October 10, 2026/ })).toBeDisabled()
    await expect(calendar.getByRole('button', { name: /October 22, 2026/ })).toBeDisabled()
    await expect(calendar.getByRole('button', { name: /October 16, 2026/ })).toBeDisabled()
    await expect(calendar.getByRole('button', { name: /October 11, 2026/ })).toHaveAttribute(
      'tabindex',
      '0',
    )
    await expect(calendar.getByRole('button', { name: /Previous month/ })).toBeDisabled()
    await expect(calendar.getByRole('button', { name: /Next month/ })).toBeDisabled()
  })

  test('navigates month, year and 18-year selection views with keyboard access', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    await calendar.getByRole('button', { name: /Choose date period/ }).click()
    const years = calendar.getByRole('listbox', { name: /Choose year/ })
    await expect(years).toBeVisible()
    await expect(years.getByRole('option')).toHaveCount(18)
    const year = years.getByRole('option', { name: '2026', exact: true })
    await year.focus()
    await year.press('Enter')
    await expect(calendar.getByRole('listbox', { name: 'Choose month, 2026' })).toBeVisible()
    await calendar.locator('[role="option"][data-option-index="10"]').click()
    await expect(calendar.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    await calendar.getByRole('button', { name: /November 12, 2026/ }).focus()
    await page.keyboard.press('Alt+PageUp')
    await expect(calendar.getByRole('grid', { name: 'November 2025' })).toBeVisible()
  })

  test('Shift+M and Shift+Y open month and year selection from the date grid', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const day = calendar.getByRole('button', { name: /October 12, 2026/ })
    await day.focus()
    await page.keyboard.press('Shift+M')
    await expect(calendar.getByRole('listbox', { name: 'Choose month, 2026' })).toBeVisible()
    const october = calendar.getByRole('option', { name: 'October', exact: true })
    await expect(october).toBeFocused()
    await october.click()
    await calendar.getByRole('button', { name: /October 12, 2026/ }).focus()
    await page.keyboard.press('Shift+Y')
    const years = calendar.getByRole('listbox', { name: /Choose year/ })
    await expect(years).toBeVisible()
    await expect(years.getByRole('option', { name: '2026', exact: true })).toBeFocused()
  })

  test('roves focus through year and month options without selecting until activation', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    await calendar.getByRole('button', { name: /Choose date period/ }).click()

    const years = calendar.getByRole('listbox', { name: /Choose year/ })
    const selectedYear = years.getByRole('option', { name: '2026', exact: true })
    await selectedYear.focus()
    await page.keyboard.press('ArrowDown')
    const nextYearRow = years.getByRole('option', { name: '2030', exact: true })
    await expect(nextYearRow).toBeFocused()
    await expect(nextYearRow).toHaveAttribute('aria-selected', 'false')
    await page.keyboard.press('Enter')

    const months = calendar.getByRole('listbox', { name: 'Choose month, 2030' })
    const october = months.getByRole('option', { name: 'October', exact: true })
    await expect(october).toBeFocused()
    await page.keyboard.press('ArrowRight')
    const november = months.getByRole('option', { name: 'November', exact: true })
    await expect(november).toBeFocused()
    await expect(november).toHaveAttribute('aria-selected', 'false')
    await page.keyboard.press('Enter')
    await expect(calendar.getByRole('grid', { name: 'November 2030' })).toBeVisible()
  })

  test('roves dates by keyboard and reverses horizontal navigation in RTL', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const day = calendar.getByRole('button', { name: /October 5, 2026/ })
    await day.focus()
    await day.press('ArrowRight')
    await expect(calendar.getByRole('button', { name: /October 6, 2026/ })).toBeFocused()
    await calendar.evaluate((element) => {
      ;(element as HTMLElement).dir = 'rtl'
    })
    await calendar.getByRole('button', { name: /October 6, 2026/ }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(calendar.getByRole('button', { name: /October 5, 2026/ })).toBeFocused()
  })

  test('applies container, weekday, date, selection and today style hooks', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const root = calendar
    const set = (name: string, value: string) =>
      root.evaluate(
        (element, [property, token]) => (element as HTMLElement).style.setProperty(property, token),
        [name, value] as [string, string],
      )
    await set('--yam3x-calendar-container-color', 'rgb(1, 2, 3)')
    await set('--yam3x-calendar-container-shape', '7px')
    await set('--yam3x-calendar-padding', '10px')
    await expect(root).toHaveCSS('background-color', 'rgb(1, 2, 3)')
    await expect(root).toHaveCSS('border-radius', '7px')
    await expect(root).toHaveCSS('padding-top', '10px')

    const period = calendar.getByRole('button', { name: /Choose date period/ })
    await set('--yam3x-calendar-period-button-text-color', 'rgb(4, 5, 6)')
    await expect(period).toHaveCSS('color', 'rgb(4, 5, 6)')
    const weekday = calendar.getByRole('columnheader').first()
    await set('--yam3x-calendar-weekday-font-size', '17px')
    await set('--yam3x-calendar-weekday-font-weight', '600')
    await set('--yam3x-calendar-weekday-line-height', '24px')
    await set('--yam3x-calendar-weekday-tracking', '1px')
    await set('--yam3x-calendar-weekday-color', 'rgb(7, 8, 9)')
    await expect(weekday).toHaveCSS('font-size', '17px')
    await expect(weekday).toHaveCSS('font-weight', '600')
    await expect(weekday).toHaveCSS('line-height', '24px')
    await expect(weekday).toHaveCSS('letter-spacing', '1px')
    await expect(weekday).toHaveCSS('color', 'rgb(7, 8, 9)')

    const day = calendar.getByRole('button', { name: /October 8, 2026/ })
    await set('--yam3x-calendar-date-font-size', '18px')
    await set('--yam3x-calendar-date-font-weight', '500')
    await set('--yam3x-calendar-date-line-height', '25px')
    await set('--yam3x-calendar-date-tracking', '1px')
    await set('--yam3x-calendar-item-color', 'rgb(10, 11, 12)')
    await expect(day).toHaveCSS('font-size', '18px')
    await expect(day).toHaveCSS('font-weight', '500')
    await expect(day).toHaveCSS('line-height', '25px')
    await expect(day).toHaveCSS('letter-spacing', '1px')
    await expect(day).toHaveCSS('color', 'rgb(10, 11, 12)')

    const selected = calendar.getByRole('button', { pressed: true })
    await set('--yam3x-calendar-item-selected-color', 'rgb(13, 14, 15)')
    await set('--yam3x-calendar-item-selected-container-color', 'rgb(16, 17, 18)')
    await set('--yam3x-calendar-item-selected-ripple-color', 'rgb(19, 20, 21)')
    await set('--yam3x-calendar-item-selected-hover-color', 'rgb(22, 23, 24)')
    await set('--yam3x-calendar-item-selected-focus-color', 'rgb(25, 26, 27)')
    await expect(selected).toHaveCSS('color', 'rgb(13, 14, 15)')
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .toBe('rgb(16, 17, 18)')
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
      )
      .toBe('rgb(19, 20, 21)')
    await selected.focus()
    await page.keyboard.press('Tab')
    await selected.focus()
    await expect(selected).toHaveCSS('outline-color', 'rgb(25, 26, 27)')
    await selected.hover()
    const selectedHover = await selected.evaluate(
      (element) => getComputedStyle(element, '::before').backgroundColor,
    )
    await set('--yam3x-calendar-item-selected-hover-color', 'rgb(250, 251, 252)')
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .not.toBe(selectedHover)

    await day.evaluate((element) =>
      element.closest('.yam3x-calendar__cell')?.classList.add('is-today'),
    )
    await set('--yam3x-calendar-item-current-outline-thickness', '3px')
    await set('--yam3x-calendar-item-current-outline-color', 'rgb(28, 29, 30)')
    await expect
      .poll(() => day.evaluate((element) => getComputedStyle(element, '::before').outlineWidth))
      .toBe('3px')
    await expect
      .poll(() => day.evaluate((element) => getComputedStyle(element, '::before').outlineColor))
      .toBe('rgb(28, 29, 30)')
    await root.evaluate((element) => {
      ;(element as HTMLElement).style.removeProperty(
        '--yam3x-calendar-item-current-outline-thickness',
      )
      ;(element as HTMLElement).style.setProperty(
        '--yam3x-calendar-date-current-outline-thickness',
        '2px',
      )
    })
    await expect
      .poll(() => day.evaluate((element) => getComputedStyle(element, '::before').outlineWidth))
      .toBe('2px')
  })

  test('applies special date, range and disabled date style hooks', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const root = calendar
    const set = (name: string, value: string) =>
      root.evaluate(
        (element, [property, token]) => (element as HTMLElement).style.setProperty(property, token),
        [name, value] as [string, string],
      )
    const special = calendar.getByRole('button', { name: /October 15, 2026/ })
    await set('--yam3x-calendar-item-special-color', 'rgb(31, 32, 33)')
    await set('--yam3x-calendar-item-special-container-color', 'rgb(34, 35, 36)')
    await set('--yam3x-calendar-item-special-ripple-color', 'rgb(37, 38, 39)')
    await set('--yam3x-calendar-item-special-hover-color', 'rgb(40, 41, 42)')
    await set('--yam3x-calendar-item-special-focus-color', 'rgb(43, 44, 45)')
    await expect(special).toHaveCSS('color', 'rgb(31, 32, 33)')
    await expect(special).toHaveAttribute('aria-description', 'Special date')
    await expect
      .poll(() =>
        special.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .toBe('rgb(34, 35, 36)')
    await expect
      .poll(() =>
        special.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
      )
      .toBe('rgb(37, 38, 39)')
    await special.hover()
    const hoverWithSpecialToken = await special.evaluate(
      (element) => getComputedStyle(element, '::before').backgroundColor,
    )
    await set('--yam3x-calendar-item-special-hover-color', 'rgb(250, 251, 252)')
    await expect
      .poll(() =>
        special.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .not.toBe(hoverWithSpecialToken)
    await special.focus()
    await page.keyboard.press('Tab')
    await special.focus()
    await expect(special).toHaveCSS('outline-color', 'rgb(43, 44, 45)')

    const range = page.getByRole('region', { name: 'Date range' })
    const rangeRoot = range
    await range.getByRole('button', { name: /October 8, 2026/ }).click()
    await range.getByRole('button', { name: /October 12, 2026/ }).click()
    const interior = range.locator('[data-date="2026-10-10"]').locator('xpath=..')
    await rangeRoot.evaluate((element) => {
      ;(element as HTMLElement).style.setProperty(
        '--yam3x-calendar-range-container-color',
        'rgb(46, 47, 48)',
      )
      ;(element as HTMLElement).style.setProperty('--yam3x-calendar-range-color', 'rgb(49, 50, 51)')
    })
    await expect
      .poll(() => interior.evaluate((element) => getComputedStyle(element).backgroundImage))
      .toContain('rgb(46, 47, 48)')
    await expect(interior).toHaveCSS('background-size', '100% 40px')
    await expect(interior).toHaveCSS('color', 'rgb(49, 50, 51)')
    await expect(range.getByRole('button', { name: /October 10, 2026/ })).toHaveAttribute(
      'aria-description',
      'Within selected range',
    )

    const restricted = page.getByRole('region', { name: 'Restricted dates' })
    const disabled = restricted.getByRole('button', { name: /October 9, 2026/ })
    await restricted.evaluate((element) => {
      ;(element as HTMLElement).style.setProperty(
        '--yam3x-calendar-item-disabled-color',
        'rgb(52, 53, 54)',
      )
      ;(element as HTMLElement).style.setProperty(
        '--yam3x-calendar-item-disabled-color-opacity',
        '0.6',
      )
    })
    await expect(disabled).toHaveCSS('color', 'rgb(52, 53, 54)')
    await expect(disabled).toHaveCSS('opacity', '0.6')
  })

  test('applies year item typography and view transition duration', async ({ page }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const root = calendar
    await root.evaluate((element) =>
      (element as HTMLElement).style.setProperty(
        '--yam3x-calendar-slide-animation-duration',
        '500ms',
      ),
    )
    await calendar.getByRole('button', { name: /Next month/ }).click()
    await expect
      .poll(() =>
        calendar
          .locator('.yam3x-calendar-next-enter-active')
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      )
      .toContain('0.5s')
    await calendar.getByRole('button', { name: /Choose date period/ }).click()
    const year = calendar.getByRole('option', { name: '2026', exact: true })
    await root.evaluate((element) => {
      ;(element as HTMLElement).style.setProperty('--yam3x-calendar-item-font-size', '19px')
      ;(element as HTMLElement).style.setProperty('--yam3x-calendar-item-font-weight', '700')
      ;(element as HTMLElement).style.setProperty('--yam3x-calendar-item-line-height', '27px')
      ;(element as HTMLElement).style.setProperty('--yam3x-calendar-item-tracking', '1.5px')
    })
    await expect(year).toHaveCSS('font-size', '19px')
    await expect(year).toHaveCSS('font-weight', '700')
    await expect(year).toHaveCSS('line-height', '27px')
    await expect(year).toHaveCSS('letter-spacing', '1.5px')
  })

  test('keeps fixed date targets in narrow containers and honors reduced motion and forced colors', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', { name: 'Calendar' })
    const root = calendar
    await calendar.evaluate((element) => {
      ;(element as HTMLElement).style.width = '320px'
    })
    await page.setViewportSize({ width: 320, height: 800 })
    await expect(root).toHaveCSS('width', '320px')
    await expect(calendar.getByRole('button', { name: /October 5, 2026/ })).toHaveCSS(
      'width',
      '48px',
    )
    expect(await calendar.evaluate((element) => element.scrollWidth)).toBeGreaterThan(
      await calendar.evaluate((element) => element.clientWidth),
    )

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await calendar.getByRole('button', { name: /Next month/ }).click()
    await expect(calendar.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    const monthPage = calendar.locator('.yam3x-calendar__month-view')
    await monthPage.evaluate((element) => element.classList.add('yam3x-calendar-next-enter-active'))
    await expect
      .poll(() =>
        monthPage.evaluate((element) =>
          Math.max(
            ...getComputedStyle(element)
              .transitionDuration.split(',')
              .map((duration) => Number.parseFloat(duration)),
          ),
        ),
      )
      .toBeLessThan(0.001)
    const weekdayY = await calendar
      .getByRole('columnheader')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().y))
    expect(new Set(weekdayY).size).toBe(1)
    expect(weekdayY.length).toBe(7)

    await page.emulateMedia({ forcedColors: 'active' })
    const focusedDay = calendar.getByRole('button', { name: /November 5, 2026/ })
    await focusedDay.focus()
    await page.keyboard.press('Tab')
    await focusedDay.focus()
    await expect(focusedDay).toHaveCSS('outline-style', 'solid')
    await expect(calendar).toHaveCSS('border-top-width', '1px')
    await calendar.getByRole('button', { name: /Previous month/ }).click()
    const selected = calendar.getByRole('button', { name: /October 5, 2026/ })
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .not.toBe('rgba(0, 0, 0, 0)')
  })

  test('keeps RTL date ranges chronological while reversing their visual caps', async ({
    page,
  }) => {
    const range = page.getByRole('region', { name: 'Date range' })
    await range.evaluate((element) => {
      ;(element as HTMLElement).dir = 'rtl'
    })
    await range.getByRole('button', { name: /October 8, 2026/ }).click()
    await range.getByRole('button', { name: /October 12, 2026/ }).click()
    const start = range.locator('[data-date="2026-10-08"]').locator('xpath=..')
    const end = range.locator('[data-date="2026-10-12"]').locator('xpath=..')
    await expect(start).toHaveCSS('background-image', /(?:270deg|to left)/)
    await expect(end).toHaveCSS('background-image', /(?:90deg|to right)/)
    await expect(page.getByText('Date range: 2026-10-08 → 2026-10-12')).toBeVisible()
  })
})
