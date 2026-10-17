import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import NumberField from '../../../../registry/components/number-field/number-field.vue'
import M3Form from '../../../../registry/components/form/form.vue'
import type {
  FormContext,
  FormSubmitResult,
  FormValidation,
} from '../../../../registry/components/form/form.types'

enableAutoUnmount(afterEach)
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function fixture(
  submit: (context: FormContext) => FormSubmitResult | void | Promise<FormSubmitResult | void>,
  validate?: (context: FormContext) => FormValidation | void | Promise<FormValidation | void>,
) {
  const value = ref('Initial')
  return mount(M3Form, {
    attachTo: document.body,
    props: {
      submit,
      validate,
      onReset: () => {
        value.value = 'Initial'
      },
    },
    slots: {
      default: () => [
        h('label', [
          'Name',
          h('input', {
            name: 'name',
            value: value.value,
            required: true,
            onInput: (event: Event) => {
              value.value = (event.target as HTMLInputElement).value
            },
          }),
        ]),
        h('button', { type: 'submit' }, 'Save'),
      ],
    },
  })
}

describe('Form coordination', () => {
  it('shows native errors only after submission and keeps the adapter out of invalid submissions', async () => {
    // form.validation.summary
    const submit = vi.fn()
    const wrapper = fixture(submit)
    await wrapper.get('input').setValue('')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Name')
    expect(submit).not.toHaveBeenCalled()
    await wrapper.get('input').setValue('New name')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.trigger('submit')
    await flushPromises()
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit.mock.calls[0]![0].data.get('name')).toBe('New name')
  })

  it('rejects duplicate submissions until the current attempt settles', async () => {
    const request = deferred<FormSubmitResult>()
    const submit = vi.fn(() => request.promise)
    const wrapper = fixture(submit)
    await wrapper.trigger('submit')
    await flushPromises()
    await wrapper.trigger('submit')
    expect(submit).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[role="status"]').text()).toBe('Submitting…')
    request.resolve({ status: 'success' })
    await flushPromises()
    expect(wrapper.text()).toContain('Form submitted.')
  })

  it('discards validation that finishes after an edit and does not start submission', async () => {
    // form.submission.concurrent
    const validation = deferred<FormValidation>()
    let signal: AbortSignal | undefined
    const submit = vi.fn()
    const wrapper = fixture(submit, (context) => {
      signal = context.signal
      return validation.promise
    })
    await wrapper.trigger('submit')
    await flushPromises()
    await wrapper.get('input').setValue('Changed')
    expect(signal?.aborted).toBe(true)
    validation.resolve({ fieldErrors: { name: 'Old name is unavailable.' } })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Old name is unavailable.')
    expect(submit).not.toHaveBeenCalled()
    expect(wrapper.emitted('outdated')).toHaveLength(1)
  })

  it('keeps new edits and explains an obsolete submission instead of applying its errors', async () => {
    const request = deferred<FormSubmitResult>()
    const wrapper = fixture(() => request.promise)
    await wrapper.trigger('submit')
    await flushPromises()
    await wrapper.get('input').setValue('Current edit')
    request.resolve({
      status: 'error',
      message: 'Old request failed.',
      fieldErrors: { name: 'Old field error.' },
    })
    await flushPromises()
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Current edit')
    expect(wrapper.text()).not.toContain('Old field error.')
    expect(wrapper.text()).not.toContain('Old request failed.')
    expect(wrapper.text()).toContain('Values changed during submission.')
    expect(wrapper.emitted('failure')).toBeUndefined()
  })

  it('detects programmatic value changes while validation is pending', async () => {
    const validation = deferred<FormValidation>()
    const submit = vi.fn()
    const wrapper = fixture(submit, () => validation.promise)
    await wrapper.trigger('submit')
    await flushPromises()
    wrapper.get<HTMLInputElement>('input').element.value = 'Programmatic change'
    validation.resolve({ fieldErrors: { name: 'Outdated validation.' } })
    await flushPromises()
    expect(submit).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Outdated validation.')
  })

  it('contains unexpected submission failure with visible recovery and diagnostic detail', async () => {
    const error = new Error('Internal service detail')
    const wrapper = fixture(() => {
      throw error
    })
    await wrapper.trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('check the result before trying again.')
    expect(wrapper.text()).not.toContain('Internal service detail')
    expect(wrapper.emitted('failure')?.[0]?.[0]).toMatchObject({
      kind: 'exception',
      error,
      phase: 'submission',
    })
  })

  it('exposes adapter errors for local presentation and clears them on editing', async () => {
    const wrapper = mount(
      defineComponent({
        components: { M3Form },
        setup: () => ({
          name: ref('Initial'),
          save: () => undefined,
          validate: () => ({ fieldErrors: { name: 'Choose another name.' } }),
        }),
        template:
          '<M3Form :submit="save" :validate="validate"><template #default="{ fieldErrors }"><label>Name<input name="name" v-model="name" /></label><p data-local-error>{{ fieldErrors.name }}</p></template></M3Form>',
      }),
      { attachTo: document.body },
    )
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[data-local-error]').text()).toBe('Choose another name.')
    await wrapper.get('input').setValue('New value')
    await flushPromises()
    expect(wrapper.get('[data-local-error]').text()).toBe('')
  })

  it('aborts owned work when unmounted and ignores its late result', async () => {
    const request = deferred<FormSubmitResult>()
    let signal: AbortSignal | undefined
    const wrapper = fixture((context) => {
      signal = context.signal
      return request.promise
    })
    await wrapper.trigger('submit')
    await flushPromises()
    wrapper.unmount()
    expect(signal?.aborted).toBe(true)
    request.resolve({ status: 'success' })
    await flushPromises()
    expect(wrapper.emitted('success')).toBeUndefined()
    expect(wrapper.emitted('outdated')).toBeUndefined()
  })
  it('resets application values and drops validation from the previous edit', async () => {
    // form.reset.session
    const validation = deferred<FormValidation>()
    const submit = vi.fn()
    const wrapper = fixture(submit, () => validation.promise)
    await wrapper.get('input').setValue('Changed')
    await wrapper.trigger('submit')
    await flushPromises()
    wrapper.element.reset()
    await flushPromises()
    validation.resolve({ fieldErrors: { name: 'Old reset error.' } })
    await flushPromises()
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Initial')
    expect(wrapper.text()).not.toContain('Old reset error.')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(submit).not.toHaveBeenCalled()
  })

  it('keeps hidden-field errors readable without focusing unrelated controls', async () => {
    const wrapper = mount(M3Form, {
      attachTo: document.body,
      props: {
        submit: () => undefined,
        validate: () => ({ fieldErrors: { hidden: 'This value must be reviewed.' } }),
      },
      slots: {
        default:
          '<input type="hidden" name="hidden" value="retained" /><label>Visible<input name="visible" /></label>',
      },
    })
    await wrapper.trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('This value must be reviewed.')
    expect(wrapper.get('[role="alert"]').find('a').exists()).toBe(false)
    expect(wrapper.vm.focusField('hidden')).toBe(false)
  })
  it('requests cancellation for numeric stepping that changes a model without a native input event', async () => {
    const request = deferred<FormSubmitResult>()
    const quantity = ref<number | null>(1)
    let signal: AbortSignal | undefined
    const wrapper = mount(M3Form, {
      attachTo: document.body,
      props: {
        submit: (context) => {
          signal = context.signal
          return request.promise
        },
      },
      slots: {
        default: () =>
          h(NumberField, {
            label: 'Quantity',
            name: 'quantity',
            modelValue: quantity.value,
            'onUpdate:modelValue': (value: number | null) => {
              quantity.value = value
            },
          }),
      },
    })
    await wrapper.trigger('submit')
    await flushPromises()
    const input = wrapper.get('input[role="spinbutton"]')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keyup', { key: 'ArrowUp' })
    await flushPromises()
    expect(quantity.value).toBe(2)
    expect(signal?.aborted).toBe(true)
    request.resolve({ status: 'success' })
    await flushPromises()
    expect(wrapper.emitted('success')).toBeUndefined()
  })
})
