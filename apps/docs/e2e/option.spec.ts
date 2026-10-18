import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test('Option composes labelled groups and controlled selectable items in an anchored listbox', async ({
  page,
}) => {
  await page.goto('/components/option')
  const trigger = page.getByRole('button', { name: 'Project view' })
  await trigger.click()
  const panel = page.getByRole('listbox', { name: 'Project view options' })
  await expect(panel).toBeVisible()
  await expect(page.getByRole('group', { name: 'Projects' })).toBeVisible()
  const options = panel.getByRole('option')
  await expect(options).toHaveCount(4)
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(options.nth(3)).toHaveAttribute('aria-disabled', 'true')
  await expect(options.nth(3)).toHaveAttribute('tabindex', '-1')

  await options.nth(1).click()
  await expect(panel).toBeHidden()
  await expect(trigger).toContainText('Recently opened')
  await expect(page.locator('p[role="status"]')).toHaveText('Current selection: Recently opened')
  await expect(page.getByTestId('option-selection-source')).toHaveText(
    'Last selection source: pointer',
  )
  await expect(trigger).toBeFocused()
})

test('Option keyboard focus and activation report intent without owning parent selection', async ({
  page,
}) => {
  // option.extension.parent-selection
  await page.goto('/components/option')
  const trigger = page.getByRole('button', { name: 'Project view' })
  await trigger.press('ArrowDown')
  const panel = page.getByRole('listbox', { name: 'Project view options' })
  await expect(panel).toBeVisible()
  const options = panel.getByRole('option')
  await expect(options.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(options.nth(1)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(options.nth(2)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(trigger).toContainText('Shared with me')
  await expect(page.getByTestId('option-selection-source')).toHaveText(
    'Last selection source: keyboard',
  )
  await expect(trigger).toBeFocused()
  await trigger.press('Space')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden()
})

test('OptionPanel follows its anchor, clamps its width, closes outside, and supports cancellation', async ({
  page,
}) => {
  await page.goto('/components/option')
  const trigger = page.getByRole('button', { name: 'Project view' })
  const panel = page.locator('#option-panel-demo')
  await trigger.evaluate((element) => {
    ;(element as HTMLElement).style.width = '240px'
  })
  await trigger.click()
  await expect(panel).toBeVisible()
  const [anchorBox, panelBox] = await Promise.all([trigger.boundingBox(), panel.boundingBox()])
  expect(anchorBox).not.toBeNull()
  expect(panelBox).not.toBeNull()
  expect(Math.abs(anchorBox!.width - panelBox!.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(anchorBox!.x - panelBox!.x)).toBeLessThanOrEqual(1)
  await page.getByRole('heading', { name: 'Option' }).click()
  await expect(panel).toBeHidden()

  await panel.evaluate((element) =>
    element.addEventListener('beforetoggle', (event) => {
      if ((event as CustomEvent<{ open: boolean }>).detail.open) event.preventDefault()
    }),
  )
  await trigger.click()
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('Option selection styling, text highlighting, states, and m3e CSS hooks affect rendering', async ({
  page,
}) => {
  await page.goto('/components/option')
  const trigger = page.getByRole('button', { name: 'Project view' })
  await trigger.click()
  const panel = page.getByRole('listbox')
  const selected = page.getByRole('option', { name: 'All projects' })
  const enabled = page.getByRole('option', { name: 'Recently opened' })
  const disabled = page.getByRole('option', { name: 'Archived' })
  await page
    .locator('.option-demo')
    .evaluate((element) =>
      (element as HTMLElement).style.setProperty('--yam3x-option-first-child-shape', '18px'),
    )

  const optionHooks = [
    ['--yam3x-option-container-height', '64px', selected, 'min-height', '64px'],
    ['--yam3x-option-color', 'rgb(10, 11, 12)', enabled, 'color', 'rgb(10, 11, 12)'],
    ['--yam3x-option-selected-color', 'rgb(20, 21, 22)', selected, 'color', 'rgb(20, 21, 22)'],
    [
      '--yam3x-option-selected-container-color',
      'rgb(30, 31, 32)',
      selected,
      'background-color',
      'rgb(30, 31, 32)',
    ],
    ['--yam3x-option-shape', '8px', enabled, 'border-top-left-radius', '8px'],
    ['--yam3x-option-selected-shape', '18px', selected, 'border-top-left-radius', '18px'],
    ['--yam3x-option-first-child-shape', '16px', selected, 'border-top-left-radius', '16px'],
    ['--yam3x-option-padding-start', '21px', enabled, 'padding-inline-start', '21px'],
    ['--yam3x-option-padding-end', '22px', enabled, 'padding-inline-end', '22px'],
    [
      '--yam3x-option-icon-size',
      '28px',
      selected.locator('.yam3x-option__indicator'),
      'width',
      '28px',
    ],
    [
      '--yam3x-option-label-text-font-size',
      '18px',
      enabled.locator('.yam3x-option__label'),
      'font-size',
      '18px',
    ],
    [
      '--yam3x-option-label-text-font-weight',
      '600',
      enabled.locator('.yam3x-option__label'),
      'font-weight',
      '600',
    ],
    [
      '--yam3x-option-label-text-line-height',
      '26px',
      enabled.locator('.yam3x-option__label'),
      'line-height',
      '26px',
    ],
    [
      '--yam3x-option-label-text-tracking',
      '1px',
      enabled.locator('.yam3x-option__label'),
      'letter-spacing',
      '1px',
    ],
  ] as const
  for (const [name, value, target, property, expected] of optionHooks) {
    await page
      .locator('.option-demo')
      .evaluate(
        (root, [hook, token]) => (root as HTMLElement).style.setProperty(hook, token),
        [name, value],
      )
    await expect(target).toHaveCSS(property, expected)
  }

  await page.locator('.option-demo').evaluate((element) => {
    const option = document.createElement('div')
    option.className = 'yam3x-option yam3x-state-layer'
    option.setAttribute('role', 'option')
    option.setAttribute('aria-selected', 'false')
    option.style.setProperty('--yam3x-option-panel-text-highlight-color', 'rgb(40, 41, 42)')
    option.innerHTML =
      '<span class="yam3x-option__label"><mark class="yam3x-option__match">Pro</mark>jects</span>'
    element.append(option)
  })
  const highlight = page.locator('.yam3x-option__match')
  await page
    .locator('.option-demo')
    .evaluate((element) =>
      (element as HTMLElement).style.setProperty(
        '--yam3x-option-panel-text-highlight-container-color',
        'rgb(50, 51, 52)',
      ),
    )
  await expect(highlight).toHaveCSS('background-color', 'rgb(50, 51, 52)')
  await expect(highlight).toHaveCSS('color', 'rgb(40, 41, 42)')
  await expect(disabled).toHaveAttribute('tabindex', '-1')
  await expect(disabled).toHaveCSS('cursor', 'default')

  await page.locator('.option-demo').evaluate((element) => {
    const root = element as HTMLElement
    root.style.setProperty('--yam3x-option-panel-container-color', 'rgb(61, 62, 63)')
    root.style.setProperty('--yam3x-option-panel-container-shape', '24px')
    root.style.setProperty('--yam3x-option-panel-container-padding-inline', '11px')
    root.style.setProperty('--yam3x-option-panel-container-padding-block', '12px')
    root.style.setProperty('--yam3x-option-panel-container-elevation', '0 0 0 2px rgb(71, 72, 73)')
    root.style.setProperty('--yam3x-option-panel-divider-spacing', '9px')
  })
  await expect(panel).toHaveCSS('background-color', 'rgb(61, 62, 63)')
  await expect(panel).toHaveCSS('border-top-left-radius', '24px')
  await expect(panel).toHaveCSS('padding-inline-start', '11px')
  await expect(panel).toHaveCSS('padding-block-start', '12px')
  await expect(panel).toHaveCSS('gap', '0px')
  await expect(panel).toHaveCSS('box-shadow', 'rgb(71, 72, 73) 0px 0px 0px 2px')
})

test('option.geometry.edge-corners keeps outer and inner row corners distinct', async ({
  page,
}) => {
  await page.goto('/components/option')
  await page.getByRole('button', { name: 'Project view' }).click()
  const options = page.getByRole('listbox').getByRole('option')
  const first = options.nth(0)
  const last = options.nth(3)

  // The selected row keeps its selected shape while retaining the public outer-corner override.
  await expect(first).toHaveCSS('border-top-left-radius', '12px')
  await expect(first).toHaveCSS('border-bottom-left-radius', '12px')
  await first.evaluate((element) => {
    element.classList.remove('yam3x-option--selected')
    element.setAttribute('aria-selected', 'false')
  })
  await expect(first).toHaveCSS('border-top-left-radius', '12px')
  await expect(first).toHaveCSS('border-bottom-left-radius', '4px')
  await expect(last).toHaveCSS('border-top-left-radius', '4px')
  await expect(last).toHaveCSS('border-bottom-left-radius', '12px')
})

test('OptionPanel loading and empty states are statuses rather than selectable options', async ({
  page,
}) => {
  await page.goto('/components/option')
  const trigger = page.getByRole('button', { name: 'Project view' })
  const mode = page.getByRole('combobox', { name: 'Panel content', exact: true })
  const panel = page.getByRole('listbox')
  await selectM3Option(page, mode, 'loading')
  await trigger.click()
  await expect(panel).toHaveAttribute('aria-busy', 'true')
  await expect(panel.getByRole('status')).toHaveText('Loading…')
  await expect(panel.getByRole('option')).toHaveCount(0)
  await page.getByRole('heading', { name: 'Option' }).click()
  await selectM3Option(page, mode, 'empty')
  await trigger.click()
  await expect(panel).not.toHaveAttribute('aria-busy', 'true')
  await expect(panel.getByRole('status')).toHaveText('No options')
  await expect(panel.getByRole('option')).toHaveCount(0)
})

test('Option remaining m3e state, group, panel-bound, and sizing hooks affect rendered styles', async ({
  page,
}) => {
  await page.goto('/components/option')
  const root = page.locator('.option-demo')
  const panel = page.locator('#option-panel-demo')
  const trigger = page.getByRole('button', { name: 'Project view' })
  await root.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-option-panel-container-min-width', '160px')
    style.setProperty('--yam3x-option-panel-container-max-width', '210px')
    style.setProperty('--yam3x-option-panel-container-max-height', '120px')
  })
  await trigger.click()
  const first = page.getByRole('option', { name: 'All projects' })
  const enabled = page.getByRole('option', { name: 'Recently opened' })
  const disabled = page.getByRole('option', { name: 'Archived' })
  const groupLabel = page.locator('.yam3x-option-group__label')
  const panelBox = await panel.boundingBox()
  expect(panelBox).not.toBeNull()
  expect(Math.abs(panelBox!.width - 210)).toBeLessThanOrEqual(1)
  await expect(panel).toHaveCSS('max-height', '120px')

  const setHook = (name: string, value: string) =>
    root.evaluate(
      (element, [hook, token]) => {
        ;(element as HTMLElement).style.setProperty(hook, token)
      },
      [name, value],
    )
  const stateLayer = async (item: ReturnType<typeof page.getByRole>) =>
    item.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--yam3x-state-layer-color').trim(),
    )

  await setHook('--yam3x-option-container-hover-color', 'rgb(10, 20, 30)')
  await enabled.hover()
  expect(await stateLayer(enabled)).toBe('rgb(10, 20, 30)')
  await setHook('--yam3x-option-container-focus-color', 'rgb(20, 30, 40)')
  await enabled.evaluate((element) => (element as HTMLElement).focus({ focusVisible: true }))
  expect(await stateLayer(enabled)).toBe('rgb(20, 30, 40)')
  await setHook('--yam3x-option-focus-ring-shape', '14px')
  await expect(enabled).toHaveCSS('border-top-left-radius', '14px')
  await setHook('--yam3x-option-last-child-shape', '19px')
  await expect(disabled).toHaveCSS('border-bottom-left-radius', '19px')
  await setHook('--yam3x-option-icon-label-space', '13px')
  await expect(first).toHaveCSS('gap', '13px')

  await setHook('--yam3x-option-disabled-color', 'rgb(40, 50, 60)')
  await setHook('--yam3x-option-disabled-opacity', '50%')
  const disabledColor = await disabled.evaluate((element) => getComputedStyle(element).color)
  expect(disabledColor).not.toBe('rgb(29, 27, 32)')
  await setHook('--yam3x-option-ripple-color', 'rgb(50, 60, 70)')
  await expect
    .poll(() =>
      enabled.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--yam3x-ripple-color').trim(),
      ),
    )
    .toBe('rgb(50, 60, 70)')

  await setHook('--yam3x-option-selected-container-hover-color', 'rgb(60, 70, 80)')
  await first.hover()
  expect(await stateLayer(first)).toBe('rgb(60, 70, 80)')
  await setHook('--yam3x-option-selected-container-focus-color', 'rgb(70, 80, 90)')
  await first.evaluate((element) => (element as HTMLElement).focus({ focusVisible: true }))
  expect(await stateLayer(first)).toBe('rgb(70, 80, 90)')
  await setHook('--yam3x-option-selected-ripple-color', 'rgb(80, 90, 100)')
  await expect
    .poll(() =>
      first.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--yam3x-ripple-color').trim(),
      ),
    )
    .toBe('rgb(80, 90, 100)')

  await setHook('--yam3x-option-height', '58px')
  await expect(groupLabel).toHaveCSS('min-height', '58px')
  await setHook('--yam3x-option-font-size', '16px')
  await expect(groupLabel).toHaveCSS('font-size', '16px')
  await setHook('--yam3x-option-font-weight', '600')
  await expect(groupLabel).toHaveCSS('font-weight', '600')
  await setHook('--yam3x-option-line-height', '24px')
  await expect(groupLabel).toHaveCSS('line-height', '24px')
  await setHook('--yam3x-option-tracking', '1px')
  await expect(groupLabel).toHaveCSS('letter-spacing', '1px')
  await setHook('--yam3x-option-padding-start', '21px')
  await setHook('--yam3x-option-padding-end', '22px')
  await expect(groupLabel).toHaveCSS('padding-inline-start', '21px')
  await expect(groupLabel).toHaveCSS('padding-inline-end', '22px')

  await panel.evaluate((element) => {
    const divider = document.createElement('div')
    divider.className = 'yam3x-divider'
    element.append(divider)
  })
  await setHook('--yam3x-option-panel-divider-spacing', '11px')
  await expect(panel.locator('.yam3x-divider')).toHaveCSS('margin-block-start', '11px')
})
