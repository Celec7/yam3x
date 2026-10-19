import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/toolbar')
})

test('floating and docked layouts follow the normative defaults and keep child actions', async ({
  page,
}) => {
  // toolbar.variants.geometry
  const toolbar = page.getByTestId('toolbar')
  await expect(toolbar).toHaveAttribute('role', 'toolbar')
  await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
  await expect(toolbar).toHaveAttribute('aria-label', 'Article actions')
  await expect(toolbar).toHaveClass(/yam3x-toolbar--floating/)
  await expect(toolbar).toHaveClass(/yam3x-toolbar--rounded/)
  await expect(toolbar).toHaveClass(/yam3x-toolbar--elevated/)
  await expect(toolbar).toHaveCSS('min-height', '64px')
  await expect(toolbar).not.toHaveCSS('box-shadow', 'none')
  expect(await toolbar.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1)
  await page.getByTestId('toolbar-share').click()
  await expect(page.locator('.toolbar-demo output')).toHaveText('Share')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar color' }), 'vibrant')
  await expect(toolbar).toHaveClass(/yam3x-toolbar--vibrant/)
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar layout' }), 'docked')
  await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
  await expect(toolbar).toHaveClass(/yam3x-toolbar--docked/)
  await expect(toolbar).toHaveClass(/yam3x-toolbar--square/)
  await expect(toolbar).not.toHaveClass(/yam3x-toolbar--elevated/)
  await expect(toolbar).toHaveCSS(
    'width',
    await toolbar.evaluate(
      (element) => `${element.parentElement!.getBoundingClientRect().width}px`,
    ),
  )
  await expect(toolbar).toHaveCSS('padding-left', '16px')
  await expect(toolbar).toHaveCSS('padding-right', '16px')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar shape' }), 'rounded')
  await page.setViewportSize({ width: 320, height: 640 })
  await expect(toolbar).toHaveClass(/yam3x-toolbar--rounded/)
  await expect(toolbar).toHaveCSS('border-radius', '0px')
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(toolbar).toHaveCSS('border-radius', '16px')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar elevation' }), 'on')
  await expect(toolbar).toHaveClass(/yam3x-toolbar--elevated/)
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar elevation' }), 'off')
  await expect(toolbar).not.toHaveClass(/yam3x-toolbar--elevated/)
  await expect(page.getByRole('checkbox', { name: 'Vertical' })).toBeDisabled()
  await expect(toolbar).not.toHaveClass(/yam3x-toolbar--vertical/)
})

test('each action remains a Tab stop while arrows, Home and End navigate the live toolbar', async ({
  page,
}) => {
  // toolbar.a11y.keyboard
  const back = page.getByRole('button', { name: 'Back' })
  const save = page.getByRole('button', { name: 'Save' })
  const share = page.getByRole('button', { name: 'Share' })
  await back.focus()
  await page.keyboard.press('Tab')
  await expect(save).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(share).toBeFocused()
  await share.press('Home')
  await expect(back).toBeFocused()
  await back.press('ArrowRight')
  await expect(save).toBeFocused()
  await save.press('End')
  await expect(share).toBeFocused()
  await share.press('ArrowRight')
  await expect(back).toBeFocused()
  await back.press('Enter')
  await expect(page.locator('.toolbar-demo output')).toHaveText('Back')

  await save.evaluate((element) => element.setAttribute('disabled', ''))
  await back.press('ArrowRight')
  await expect(share).toBeFocused()
  await save.evaluate((element) => element.removeAttribute('disabled'))
  await back.press('ArrowRight')
  await expect(save).toBeFocused()
})

