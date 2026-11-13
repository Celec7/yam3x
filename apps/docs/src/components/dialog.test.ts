import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Dialog from '../../../../registry/components/dialog/dialog.vue'

async function settle() {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

describe('dialog visible dismissal warning', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('warns when a dialog opens without a close button or actions', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Dialog, {
      props: { open: true, title: 'Delete item' },
      attachTo: document.body,
    })

    await settle()
    await settle()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('visible dismissal'))
    wrapper.unmount()
  })

  it('does not warn when the dialog provides an action', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Dialog, {
      props: { open: true, title: 'Delete item' },
      slots: { actions: '<button type="button">Cancel</button>' },
      attachTo: document.body,
    })

    await settle()
    await settle()

    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('visible dismissal'))
    wrapper.unmount()
  })
})
