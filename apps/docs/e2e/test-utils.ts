import type { Locator, Page } from '@playwright/test'

export async function selectM3Option(page: Page, control: Locator, value: string): Promise<void> {
  await control.click()
  const listboxId = await control.getAttribute('aria-controls')
  if (!listboxId) throw new Error('The M3 Select did not expose its open listbox.')
  await page.locator(`#${listboxId} [role="option"][data-value=${JSON.stringify(value)}]`).click()
}

export async function setM3SliderValue(control: Locator, value: number): Promise<void> {
  const readValue = async () => Number(await control.inputValue())
  await control.press('Home')
  let current = await readValue()
  if (!Number.isFinite(current)) throw new Error('The M3 Slider did not expose a numeric value.')

  while (current < value) {
    await control.press('ArrowUp')
    const next = await readValue()
    if (!Number.isFinite(next) || next <= current)
      throw new Error(`The M3 Slider did not advance from ${current}.`)
    current = next
  }

  if (current !== value) throw new Error(`The M3 Slider settled at ${current}, not ${value}.`)
}
