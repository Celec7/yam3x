import { selectM3Option } from './test-utils'
import { expect, test, type Locator, type Page } from '@playwright/test'

const listDemo = (page: Page, index = 0) =>
  page.locator('.yam3x-doc-demo-theme').nth(index).locator('.yam3x-list-demo')

async function resolveColorToken(element: Locator, token: string): Promise<string> {
  return element.evaluate((target, name) => {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    target.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, token)
}

async function resolveFontSizeToken(element: Locator, token: string): Promise<string> {
  return element.evaluate((target, name) => {
    const probe = document.createElement('span')
    probe.style.fontSize = `var(${name})`
    target.append(probe)
    const fontSize = getComputedStyle(probe).fontSize
    probe.remove()
    return fontSize
  }, token)
}

test('inbox stays inline in narrow desktop content panes and mobile viewports', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 1000 })
  await page.goto('/components/list')

  const demo = listDemo(page, 0)
  const contentDemo = listDemo(page, 1)
  const list = demo.locator('.yam3x-action-list')
  const inbox = demo.locator('[data-yam3x-expand-toggle]')
  const expandIndicator = inbox.locator('.yam3x-expandable-list-item__toggle')
  const row = demo.locator('.yam3x-expandable-list-item')
  const panel = row.locator('.yam3x-expandable-list-item__panel')
  const sent = demo.getByRole('link', { name: 'Sent' })
  const mediaList = contentDemo.getByRole('list', { name: 'Media and dividers' })
  const divider = mediaList.getByRole('separator')
  const image = mediaList.locator('[data-leading-type="image"] > img')
  const video = mediaList.locator('[data-leading-type="video"] > video')

  await expect(image).toHaveCSS('width', '56px')
  await expect(image).toHaveCSS('height', '56px')
  await expect(video).toHaveCSS('width', '100px')
  await expect(video).toHaveCSS('height', '56px')
  const appearance = contentDemo.getByRole('combobox', { name: 'List appearance' })
  await selectM3Option(page, appearance, 'standard')
  await expect(divider).toBeVisible()
  await expect(divider).toHaveCSS('margin-inline-start', '16px')
  await expect(divider).toHaveCSS('margin-inline-end', '16px')
  await selectM3Option(page, appearance, 'segmented')
  await expect(divider).toBeHidden()

  await expect
    .poll(() => list.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThan(600)
  await expect(list).toHaveCSS('row-gap', '2px')
  await expect(inbox).toHaveAttribute('aria-expanded', 'false')
  await expect(inbox).toHaveAttribute('aria-current', 'page')
  await expect(inbox).toHaveAttribute('aria-controls', (await panel.getAttribute('id')) ?? '')
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(panel).toHaveAttribute('inert', '')
  const sentPositionBeforeExpansion = await sent.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  )
  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'true')
  const surfaceContainerColor = await expandIndicator.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-surface-container)'
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  const segmentedItemColor = await inbox.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color =
      'var(--_yam3x-list-item-container-color, var(--_yam3x-list-segmented-item-container-color, var(--_yam3x-list-color-surface)))'
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  await expect(expandIndicator).toHaveCSS('background-color', surfaceContainerColor)
  await page.mouse.move(0, 0)
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(panel).not.toHaveAttribute('inert')
  await expect(row).toHaveCSS('position', 'static')
  await expect(inbox).toHaveCSS('border-start-start-radius', '16px')
  await expect(inbox).toHaveCSS('border-end-start-radius', '4px')
  await expect(inbox).toHaveCSS('border-end-end-radius', '4px')
  const firstChildSurface = panel
    .locator('.yam3x-expandable-list-item__clip > [role="list"] > .yam3x-list-action')
    .first()
    .locator('.yam3x-list-item__surface')
  const secondaryContainerColor = await resolveColorToken(
    inbox,
    '--md-sys-color-secondary-container',
  )
  await expect(inbox).toHaveCSS('background-color', secondaryContainerColor)
  await expect(inbox.locator('.yam3x-list-item__headline')).toHaveCSS(
    'color',
    await resolveColorToken(inbox, '--md-sys-color-on-secondary-container'),
  )
  await expect(firstChildSurface).toHaveCSS('background-color', segmentedItemColor)
  await expect(firstChildSurface).toHaveCSS('border-start-start-radius', '4px')
  await expect(firstChildSurface).toHaveCSS('border-start-end-radius', '4px')
  const lastChildSurface = panel
    .locator('.yam3x-expandable-list-item__clip > [role="list"] > .yam3x-list-action')
    .last()
    .locator('.yam3x-list-item__surface')
  await expect(lastChildSurface).toHaveCSS('border-end-start-radius', '16px')
  await expect(lastChildSurface).toHaveCSS('border-end-end-radius', '16px')
  await expect(panel.locator('.yam3x-expandable-list-item__clip > [role="list"]')).toHaveCSS(
    'row-gap',
    '2px',
  )
  await expect(sent).toBeVisible()
  await expect
    .poll(() => sent.evaluate((element) => element.getBoundingClientRect().top + window.scrollY))
    .toBeGreaterThan(sentPositionBeforeExpansion)

  const childAction = demo.getByRole('button', { name: 'Primary' })
  await childAction.click()
  await expect(childAction).toHaveAttribute('aria-current', 'page')
  await expect(childAction).toHaveCSS('background-color', secondaryContainerColor)
  await expect(inbox).not.toHaveAttribute('aria-current')
  await childAction.focus()
  await childAction.press('Escape')
  await expect(inbox).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(panel).toHaveAttribute('inert', '')
  await expect(inbox).toBeFocused()
  await expect
    .poll(() => sent.evaluate((element) => element.getBoundingClientRect().top + window.scrollY))
    .toBeCloseTo(sentPositionBeforeExpansion, 0)

  await list.evaluate((element, item) => element.append(item), await row.elementHandle())
  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'true')
  await inbox.evaluate((element) => element.blur())
  await page.mouse.move(0, 0)
  await expect(inbox).toHaveCSS('border-end-start-radius', '4px')
  await expect(inbox).toHaveCSS('border-end-end-radius', '4px')
  await expect(lastChildSurface).toHaveCSS('border-end-start-radius', '16px')
  await expect(lastChildSurface).toHaveCSS('border-end-end-radius', '16px')
  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'false')
  await expect(inbox).toHaveCSS('border-end-start-radius', '16px')
  await expect(inbox).toHaveCSS('border-end-end-radius', '16px')

  await selectM3Option(page, demo.getByRole('combobox', { name: 'List appearance' }), 'standard')
  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'true')
  await expect(expandIndicator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await inbox.evaluate((element) => element.blur())
  await page.mouse.move(0, 0)
  await expect(inbox).toHaveCSS('border-start-start-radius', '4px')
  await expect(inbox).toHaveCSS('border-end-start-radius', '4px')
  await expect(inbox).toHaveCSS('border-end-end-radius', '4px')
  await inbox.press('Escape')
  await expect(inbox).toHaveAttribute('aria-expanded', 'false')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  const mobileDemo = page.locator('.yam3x-doc-demo-theme').first().locator('.yam3x-list-demo')
  const mobileRow = mobileDemo.locator('.yam3x-expandable-list-item')
  const mobileInbox = mobileDemo.locator('[data-yam3x-expand-toggle]')
  await expect
    .poll(() =>
      mobileDemo
        .locator('.yam3x-action-list')
        .evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThan(600)
  await mobileInbox.click()
  await expect(mobileInbox).toHaveAttribute('aria-expanded', 'true')
  await expect(mobileRow).toHaveCSS('position', 'static')
  await expect(mobileDemo.getByRole('link', { name: 'Sent' })).toBeVisible()
})

