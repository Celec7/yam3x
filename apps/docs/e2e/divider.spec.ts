import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/divider')
})

test('horizontal dividers expose thickness and color while retaining measured insets', async ({
  page,
}) => {
  const fullWidth = page.getByTestId('divider-full-width')
  const inset = page.getByTestId('divider-inset')
  const insetStart = page.getByTestId('divider-inset-start')
  const custom = page.getByTestId('divider-custom')

  await expect(fullWidth).toHaveCSS('height', '1px')
  await expect(fullWidth).toHaveAttribute('aria-hidden', 'true')
  await expect(fullWidth).not.toHaveAttribute('role', 'separator')
  await expect(custom).toHaveCSS('height', '3px')
  await expect(custom.locator('.yam3x-divider__line')).toHaveCSS(
    'background-color',
    'rgb(18, 52, 86)',
  )

  const geometry = await Promise.all(
    [inset, insetStart].map((divider) =>
      divider.evaluate((element) => {
        const root = element.getBoundingClientRect()
        const line = element.querySelector('.yam3x-divider__line')!.getBoundingClientRect()
        return {
          rootLeft: root.left,
          rootRight: root.right,
          lineLeft: line.left,
          lineRight: line.right,
        }
      }),
    ),
  )

  expect(geometry[0].lineLeft - geometry[0].rootLeft).toBe(16)
  expect(geometry[0].rootRight - geometry[0].lineRight).toBe(16)
  expect(geometry[1].lineLeft - geometry[1].rootLeft).toBe(16)
  expect(geometry[1].rootRight - geometry[1].lineRight).toBe(0)

  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  const rtlGeometry = await insetStart.evaluate((element) => {
    const root = element.getBoundingClientRect()
    const line = element.querySelector('.yam3x-divider__line')!.getBoundingClientRect()
    return { leading: line.left - root.left, trailing: root.right - line.right }
  })
  expect(rtlGeometry.leading).toBe(0)
  expect(rtlGeometry.trailing).toBe(16)
})

test('divider CSS custom properties remain available for theme overrides', async ({ page }) => {
  const divider = page.getByTestId('divider-full-width')
  await divider.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--yam3x-divider-thickness', '3px')
    host.style.setProperty('--yam3x-divider-color', 'rgb(12, 34, 56)')
  })

  await expect(divider).toHaveCSS('height', '3px')
  await expect(divider.locator('.yam3x-divider__line')).toHaveCSS(
    'background-color',
    'rgb(12, 34, 56)',
  )

  await page.emulateMedia({ forcedColors: 'active' })
  const systemGrayText = await page.evaluate(() => {
    const probe = document.createElement('span')
    probe.style.color = 'GrayText'
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  await expect(divider.locator('.yam3x-divider__line')).toHaveCSS(
    'background-color',
    systemGrayText,
  )
})

test('explicit props take precedence over inherited Divider overrides', async ({ page }) => {
  const custom = page.getByTestId('divider-custom')
  await custom.evaluate((element) => {
    element.parentElement!.style.setProperty('--yam3x-divider-thickness', '9px')
    element.parentElement!.style.setProperty('--yam3x-divider-color', 'rgb(12, 34, 56)')
  })

  await expect(custom).toHaveCSS('height', '3px')
  await expect(custom.locator('.yam3x-divider__line')).toHaveCSS(
    'background-color',
    'rgb(18, 52, 86)',
  )
})

test('default Divider color follows the System Outline variant in both themes', async ({
  page,
}) => {
  const divider = page.getByTestId('divider-full-width')
  const line = divider.locator('.yam3x-divider__line')
  const systemOutlineVariant = () =>
    page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--md-sys-color-outline-variant)'
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    })

  await page.locator('html').evaluate((element) => {
    element.classList.remove('dark')
    element.removeAttribute('data-theme')
  })
  await expect(line).toHaveCSS('background-color', await systemOutlineVariant())

  await page.locator('html').evaluate((element) => element.setAttribute('data-theme', 'dark'))
  await expect(line).toHaveCSS('background-color', await systemOutlineVariant())
})

test('vertical divider fills its parent height and exposes project separator semantics', async ({
  page,
}) => {
  const divider = page.getByTestId('divider-vertical')
  await expect(divider).toHaveCSS('height', '96px')
  await expect(divider).toHaveCSS('width', '1px')
  await expect(divider).toHaveAttribute('role', 'separator')
  await expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  await expect(divider).not.toHaveAttribute('aria-hidden', 'true')
})
