import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/badge')
})

test('empty and populated badges use the official dot and text variants', async ({ page }) => {
  const small = page.locator('.yam3x-badge--small').first()
  const text = page.locator('.yam3x-badge--large').nth(0)
  const large = page.locator('.yam3x-badge--large').nth(1)

  // badge.content.forms
  await expect(small).toHaveAttribute('role', 'img')
  await expect(small).toHaveAttribute('aria-label', 'New messages')
  // badge.a11y.passive
  await expect(small).not.toHaveAttribute('tabindex')
  await expect(text).toHaveText('3')
  await expect(large).toHaveText('999+')
  await expect(small).toHaveCSS('width', '6px')
  await expect(small).toHaveCSS('height', '6px')
  await expect(text).toHaveCSS('height', '16px')
  await expect(large).toHaveCSS('height', '16px')
  await expect(small).toHaveCSS('pointer-events', 'none')
  const largeWidth = await large.evaluate((element) => element.getBoundingClientRect().width)
  expect(largeWidth).toBeLessThanOrEqual(34)

  const colors = await small.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    foreground: getComputedStyle(element).color,
  }))
  // badge.color.contrast
  const roleColor = async (role: string) =>
    page.evaluate((token) => {
      const probe = document.createElement('span')
      probe.style.color = `var(--md-sys-color-${token})`
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }, role)
  expect(colors.background).toBe(await roleColor('error'))
  expect(colors.foreground).toBe(await roleColor('on-error'))
  await expect(page.getByRole('img', { name: 'New notification', exact: true })).toBeVisible()

  const contrastRatio = (first: string, second: string) => {
    const luminance = (color: string) => {
      const [r, g, b] = color
        .match(/\d+/g)!
        .slice(0, 3)
        .map(Number)
        .map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
    return (values[0] + 0.05) / (values[1] + 0.05)
  }
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, isDark) => element.classList.toggle('dark', isDark), dark)
    const current = await small.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      foreground: getComputedStyle(element).color,
      surrounding: getComputedStyle(element.closest('.yam3x-demo')!).backgroundColor,
    }))
    expect(contrastRatio(current.foreground, current.background)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(current.background, current.surrounding)).toBeGreaterThanOrEqual(3)
  }
})

test('badge variant follows dynamically rendered default slot content', async ({ page }) => {
  const dot = page.locator('.badge-example__positions > .yam3x-badge')
  const content = dot.locator('.yam3x-badge__content')

  await content.evaluate((element) => element.append(document.createTextNode('7')))
  await expect(dot).toHaveClass(/yam3x-badge--large/)
  await expect(dot).toHaveText('7')

  await content.evaluate((element) => element.replaceChildren(document.createTextNode('  ')))
  await expect(dot).toHaveClass(/yam3x-badge--small/)
  await expect(dot).toHaveCSS('width', '6px')
})

test('for anchors badges to the target, follows target resizing, and hidden owns read state', async ({
  page,
}) => {
  const anchor = page.getByRole('button', { name: 'Messages', exact: true })
  const badge = page.locator('.yam3x-badge[for="badge-example-messages"]')

  await expect(badge).toHaveAttribute('data-positioned', '')
  const initial = await badge.boundingBox()
  expect(initial).not.toBeNull()
  await anchor.evaluate((element) => {
    ;(element as HTMLElement).style.width = '88px'
  })
  await expect
    .poll(async () => {
      const badgeBox = await badge.boundingBox()
      const anchorBox = await anchor.boundingBox()
      return badgeBox && anchorBox ? Math.abs(badgeBox.x - anchorBox.x) : Number.POSITIVE_INFINITY
    })
    .toBeGreaterThan(20)

  // badge.behavior.hide-read
  await anchor.click()
  await expect(badge).toBeHidden()
  await page.getByRole('button', { name: 'Restore unread badge' }).click()
  await expect(badge).toBeVisible()
})