test('selection lists integrate with native required validation, submission, disabled values, and reset', async ({
  page,
}) => {
  await page.goto('/components/list')

  const form = page.getByRole('form', { name: 'Inbox preferences form' })
  const listbox = form.getByRole('listbox', { name: 'Choose an inbox to submit' })
  const primary = listbox.getByRole('option', { name: 'Primary' })
  const updates = listbox.getByRole('option', { name: 'Updates' })
  const disabled = listbox.getByRole('option', { name: 'Spam (unavailable)' })
  const status = form.getByRole('status')

  await expect(listbox).toHaveAttribute('aria-required', 'true')
  await form.getByRole('button', { name: 'Save preferences' }).click()
  await expect(listbox).toHaveAttribute('aria-invalid', 'true')
  await expect(status).toHaveText('Choose an inbox.')
  await expect(primary).toBeFocused()

  await disabled.dispatchEvent('click')
  await expect(disabled).toHaveAttribute('aria-selected', 'false')
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await updates.click()
  await expect(updates).toHaveAttribute('aria-selected', 'true')
  await expect(listbox).not.toHaveAttribute('aria-invalid')
  await form.getByRole('button', { name: 'Save preferences' }).click()
  await expect(status).toHaveText('Form submitted: updates')
  await expect
    .poll(() =>
      form.evaluate((element) => new FormData(element as HTMLFormElement).getAll('destination')),
    )
    .toEqual(['updates'])

  await form.getByRole('button', { name: 'Reset' }).click()
  await expect(primary).toHaveAttribute('aria-selected', 'false')
  await expect(updates).toHaveAttribute('aria-selected', 'false')
  await expect(form.locator('output')).toBeHidden()
  await expect(listbox).not.toHaveAttribute('aria-invalid')
  await expect
    .poll(() =>
      form
        .locator('[data-yam3x-list-validation-input]')
        .evaluate((element) => (element as HTMLInputElement).validity.valueMissing),
    )
    .toBe(true)
})

