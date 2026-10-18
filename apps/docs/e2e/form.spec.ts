import { expect, test, type Page } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/form')
})
async function validContact(page: Page) {
  await page.getByRole('textbox', { name: 'Email *', exact: true }).fill('person@example.com')
  await expect(page.getByRole('textbox', { name: 'Email *', exact: true })).toHaveValue(
    'person@example.com',
  )
  await selectM3Option(page, page.getByRole('combobox', { name: 'Language *', exact: true }), 'en')
}

test('validates on submit, exposes local errors and linked summary, and focuses the visible Select', async ({
  page,
}) => {
  // form.validation.summary
  const form = page.locator('#settings-form')
  await expect(form.locator('.yam3x-form__summary [role="alert"]')).toHaveCount(0)
  await form.getByRole('button', { name: 'Save settings', exact: true }).click()
  const summary = form.getByRole('group', { name: 'Review this form', exact: true })
  await expect(summary).toBeFocused()
  await expect(summary.getByRole('link')).toHaveCount(2)
  await expect(page.getByTestId('form-requests')).toHaveText('0')
  const email = page.getByRole('textbox', { name: 'Email *', exact: true })
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  const languageField = form
    .locator('.yam3x-form-field')
    .filter({ has: page.getByRole('combobox', { name: 'Language *', exact: true }) })
  await expect(languageField.locator('.yam3x-form-field__error')).toContainText('Please select')
  await summary.getByRole('link', { name: /^Language/ }).click()
  await expect(page.getByRole('combobox', { name: 'Language *', exact: true })).toBeFocused()
  await validContact(page)
  await expect(summary).toHaveCount(0)
  await expect(languageField.locator('.yam3x-form-field__error')).toHaveCount(0)
})

test('commits a focused Number field before reading FormData and includes the submitter', async ({
  page,
}) => {
  // form.validation.ownership
  await validContact(page)
  const seats = page.getByRole('spinbutton', { name: 'Seats *', exact: true })
  await seats.fill('4')
  const save = page.getByRole('button', { name: 'Save settings', exact: true })
  await save.evaluate((element: HTMLButtonElement) => element.form!.requestSubmit(element))
  await expect(page.getByTestId('form-successes')).toHaveText('1')
  const data = JSON.parse((await page.getByTestId('form-request').textContent())!)
  expect(data).toEqual({ email: 'person@example.com', language: 'en', seats: '4', intent: 'save' })
})

test('maps adapter errors to Number field and preserves values through correction', async ({
  page,
}) => {
  await validContact(page)
  const seats = page.getByRole('spinbutton', { name: 'Seats *', exact: true })
  await seats.fill('7')
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  const form = page.locator('#settings-form')
  const summary = form.getByRole('group', { name: 'Review this form', exact: true })
  await expect(summary).toContainText('This workspace supports up to 5 seats.')
  await expect(seats).toHaveValue('7')
  await expect(seats).toHaveAttribute('aria-invalid', 'true')
  await summary.getByRole('link', { name: /^Seats/ }).click()
  await expect(seats).toBeFocused()
  await seats.fill('3')
  await seats.blur()
  await expect(summary).toHaveCount(0)
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await expect(page.getByTestId('form-successes')).toHaveText('1')
})

test('blocks duplicates and discards a submission response after editing without losing new input', async ({
  page,
}) => {
  // form.submission.concurrent
  await validContact(page)
  await page.getByRole('checkbox', { name: 'Hold server response', exact: true }).check()
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Save settings', exact: true })).toBeDisabled()
  await expect(page.locator('#settings-form > [role="status"]')).toHaveText('Submitting…')
  await page.locator('#settings-form').evaluate((element: HTMLFormElement) => {
    element.requestSubmit()
    element.requestSubmit()
  })
  await expect(page.getByTestId('form-requests')).toHaveText('1')
  const email = page.getByRole('textbox', { name: 'Email *', exact: true })
  await email.fill('new@example.com')
  await page.getByRole('button', { name: 'Return failure', exact: true }).click()
  await expect(page.getByTestId('form-outdated')).toHaveText('1')
  await expect(page.locator('#settings-form')).toContainText('Values changed during submission.')
  await expect(email).toHaveValue('new@example.com')
  await expect(page.getByTestId('form-successes')).toHaveText('0')
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await page.getByRole('button', { name: 'Return success', exact: true }).click()
  await expect(page.getByTestId('form-successes')).toHaveText('1')
})