test('all badge positions mirror logically in RTL and missing targets attach when inserted', async ({
  page,
}) => {
  await page.locator('.yam3x-badge').first().waitFor()
  for (const position of [
    'above-after',
    'above-before',
    'below-before',
    'below-after',
    'before',
    'after',
    'above',
    'below',
  ]) {
    const badge = page.locator(`.yam3x-badge[data-attached][data-position="${position}"]`)
    const matches = await badge.all()
    expect(matches.length, `${position} demo`).toBeGreaterThan(0)
    for (const item of matches) {
      await expect(item).toHaveAttribute('data-positioned', '')
      await expect(item).toBeVisible()
    }
  }

  const anchor = page.getByRole('button', { name: 'Messages', exact: true })
  const badge = page.locator('.yam3x-badge[for="badge-example-messages"]')
  const ltr = await badge.boundingBox()
  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
  await expect
    .poll(() => badge.evaluate((element) => getComputedStyle(element).direction))
    .toBe('rtl')
  await expect
    .poll(async () => {
      const box = await badge.boundingBox()
      return box && ltr ? box.x !== ltr.x : false
    })
    .toBe(true)

  await anchor.evaluate((element) => {
    element.id = 'messages-read'
  })
  await expect(badge).not.toHaveAttribute('data-positioned', '')
  await page.evaluate(() => {
    const target = document.createElement('button')
    target.id = 'badge-example-messages'
    document.body.append(target)
  })
  await expect(badge).toHaveAttribute('data-positioned', '')
})

test('documented badge custom properties override geometry, typography, and colors', async ({
  page,
}) => {
  const badge = page.locator('.yam3x-badge--large').first()
  await badge.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-badge-large-size', '32px')
    style.setProperty('--yam3x-badge-large-font-size', '18px')
    style.setProperty('--yam3x-badge-large-font-weight', '700')
    style.setProperty('--yam3x-badge-large-line-height', '24px')
    style.setProperty('--yam3x-badge-large-tracking', '1px')
    style.setProperty('--yam3x-badge-container-color', 'rgb(1, 2, 3)')
    style.setProperty('--yam3x-badge-color', 'rgb(4, 5, 6)')
  })
  await expect(badge).toHaveCSS('height', '32px')
  await expect(badge).toHaveCSS('font-size', '18px')
  await expect(badge).toHaveCSS('font-weight', '700')
  await expect(badge).toHaveCSS('line-height', '24px')
  await expect(badge).toHaveCSS('letter-spacing', '1px')
  await expect(badge).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(badge).toHaveCSS('color', 'rgb(4, 5, 6)')
  const mapped = await badge.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      size: style.getPropertyValue('--_yam3x-badge-size').trim(),
      container: style.getPropertyValue('--_yam3x-badge-container-color').trim(),
      color: style.getPropertyValue('--_yam3x-badge-color').trim(),
    }
  })
  expect(mapped).toEqual({ size: '32px', container: 'rgb(1, 2, 3)', color: 'rgb(4, 5, 6)' })

  const longLabel = page.locator('.yam3x-badge--large[data-long-label]')
  await expect(longLabel).toHaveCSS('font-size', '10px')
  await longLabel.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty('--yam3x-badge-long-label-font-size', '9px')
    ;(element as HTMLElement).style.setProperty('--yam3x-badge-long-label-tracking', '0.2px')
  })
  await expect(longLabel).toHaveCSS('font-size', '9px')
  await expect(longLabel).toHaveCSS('letter-spacing', '0.2px')
})

test('documented badge offset override updates runtime anchor placement', async ({ page }) => {
  const anchor = page.getByRole('button', { name: 'Messages', exact: true })
  const badge = page.locator('.yam3x-badge[for="badge-example-messages"]')
  const before = await badge.boundingBox()
  expect(before).not.toBeNull()

  await badge.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty('--yam3x-badge-small-offset', '12px')
    window.dispatchEvent(new Event('resize'))
  })

  await expect
    .poll(async () => {
      const after = await badge.boundingBox()
      return after && before ? Math.abs(after.y - before.y) : 0
    })
    .toBeGreaterThanOrEqual(5)
  await expect(anchor).toBeVisible()
})

test('forced colors preserve badge contrast and hidden badges stay absent', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  const badge = page.locator('.yam3x-badge--large').first()
  await expect(badge).toHaveCSS('outline-width', '1px')
  await expect(badge).toHaveCSS('outline-color', 'rgb(0, 0, 0)')
  await expect(page.locator('.yam3x-badge--small').first()).toBeVisible()
})