test('action lists keep one tab stop and navigate through dynamic nested and secondary actions', async ({
  page,
}) => {
  await page.goto('/components/list')

  const actionList = page.getByRole('list', { name: 'Mail actions' })
  const inbox = actionList.locator('[data-yam3x-expand-toggle]')
  const sent = actionList.getByRole('link', { name: 'Sent' })
  const drafts = actionList.getByRole('button', { name: 'Drafts', exact: true })
  const more = actionList.getByRole('button', { name: 'More draft actions' })
  const moreTarget = await more.boundingBox()
  expect(moreTarget).not.toBeNull()
  expect(moreTarget!.width).toBeGreaterThanOrEqual(48)
  expect(moreTarget!.height).toBeGreaterThanOrEqual(48)
  const child = actionList
    .locator('.yam3x-expandable-list-item__panel [data-yam3x-list-action]')
    .filter({ hasText: 'Primary' })

  await expect(inbox).toHaveAttribute('tabindex', '0')
  await expect(sent).toHaveAttribute('tabindex', '-1')
  await expect(drafts).toHaveAttribute('tabindex', '-1')
  await expect(more).toHaveAttribute('tabindex', '-1')
  await inbox.focus()
  await inbox.press('End')
  await expect(more).toBeFocused()
  await more.press('Home')
  await expect(inbox).toBeFocused()
  await inbox.press('ArrowUp')
  await expect(more).toBeFocused()
  await more.press('ArrowDown')
  await expect(inbox).toBeFocused()
  await more.focus()
  await more.press('Enter')
  await expect(page.locator('.yam3x-list-demo__detail h3')).toContainText('draft-actions')
  await more.evaluate((element) => {
    element.addEventListener('click', () => {
      element.setAttribute(
        'data-test-key-activations',
        String(Number(element.getAttribute('data-test-key-activations') ?? 0) + 1),
      )
    })
  })
  await more.press('Space')
  await expect(more).toHaveAttribute('data-test-key-activations', '1')

  await sent.focus()
  await sent.press('Enter')
  await expect(sent).toHaveAttribute('aria-current', 'page')

  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'true')
  await expect(child).toHaveAttribute('tabindex', '-1')
  await inbox.press('ArrowDown')
  await expect(child).toBeFocused()
  await child.press('Escape')
  await expect(inbox).toHaveAttribute('aria-expanded', 'false')
  await expect(child).toHaveAttribute('tabindex', '-1')
  await inbox.press('ArrowDown')
  await expect(sent).toBeFocused()
})

test('List Component aliases resolve shared System roles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/components/list')

  const demo = listDemo(page, 2)
  const surface = demo.locator('.yam3x-list-item__surface').first()
  const headline = surface.locator('.yam3x-list-item__headline')
  const selectedOption = demo.getByRole('option', { name: 'Inbox' })

  expect(await resolveColorToken(surface, '--_yam3x-list-color-surface')).toBe(
    await resolveColorToken(surface, '--md-sys-color-surface'),
  )
  expect(await resolveFontSizeToken(headline, '--_yam3x-list-typescale-body-large-font-size')).toBe(
    await resolveFontSizeToken(headline, '--md-sys-typescale-body-large-font-size'),
  )
  await expect(selectedOption).toHaveAttribute('aria-selected', 'true')
  expect(await resolveColorToken(selectedOption, '--_yam3x-list-color-secondary-container')).toBe(
    await resolveColorToken(selectedOption, '--md-sys-color-secondary-container'),
  )
})

