import { afterEach, describe, expect, it } from 'vitest'
import { getTabbableElements, trapTabKey } from '../../../../registry/components/_shared/focus-trap'

describe('focus trap foundation', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('finds enabled tabbable controls and excludes hidden or untabbable descendants', () => {
    document.body.innerHTML = `
      <section id="trap">
        <a id="link" href="/one">Link</a>
        <button id="disabled" disabled>Disabled</button>
        <input id="hidden-input" type="hidden">
        <button id="negative" tabindex="-1">Programmatic only</button>
        <div hidden><button id="hidden-child">Hidden</button></div>
        <div inert><a id="inert-child" href="/two">Inert</a></div>
        <div aria-hidden="true"><button id="aria-hidden-child">Hidden from AT</button></div>
        <div id="editable" contenteditable="true">Editable</div>
        <button id="last">Last</button>
      </section>`
    const container = document.querySelector<HTMLElement>('#trap')!
    expect(getTabbableElements(container).map((element) => element.id)).toEqual([
      'link',
      'editable',
      'last',
    ])
  })

  it('walks assigned slot content and open shadow roots in composed order', () => {
    const container = document.createElement('section')
    const host = document.createElement('focus-trap-fixture')
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = '<slot></slot><button id="shadow-action">Shadow</button>'
    const assigned = document.createElement('a')
    assigned.id = 'assigned-link'
    assigned.href = '/assigned'
    host.append(assigned)
    container.append(host)
    document.body.append(container)
    expect(getTabbableElements(container).map((element) => element.id)).toEqual([
      'assigned-link',
      'shadow-action',
    ])
  })

  it('follows browser tab order for positive tabindex values and radio groups', () => {
    document.body.innerHTML = `
      <section id="trap">
        <input id="radio-first" type="radio" name="choice">
        <a id="ordinary" href="/ordinary">Ordinary</a>
        <button id="positive-two" tabindex="2">Two</button>
        <input id="radio-checked" type="radio" name="choice" checked>
        <button id="positive-one" tabindex="1">One</button>
      </section>`
    const container = document.querySelector<HTMLElement>('#trap')!
    expect(getTabbableElements(container).map((element) => element.id)).toEqual([
      'positive-one',
      'positive-two',
      'radio-checked',
      'ordinary',
    ])
  })

  it('wraps Tab and Shift+Tab at the boundary and contains outside focus', () => {
    document.body.innerHTML =
      '<button id="outside">Outside</button><section id="trap"><button id="first">First</button><a id="last" href="/last">Last</a></section>'
    const container = document.querySelector<HTMLElement>('#trap')!
    const first = container.querySelector<HTMLElement>('#first')!
    const last = container.querySelector<HTMLElement>('#last')!

    last.focus()
    const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trapTabKey(forward, container)
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)

    first.focus()
    const backward = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    trapTabKey(backward, container)
    expect(backward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)

    document.querySelector<HTMLElement>('#outside')!.focus()
    const outside = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trapTabKey(outside, container)
    expect(outside.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)

    last.focus()
    const modified = new KeyboardEvent('keydown', {
      key: 'Tab',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    trapTabKey(modified, container)
    expect(modified.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(last)
  })
})
