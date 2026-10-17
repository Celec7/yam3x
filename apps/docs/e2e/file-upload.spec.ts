import { expect, test, type Page } from '@playwright/test'

const txt = (name: string) => ({ name, mimeType: 'text/plain', buffer: Buffer.from('0123456789') })
const row = (page: Page, name: string) =>
  page
    .locator('[data-upload-id]')
    .filter({ has: page.locator('.yam3x-file-upload__name', { hasText: name }) })
const response = (page: Page, name: string) =>
  page.locator('.file-upload-demo__responses section').filter({ hasText: name })
test.beforeEach(async ({ page }) => {
  await page.goto('/components/file-upload')
})

test('resumes scheduled files after disabled actions are enabled again', async ({ page }) => {
  await page
    .locator('input[type="file"]')
    .setInputFiles([txt('first.txt'), txt('second.txt'), txt('third.txt')])
  await page.getByRole('button', { name: 'Upload ready files', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Disable file actions', exact: true }).check()
  await response(page, 'first.txt').getByRole('button', { name: 'Complete', exact: true }).click()
  await response(page, 'second.txt').getByRole('button', { name: 'Complete', exact: true }).click()
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'waiting')
  await page.getByRole('checkbox', { name: 'Disable file actions', exact: true }).uncheck()
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'uploading')
})

test('honors native fieldset disabling and resumes when the fieldset is enabled', async ({
  page,
}) => {
  await page
    .locator('input[type="file"]')
    .setInputFiles([txt('first.txt'), txt('second.txt'), txt('third.txt')])
  await page.getByRole('button', { name: 'Upload ready files', exact: true }).click()
  const fieldset = page.getByRole('group', { name: 'Attachments', exact: true })
  await fieldset.evaluate((element: HTMLFieldSetElement) => {
    element.disabled = true
  })
  await expect(fieldset.getByRole('button', { name: 'Choose files', exact: true })).toBeDisabled()
  await response(page, 'first.txt').getByRole('button', { name: 'Complete', exact: true }).click()
  await response(page, 'second.txt').getByRole('button', { name: 'Complete', exact: true }).click()
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'waiting')
  await fieldset.evaluate((element: HTMLFieldSetElement) => {
    element.disabled = false
  })
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'uploading')
})

test('opens a native picker, retains each selection, and shows type, size, and count rejection reasons', async ({
  page,
}) => {
  // file-upload.selection.constraints
  const chooserEvent = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Choose files', exact: true }).click()
  const chooser = await chooserEvent
  expect(chooser.isMultiple()).toBe(true)
  await chooser.setFiles([
    txt('first.txt'),
    { name: 'wrong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') },
    { name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.alloc(2 * 1024 * 1024 + 1) },
  ])
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'queued')
  await expect(row(page, 'wrong.pdf')).toContainText('This file type is not accepted.')
  await expect(row(page, 'large.txt')).toContainText('This file exceeds the size limit.')
  const picker = page.locator('.yam3x-file-upload input[type="file"]')
  await expect(picker).toHaveValue('')
  await picker.setInputFiles(txt('second.txt'))
  await picker.setInputFiles(txt('third.txt'))
  await picker.setInputFiles(txt('overflow.txt'))
  await expect(row(page, 'overflow.txt')).toContainText('The queue has reached its file limit.')
  await row(page, 'second.txt')
    .getByRole('button', { name: 'Remove second.txt', exact: true })
    .click()
  await picker.setInputFiles(txt('first.txt'))
  await expect(row(page, 'first.txt')).toHaveCount(2)
})

test('limits independent uploads and switches from measured progress to server processing before completion', async ({
  page,
}) => {
  // file-upload.transfer.lifecycle
  await page
    .locator('input[type="file"]')
    .setInputFiles([txt('first.txt'), txt('second.txt'), txt('third.txt')])
  await page.getByRole('button', { name: 'Upload ready files', exact: true }).click()
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'uploading')
  await expect(row(page, 'second.txt')).toHaveAttribute('data-status', 'uploading')
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'waiting')
  const first = response(page, 'first.txt')
  await first.getByRole('button', { name: 'Report 50%', exact: true }).click()
  await expect(row(page, 'first.txt').getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '5',
  )
  await expect(row(page, 'first.txt')).toContainText('50%')
  const summary = page.locator('.yam3x-file-upload [role="status"]')
  await expect(summary).toContainText('2 active')
  await expect(summary).not.toContainText('50%')
  await first.getByRole('button', { name: 'Server processing', exact: true }).click()
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'processing')
  await expect(row(page, 'first.txt').getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  await expect(page.getByTestId('upload-completed')).toHaveText('Completed: 0')
  await first.getByRole('button', { name: 'Complete', exact: true }).click()
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'completed')
  await expect(row(page, 'third.txt')).toHaveAttribute('data-status', 'uploading')
  await response(page, 'second.txt').getByRole('button', { name: 'Reject', exact: true }).click()
  await expect(row(page, 'second.txt')).toContainText('The server rejected this file. Try again.')
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'completed')
  await row(page, 'second.txt')
    .getByRole('button', { name: 'Retry second.txt', exact: true })
    .click()
  await expect(row(page, 'second.txt')).not.toContainText('The server rejected this file.')
  await response(page, 'second.txt').getByRole('button', { name: 'Complete', exact: true }).click()
  await expect(page.getByTestId('upload-completed')).toHaveText('Completed: 2')
})

