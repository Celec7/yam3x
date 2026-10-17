import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/number-field')
})

test('commits the focused edit before a native submit handler reads form data', async ({
  page,
}) => {
  // number-field.form.submit
  const input = page.getByRole('spinbutton', { name: 'Quantity *', exact: true })
  await input.fill('3.5')
  await expect(page.getByTestId('number-quantity')).toHaveText('2')
  await input.evaluate((element: HTMLInputElement) => element.form!.requestSubmit())
  await expect(page.getByTestId('number-submitted')).toHaveText('3.5')
  await expect(page.getByTestId('number-quantity')).toHaveText('3.5')
})

test('blocks invalid edits without submitting the previous value and recovers after correction', async ({
  page,
}) => {
  const input = page.getByRole('spinbutton', { name: 'Quantity *', exact: true })
  await input.fill('-')
  await input.evaluate((element: HTMLInputElement) => element.form!.requestSubmit())
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Enter a valid number.', { exact: true })).toBeVisible()
  await expect(page.getByTestId('number-submitted')).toHaveCount(0)
  await expect(page.getByTestId('number-quantity')).toHaveText('2')
  await input.fill('11')
  await input.blur()
  await expect(page.getByText('Enter a number no greater than 10.', { exact: true })).toBeVisible()
  await expect(input).toHaveValue('11')
  await input.fill('4')
  await input.blur()
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await page.getByRole('button', { name: 'Submit quantity', exact: true }).click()
  await expect(page.getByTestId('number-submitted')).toHaveText('4')
})

test('resets pending edits and native validity to the initial value', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Quantity *', exact: true })
  await input.fill('')
  await input.blur()
  await expect(page.getByText('This field is required.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reset quantity', exact: true }).click()
  await expect(input).toHaveValue('2')
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await expect
    .poll(() => input.evaluate((element: HTMLInputElement) => element.checkValidity()))
    .toBe(true)
  await input.fill('5')
  await input.press('Enter')
  await expect(page.getByTestId('number-submitted')).toHaveText('5')
})

test('formats localized decimals and associates the suffix with the editor', async ({ page }) => {
  // A suffix without a hint must not make FormField rewrite its own observed description.
  const weight = page.getByRole('spinbutton', { name: 'Weight', exact: true })
  await expect(weight).toHaveAttribute('aria-describedby', /^yam3x-number-suffix-/)
  const input = page.getByRole('spinbutton', { name: 'German amount', exact: true })
  await expect(input).toHaveValue('1.234,5')
  await input.fill('1.234,75')
  await input.blur()
  await expect(input).toHaveValue('1.234,75')
  await expect(input).toHaveAttribute('aria-valuenow', '1234.75')
  const description = await input.getAttribute('aria-describedby')
  expect(description).toMatch(/yam3x-number-suffix/)
  const ids = description!.split(/\s+/)
  const text = await page.evaluate(
    (values) => values.map((id) => document.getElementById(id)?.textContent).join(' '),
    ids,
  )
  expect(text).toContain('EUR')
  await input.fill('1.2,3')
  await input.blur()
  await expect(input).toHaveAttribute('aria-invalid', 'true')
})

test('supports decimal keyboard steps, bounds, pointer controls and normal scrolling', async ({
  page,
}) => {
  // number-field.a11y.keyboard
  const input = page.getByRole('spinbutton', { name: 'Weight', exact: true })
  await input.focus()
  await input.press('ArrowUp')
  await input.press('ArrowUp')
  await expect(input).toHaveValue('0.3')
  await input.press('End')
  await expect(input).toHaveValue('10')
  await expect(page.getByRole('button', { name: 'Increase Weight', exact: true })).toBeDisabled()
  await input.press('Home')
  await expect(input).toHaveValue('0')
  await page.getByRole('button', { name: 'Increase Weight', exact: true }).click()
  await expect(input).toHaveValue('0.1')
  await expect(input).toBeFocused()
  await input.press('Control+Home')
  await expect(input).toHaveValue('0.1')
  await input.hover()
  await page.mouse.wheel(0, -100)
  await expect(input).toHaveValue('0.1')
})

test('keeps read-only and disabled editors unchanged and localizes Chinese errors', async ({
  page,
}) => {
  const readonly = page.getByRole('spinbutton', { name: 'Read-only quantity', exact: true })
  await readonly.press('ArrowUp')
  await expect(readonly).toHaveValue('8')
  await expect(
    page.getByRole('spinbutton', { name: 'Disabled quantity', exact: true }),
  ).toBeDisabled()
  await page.goto('/zh/components/number-field')
  const input = page.getByRole('spinbutton', { name: '数量 *', exact: true })
  await input.fill('-')
  await input.blur()
  await expect(page.getByText('请输入有效数字。', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '增加数量', exact: true })).toBeEnabled()
})

test('reserves separate targets and grows with 200% text in a narrow container', async ({
  page,
}) => {
  // number-field.geometry.targets
  await page.setViewportSize({ width: 360, height: 900 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const input = page.getByRole('spinbutton', { name: 'Quantity *', exact: true })
  const field = page.locator('.yam3x-number-field').filter({ has: input })
  const targets = await field.locator('.yam3x-number-field__step').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect()
      return { x: box.x, width: box.width }
    }),
  )
  expect(targets).toHaveLength(2)
  expect(targets[0]!.width).toBeGreaterThanOrEqual(48)
  expect(targets[1]!.width).toBeGreaterThanOrEqual(48)
  expect(targets[1]!.x - targets[0]!.x).toBeGreaterThanOrEqual(48)
  const inputBox = await input.boundingBox()
  expect(inputBox!.width).toBeGreaterThan(32)
  const geometry = await field.locator('.yam3x-form-field__container').evaluate((element) => ({
    height: element.clientHeight,
    overflow: element.scrollWidth > element.clientWidth,
  }))
  expect(geometry.height).toBeGreaterThan(56)
  expect(geometry.overflow).toBe(false)
  await input.fill('3.5')
  await input.blur()
  await expect(page.getByTestId('number-quantity')).toHaveText('3.5')
  await field.screenshot({ path: '/tmp/yam3x-number-field-mobile-200.png' })
})

test('renders outlined, filled, RTL and dark appearances without page errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 1000 })
  const demo = page.locator('.number-field-demo')
  await demo.screenshot({ path: '/tmp/yam3x-number-field-desktop.png' })
  await page.getByRole('checkbox', { name: 'Filled appearance', exact: true }).check()
  const input = page.getByRole('spinbutton', { name: 'Quantity *', exact: true })
  const field = page.locator('.yam3x-number-field').filter({ has: input })
  await expect(field).toHaveClass(/yam3x-form-field--filled/)
  await demo.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await page.getByRole('switch', { name: /dark theme|dark mode/i }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await input.fill('6.5')
  await input.blur()
  await expect(page.getByTestId('number-quantity')).toHaveText('6.5')
  await demo.screenshot({ path: '/tmp/yam3x-number-field-dark-rtl.png' })
  expect(errors).toEqual([])
})