test('lists preserve row geometry, selection semantics, theme roles, and RTL order', async ({
  page,
}) => {
  // list.geometry.rows
  // list.selection.semantics
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/components/list')

  const demo = listDemo(page, 0)
  const contentDemo = listDemo(page, 1)
  const selectionDemo = listDemo(page, 2)
  const sent = demo.getByRole('link', { name: 'Sent' })
  const moreActions = demo.getByRole('button', { name: 'More draft actions' })
  const passiveList = contentDemo.getByRole('list', { name: 'Recent contacts' })
  const passiveRows = passiveList.locator(':scope > .yam3x-list-item')
  const firstSurface = passiveRows.nth(0).locator('.yam3x-list-item__surface')
  const secondSurface = passiveRows.nth(1).locator('.yam3x-list-item__surface')
  const firstLayout = firstSurface.locator('.yam3x-list-item__layout')
  const firstAvatar = passiveRows.nth(0).locator('.yam3x-list-item__leading')
  const firstSupporting = passiveRows.nth(0).locator('.yam3x-list-item__supporting')
  const noLeadingOption = selectionDemo.getByRole('option', { name: 'Priority' })
  const noLeadingHeadline = noLeadingOption.locator('.yam3x-list-item__headline')
  const appearance = demo.getByRole('combobox', { name: 'List appearance' })
  await contentDemo.locator('.yam3x-list-demo__columns').evaluate((element) => {
    element.style.gridTemplateColumns = '1fr'
  })
  await expect(firstLayout).toHaveAttribute('data-lines', 'three')
  await expect(firstSurface).toHaveCSS('min-height', '88px')
  expect((await firstSurface.boundingBox())?.height).toBeGreaterThanOrEqual(88)
  await expect(secondSurface).toHaveCSS('min-height', '88px')
  expect((await secondSurface.boundingBox())?.height).toBeGreaterThanOrEqual(88)
  await expect(firstAvatar).toHaveCSS('width', '40px')
  await expect(sent).toHaveCSS('min-height', '56px')
  expect((await sent.boundingBox())?.height).toBeGreaterThanOrEqual(56)
  const sentBox = await sent.boundingBox()
  const sentHeadlineBox = await sent.locator('.yam3x-list-item__headline').boundingBox()
  const noLeadingBox = await noLeadingOption.boundingBox()
  const noLeadingHeadlineBox = await noLeadingHeadline.boundingBox()
  expect(sentBox).not.toBeNull()
  expect(sentHeadlineBox).not.toBeNull()
  expect(noLeadingBox).not.toBeNull()
  expect(noLeadingHeadlineBox).not.toBeNull()
  expect(sentHeadlineBox!.y - sentBox!.y).toBeCloseTo(16, 0)
  expect(noLeadingHeadlineBox!.x - noLeadingBox!.x).toBeCloseTo(16, 0)
  expect((await moreActions.boundingBox())?.width).toBeGreaterThanOrEqual(48)
  expect((await moreActions.boundingBox())?.height).toBeGreaterThanOrEqual(48)
  const rowBox = await firstSurface.boundingBox()
  const leadingStartBox = await firstAvatar.boundingBox()
  const trailingBox = await passiveRows
    .nth(0)
    .locator('.yam3x-list-item__trailing-text')
    .boundingBox()
  expect(rowBox).not.toBeNull()
  expect(leadingStartBox).not.toBeNull()
  expect(trailingBox).not.toBeNull()
  expect(leadingStartBox!.x - rowBox!.x).toBeCloseTo(16, 0)
  expect(rowBox!.x + rowBox!.width - trailingBox!.x - trailingBox!.width).toBeCloseTo(16, 0)
  expect(leadingStartBox!.y - rowBox!.y).toBeCloseTo(10, 0)
  expect(trailingBox!.y - rowBox!.y).toBeCloseTo(10, 0)

  await passiveList.evaluate((element) => {
    element.style.width = '240px'
  })
  await expect(firstLayout).toHaveAttribute('data-lines', 'three')
  await expect(passiveRows.nth(0)).toHaveAttribute('data-lines', 'three')
  const wrappedSurfaceHeight = (await firstSurface.boundingBox())?.height
  expect(wrappedSurfaceHeight).toBeGreaterThan(88)
  await expect
    .poll(() => firstSupporting.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThan(40)
  await passiveList.evaluate((element) => {
    element.style.width = '100%'
  })
  await expect(firstLayout).toHaveAttribute('data-lines', 'three')
  await expect(passiveRows.nth(0)).toHaveAttribute('data-lines', 'three')
  expect((await firstSurface.boundingBox())?.height).toBeLessThan(wrappedSurfaceHeight!)

  await selectM3Option(page, appearance, 'segmented')
  await expect(passiveList).toHaveCSS('row-gap', '2px')
  await expect(firstSurface).toHaveCSS('border-top-left-radius', '16px')

  const draggedStateControl = contentDemo.getByRole('checkbox', { name: 'Simulate dragged state' })
  await draggedStateControl.check()
  const draggedRow = passiveRows.nth(0)
  const draggedSurface = firstSurface
  await expect(draggedRow).toHaveAttribute('data-yam3x-dragged', 'true')
  const draggedTokens = await page.evaluate(() => {
    const rootStyles = getComputedStyle(document.documentElement)
    const resolveColor = (token: string, property: 'color' | 'backgroundColor') => {
      const probe = document.createElement('span')
      probe.style[property] = rootStyles.getPropertyValue(token).trim()
      document.body.append(probe)
      const color = getComputedStyle(probe)[property]
      probe.remove()
      return color
    }
    return {
      background: resolveColor('--md-sys-color-tertiary-container', 'backgroundColor'),
      foreground: resolveColor('--md-sys-color-on-tertiary-container', 'color'),
    }
  })
  const assertDraggedVisuals = async (
    row: ReturnType<typeof page.locator>,
    surface: ReturnType<typeof page.locator>,
  ) => {
    await expect(row).toHaveAttribute('data-yam3x-dragged', 'true')
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe(draggedTokens.background)
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).boxShadow))
      .not.toBe('none')
    await expect(surface.locator('.yam3x-list-item__headline')).toHaveCSS(
      'color',
      draggedTokens.foreground,
    )
    await expect(surface).toHaveCSS('border-top-left-radius', '16px')
  }
  await assertDraggedVisuals(draggedRow, draggedSurface)
  await draggedStateControl.uncheck()
  await expect(draggedRow).not.toHaveAttribute('data-yam3x-dragged')

  const single = page.getByRole('listbox', { name: 'Default inbox' })
  const inbox = single.getByRole('option', { name: 'Inbox' })
  const priority = single.getByRole('option', { name: 'Priority' })
  const disabled = single.getByRole('option', { name: 'Archive (unavailable)' })
  await expect(inbox).toHaveAttribute('aria-selected', 'true')
  await expect(inbox.locator('.yam3x-list-option__indicator')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(inbox.locator('.yam3x-list-option__indicator .yam3x-icon__ligature')).toHaveText(
    'radio_button_checked',
  )
  await expect(priority.locator('.yam3x-list-option__indicator .yam3x-icon__ligature')).toHaveText(
    'radio_button_unchecked',
  )
  await expect(inbox).toHaveAccessibleName(/Inbox.*4 unread messages/)
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await expect(disabled).toHaveAttribute('tabindex', '-1')
  await expect(inbox).toHaveCSS('border-radius', '16px')
  await priority.hover()
  await expect(priority).toHaveCSS('border-radius', '12px')
  await page.mouse.move(0, 0)

  const readMaterialSelectionColors = async () =>
    single.locator('[role="option"][aria-selected="true"]').evaluate((element) => {
      const readRoleColor = (name: string) => {
        const role = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
        const probe = document.createElement('span')
        probe.style.color = role
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      return {
        background: getComputedStyle(element).backgroundColor,
        expectedBackground: readRoleColor('--md-sys-color-secondary-container'),
        foreground: getComputedStyle(element.querySelector('.yam3x-list-item__headline')!).color,
        expectedForeground: readRoleColor('--md-sys-color-on-secondary-container'),
      }
    })
  await expect
    .poll(async () => {
      const colors = await readMaterialSelectionColors()
      return (
        colors.background === colors.expectedBackground &&
        colors.foreground === colors.expectedForeground
      )
    })
    .toBe(true)

  await inbox.focus()
  await inbox.press('ArrowDown')
  await expect(priority).toBeFocused()
  await priority.press('Enter')
  await expect(priority).toHaveAttribute('aria-selected', 'true')
  await expect(priority.locator('.yam3x-list-option__indicator .yam3x-icon__ligature')).toHaveText(
    'radio_button_checked',
  )
  await expect(inbox.locator('.yam3x-list-option__indicator .yam3x-icon__ligature')).toHaveText(
    'radio_button_unchecked',
  )
  await expect(disabled).toHaveAttribute('aria-selected', 'false')
  await priority.hover()
  await expect(priority).toHaveCSS('border-radius', '16px')
  await priority.press('ArrowDown')
  await expect(inbox).toBeFocused()
  await expect(inbox).toHaveCSS('outline-style', 'solid')
  await expect(inbox).toHaveCSS('border-radius', '16px')

  const multiple = page.getByRole('listbox', { name: 'Mail filters' })
  const attachments = multiple.getByRole('option', { name: 'Has attachments' })
  const checkMark = attachments.locator('.yam3x-list-option__indicator .yam3x-icon__ligature')
  await expect(checkMark).toHaveText('check_box_outline_blank')
  await attachments.click()
  await expect(attachments).toHaveAttribute('aria-selected', 'true')
  await expect(checkMark).toHaveText('check_box')
  await attachments.press('Space')
  await expect(attachments).toHaveAttribute('aria-selected', 'false')
  await expect(checkMark).toHaveText('check_box_outline_blank')
  await attachments.press('Enter')
  await expect(attachments).toHaveAttribute('aria-selected', 'true')
  await expect(checkMark).toHaveText('check_box')

  const themeSwitch = page.getByRole('switch')
  const html = page.locator('html')
  if (!(await html.evaluate((element) => element.classList.contains('dark'))))
    await themeSwitch.click()
  await expect(html).toHaveClass(/dark/)
  await expect
    .poll(async () => {
      const colors = await readMaterialSelectionColors()
      return (
        colors.background === colors.expectedBackground &&
        colors.foreground === colors.expectedForeground
      )
    })
    .toBe(true)

  await contentDemo.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await expect(contentDemo).toHaveAttribute('dir', 'rtl')
  const leadingBox = await firstAvatar.boundingBox()
  const headlineBox = await passiveRows.nth(0).locator('.yam3x-list-item__headline').boundingBox()
  expect(leadingBox).not.toBeNull()
  expect(headlineBox).not.toBeNull()
  expect(leadingBox!.x).toBeGreaterThan(headlineBox!.x)
})