test('cancels active work and restores focus when the focused queue entry disappears', async ({
  page,
}) => {
  // file-upload.transfer.cancellation
  await page.locator('input[type="file"]').setInputFiles([txt('first.txt'), txt('second.txt')])
  await row(page, 'first.txt')
    .getByRole('button', { name: 'Upload first.txt', exact: true })
    .click()
  await row(page, 'first.txt')
    .getByRole('button', { name: 'Cancel first.txt', exact: true })
    .click()
  await expect(row(page, 'first.txt')).toHaveAttribute('data-status', 'canceled')
  await expect(row(page, 'first.txt')).toContainText('a server copy may remain')
  await expect(response(page, 'first.txt')).toHaveCount(0)
  await row(page, 'first.txt')
    .getByRole('button', { name: 'Remove first.txt', exact: true })
    .click()
  await expect(page.locator('.yam3x-file-upload')).toContainText(
    'Removed “first.txt” from the queue. A server copy may remain',
  )
  await expect(
    row(page, 'second.txt').getByRole('button', { name: 'Upload second.txt', exact: true }),
  ).toBeFocused()
  await row(page, 'second.txt')
    .getByRole('button', { name: 'Remove second.txt', exact: true })
    .click()
  await expect(page.getByRole('button', { name: 'Choose files', exact: true })).toBeFocused()
})

test('applies the same checks to drops and prevents disabled or unavailable drops from changing the queue', async ({
  page,
}) => {
  const data = await page.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['text'], 'dropped.txt', { type: 'text/plain' }))
    transfer.items.add(new File(['pdf'], 'dropped.pdf', { type: 'application/pdf' }))
    return transfer
  })
  const area = page.locator('.yam3x-file-upload__selection')
  await area.dispatchEvent('dragenter', { dataTransfer: data })
  await expect(area).toHaveClass(/--dragging/)
  await expect(area).toContainText('Drop to add these files.')
  await area.dispatchEvent('drop', { dataTransfer: data })
  await expect(row(page, 'dropped.txt')).toHaveAttribute('data-status', 'queued')
  await expect(row(page, 'dropped.pdf')).toContainText('This file type is not accepted.')
  await expect(area).not.toHaveClass(/--dragging/)
  await page.getByRole('checkbox', { name: 'Disable file actions', exact: true }).check()
  await expect(page.getByRole('button', { name: 'Choose files', exact: true })).toBeDisabled()
  await area.dispatchEvent('drop', { dataTransfer: data })
  await expect(page.locator('[data-upload-id]')).toHaveCount(2)
  await page.getByRole('checkbox', { name: 'Disable file actions', exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'Offer drag and drop', exact: true }).uncheck()
  await area.dispatchEvent('drop', { dataTransfer: data })
  await expect(page.locator('[data-upload-id]')).toHaveCount(2)
  await expect(area).not.toHaveClass(/--drop/)
  await data.dispose()
})

test('wraps long file names and actions at enlarged text size in RTL and localizes Chinese feedback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const group = page.getByRole('group', { name: 'Attachments', exact: true })
  await group.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await page
    .locator('input[type="file"]')
    .setInputFiles(txt('very-long-supporting-document-文件-without-truncation.txt'))
  expect(await group.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await group.screenshot({ path: '/tmp/yam3x-file-upload-mobile.png' })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(group.getByRole('button', { name: 'Choose files', exact: true })).toBeVisible()
  await page.goto('/zh/components/file-upload')
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'wrong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') })
  await expect(page.getByRole('group', { name: '附件', exact: true })).toContainText(
    '不接受此文件类型。',
  )
  await expect(page.getByRole('button', { name: '移除 wrong.pdf', exact: true })).toBeVisible()
})
