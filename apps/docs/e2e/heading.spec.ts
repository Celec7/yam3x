import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/heading')
})

test('optional levels expose native heading semantics while default content stays passive', async ({
  page,
}) => {
  const examples = page.locator('.yam3x-demo .yam3x-heading')
  // heading.extension.semantic-level
  await expect(examples).toHaveCount(27)
  await expect(page.getByRole('heading', { name: 'Semantic level 1', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Semantic level 2', level: 2 })).toBeVisible()
  await expect(
    page.getByText('Plain text without heading semantics', { exact: true }),
  ).not.toHaveAttribute('role')
  await expect(
    page.getByText('Plain text without heading semantics', { exact: true }),
  ).not.toHaveAttribute('aria-level')
  await expect(page.getByTestId('heading-title-small')).toHaveCSS('display', 'block')
})

test('all standard and emphasized type scale properties accept their m3e token overrides', async ({
  page,
}) => {
  await expect(page.locator('.yam3x-demo .yam3x-heading')).toHaveCount(27)
  const values = await page.evaluate(() => {
    const results: Array<{ name: string; actual: string; expected: string }> = []
    const families = ['display', 'headline', 'title', 'label']
    const sizes = ['small', 'medium', 'large']
    const emphases = ['', 'emphasized-']
    const properties = [
      { suffix: 'font-size', value: '31px', read: 'fontSize' },
      { suffix: 'font-weight', value: '650', read: 'fontWeight' },
      { suffix: 'line-height', value: '37px', read: 'lineHeight' },
      { suffix: 'tracking', value: '1.25px', read: 'letterSpacing' },
    ] as const

    for (const emphasis of emphases) {
      for (const family of families) {
        for (const size of sizes) {
          const testId = `heading-${emphasis}${family}-${size}`
          const heading = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
          if (!heading) throw new Error(`Missing rendered type scale example: ${testId}`)
          for (const property of properties) {
            const name = `--md-sys-typescale-${emphasis}${family}-${size}-${property.suffix}`
            heading.style.setProperty(name, property.value)
            const actual = getComputedStyle(heading)[property.read]
            results.push({ name, actual, expected: property.value })
          }
        }
      }
    }
    return results
  })
  expect(values).toHaveLength(96)
  expect(values.filter((value) => value.actual !== value.expected)).toEqual([])
})

test('uses the pinned defaults, inherits typography and color, and honors hidden state', async ({
  page,
}) => {
  const medium = page.getByTestId('heading-title-medium')
  const emphasized = page.getByTestId('heading-emphasized-title-medium')
  await expect(medium).toHaveCSS('font-size', '16px')
  await expect(medium).toHaveCSS('font-weight', '500')
  await expect(medium).toHaveCSS('line-height', '24px')
  await expect(emphasized).toHaveCSS('font-weight', '700')
  await expect(emphasized).toHaveCSS('line-height', '24px')
  const styleOwnership = await medium.evaluate((element) => {
    const style = (element as HTMLElement).style
    return {
      directFontSize: style.fontSize,
      directFontWeight: style.fontWeight,
      componentFontSize: style.getPropertyValue('--_yam3x-heading-font-size'),
      componentFontWeight: style.getPropertyValue('--_yam3x-heading-font-weight'),
    }
  })
  expect(styleOwnership.directFontSize).toBe('')
  expect(styleOwnership.directFontWeight).toBe('')
  expect(styleOwnership.componentFontSize).toBe('var(--md-sys-typescale-title-medium-font-size)')
  expect(styleOwnership.componentFontWeight).toBe(
    'var(--md-sys-typescale-title-medium-font-weight)',
  )

  const custom = page.getByTestId('heading-label-large')
  await page.locator('.yam3x-demo').evaluate((element) => {
    const demo = element as HTMLElement
    demo.style.fontFamily = 'serif'
    demo.style.color = 'rgb(12, 34, 56)'
  })
  await custom.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty('--md-sys-typescale-label-large-font-size', '25px')
  })
  await expect(custom).toHaveCSS('font-size', '25px')
  await expect(custom).toHaveCSS('font-family', /serif/)
  await expect(custom).toHaveCSS('color', 'rgb(12, 34, 56)')
  await custom.evaluate((element) => {
    ;(element as HTMLElement).setAttribute('hidden', '')
  })
  await expect(custom).toBeHidden()
  await custom.evaluate((element) => {
    ;(element as HTMLElement).removeAttribute('hidden')
  })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(custom).toBeVisible()
})