test('expanded segmented containers follow light and dark theme roles without becoming selected', async ({
  page,
}) => {
  await page.goto('/components/list')

  const demo = listDemo(page, 0)
  const appearance = demo.getByRole('combobox', { name: 'List appearance' })
  await selectM3Option(page, appearance, 'segmented')
  const themeSwitch = page.getByRole('switch')
  const html = page.locator('html')
  if (await html.evaluate((element) => element.classList.contains('dark')))
    await themeSwitch.click()

  const inbox = demo.locator('[data-yam3x-expand-toggle]')
  const indicator = inbox.locator('.yam3x-expandable-list-item__toggle')
  const childSurface = demo
    .locator('.yam3x-expandable-list-item__clip > [role="list"] > .yam3x-list-action')
    .first()
    .locator('.yam3x-list-item__surface')
  await demo.getByRole('link', { name: 'Sent' }).click()
  await expect(inbox).not.toHaveAttribute('aria-current')

  const assertExpandedThemeColors = async () => {
    await inbox.click()
    await expect(inbox).toHaveAttribute('aria-expanded', 'true')
    const itemContainer = await resolveColorToken(
      inbox,
      '--_yam3x-list-expandable-item-expanded-container-color, var(--_yam3x-list-item-container-color)',
    )
    const indicatorContainer = await resolveColorToken(
      indicator,
      '--_yam3x-list-expandable-item-expanded-toggle-icon-container-color, var(--_yam3x-list-color-surface-container)',
    )
    await expect(inbox).toHaveCSS('background-color', itemContainer)
    await expect(childSurface).toHaveCSS('background-color', itemContainer)
    await expect(indicator).toHaveCSS('background-color', indicatorContainer)
    await inbox.click()
    await expect(inbox).toHaveAttribute('aria-expanded', 'false')
    await expect(inbox).not.toHaveAttribute('aria-selected')
  }

  await assertExpandedThemeColors()
  await themeSwitch.click()
  await expect(html).toHaveClass(/dark/)
  await assertExpandedThemeColors()
})

