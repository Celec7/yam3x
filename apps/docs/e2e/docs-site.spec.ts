import { expect, test } from '@playwright/test'

test('public guides lead from installation to design foundations and component references', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Get started', exact: true }).first().click()
  await expect(page).toHaveURL('/guide/installation')
  await expect(
    page.getByRole('heading', { name: 'Installation and first use', level: 1 }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Update copied source' }).first().click()
  await expect(page).toHaveURL('/guide/updating')
  await page.getByRole('link', { name: 'Design foundations', exact: true }).first().click()
  await expect(page).toHaveURL('/guide/design')
  await page.getByRole('link', { name: 'Color and theming' }).first().click()
  await expect(page).toHaveURL('/guide/theme')
  await page.getByRole('link', { name: 'Components', exact: true }).first().click()
  await expect(page).toHaveURL('/components/')
  await page.getByRole('link', { name: 'Buttons', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Use in your app' })).toBeVisible()
  await expect(
    page.locator('a[href="https://m3.material.io/components/buttons/overview"]'),
  ).toHaveCount(1)
})

test('component navigation and copyable examples are available on documentation pages', async ({
  page,
}) => {
  await page.goto('/components/chips')

  await expect(page.getByRole('heading', { name: 'Chips', level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Badges', exact: true })).toHaveAttribute(
    'href',
    '/components/badge',
  )
  await expect(page.getByRole('link', { name: 'Button group' })).toHaveAttribute(
    'href',
    '/components/button-group',
  )
  await expect(page.locator('#filters').first()).toBeVisible()
  const demoSources = page.getByText('View demo source', { exact: true })
  await expect(demoSources).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'Copy Code' })).toHaveCount(1)
  for (const source of await demoSources.all()) await source.click()
  await expect(page.getByRole('button', { name: 'Copy Code' })).toHaveCount(5)
  await expect(page.getByRole('button', { name: 'Refresh content' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Participants' })).toBeVisible()
  const primaryTopic = page.getByRole('grid', { name: 'Primary topic' })
  await expect(primaryTopic.getByRole('gridcell', { name: 'Design' })).toBeVisible()
  const multiFilters = page.getByRole('grid', { name: 'More topics' })
  const design = multiFilters.getByRole('gridcell', { name: 'Design' })
  const engineering = multiFilters.getByRole('gridcell', { name: 'Engineering' })
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await engineering.click()
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await expect(engineering).toHaveAttribute('aria-selected', 'true')
})

test('docs navigation and component pages fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/divider')

  await expect(page.getByRole('heading', { name: 'Divider', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Horizontal divider', level: 3 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vertical divider', level: 3 })).toBeVisible()
  const demoSources = page.getByText('View demo source', { exact: true })
  await expect(demoSources).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Copy Code' })).toHaveCount(1)
  for (const source of await demoSources.all()) await source.click()
  await expect(page.getByRole('button', { name: 'Copy Code' })).toHaveCount(3)
  expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
    390,
  )
})

test('registry color utility classes follow the VitePress light and dark themes', async ({
  page,
}) => {
  await page.goto('/components/button')
  await page.locator('.yam3x-demo').first().locator('.yam3x-button--elevated').first().waitFor()
  const modeSwitch = page.getByRole('switch')
  const html = page.locator('html')
  const isDark = () => html.evaluate((element) => element.classList.contains('dark'))
  if (await isDark()) await modeSwitch.click()

  const save = page.getByRole('button', { name: 'Save', exact: true })
  const colors = async () =>
    page.evaluate(() => {
      const parse = (value: string) => {
        const match = value.match(/^#([\da-f]{6})$/i)
        if (!match) throw new Error(`Expected a hex semantic token, received ${value}`)
        const hex = Number.parseInt(match[1]!, 16)
        return `rgb(${(hex >> 16) & 255}, ${(hex >> 8) & 255}, ${hex & 255})`
      }
      const demo = document.querySelector('.yam3x-demo')!
      const button = demo.querySelector('.yam3x-button--filled')!
      const elevated = demo.querySelector('.yam3x-button--elevated')!
      const style = getComputedStyle(button)
      const elevatedStyle = getComputedStyle(elevated)
      const root = getComputedStyle(document.documentElement)
      return {
        background: style.backgroundColor,
        foreground: style.color,
        elevatedBackground: elevatedStyle.backgroundColor,
        primary: parse(root.getPropertyValue('--md-sys-color-primary').trim()),
        onPrimary: parse(root.getPropertyValue('--md-sys-color-on-primary').trim()),
        surfaceContainerLow: parse(
          root.getPropertyValue('--md-sys-color-surface-container-low').trim(),
        ),
      }
    })

  await expect(html).not.toHaveClass(/dark/)
  await expect
    .poll(async () => {
      const value = await colors()
      return (
        value.background === value.primary &&
        value.foreground === value.onPrimary &&
        value.elevatedBackground === value.surfaceContainerLow
      )
    })
    .toBe(true)
  const lightColors = await colors()

  await modeSwitch.click()
  await expect(html).toHaveClass(/dark/)
  await page.locator('.yam3x-demo').first().locator('.yam3x-button--elevated').first().waitFor()
  await expect
    .poll(async () => {
      const value = await colors()
      return (
        value.background === value.primary &&
        value.foreground === value.onPrimary &&
        value.elevatedBackground === value.surfaceContainerLow &&
        value.surfaceContainerLow !== lightColors.surfaceContainerLow
      )
    })
    .toBe(true)
  await expect(save).toBeVisible()
})
