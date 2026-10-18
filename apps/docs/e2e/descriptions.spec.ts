import { expect, test } from '@playwright/test'

test('descriptions.content.association: names the native list and retains source order and native link focus', async ({
  page,
}) => {
  await page.goto('/components/descriptions')
  const demo = page.getByTestId('descriptions-demo')
  const list = demo.locator('dl')
  const title = demo.getByRole('heading', { name: 'Project details', level: 3 })
  await expect(list).toHaveAttribute('aria-labelledby', (await title.getAttribute('id'))!)
  await expect(list.locator('dt')).toHaveText([
    'Project',
    'Owner',
    'Remaining budget',
    'Contact',
    'Notifications',
    'Review date',
    'Notes',
  ])
  await expect(list.locator('dd').nth(2)).toHaveText('0')
  const link = demo.getByRole('link', { name: 'ada@example.com' })
  await link.focus()
  await expect(link).toBeFocused()
  const before = await list
    .locator('dd')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  await list.locator('dd').first().hover()
  await expect(list.locator('dd').first()).toHaveCSS('background-color', before)
  await expect(list.locator('[tabindex]')).toHaveCount(0)
})

test('descriptions.layout.responsive: adapts to its container and keeps full-width attributes and long values readable in RTL at enlarged text', async ({
  page,
}) => {
  await page.goto('/components/descriptions')
  const demo = page.getByTestId('descriptions-demo')
  const component = demo.locator('.yam3x-descriptions')
  const list = demo.locator('dl')
  // Width is controlled by the component's container, independently of the page viewport.
  for (const [width, count] of [
    [340, 1],
    [700, 2],
    [1000, 3],
  ] as const) {
    await component.evaluate((element, size) => {
      ;(element as HTMLElement).style.width = `${size}px`
    }, width)
    await expect
      .poll(async () =>
        list.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
      )
      .toBe(count)
  }
  await component.evaluate((element) => {
    ;(element as HTMLElement).style.width = '340px'
  })
  await demo.getByRole('checkbox', { name: 'Narrow container', exact: true }).check()
  await demo.getByRole('checkbox', { name: 'Inline labels', exact: true }).check()
  await component.evaluate((element) => {
    element.setAttribute('dir', 'rtl')
    element.querySelector('dd')!.textContent = 'verylongidentifier'.repeat(20)
    for (const text of element.querySelectorAll('dt, dd'))
      (text as HTMLElement).style.fontSize = '32px'
  })
  await expect
    .poll(async () => component.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeLessThanOrEqual(2)
  const first = list.locator('.yam3x-descriptions__item').first()
  expect((await first.locator('dt').boundingBox())!.x).toBeGreaterThan(
    (await first.locator('dd').boundingBox())!.x,
  )
  const notes = list.locator('.yam3x-descriptions__item--full')
  expect((await notes.boundingBox())!.width).toBeCloseTo((await list.boundingBox())!.width, 0)
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(component).toHaveCSS('border-top-style', 'solid')
})

test('descriptions.content.empty: Chinese defaults distinguish absent attributes from an empty record', async ({
  page,
}) => {
  await page.goto('/zh/components/descriptions')
  const demo = page.getByTestId('descriptions-demo')
  await expect(demo.locator('dd').nth(5)).toHaveText('未提供')
  await expect(demo.locator('dd').nth(4)).toHaveText('关闭')
  await demo.getByRole('checkbox', { name: '空记录', exact: true }).check()
  await expect(demo.locator('dl')).toHaveCount(0)
  await expect(demo.locator('.yam3x-descriptions__empty')).toHaveText('暂无详情')
})