test('selectable list options show touch ripple feedback', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto('/components/list')
    const option = page
      .getByRole('listbox', { name: 'Default inbox' })
      .getByRole('option', { name: 'Inbox' })
    const bounds = await option.boundingBox()
    expect(bounds).not.toBeNull()
    await option.evaluate(
      (element, point) => {
        element.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 1,
            pointerType: 'touch',
            isPrimary: true,
            clientX: point.x,
            clientY: point.y,
          }),
        )
      },
      { x: bounds!.x + bounds!.width / 2, y: bounds!.y + bounds!.height / 2 },
    )
    await expect(option.locator('.yam3x-ripple--visible')).toHaveCount(1)
    await page.evaluate(() =>
      window.dispatchEvent(
        new PointerEvent('pointerup', { pointerId: 1, pointerType: 'touch', isPrimary: true }),
      ),
    )
    await expect(option).toHaveAttribute('aria-selected', 'true')
  } finally {
    await context.close()
  }
})

test('rows grow with enlarged typography without clipping their text or slotted content', async ({
  page,
}) => {
  await page.goto('/components/list')
  const list = page.getByRole('list', { name: 'Recent contacts' })
  const row = list.locator(':scope > .yam3x-list-item').first()
  const surface = row.locator('.yam3x-list-item__surface')
  const originalHeight = (await surface.boundingBox())!.height

  await list.evaluate((element) => {
    const root = element as HTMLElement
    root.style.setProperty('--md-sys-typescale-body-large-font-size', '32px')
    root.style.setProperty('--md-sys-typescale-body-large-line-height-small', '48px')
    root.style.setProperty('--md-sys-typescale-body-medium-font-size', '28px')
    root.style.setProperty('--md-sys-typescale-body-medium-line-height-small', '40px')
  })

  await expect
    .poll(() => surface.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThan(originalHeight)
  for (const text of await row
    .locator('.yam3x-list-item__headline, .yam3x-list-item__supporting')
    .all()) {
    const dimensions = await text.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      fontSize: getComputedStyle(element).fontSize,
    }))
    expect(Number.parseFloat(dimensions.fontSize)).toBeGreaterThanOrEqual(28)
    expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 1)
  }
  const avatar = await row.locator('.yam3x-list-item__leading').boundingBox()
  expect(avatar).not.toBeNull()
  expect(avatar!.height).toBeGreaterThanOrEqual(40)
})

