import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.describe('Date picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 2, 12))
  })

  test('docked field is editable separately from its calendar and commits dates', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    const input = page.getByLabel('Event date')
    await input.fill('2026-12-25')
    await input.press('Enter')
    await expect(page.getByText('Current value: 2026-12-25')).toBeVisible()

    await page.getByRole('button', { name: 'Open calendar' }).click()
    const grid = page.getByRole('grid', { name: 'December 2026' })
    await expect(grid).toBeVisible()
    await expect(grid.getByRole('gridcell', { name: 'Friday, December 25, 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(page.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    await page.getByRole('gridcell', { name: 'Friday, November 27, 2026' }).click()
    await page.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(input).toHaveValue('11/27/2026')
  })

  test('accepts a complete compact date and rejects an incomplete numeric value', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    const field = page.getByLabel('Event date')
    await field.fill('10112026')
    await field.press('Enter')
    await expect(field).toHaveValue('10/11/2026')
    await expect(page.getByText('Current value: 2026-10-11')).toBeVisible()

    await field.fill('1122026')
    await field.press('Enter')
    await expect(page.getByRole('alert')).toContainText('Enter a valid date')
    await expect(page.getByText('Current value: 2026-10-11')).toBeVisible()
  })

  test('modal selection is transactional, supports keyboard movement and restores the opener', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Event date' }).click()
    const dialog = page.getByRole('dialog', { name: 'Event date' })
    await expect(dialog).toBeVisible()
    const day = dialog.getByRole('gridcell', { name: 'Sunday, October 4, 2026' })
    await day.focus()
    await day.press('ArrowRight')
    await expect(dialog.getByRole('gridcell', { name: 'Monday, October 5, 2026' })).toBeFocused()
    await dialog.getByRole('button', { name: 'Enter date manually' }).click()
    await dialog.getByLabel('Event date').fill('2026/10/12')
    await dialog.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(page.getByText('Current value: 2026-10-12')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Event date' })).toBeFocused()
  })

  test('range selection marks its interval and enforces date constraints', async ({ page }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const grid = page.getByRole('grid', { name: 'October 2026' })
    const start = grid.getByRole('gridcell', { name: 'Saturday, October 3, 2026' })
    await expect(start).toBeEnabled()
    await grid.getByRole('gridcell', { name: 'Sunday, October 4, 2026' }).click()
    const newStart = grid.locator('[data-date="2026-10-04"]')
    await expect(newStart).toHaveClass(/is-range-start/)
    await expect(newStart).not.toHaveClass(/is-in-range/)
    await expect
      .poll(() => newStart.evaluate((element) => getComputedStyle(element, '::after').content))
      .toBe('none')
    await grid.getByRole('gridcell', { name: 'Thursday, October 8, 2026' }).click()
    await expect(grid.getByRole('gridcell', { name: 'Sunday, October 4, 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(grid.getByRole('gridcell', { name: 'Tuesday, October 6, 2026' })).toHaveClass(
      /is-in-range/,
    )
    await expect
      .poll(() =>
        grid
          .locator('[data-date="2026-10-04"]')
          .evaluate((element) => [
            getComputedStyle(element, '::after').top,
            getComputedStyle(element, '::after').bottom,
          ]),
      )
      .toEqual(['4px', '4px'])
    await page.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(page.getByText('Current value: 2026-10-04 – 2026-10-08')).toBeVisible()
  })

  test('range input labels stay clear of the entered date text', async ({ page }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')

    const fields = page.locator('.yam3x-date-picker__range-field')
    await expect(fields).toHaveCount(2)
    const gaps = await fields.evaluateAll((elements) =>
      elements.map((element) => {
        const label = element.querySelector('label')
        const input = element.querySelector('input')
        if (!label || !input) return Number.NEGATIVE_INFINITY
        const labelBottom = label.getBoundingClientRect().bottom
        const inputStyle = getComputedStyle(input)
        const textTop = input.getBoundingClientRect().top + Number.parseFloat(inputStyle.paddingTop)
        return textTop - labelBottom
      }),
    )

    expect(gaps.every((gap) => gap >= 8)).toBe(true)
  })

  test('modal range calendar scrolls through months and keeps cross-month keyboard focus', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Booking dates' }).click()

    const dialog = page.getByRole('dialog', { name: 'Booking dates' })
    await expect(dialog.locator('.yam3x-date-picker__modal-value')).toHaveCSS('font-size', '22px')
    const monthViewport = dialog.locator('.yam3x-date-picker__view-viewport')
    await expect(monthViewport).toHaveClass(/is-continuous-range/)
    await expect(dialog.getByRole('grid')).toHaveCount(12)
    await expect(dialog.locator('.yam3x-date-picker__continuous-month-title').first()).toHaveCSS(
      'font-size',
      '14px',
    )
    const november = dialog.getByRole('grid', { name: 'November 2026' })
    await november.scrollIntoViewIfNeeded()
    await expect(november).toBeInViewport()

    const octoberThirtyFirst = dialog.getByRole('gridcell', {
      name: 'Saturday, October 31, 2026',
    })
    await octoberThirtyFirst.click()
    await octoberThirtyFirst.focus()
    await octoberThirtyFirst.press('ArrowRight')
    const novemberFirst = dialog.getByRole('gridcell', {
      name: 'Sunday, November 1, 2026',
    })
    await expect(novemberFirst).toBeFocused()
    await dialog.getByRole('gridcell', { name: 'Tuesday, November 3, 2026' }).click()
    await page.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(page.getByText('Current value: 2026-10-31 – 2026-11-03')).toBeVisible()
  })

  test('range fields support direct entry and the modal range input commits transactionally', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    const start = page.getByLabel('Start date')
    const end = page.getByLabel('End date')
    await start.fill('2026-10-04')
    await start.press('Enter')
    await end.fill('2026-10-08')
    await end.press('Enter')
    await expect(page.getByText('Current value: 2026-10-04 – 2026-10-08')).toBeVisible()

    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Booking dates' }).click()
    const dialog = page.getByRole('dialog', { name: 'Booking dates' })
    await dialog.getByRole('button', { name: 'Enter date manually' }).click()
    await dialog.getByLabel('Start date').fill('2026-10-05')
    await dialog.getByLabel('End date').fill('2026-10-09')
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Current value: 2026-10-04 – 2026-10-08')).toBeVisible()
    await page.getByRole('button', { name: 'Booking dates' }).click()
    await page
      .getByRole('dialog', { name: 'Booking dates' })
      .getByRole('button', { name: 'Enter date manually' })
      .click()
    await page
      .getByRole('dialog', { name: 'Booking dates' })
      .getByLabel('Start date')
      .fill('2026-10-05')
    await page
      .getByRole('dialog', { name: 'Booking dates' })
      .getByLabel('End date')
      .fill('2026-10-09')
    await page.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(page.getByText('Current value: 2026-10-05 – 2026-10-09')).toBeVisible()
  })

  test('keeps Material target and calendar geometry at compact and desktop widths', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const docked = page.locator('.yam3x-date-picker__surface')
    await expect
      .poll(() => docked.evaluate((element) => getComputedStyle(element).width))
      .toBe('360px')
    await expect
      .poll(() =>
        docked
          .locator('.yam3x-date-picker__calendar')
          .evaluate((element) => getComputedStyle(element).width),
      )
      .toBe('336px')
    await expect
      .poll(() =>
        docked
          .getByRole('gridcell')
          .first()
          .evaluate((element) => getComputedStyle(element).width),
      )
      .toBe('48px')
    await expect(docked.getByRole('columnheader').first()).toHaveCSS('font-size', '16px')
    await expect(docked.getByRole('gridcell').first()).toHaveCSS('font-size', '16px')
    const selected = docked.getByRole('gridcell', { selected: true }).first()
    await expect
      .poll(() => selected.evaluate((element) => getComputedStyle(element, '::before').inset))
      .toBe('4px')
    await expect
      .poll(() => selected.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe('rgba(0, 0, 0, 0)')

    await page.getByRole('button', { name: 'Cancel' }).click()
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Event date' }).click()
    await expect(page.locator('.yam3x-date-picker__modal')).toBeVisible()
    await expect
      .poll(() =>
        page
          .locator('.yam3x-date-picker__modal')
          .evaluate((element) => getComputedStyle(element).width),
      )
      .toBe('360px')
    await page.setViewportSize({ width: 390, height: 844 })
    await expect
      .poll(() =>
        page
          .locator('.yam3x-date-picker__modal')
          .evaluate((element) => getComputedStyle(element).width),
      )
      .toBe('390px')
    await expect
      .poll(() =>
        page
          .locator('.yam3x-date-picker__calendar')
          .evaluate((element) => getComputedStyle(element).width),
      )
      .toBe('336px')
  })

  test('uses localized short weekday labels and keeps focus treatment circular', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    const startField = page.getByLabel('Start date')
    await expect(startField).toHaveAttribute('placeholder', /2023/)
    await expect(startField).toHaveAttribute('aria-describedby', /support/)
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const grid = page.getByRole('grid', { name: 'October 2026' })
    await expect(grid.getByRole('columnheader')).toHaveCount(7)
    await expect(grid.getByRole('row')).toHaveCount(6)
    expect(await grid.getByRole('columnheader').allTextContents()).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])
    const today = grid.locator('.yam3x-date-picker__day.is-today')
    await today.focus()
    await expect
      .poll(() => today.evaluate((element) => getComputedStyle(element, '::before').borderRadius))
      .toBe('50%')
    await expect
      .poll(() => today.evaluate((element) => getComputedStyle(element).outlineStyle))
      .toBe('none')
    const previous = page.getByRole('button', { name: /Previous month/ })
    await expect(previous.locator('.yam3x-icon__ligature')).toHaveText('chevron_left')
  })

  test('uses single-character Chinese weekday labels aligned with date columns', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'zh-CN' })
    })
    await page.goto('/zh/components/date-picker')
    await page.locator('.yam3x-date-picker__icon-button').click()

    const grid = page.locator('.yam3x-date-picker__grid')
    await expect(grid).toBeVisible()
    const headers = grid.getByRole('columnheader')
    const weekdayLabels = await headers.allTextContents()
    expect(weekdayLabels).toHaveLength(7)
    expect(new Set(weekdayLabels)).toEqual(new Set(['日', '一', '二', '三', '四', '五', '六']))
    expect(await headers.first().getAttribute('aria-label')).not.toBe(weekdayLabels[0])
    const alignment = await grid.evaluate((element) => {
      const weekdays = [...element.querySelectorAll<HTMLElement>('.yam3x-date-picker__weekday')]
      const days = [
        ...element.querySelectorAll<HTMLElement>(
          '.yam3x-date-picker__date-rows .yam3x-date-picker__day',
        ),
      ].slice(0, 7)
      return weekdays.map((weekday, index) => {
        const weekdayCenter =
          weekday.getBoundingClientRect().left + weekday.getBoundingClientRect().width / 2
        const dayRect = days[index].getBoundingClientRect()
        return Math.abs(weekdayCenter - (dayRect.left + dayRect.width / 2))
      })
    })
    expect(alignment.every((offset) => offset <= 1)).toBe(true)
  })

  test('calendar keyboard navigation clamps months and respects the minimum date', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const day = (iso: string) => page.locator(`.yam3x-date-picker__day[data-date="${iso}"]`)

    await day('2026-10-10').focus()
    await day('2026-10-10').press('End')
    await expect(day('2026-10-31')).toBeFocused()
    await day('2026-10-07').focus()
    await day('2026-10-07').press('PageUp')
    await expect(day('2026-10-07')).toBeFocused()
    await expect(page.getByRole('button', { name: /Previous month/ })).toBeDisabled()
    await day('2026-10-07').press('PageUp')
    await expect(day('2026-10-07')).toBeFocused()
  })

  test('opens the range calendar with focus on its selected start date', async ({ page }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const start = page.locator('.yam3x-date-picker__day.is-range-start')
    await expect(start).toHaveAttribute('tabindex', '0')
    await expect(start).toBeFocused()
    const today = page.locator('.yam3x-date-picker__day.is-today')
    await expect
      .poll(() => today.evaluate((element) => getComputedStyle(element).borderRadius))
      .toBe('50%')
    await expect
      .poll(() => today.evaluate((element) => getComputedStyle(element, '::before').borderRadius))
      .toBe('50%')
  })

  test('mirrors range-band end caps in RTL without reversing chronological values', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
    const start = page.locator('.yam3x-date-picker__day[data-date="2026-10-05"]')
    const end = page.locator('.yam3x-date-picker__day[data-date="2026-10-10"]')
    await expect
      .poll(() =>
        start.evaluate((element) => [
          getComputedStyle(element, '::after').left,
          getComputedStyle(element, '::after').right,
        ]),
      )
      .toEqual(['-2px', '24px'])
    await expect
      .poll(() =>
        end.evaluate((element) => [
          getComputedStyle(element, '::after').left,
          getComputedStyle(element, '::after').right,
        ]),
      )
      .toEqual(['24px', '-2px'])
    await expect(start).toHaveAttribute('aria-selected', 'true')
    await expect(end).toHaveAttribute('aria-selected', 'true')
  })

  test('month and year option lists support roving keyboard navigation and skip unavailable years', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    await page.locator('.yam3x-date-picker__day[tabindex="0"]').press('Shift+M')
    const months = page.getByRole('listbox', { name: 'Choose month' })
    const october = months.getByRole('option', { name: 'October' })
    await expect(october).toBeFocused()
    await october.press('ArrowRight')
    await expect(months.getByRole('option', { name: 'November' })).toBeFocused()
    await months.getByRole('option', { name: 'November' }).press('End')
    const december = months.getByRole('option', { name: 'December' })
    await expect(december).toBeFocused()
    await december.press('Enter')
    await expect(page.getByRole('grid', { name: 'December 2026' })).toBeVisible()

    await page.locator('.yam3x-date-picker__day[tabindex="0"]').press('Shift+Y')
    const years = page.getByRole('listbox', { name: 'Choose year' })
    await expect(years.getByRole('option')).toHaveCount(3)
    const currentYear = years.getByRole('option', { name: '2026' })
    await expect(currentYear).toBeFocused()
    await currentYear.press('ArrowRight')
    const nextYear = years.getByRole('option', { name: '2027' })
    await expect(nextYear).toBeFocused()
    await nextYear.press('Enter')
    await expect(page.getByRole('grid', { name: 'December 2027' })).toBeVisible()
    await expect(
      page.locator(
        '.yam3x-date-picker__view-page:not([aria-hidden="true"]) .yam3x-date-picker__day[tabindex="0"]',
      ),
    ).toBeFocused()
  })

  test('month navigation animates the new calendar page', async ({ page }) => {
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const animationStarted = page.evaluate(
      () =>
        new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(
            () => reject(new Error('Month page animation did not start')),
            1000,
          )
          document.addEventListener(
            'transitionrun',
            (event) => {
              if (
                !(event.target instanceof HTMLElement) ||
                !event.target.matches('.yam3x-date-month-next-enter-active')
              )
                return
              window.clearTimeout(timeout)
              resolve()
            },
            { once: false },
          )
        }),
    )

    await page.getByRole('button', { name: /Next month/ }).click()
    await expect(page.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    await animationStarted
    await page.waitForTimeout(70)
    const grid = page.getByRole('grid', { name: 'November 2026' })
    const pageRows = grid.locator('.yam3x-date-picker__date-rows:not([aria-hidden="true"])')
    await expect
      .poll(() =>
        grid.evaluate((element) => {
          const animation = element
            .querySelector('.yam3x-date-picker__date-rows:not([aria-hidden="true"])')!
            .getAnimations()
            .find(
              (candidate) =>
                candidate instanceof CSSTransition && candidate.transitionProperty === 'transform',
            )
          return (
            animation?.playState === 'running' &&
            Number(animation.effect?.getComputedTiming().duration) >= 200
          )
        }),
      )
      .toBe(true)
    await expect(pageRows).toHaveCSS('transform', /matrix\(1, 0, 0, 1, -?[1-9]/)
    const nextMonth = page.getByRole('button', { name: /Next month/ })
    await nextMonth.click()
    await nextMonth.click()
    const january = page.getByRole('grid', { name: 'January 2027' })
    await expect(january).toBeVisible()
    await expect
      .poll(() =>
        january.locator('.yam3x-date-picker__date-rows:not([aria-hidden="true"])').count(),
      )
      .toBe(1)
  })

  test('desktop pointer swipe pages the calendar without selecting a date', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const viewport = page.locator('.yam3x-date-picker__month-viewport')
    const box = await viewport.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box!.x + box!.width - 40, box!.y + 90)
    await page.mouse.down()
    await page.mouse.move(box!.x + 40, box!.y + 90, { steps: 8 })
    await page.mouse.up()
    await expect(page.getByRole('grid', { name: 'November 2026' })).toBeVisible()
    await expect(page.getByText('Current value: 2026-10-04')).toBeVisible()
  })

  test('year selection transitions the calendar into year options', async ({ page }) => {
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const viewport = page.locator('.yam3x-date-picker__view-viewport')
    const viewTransition = viewport.evaluate(
      (element) =>
        new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(
            () => reject(new Error('Year view transition did not start')),
            1000,
          )
          element.addEventListener(
            'transitionrun',
            (event) => {
              if (
                !(event.target instanceof HTMLElement) ||
                !event.target.classList.contains('yam3x-date-picker__year-options') ||
                !['clip-path', 'opacity'].includes((event as TransitionEvent).propertyName)
              )
                return
              window.clearTimeout(timeout)
              resolve()
            },
            { once: false },
          )
        }),
    )
    await page.getByRole('button', { name: /Choose year/ }).click()
    const years = page.getByRole('listbox', { name: 'Choose year' })
    await expect(years).toBeVisible()
    await viewTransition
    await expect(
      viewport.locator('.yam3x-date-picker__year-options:not([aria-hidden="true"])'),
    ).toHaveCSS('transition-duration', '0.35s, 0.15s')
    await expect(years.getByRole('option', { name: '2026' })).toBeVisible()
    await expect(viewport.locator('.yam3x-date-picker__year-background')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  test('manual entry and calendar modes slide with overlapping exit and enter states', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Event date' }).click()
    const viewport = page.locator('.yam3x-date-picker__mode-viewport')
    const waitForTransition = (name: string) =>
      viewport.evaluate(
        (element, transitionClass) =>
          new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(
              () => reject(new Error(`${transitionClass} did not start`)),
              1000,
            )
            element.addEventListener('transitionrun', (event) => {
              if (
                !(event.target instanceof HTMLElement) ||
                !event.target.classList.contains(transitionClass) ||
                (event as TransitionEvent).propertyName !== 'transform'
              )
                return
              window.clearTimeout(timeout)
              resolve()
            })
          }),
        name,
      )

    const inputEnter = waitForTransition('yam3x-date-entry-input-enter-active')
    await page.getByRole('button', { name: 'Enter date manually' }).click()
    await expect(page.getByLabel('Event date').last()).toBeFocused()
    await inputEnter
    await page.waitForTimeout(70)
    await expect
      .poll(() =>
        viewport
          .locator('.yam3x-date-picker__mode-page:not([aria-hidden="true"])')
          .evaluate((element) =>
            element
              .getAnimations()
              .some(
                (animation) =>
                  animation.playState === 'running' &&
                  Number(animation.effect?.getComputedTiming().duration) >= 200,
              ),
          ),
      )
      .toBe(true)

    const calendarEnter = waitForTransition('yam3x-date-entry-picker-enter-active')
    await page.getByRole('button', { name: 'Show calendar' }).click()
    await expect(page.getByRole('grid', { name: 'October 2026' })).toBeVisible()
    await calendarEnter
  })

  test('modal focus wraps at both ends and honors reduced motion and forced colors', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Event date' }).click()
    const dialog = page.getByRole('dialog', { name: 'Event date' })
    const focusables = dialog.locator('button:not(:disabled), input:not(:disabled), [tabindex="0"]')
    const first = focusables.first()
    const last = focusables.last()
    await first.focus()
    await first.press('Shift+Tab')
    await expect(last).toBeFocused()
    await last.press('Tab')
    await expect(first).toBeFocused()

    await page.keyboard.press('Escape')
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
    await page.getByRole('button', { name: 'Event date' }).click()
    const modal = page.locator('.yam3x-date-picker__modal')
    await expect
      .poll(() => modal.evaluate((element) => getComputedStyle(element).animationName))
      .toBe('none')
    await modal.getByRole('button', { name: /Choose year/ }).click()
    const years = modal.getByRole('listbox', { name: 'Choose year' })
    await expect(years).toBeVisible()
    await expect
      .poll(() =>
        modal
          .locator('.yam3x-date-picker__view-viewport')
          .evaluate((element) =>
            element
              .getAnimations({ subtree: true })
              .some((animation) => animation.playState === 'running'),
          ),
      )
      .toBe(false)
    await years.getByRole('option', { name: '2026' }).click()
    const selected = modal.locator(
      '.yam3x-date-picker__view-page:not([aria-hidden="true"]) .yam3x-date-picker__day.is-selected',
    )
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .not.toBe('rgba(0, 0, 0, 0)')
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').outlineStyle),
      )
      .toBe('solid')
    await modal.getByRole('button', { name: 'Enter date manually' }).click()
    await expect(page.getByLabel('Event date').last()).toBeFocused()
    await expect
      .poll(() =>
        modal
          .locator('.yam3x-date-picker__mode-viewport')
          .evaluate((element) =>
            element
              .getAnimations({ subtree: true })
              .some((animation) => animation.playState === 'running'),
          ),
      )
      .toBe(false)
  })

  test('invalid manually entered range endpoints remain uncommitted and are described accessibly', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    const committedValue = await page.locator('.date-picker-example__value').textContent()
    await page.getByRole('button', { name: 'Booking dates' }).click()
    const dialog = page.getByRole('dialog', { name: 'Booking dates' })
    await dialog.getByRole('button', { name: 'Enter date manually' }).click()
    const end = dialog.getByLabel('End date')
    await end.fill('2026-10-02')
    await end.press('Enter')
    const errorId = await end.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    await expect(end).toHaveAttribute('aria-invalid', 'true')
    await expect(dialog.locator(`#${errorId}`)).toHaveText(
      'End date must be on or after the start date.',
    )
    await dialog.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(dialog).toBeVisible()
    await expect(page.locator('.date-picker-example__value')).toHaveText(committedValue!)
  })

  test('six-week months grow the calendar by one row and modal outside dismissal restores focus', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await selectM3Option(page, page.getByLabel('Selection'), 'range')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const october = page.getByRole('grid', { name: 'October 2026' })
    await expect(october.getByRole('row')).toHaveCount(6)
    const fiveWeekHeight = await october.evaluate(
      (element) => element.getBoundingClientRect().height,
    )
    await page.getByRole('button', { name: /Previous month/ }).click()
    await page.getByRole('button', { name: /Previous month/ }).click()
    const august = page.getByRole('grid', { name: 'August 2026' })
    await expect(august.getByRole('row')).toHaveCount(7)
    await expect
      .poll(
        async () =>
          (await august.evaluate((element) => element.getBoundingClientRect().height)) -
          fiveWeekHeight,
      )
      .toBe(48)
    await page.getByRole('button', { name: 'Cancel' }).click()

    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    const trigger = page.getByRole('button', { name: 'Booking dates' })
    await trigger.click()
    const scrim = page.locator('.yam3x-date-picker__scrim')
    await scrim.click({ position: { x: 8, y: 8 } })
    await expect(page.getByRole('dialog', { name: 'Booking dates' })).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('auto mode follows compact and expanded window widths', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/components/date-picker')
    await expect(page.locator('.yam3x-date-picker')).toHaveClass(/yam3x-date-picker--modal/)
    await page.getByRole('button', { name: 'Event date' }).click()
    await expect(page.locator('.yam3x-date-picker__modal')).toHaveCSS('width', '390px')
    await page.setViewportSize({ width: 1280, height: 900 })
    await expect(page.locator('.yam3x-date-picker')).toHaveClass(/yam3x-date-picker--docked/)
  })

  test('anchors the docked calendar to the field and renders one focus ring on the selected date', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/date-picker')
    const root = page.locator('.yam3x-date-picker').first()
    const opener = page.getByRole('button', { name: 'Open calendar' })
    await opener.focus()
    await opener.press('Enter')
    const surface = root.locator('.yam3x-date-picker__surface')
    await expect(surface).toBeVisible()

    const gap = await surface.evaluate((element) => {
      const surfaceRect = element.getBoundingClientRect()
      const anchorRect = element
        .parentElement!.querySelector('.yam3x-date-picker__field-wrap')!
        .getBoundingClientRect()
      return element.classList.contains('is-above')
        ? anchorRect.top - surfaceRect.bottom
        : surfaceRect.top - anchorRect.bottom
    })
    expect(gap).toBeCloseTo(4, 0)

    const selected = surface.locator('.yam3x-date-picker__day.is-selected')
    await expect(selected).toBeFocused()
    await expect(selected).toHaveCSS('outline-style', 'none')
    await expect
      .poll(() =>
        selected.evaluate((element) => getComputedStyle(element, '::before').outlineStyle),
      )
      .toBe('solid')
  })

  test('desktop docked picker flips above its field and closes with Escape or outside interaction', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/components/date-picker')
    const root = page.locator('.yam3x-date-picker').first()
    await root.evaluate((element) => {
      element.style.position = 'fixed'
      element.style.top = '650px'
      element.style.left = '40px'
    })
    const opener = page.getByRole('button', { name: 'Open calendar' })
    await opener.click()
    const surface = page.locator('.yam3x-date-picker__surface')
    await expect(surface).toHaveClass(/is-above/)
    const placement = await surface.evaluate((element) => ({
      top: element.getBoundingClientRect().top,
      bottom: element.getBoundingClientRect().bottom,
      anchorTop: element.parentElement!.getBoundingClientRect().top,
    }))
    expect(placement.bottom).toBeLessThanOrEqual(placement.anchorTop)

    await page.locator('.yam3x-date-picker__day[tabindex="0"]').press('Escape')
    await expect(surface).toBeHidden()
    await expect(opener).toBeFocused()
    await opener.click()
    await page.locator('.date-picker-example__settings').click()
    await expect(surface).toBeHidden()
  })

  test('maps System roles through component aliases and preserves the documented elevation override', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    const root = page.locator('.yam3x-date-picker').first()
    const set = async (name: string, value: string) =>
      root.evaluate((element, input) => element.style.setProperty(input.name, input.value), {
        name,
        value,
      })
    const computed = (selector: string, property: string) =>
      page
        .locator(selector)
        .evaluate(
          (element, cssProperty) => getComputedStyle(element).getPropertyValue(cssProperty),
          property,
        )

    await page.getByRole('button', { name: 'Open calendar' }).click()
    await set('--md-sys-color-primary', 'rgb(1, 2, 3)')
    await set('--md-sys-color-surface-container-high', 'rgb(4, 5, 6)')
    await set('--yam3x-date-picker-container-elevation', '0 0 0 8px rgb(1, 2, 3)')
    expect(await computed('.yam3x-date-picker__surface', 'padding-block-start')).toBe('12px')
    expect(await computed('.yam3x-date-picker__surface', 'padding-inline-start')).toBe('12px')
    expect(await computed('.yam3x-date-picker__surface', 'background-color')).toBe('rgb(4, 5, 6)')
    expect(await computed('.yam3x-date-picker__surface', 'box-shadow')).toContain('8px')
    expect(await computed('.yam3x-date-picker__day.is-selected', 'background-color')).toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(
      await page
        .locator('.yam3x-date-picker__day.is-selected')
        .evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
    ).toBe('rgb(1, 2, 3)')

    await page.getByRole('button', { name: 'Cancel' }).click()
    await selectM3Option(page, page.getByLabel('Mode'), 'modal')
    await page.getByRole('button', { name: 'Event date' }).click()
    expect(await computed('.yam3x-date-picker__modal', 'background-color')).toBe('rgb(4, 5, 6)')
    expect(await computed('.yam3x-date-picker__modal', 'box-shadow')).toContain('8px')
    expect(await computed('.yam3x-date-picker__modal-value', 'font-size')).toBe('32px')
  })

  test('date text meets Material contrast in light and dark themes and RTL reverses navigation icons', async ({
    page,
  }) => {
    await page.goto('/components/date-picker')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const contrastResults = async () =>
      page.locator('.yam3x-date-picker__surface').evaluate((surface) => {
        const parse = (value: string) =>
          value
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number)
        const luminance = (rgb: number[]) =>
          rgb
            .map((value) => {
              const channel = value / 255
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
            })
            .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
        const compare = (foreground: string, background: string) => {
          const a = luminance(parse(foreground)),
            b = luminance(parse(background))
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        }
        const background = getComputedStyle(surface).backgroundColor
        const normal = surface.querySelector<HTMLElement>(
          '.yam3x-date-picker__day:not(.is-outside):not(.is-selected):not(:disabled)',
        )!
        const outside = surface.querySelector<HTMLElement>(
          '.yam3x-date-picker__day.is-outside:not(:disabled)',
        )
        const selected = surface.querySelector<HTMLElement>('.yam3x-date-picker__day.is-selected')!
        const weekday = surface.querySelector<HTMLElement>('.yam3x-date-picker__weekday')!
        return [
          compare(getComputedStyle(normal).color, background),
          ...(outside ? [compare(getComputedStyle(outside).color, background)] : []),
          compare(
            getComputedStyle(selected).color,
            getComputedStyle(selected, '::before').backgroundColor,
          ),
          compare(getComputedStyle(weekday).color, background),
        ]
      })
    for (const ratio of await contrastResults()) expect(ratio).toBeGreaterThanOrEqual(4.5)
    await page.getByRole('switch', { name: 'Switch to dark theme' }).click()
    await page.getByRole('button', { name: 'Open calendar' }).click()
    for (const ratio of await contrastResults()) expect(ratio).toBeGreaterThanOrEqual(4.5)

    await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
    const leftArrow = page.getByRole('button', { name: /Previous month/ }).locator('.yam3x-icon')
    await expect
      .poll(() => leftArrow.evaluate((element) => getComputedStyle(element).transform))
      .toBe('matrix(-1, 0, 0, -1, 0, 0)')
    await expect(page.locator('.yam3x-date-picker__day.is-today')).toHaveAttribute(
      'aria-current',
      'date',
    )
  })
})
