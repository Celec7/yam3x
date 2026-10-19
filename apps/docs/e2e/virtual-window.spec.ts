import { expect, test } from '@playwright/test'

for (const kind of ['select', 'autocomplete'] as const) {
  for (const padding of [undefined, 0, 64]) {
    test(`${kind}.virtual.catalog: zero overscan covers the viewport and reaches edges (padding=${padding ?? 'default'})`, async ({
      page,
    }) => {
      await page.goto(`/components/${kind}`)
      const example = page.getByTestId(
        kind === 'select' ? 'select-virtual' : 'autocomplete-virtual',
      )
      await example.getByRole('checkbox', { name: 'Use zero overscan', exact: true }).check()
      if (kind === 'autocomplete' && padding !== undefined)
        await example.locator('.yam3x-autocomplete').evaluate((element, padding) => {
          ;(element as HTMLElement).style.setProperty(
            '--yam3x-autocomplete-popup-padding-block',
            `${padding}px`,
          )
        }, padding)
      const trigger = example.getByRole('combobox', {
        name: kind === 'select' ? 'Large catalog' : 'Large suggestion catalog',
        exact: true,
      })
      await trigger.click()
      const list = page.getByRole('listbox', {
        name: kind === 'select' ? 'Large catalog' : 'Large suggestion catalog suggestions',
        exact: true,
      })
      if (kind === 'select' && padding !== undefined)
        await list.evaluate((element, padding) => {
          ;(element as HTMLElement).style.setProperty(
            '--yam3x-option-panel-container-padding-block',
            `${padding}px`,
          )
        }, padding)
      await list.evaluate((element) => {
        element.scrollTop = 1500
      })
      await expect
        .poll(() =>
          list.evaluate((element) => {
            const box = element.getBoundingClientRect()
            const rows = [...element.querySelectorAll('[role="option"]')]
              .map((row) => {
                const rect = row.getBoundingClientRect()
                return { top: rect.top - box.top, bottom: rect.bottom - box.top }
              })
              .filter((row) => row.bottom > 0 && row.top < element.clientHeight)
              .sort((a, b) => a.top - b.top)
            return (
              rows.length > 0 &&
              rows[0]!.top <= 1 &&
              rows.at(-1)!.bottom >= element.clientHeight - 1 &&
              rows.every((row, index) => index === 0 || row.top - rows[index - 1]!.bottom <= 1)
            )
          }),
        )
        .toBe(true)
      expect(await list.getByRole('option').count()).toBeLessThan(35)
      await trigger.press(kind === 'select' ? 'End' : 'ArrowUp')
      await expect(list.getByRole('option', { name: 'Item 10000', exact: true })).toBeInViewport({
        ratio: 0.95,
      })
      await list.evaluate((element) => {
        element.scrollTop = 0
      })
      await expect(list.getByRole('option', { name: 'Item 1', exact: true })).toBeInViewport({
        ratio: 0.95,
      })
    })
  }
}