test('rapid expansion reversals settle in the latest requested state', async ({ page }) => {
  await page.goto('/components/list')
  const row = page
    .locator('.yam3x-doc-demo-theme')
    .first()
    .locator('.yam3x-list-demo .yam3x-expandable-list-item')
  const disclosure = row.locator('[data-yam3x-expand-toggle]')
  const panel = row.locator('.yam3x-expandable-list-item__panel')

  await disclosure.evaluate((element) => (element as HTMLButtonElement).click())
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await disclosure.evaluate((element) => (element as HTMLButtonElement).click())
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(panel).toHaveAttribute('inert', '')
  await expect.poll(() => row.getAttribute('data-transitioning')).toBe('false')
  await expect(panel).toHaveCSS('grid-template-rows', '0px')
})

test('segmented item shape morphs smoothly between resting and hover shapes', async ({ page }) => {
  await page.goto('/components/list')
  const demo = listDemo(page, 2)
  await selectM3Option(page, demo.getByRole('combobox', { name: 'List appearance' }), 'segmented')
  const option = demo
    .getByRole('listbox', { name: 'Default inbox' })
    .getByRole('option', { name: 'Priority' })
  await page.mouse.move(0, 0)
  await expect(option).toHaveCSS('border-radius', '4px')
  const transitionDuration = await option.evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  )
  expect(transitionDuration.split(',').some((value) => parseFloat(value) > 0)).toBe(true)

  const expectIntermediateRadius = () =>
    expect
      .poll(() =>
        option.evaluate((element) => {
          const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)
          return radius > 4 && radius < 12
        }),
      )
      .toBe(true)

  await option.hover()
  await expectIntermediateRadius()
  await expect(option).toHaveCSS('border-radius', '12px')
  await page.mouse.move(0, 0)
  await expectIntermediateRadius()
  await expect(option).toHaveCSS('border-radius', '4px')
})