test('retains values after a current failure and resets to each mounted record session', async ({
  page,
}) => {
  // form.reset.session
  await validContact(page)
  await page.getByRole('checkbox', { name: 'Hold server response', exact: true }).check()
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await page.getByRole('button', { name: 'Return failure', exact: true }).click()
  await expect(page.locator('#settings-form .yam3x-form__summary [role="alert"]')).toContainText(
    'Settings could not be saved.',
  )
  await expect(page.getByRole('textbox', { name: 'Email *', exact: true })).toHaveValue(
    'person@example.com',
  )
  await page.getByRole('button', { name: 'Reset settings', exact: true }).click()
  await expect(page.locator('#settings-form .yam3x-form__summary [role="alert"]')).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Email *', exact: true })).toHaveValue('')
  await page.getByRole('button', { name: 'Load another record', exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Seats *', exact: true }).fill('4')
  await page.getByRole('button', { name: 'Reset settings', exact: true }).click()
  await expect(page.getByRole('spinbutton', { name: 'Seats *', exact: true })).toHaveValue('3')
  await expect(page.getByRole('textbox', { name: 'Email *', exact: true })).toHaveValue(
    'team@example.com',
  )
})

test('does not link to hidden fields or lose their values when they are revealed', async ({
  page,
}) => {
  const show = page.getByRole('checkbox', { name: 'Show contact fields', exact: true })
  await show.uncheck()
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  const summary = page.getByRole('group', { name: 'Review this form', exact: true })
  await expect(summary).toContainText('Email')
  await expect(summary.getByRole('link')).toHaveCount(0)
  await show.check()
  await validContact(page)
  await show.uncheck()
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await expect(page.getByTestId('form-successes')).toHaveText('1')
  await show.check()
  await expect(page.getByRole('textbox', { name: 'Email *', exact: true })).toHaveValue(
    'person@example.com',
  )
})

test('wraps errors and actions at 200% text in narrow RTL regions and localizes Chinese feedback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const form = page.locator('#settings-form')
  await form.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await page.getByRole('button', { name: 'Save settings', exact: true }).click()
  await expect(form.locator('.yam3x-form__summary [role="alert"]')).toBeVisible()
  const overflow = await form.evaluate((element) => element.scrollWidth > element.clientWidth)
  expect(overflow).toBe(false)
  await form.screenshot({ path: '/tmp/yam3x-form-mobile.png' })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(form.getByRole('button', { name: 'Reset settings', exact: true })).toBeVisible()
  await page.goto('/zh/components/form')
  await page.getByRole('button', { name: '保存设置', exact: true }).click()
  await expect(page.getByRole('heading', { name: '请检查这份表单', exact: true })).toBeVisible()
})

test('inherited section disabling preserves the field presentation and restores editing', async ({
  page,
}) => {
  const field = page.locator('#settings-form .yam3x-number-field')
  await field.evaluate((element) => {
    element.closest('fieldset')!.disabled = true
  })
  await expect(field.getByRole('spinbutton')).toBeDisabled()
  await expect(field).toHaveClass(/yam3x-form-field--disabled/)
  await field.evaluate((element) => {
    element.closest('fieldset')!.disabled = false
  })
  await expect(field).not.toHaveClass(/yam3x-form-field--disabled/)
  await expect(field.getByRole('spinbutton')).toBeEnabled()
})

test('form.validation.partial: checks a nested group without submitting or moving focus and adapts schema errors', async ({
  page,
}) => {
  const example = page.getByTestId('form-registered')
  const check = example.getByRole('button', { name: 'Check profile', exact: true })
  await check.click()
  await expect(check).toBeFocused()
  await expect(example.getByTestId('registered-result')).toHaveText('invalid')
  await expect(example.getByTestId('registered-saved')).toHaveText('0')
  const summary = example.getByRole('group', { name: 'Review this form', exact: true })
  await expect(summary).toContainText('Use at least three letters.')
  await expect(summary).toContainText('Use at least four characters.')
  await example.getByRole('textbox', { name: 'Display name', exact: true }).fill('Ada')
  await example.getByRole('textbox', { name: 'Alias', exact: true }).fill('reserved')
  await check.click()
  await expect(summary).toContainText('Choose another alias.')
  await summary.getByRole('link', { name: /^Alias:/ }).click()
  await expect(example.getByRole('textbox', { name: 'Alias', exact: true })).toBeFocused()
  await example.getByRole('textbox', { name: 'Alias', exact: true }).fill('writer')
  await check.click()
  await expect(example.getByTestId('registered-result')).toHaveText('valid')
  await expect(summary).toHaveCount(0)
  await example.getByRole('button', { name: 'Save profile', exact: true }).click()
  await expect(example.getByTestId('registered-saved')).toHaveText('1')
})

test('form.fields.lifecycle: removes child rules while retaining its value and restores them when shown', async ({
  page,
}) => {
  const example = page.getByTestId('form-registered')
  await example.getByRole('textbox', { name: 'Display name', exact: true }).fill('Ada')
  const show = example.getByRole('checkbox', { name: 'Register alias field', exact: true })
  await show.uncheck()
  await expect(example.getByRole('textbox', { name: 'Alias', exact: true })).toHaveCount(0)
  await expect(example.getByTestId('registered-alias')).toHaveText('Retained alias: ab')
  await example.getByRole('button', { name: 'Check profile', exact: true }).click()
  await expect(example.getByTestId('registered-result')).toHaveText('valid')
  await show.check()
  await expect(example.getByRole('textbox', { name: 'Alias', exact: true })).toHaveValue('ab')
  await example.getByRole('button', { name: 'Check profile', exact: true }).click()
  await expect(example.getByTestId('registered-result')).toHaveText('invalid')
  await expect(example.getByRole('group', { name: 'Review this form', exact: true })).toContainText(
    'Use at least four characters.',
  )
})

test('form.fields.lifecycle: cancels pending rule results after an edit and retains the operation lock until settlement', async ({
  page,
}) => {
  const example = page.getByTestId('form-registered')
  await example.getByRole('textbox', { name: 'Display name', exact: true }).fill('Ada')
  await example.getByRole('textbox', { name: 'Alias', exact: true }).fill('writer')
  await example.getByRole('checkbox', { name: 'Hold name validation', exact: true }).check()
  await example.getByRole('button', { name: 'Check profile', exact: true }).click()
  await expect(example.getByRole('button', { name: 'Save profile', exact: true })).toBeDisabled()
  await example.getByRole('textbox', { name: 'Display name', exact: true }).fill('Grace')
  await expect(example.getByText('Previous validation canceled.', { exact: true })).toBeVisible()
  await expect(example.getByRole('button', { name: 'Check profile', exact: true })).toBeDisabled()
  await example.getByRole('button', { name: 'Return validation error', exact: true }).click()
  await expect(example.getByTestId('registered-result')).toHaveText('outdated')
  await expect(example.getByText('This name is unavailable.', { exact: true })).toHaveCount(0)
  await expect(example.getByRole('textbox', { name: 'Display name', exact: true })).toHaveValue(
    'Grace',
  )
  await expect(example.getByTestId('registered-saved')).toHaveText('0')
})

test('shows application-localized registered rule feedback on the Chinese page', async ({
  page,
}) => {
  await page.goto('/zh/components/form')
  const example = page.getByTestId('form-registered')
  await example.getByRole('button', { name: '校验个人资料', exact: true }).click()
  const summary = example.getByRole('group', { name: '请检查这份表单', exact: true })
  await expect(summary).toContainText('请至少输入三个字母。')
  await expect(summary).toContainText('请至少输入四个字符。')
  await example.screenshot({ path: '/tmp/yam3x-form-registered-zh.png' })
})

test('form.reset.session: registered parent and child values reset even before the first edit', async ({
  page,
}) => {
  const example = page.getByTestId('form-registered')
  const name = example.getByRole('textbox', { name: 'Display name', exact: true })
  const alias = example.getByRole('textbox', { name: 'Alias', exact: true })
  const reset = example.getByRole('button', { name: 'Reset profile', exact: true })
  await reset.click()
  await expect(name).toHaveValue('Al')
  await expect(alias).toHaveValue('ab')
  await name.fill('Grace')
  await alias.fill('writer')
  await example.getByRole('button', { name: 'Check profile', exact: true }).click()
  await expect(example.getByTestId('registered-result')).toHaveText('valid')
  await reset.click()
  await expect(name).toHaveValue('Al')
  await expect(alias).toHaveValue('ab')
  await expect(example.getByTestId('registered-result')).toHaveText('—')
  await expect(example.getByRole('group', { name: 'Review this form', exact: true })).toHaveCount(0)
})
