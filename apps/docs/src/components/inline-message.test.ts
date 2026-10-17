import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import InlineMessage from '../../../../registry/components/inline-message/inline-message.vue'

describe('Inline message', () => {
  it('keeps visual tone separate from announcement urgency', async () => {
    // inline-message.announcement.independent
    const wrapper = mount(InlineMessage, {
      props: { tone: 'error' },
      slots: { default: 'Save failed.' },
    })
    expect(wrapper.attributes('role')).toBeUndefined()
    await wrapper.setProps({ announcement: 'polite' })
    expect(wrapper.attributes('role')).toBe('status')
    await wrapper.setProps({ tone: 'info', announcement: 'assertive' })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.attributes('aria-atomic')).toBe('true')
    expect(wrapper.text()).toContain('Save failed.')
    wrapper.unmount()
  })

  it('dismisses without claiming the condition was resolved and restores focused content', async () => {
    // inline-message.dismiss.focus
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mount(
      defineComponent({
        components: { InlineMessage },
        setup() {
          return { open: ref(true) }
        },
        template:
          '<div><button id="after-message">Continue editing</button><InlineMessage v-model:open="open" dismissible :dismiss-focus="() => $el.querySelector(\'button\')">Save failed.</InlineMessage></div>',
      }),
      { attachTo: host },
    )
    const dismiss = wrapper.get<HTMLButtonElement>('[aria-label="Dismiss message"]')
    dismiss.element.focus()
    await dismiss.trigger('click')
    await nextTick()
    expect(wrapper.find('.yam3x-inline-message').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('#after-message').element)
    wrapper.unmount()
    host.remove()
  })

  it('does not move focus when an unrelated message closes or appears', async () => {
    const button = document.createElement('button')
    document.body.append(button)
    button.focus()
    const wrapper = mount(InlineMessage, {
      attachTo: document.body,
      props: { open: false },
      slots: { default: 'Updated.' },
    })
    await wrapper.setProps({ open: true })
    expect(document.activeElement).toBe(button)
    await wrapper.setProps({ open: false })
    expect(document.activeElement).toBe(button)
    wrapper.unmount()
    button.remove()
  })
})