test('demo standard icon actions use the color role for each toolbar scheme', async ({ page }) => {
  const toolbar = page.getByTestId('toolbar')
  const back = page.getByTestId('toolbar-back')
  const mappedColor = (token: string) =>
    back.evaluate((element, colorToken) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${colorToken})`
      document.body.append(probe)
      const expected = getComputedStyle(probe).color
      probe.remove()
      return { actual: getComputedStyle(element).color, expected }
    }, token)

  await expect(toolbar).toHaveClass(/yam3x-toolbar--standard/)
  await expect
    .poll(async () => {
      const colors = await mappedColor('--md-sys-color-primary')
      return colors.actual === colors.expected
    })
    .toBe(true)

  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar color' }), 'vibrant')
  await expect(toolbar).toHaveClass(/yam3x-toolbar--vibrant/)
  await expect
    .poll(async () => {
      const colors = await mappedColor('--md-sys-color-on-primary-container')
      return colors.actual === colors.expected
    })
    .toBe(true)
})

test('RTL reverses horizontal arrow movement and vertical layout uses up and down', async ({
  page,
}) => {
  const toolbar = page.getByTestId('toolbar')
  const back = page.getByRole('button', { name: 'Back' })
  const save = page.getByRole('button', { name: 'Save' })
  const share = page.getByRole('button', { name: 'Share' })
  await toolbar.evaluate((element) => ((element as HTMLElement).dir = 'rtl'))
  await save.focus()
  await save.press('ArrowRight')
  await expect(back).toBeFocused()
  await back.press('ArrowLeft')
  await expect(save).toBeFocused()
  await page.getByRole('checkbox', { name: 'Vertical' }).check()
  await expect(toolbar).toHaveClass(/yam3x-toolbar--vertical/)
  // toolbar.a11y.orientation
  await expect(toolbar).toHaveAttribute('aria-orientation', 'vertical')
  await expect(toolbar).toHaveCSS('min-width', '64px')
  await save.press('ArrowDown')
  await expect(share).toBeFocused()
  await share.press('ArrowUp')
  await expect(save).toBeFocused()
  await save.press('ArrowRight')
  await expect(save).toBeFocused()
  await page.getByRole('checkbox', { name: 'Vertical' }).uncheck()
  await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
})

test('text input keeps arrow editing and hidden toolbar leaves the accessibility tree', async ({
  page,
}) => {
  const toolbar = page.getByTestId('toolbar')
  await toolbar.evaluate((element) => {
    const input = document.createElement('input')
    input.setAttribute('aria-label', 'Query')
    input.value = 'abc'
    element.append(input)
  })
  const input = page.getByRole('textbox', { name: 'Query' })
  await input.focus()
  await input.press('Home')
  await expect(input).toBeFocused()
  await input.press('ArrowRight')
  await expect(input).toBeFocused()
  await toolbar.evaluate((element) => {
    const tablist = document.createElement('div')
    tablist.setAttribute('role', 'tablist')
    const tab = document.createElement('button')
    tab.setAttribute('role', 'tab')
    tab.textContent = 'Local label'
    tablist.append(tab)
    element.append(tablist)
  })
  const tab = page.getByRole('tab', { name: 'Local label' })
  await tab.focus()
  await tab.press('ArrowRight')
  await expect(tab).toBeFocused()
  await toolbar.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(toolbar).toBeHidden()
  await expect(page.getByRole('toolbar', { name: 'Article actions' })).toHaveCount(0)
})

test('CSS hooks affect size, spacing, both shapes, both colors, and logical edge padding', async ({
  page,
}) => {
  const toolbar = page.getByTestId('toolbar')
  await toolbar.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-toolbar-size', '80px')
    style.setProperty('--yam3x-toolbar-spacing', '12px')
    style.setProperty('--yam3x-toolbar-rounded-shape', '20px')
    style.setProperty('--yam3x-toolbar-padding-inline', '20px')
    style.setProperty('--yam3x-toolbar-padding-block', '12px')
    style.setProperty('--yam3x-toolbar-standard-container-color', 'rgb(10, 20, 30)')
    style.setProperty('--yam3x-toolbar-standard-color', 'rgb(240, 230, 220)')
  })
  await expect(toolbar).toHaveCSS('min-height', '80px')
  await expect(toolbar).toHaveCSS('column-gap', '12px')
  await expect(toolbar).toHaveCSS('border-radius', '20px')
  await expect(toolbar).toHaveCSS('padding-left', '20px')
  await expect(toolbar).toHaveCSS('padding-right', '20px')
  await expect(toolbar).toHaveCSS('padding-top', '12px')
  await expect(toolbar).toHaveCSS('padding-bottom', '12px')
  await expect(toolbar).toHaveCSS('background-color', 'rgb(10, 20, 30)')
  await expect(toolbar).toHaveCSS('color', 'rgb(240, 230, 220)')

  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar layout' }), 'docked')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar shape' }), 'rounded')
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(toolbar).toHaveCSS('border-radius', '16px')
  await toolbar.evaluate((element) => {
    ;(element as HTMLElement).style.setProperty('--yam3x-toolbar-docked-rounded-shape', '24px')
  })
  await expect(toolbar).toHaveCSS('border-radius', '24px')

  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar layout' }), 'floating')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar shape' }), 'rounded')
  await expect(toolbar).toHaveCSS('border-radius', '20px')
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar color' }), 'vibrant')
  await toolbar.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-toolbar-vibrant-container-color', 'rgb(30, 40, 50)')
    style.setProperty('--yam3x-toolbar-vibrant-color', 'rgb(220, 210, 200)')
  })
  await expect(toolbar).toHaveCSS('background-color', 'rgb(30, 40, 50)')
  await expect(toolbar).toHaveCSS('color', 'rgb(220, 210, 200)')
  await page.getByRole('checkbox', { name: 'Vertical' }).check()
  await expect(toolbar).toHaveCSS('padding-top', '12px')
  await expect(toolbar).toHaveCSS('padding-bottom', '12px')
  await expect(toolbar).toHaveCSS('padding-left', '20px')
  await expect(toolbar).toHaveCSS('padding-right', '20px')
  await page.getByRole('checkbox', { name: 'Vertical' }).uncheck()
  await toolbar.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-toolbar-padding-inline', '22px')
    style.setProperty('--yam3x-toolbar-padding-block', '10px')
  })
  await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar shape' }), 'square')
  await expect(toolbar).toHaveCSS('padding-left', '22px')
  await expect(toolbar).toHaveCSS('padding-right', '22px')
  await expect(toolbar).toHaveCSS('padding-top', '10px')
  await expect(toolbar).toHaveCSS('padding-bottom', '10px')
  await page.getByRole('checkbox', { name: 'Vertical' }).check()
  await expect(toolbar).toHaveCSS('padding-top', '10px')
  await expect(toolbar).toHaveCSS('padding-bottom', '10px')
  await expect(toolbar).toHaveCSS('padding-left', '22px')
  await expect(toolbar).toHaveCSS('padding-right', '22px')
})

test('theme colors, forced colors, and child touch targets remain visible', async ({ page }) => {
  // toolbar.a11y.target
  const toolbar = page.getByTestId('toolbar')
  const luminance = (color: string) => {
    const [red, green, blue] = color
      .match(/\d+/g)!
      .slice(0, 3)
      .map(Number)
      .map((channel) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  for (const dark of [false, true]) {
    await page
      .locator('html')
      .evaluate((element, enabled) => element.classList.toggle('dark', enabled), dark)
    for (const vibrant of [false, true]) {
      await selectM3Option(
        page,
        page.getByRole('combobox', { name: 'Toolbar color' }),
        vibrant ? 'vibrant' : 'standard',
      )
      const colors = await toolbar.evaluate((element) => {
        const style = getComputedStyle(element)
        const vibrant = element.classList.contains('yam3x-toolbar--vibrant')
        const probe = document.createElement('span')
        probe.style.background = `var(${vibrant ? '--md-sys-color-primary-container' : '--md-sys-color-surface-container'})`
        probe.style.color = `var(${vibrant ? '--md-sys-color-on-primary-container' : '--md-sys-color-on-surface'})`
        document.body.append(probe)
        const expected = [getComputedStyle(probe).backgroundColor, getComputedStyle(probe).color]
        probe.remove()
        return {
          actual: [style.backgroundColor, style.color],
          expected,
        }
      })
      expect(colors.actual).toEqual(colors.expected)
      const [lighter, darker] = colors.actual.map(luminance).sort((a, b) => b - a)
      expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(4.5)
    }
  }
  const target = await page.getByRole('button', { name: 'Back' }).evaluate((element) => {
    const style = getComputedStyle(element, '::before')
    return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) }
  })
  expect(target.width).toBeGreaterThanOrEqual(48)
  expect(target.height).toBeGreaterThanOrEqual(48)
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(toolbar).toHaveCSS('outline-width', '1px')
  await expect(toolbar).toHaveCSS('background-color', /rgb\(/)
})

test('both layouts fit a compact viewport without clipping their essential controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 })
  const toolbar = page.getByTestId('toolbar')
  for (const layout of ['floating', 'docked']) {
    await selectM3Option(page, page.getByRole('combobox', { name: 'Toolbar layout' }), layout)
    const geometry = await toolbar.evaluate((element) => {
      const container = element.closest('.toolbar-demo__stage')!.getBoundingClientRect()
      const toolbar = element.getBoundingClientRect()
      const controls = [...element.querySelectorAll('button')].map((button) =>
        button.getBoundingClientRect(),
      )
      return {
        container: [container.left, container.right],
        toolbar: [toolbar.left, toolbar.right],
        controls: controls.map((rect) => [rect.left, rect.right]),
      }
    })
    expect(geometry.toolbar[0]).toBeGreaterThanOrEqual(geometry.container[0])
    expect(geometry.toolbar[1]).toBeLessThanOrEqual(geometry.container[1])
    for (const [left, right] of geometry.controls) {
      expect(left).toBeGreaterThanOrEqual(geometry.toolbar[0])
      expect(right).toBeLessThanOrEqual(geometry.toolbar[1])
    }
  }
})
