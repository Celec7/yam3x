import { expect, test } from '@playwright/test'

test.describe('Textarea autosize', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/textarea-autosize')
  })

  test('grows to content, caps at maxRows, and shrinks after deletion', async ({ page }) => {
    const textarea = page.getByTestId('autosize-textarea')
    const initialHeight = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.getBoundingClientRect().height,
    )
    await textarea.fill('one\ntwo\nthree\nfour\nfive\nsix')
    const grownHeight = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.getBoundingClientRect().height,
    )
    const cappedScrolls = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.scrollHeight > el.clientHeight,
    )
    expect(grownHeight).toBeGreaterThan(initialHeight)
    expect(grownHeight).toBe(122)
    expect(cappedScrolls).toBe(true)
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      el.focus()
      el.setSelectionRange(2, 5)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await expect
      .poll(() =>
        textarea.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd]),
      )
      .toEqual([2, 5])
    await expect(textarea).toBeFocused()

    await textarea.fill('one')
    const shrunkHeight = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.getBoundingClientRect().height,
    )
    const stillScrolls = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.scrollHeight > el.clientHeight,
    )
    expect(shrunkHeight).toBe(initialHeight)
    expect(stillScrolls).toBe(false)
  })

  test('remeasures wrapping when the desktop field width changes', async ({ page }) => {
    const textarea = page.getByTestId('autosize-textarea')
    await textarea.fill(
      'A deliberately long sentence that wraps differently when the available desktop field width gets narrower and must grow to reveal more lines.',
    )
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      el.style.width = '180px'
    })
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => el.scrollHeight > el.clientHeight))
      .toBe(true)
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      el.style.width = ''
    })
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => el.scrollHeight > el.clientHeight))
      .toBe(false)
  })

  test('reacts to Vue model changes and preserves native form data', async ({ page }) => {
    const textarea = page.getByTestId('autosize-textarea')
    await page.getByTestId('programmatic-fill').click()
    await expect(textarea).toHaveValue(
      'programmatic one\nprogrammatic two\nprogrammatic three\nprogrammatic four',
    )
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => el.getBoundingClientRect().height))
      .toBeGreaterThan(74)
    const formValue = await textarea.evaluate((el: HTMLTextAreaElement) =>
      new FormData(el.form!).get('message'),
    )
    expect(formValue).toBe(
      'programmatic one\nprogrammatic two\nprogrammatic three\nprogrammatic four',
    )
  })

  test('restores original styles and leaves manual sizing available when autosize is disabled', async ({
    page,
  }) => {
    const textarea = page.getByTestId('autosize-textarea')
    await textarea.fill('one\ntwo\nthree\nfour')
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => el.style.height))
      .not.toBe('')
    await page.getByLabel('Automatically adjust height').uncheck()
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => getComputedStyle(el).resize))
      .toBe('vertical')
    await expect
      .poll(() => textarea.evaluate((el: HTMLTextAreaElement) => el.style.height))
      .toBe('96px')
    await textarea.fill('one\ntwo\nthree\nfour\nfive\nsix')
    await expect(textarea).toHaveJSProperty('value', 'one\ntwo\nthree\nfour\nfive\nsix')
  })

  test('restores directive-owned styles when the textarea unmounts', async ({ page }) => {
    const textarea = page.getByTestId('autosize-textarea')
    const handle = await textarea.elementHandle()
    await textarea.fill('one\ntwo\nthree\nfour')
    await page.getByTestId('remove-textarea').click()
    await expect(textarea).toHaveCount(0)
    expect(await handle!.evaluate((el: HTMLTextAreaElement) => el.style.height)).toBe('96px')
    expect(
      await handle!.evaluate((el: HTMLTextAreaElement) => el.style.getPropertyValue('overflow-y')),
    ).toBe('')
  })
})