test('reduced motion and forced colors preserve expandable and selection states', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await page.goto('/components/list')

  const single = page.getByRole('listbox', { name: 'Default inbox' })
  const selected = single.getByRole('option', { name: 'Inbox' })
  const forcedColors = await page.evaluate(() => {
    const probe = document.createElement('span')
    document.body.append(probe)
    probe.style.backgroundColor = 'Highlight'
    const highlight = getComputedStyle(probe).backgroundColor
    probe.remove()
    return highlight
  })
  await expect
    .poll(() => selected.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(forcedColors)
  const selectedContrast = await selected.evaluate((element) => {
    const background = getComputedStyle(element).backgroundColor
    const textStyle = getComputedStyle(element.querySelector('.yam3x-list-item__headline')!)
    return {
      background,
      foreground: textStyle.color,
      forcedColorAdjust: textStyle.forcedColorAdjust,
    }
  })
  expect(selectedContrast.background).toBe(forcedColors)
  expect(selectedContrast.foreground).not.toBe(selectedContrast.background)
  expect(selectedContrast.forcedColorAdjust).toBe('none')

  const inbox = page
    .locator('.yam3x-doc-demo-theme')
    .first()
    .locator('.yam3x-list-demo [data-yam3x-expand-toggle]')
  const row = page
    .locator('.yam3x-doc-demo-theme')
    .first()
    .locator('.yam3x-list-demo .yam3x-expandable-list-item')
  const panel = row.locator('.yam3x-expandable-list-item__panel')
  await expect(panel).toHaveCSS('transition-duration', '0s')
  await inbox.click()
  await expect(inbox).toHaveAttribute('aria-expanded', 'true')
  await expect(row).toHaveCSS('position', 'static')
  await expect.poll(() => row.getAttribute('data-transitioning')).toBe('false')
})

test('list defaults follow Expressive component tokens and global typography roles', async ({
  page,
}) => {
  await page.goto('/components/list')

  const list = page.getByRole('list', { name: 'Recent contacts' })
  const row = list.locator(':scope > .yam3x-list-item').first()
  const surface = row.locator('.yam3x-list-item__surface')
  const layout = surface.locator('.yam3x-list-item__layout')
  const headline = surface.locator('.yam3x-list-item__headline')

  await expect(surface).toHaveCSS(
    'background-color',
    await resolveColorToken(surface, '--md-sys-color-surface'),
  )
  await expect(layout).toHaveCSS('padding-inline-start', '16px')
  await expect(layout).toHaveCSS('padding-inline-end', '16px')
  await expect(layout).toHaveCSS('padding-block-start', '10px')
  await expect(layout).toHaveCSS('padding-block-end', '10px')

  await page.evaluate(() => {
    document.documentElement.style.setProperty('--md-sys-typescale-body-large-font-size', '21px')
  })
  await expect(headline).toHaveCSS('font-size', '21px')

  const selected = page
    .getByRole('listbox', { name: 'Default inbox' })
    .getByRole('option', { name: 'Inbox' })
  await expect(selected).toHaveCSS(
    'background-color',
    await resolveColorToken(selected, '--md-sys-color-secondary-container'),
  )
  await expect(selected.locator('.yam3x-list-item__headline')).toHaveCSS(
    'color',
    await resolveColorToken(selected, '--md-sys-color-on-secondary-container'),
  )

  const disabled = page
    .getByRole('listbox', { name: 'Default inbox' })
    .getByRole('option', { name: 'Archive (unavailable)' })
  await disabled.evaluate((element) => element.setAttribute('aria-selected', 'true'))
  const disabledContainerColor = await disabled.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.backgroundColor =
      'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)'
    element.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  })
  await expect(disabled).toHaveCSS('background-color', disabledContainerColor)
})
