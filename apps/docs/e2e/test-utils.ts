import type { Locator, Page } from '@playwright/test'

export async function selectM3Option(page: Page, control: Locator, value: string): Promise<void> {
  const trigger = control.and(page.getByRole('combobox'))
  await trigger.click()
  const listboxId = await trigger.getAttribute('aria-controls')
  if (!listboxId) throw new Error('The M3 Select did not expose its open listbox.')
  await page.locator(`#${listboxId} [role="option"][data-value=${JSON.stringify(value)}]`).click()
}

export async function setM3SliderValue(control: Locator, value: number): Promise<void> {
  const readValue = async () => Number(await control.inputValue())
  let step = 0
  let current = await readValue()
  if (!Number.isFinite(current)) throw new Error('The M3 Slider did not expose a numeric value.')

  while (current !== value) {
    const increasing = current < value
    const page = step > 0 && Math.abs(value - current) >= step * 10
    await control.press(
      increasing ? (page ? 'PageUp' : 'ArrowUp') : page ? 'PageDown' : 'ArrowDown',
    )
    const next = await readValue()
    if (
      !Number.isFinite(next) ||
      (increasing ? next <= current || next > value : next >= current || next < value)
    )
      throw new Error(`The M3 Slider could not move from ${current} toward ${value}; got ${next}.`)
    if (!page) step = Math.abs(next - current)
    current = next
  }
}
