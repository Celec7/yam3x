import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import NumberField from '../../../../registry/components/number-field/number-field.vue'
import { useFormField, formValidationFromIssues } from '../../../../registry/components/form'
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

it('form.fields.rules: validates registered nested values before the application adapter or submission', async () => {
  const profile = ref({ email: 'ab' })
  const submit = vi.fn()
  const validate = vi.fn()
  const wrapper = mount(M3Form, {
    props: {
      submit,
      validate,
      fields: [
        {
          path: ['profile', 'email'],
          value: () => profile.value.email,
          rules: [{ minLength: 3, message: 'Use at least three characters.' }],
        },
      ],
    },
    slots: {
      default: ({ fieldErrors }: { fieldErrors: Record<string, string> }) => [
        h('label', ['Email', h('input', { name: 'profile.email', value: profile.value.email })]),
        h('p', { 'data-testid': 'local-error' }, fieldErrors['profile.email']),
      ],
    },
  })
  await wrapper.trigger('submit')
  await flushPromises()
  expect(wrapper.get('[data-testid="local-error"]').text()).toBe('Use at least three characters.')
  expect(submit).not.toHaveBeenCalled()
  expect(validate).not.toHaveBeenCalled()
  profile.value.email = 'valid'
  await flushPromises()
  expect(wrapper.get('[data-testid="local-error"]').text()).toBe('')
  await wrapper.trigger('submit')
  await flushPromises()
  expect(validate).toHaveBeenCalledOnce()
  expect(submit).toHaveBeenCalledOnce()
})

it('form.fields.lifecycle: unregisters a child without removing application-owned values', async () => {
  const value = ref('kept')
  const visible = ref(true)
  const rule = vi.fn(() => 'Not ready')
  const Field = defineComponent({
    setup() {
      useFormField({
        path: ['contacts', 0, 'name'],
        name: 'contact',
        value: () => value.value,
        rules: [{ validate: rule }],
      })
      return () => h('input', { name: 'contact', value: value.value })
    },
  })
  const submit = vi.fn()
  const wrapper = mount(M3Form, {
    props: { submit },
    slots: { default: () => (visible.value ? h(Field) : null) },
  })
  await wrapper.trigger('submit')
  await flushPromises()
  expect(rule).toHaveBeenCalledOnce()
  expect(wrapper.get('[role="alert"]').text()).toContain('Not ready')
  visible.value = false
  await flushPromises()
  expect(value.value).toBe('kept')
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  await wrapper.trigger('submit')
  await flushPromises()
  expect(rule).toHaveBeenCalledOnce()
  expect(submit).toHaveBeenCalledOnce()
})
it('form.fields.lifecycle: discards a pending rule after a registered model changes without a DOM event', async () => {
  const value = ref('original')
  const gate = deferred<string | void>()
  let signal: AbortSignal | undefined
  const submit = vi.fn()
  const wrapper = mount(M3Form, {
    props: {
      submit,
      fields: [
        {
          path: ['profile', 'name'],
          value: () => value.value,
          rules: [
            {
              validate: (_, context) => {
                signal = context.signal
                return gate.promise
              },
            },
          ],
        },
      ],
    },
  })
  await wrapper.trigger('submit')
  await flushPromises()
  value.value = 'current'
  expect(signal?.aborted).toBe(true)
  await wrapper.trigger('submit')
  gate.resolve('Obsolete error')
  await flushPromises()
  expect(submit).not.toHaveBeenCalled()
  expect(wrapper.text()).not.toContain('Obsolete error')
  expect(wrapper.emitted('outdated')).toHaveLength(1)
})
it('maps schema issue tuples to native aliases, retaining first errors and ordinary prototype-like keys', () => {
  const result = formValidationFromIssues(
    [
      { path: ['contacts', 0, 'email'], message: 'Invalid email' },
      { path: ['contacts', 0, 'email'], message: 'Second error' },
      { path: '__proto__', message: 'Ordinary field' },
    ],
    [{ path: ['contacts', 0, 'email'], name: 'contact-email' }],
  )
  expect(result.fieldErrors).toEqual(
    Object.fromEntries([
      ['contact-email', 'Invalid email'],
      ['__proto__', 'Ordinary field'],
    ]),
  )
})

it('form.validation.partial: validates a nested group, preserves unrelated errors, and never submits or moves focus', async () => {
  const submit = vi.fn()
  const wrapper = mount(M3Form, {
    attachTo: document.body,
    props: {
      submit,
      fields: [
        {
          path: ['profile', 'first'],
          name: 'first',
          rules: [{ required: true, message: 'First is required' }],
        },
        {
          path: ['profile', 'last'],
          name: 'last',
          rules: [{ required: true, message: 'Last is required' }],
        },
        {
          path: ['billing', 'code'],
          name: 'code',
          rules: [{ required: true, message: 'Code is required' }],
        },
      ],
    },
    slots: {
      default: () =>
        ['first', 'last', 'code'].map((name) => h('input', { name, 'aria-label': name })),
    },
  })
  const first = wrapper.get<HTMLInputElement>('[name="first"]')
  first.element.focus()
  expect((await wrapper.vm.validateFields([['billing']])).status).toBe('invalid')
  expect(wrapper.text()).toContain('Code is required')
  const result = await wrapper.vm.validateFields([['profile']])
  expect(result.status).toBe('invalid')
  expect(result.issues.map((issue) => issue.name)).toEqual(['first', 'last'])
  expect(wrapper.text()).toContain('Code is required')
  expect(document.activeElement).toBe(first.element)
  expect(submit).not.toHaveBeenCalled()
})

it('form.validation.partial: adapts scoped checks and keeps unrelated native fields untouched on edit', async () => {
  const validate = vi.fn((_context: FormContext) => ({
    fieldErrors: { first: 'First error', other: 'Unrelated' },
    message: 'Unscoped message',
  }))
  const validateFields = vi.fn((context: FormContext) => validate(context))
  const wrapper = mount(M3Form, {
    attachTo: document.body,
    props: { submit: vi.fn(), validate: { validate, validateFields } },
    slots: {
      default: () => [h('input', { name: 'first' }), h('input', { name: 'other', required: true })],
    },
  })
  const result = await wrapper.vm.validateFields(['first'])
  expect(result.status).toBe('invalid')
  expect(result.issues.map((issue) => issue.name)).toEqual(['first'])
  expect(validateFields).toHaveBeenCalledOnce()
  expect(validateFields.mock.calls[0]![0].paths).toEqual(['first'])
  expect(wrapper.text()).not.toContain('Unscoped message')
  await wrapper.get('[name="first"]').setValue('changed')
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
})
it('form.fields.lifecycle: refreshes native feedback after a registered value changes programmatically', async () => {
  const value = ref('')
  const wrapper = mount(M3Form, {
    props: { submit: vi.fn(), fields: [{ path: 'name', value: () => value.value }] },
    slots: { default: () => h('input', { name: 'name', value: value.value, required: true }) },
  })
  expect((await wrapper.vm.validateFields(['name'])).status).toBe('invalid')
  value.value = 'corrected'
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
})
it('form.validation.partial: reports busy and outdated without accepting a stale partial result', async () => {
  const gate = deferred<string | void>()
  const value = ref('old')
  const submit = vi.fn()
  const wrapper = mount(M3Form, {
    props: {
      submit,
      fields: [
        { path: 'name', value: () => value.value, rules: [{ validate: () => gate.promise }] },
      ],
    },
  })
  const checking = wrapper.vm.validateFields(['name'])
  await flushPromises()
  expect((await wrapper.vm.validateFields(['name'])).status).toBe('busy')
  value.value = 'new'
  gate.resolve('Stale feedback')
  expect((await checking).status).toBe('outdated')
  expect(wrapper.text()).not.toContain('Stale feedback')
  expect(submit).not.toHaveBeenCalled()
})

it.each([
  { value: '', rule: { required: true, message: 'Required' }, valid: false },
  { value: false, rule: { required: true, message: 'Required' }, valid: true },
  { value: 0, rule: { min: 0, max: 0, message: 'Range' }, valid: true },
  { value: '5', rule: { min: 0, message: 'Number needed' }, valid: false },
  { value: Number.NaN, rule: { max: 10, message: 'Finite number needed' }, valid: false },
  { value: '', rule: { minLength: 3, message: 'Too short' }, valid: true },
  { value: ['one'], rule: { minLength: 2, message: 'Two needed' }, valid: false },
  { value: 'abc', rule: { pattern: /^abc$/g, message: 'Pattern' }, valid: true },
])(
  'form.fields.rules: checks a typed value $value without coercing or mutating rule state',
  async ({ value, rule, valid }) => {
    const wrapper = mount(M3Form, {
      props: { submit: vi.fn(), fields: [{ path: 'value', value: () => value, rules: [rule] }] },
    })
    expect((await wrapper.vm.validateFields()).status).toBe(valid ? 'valid' : 'invalid')
    expect((await wrapper.vm.validateFields()).status).toBe(valid ? 'valid' : 'invalid')
  },
)
it('adapts root schema issues separately from native field feedback', () => {
  expect(
    formValidationFromIssues([
      { path: [], message: 'Check this combination' },
      { path: ['name'], message: 'Name error' },
    ]),
  ).toEqual({ message: 'Check this combination', fieldErrors: { name: 'Name error' } })
})

it('form.validation.partial: distinguishes literal dotted segments and numeric indices in nested scopes', async () => {
  const wrapper = mount(M3Form, {
    props: {
      submit: vi.fn(),
      fields: [
        {
          path: ['contacts', 0, 'email'],
          name: 'numeric',
          rules: [{ required: true, message: 'Numeric index' }],
        },
        {
          path: ['contacts', '0', 'email'],
          name: 'text',
          rules: [{ required: true, message: 'Text key' }],
        },
        {
          path: ['contacts.email'],
          name: 'literal',
          rules: [{ required: true, message: 'Literal key' }],
        },
      ],
    },
  })
  expect(
    (await wrapper.vm.validateFields([['contacts', 0]])).issues.map((issue) => issue.name),
  ).toEqual(['numeric'])
  expect(
    (await wrapper.vm.validateFields([['contacts', '0']])).issues.map((issue) => issue.name),
  ).toEqual(['text'])
  expect(
    (await wrapper.vm.validateFields([['contacts.email']])).issues.map((issue) => issue.name),
  ).toEqual(['literal'])
})
it('form.fields.rules: gives scoped cross-field rules captured values without running unrelated rules', async () => {
  const untouched = vi.fn()
  const wrapper = mount(M3Form, {
    props: {
      submit: vi.fn(),
      fields: [
        {
          path: ['profile', 'password'],
          name: 'password',
          value: () => 'secret',
          rules: [{ validate: untouched }],
        },
        {
          path: ['profile', 'confirmation'],
          name: 'confirmation',
          value: () => 'different',
          rules: [
            {
              validate: (value, context) =>
                value === context.getValue(['profile', 'password'])
                  ? undefined
                  : 'Passwords must match',
            },
          ],
        },
      ],
    },
  })
  const result = await wrapper.vm.validateFields([['profile', 'confirmation']])
  expect(result.status).toBe('invalid')
  expect(result.issues).toEqual([
    { name: 'confirmation', label: 'confirmation', message: 'Passwords must match' },
  ])
  expect(untouched).not.toHaveBeenCalled()
})
it('form.fields.lifecycle: cancels a pending rule when its registered rule configuration changes', async () => {
  const gate = deferred<string | void>()
  let signal: AbortSignal | undefined
  const wrapper = mount(M3Form, {
    props: {
      submit: vi.fn(),
      fields: [
        {
          path: 'name',
          value: () => 'Ada',
          rules: [
            {
              validate: (_, context) => {
                signal = context.signal
                return gate.promise
              },
            },
          ],
        },
      ],
    },
  })
  const checking = wrapper.vm.validateFields()
  await flushPromises()
  await wrapper.setProps({
    fields: [
      {
        path: 'name',
        value: () => 'Ada',
        rules: [{ minLength: 4, message: 'Longer name needed' }],
      },
    ],
  })
  expect(signal?.aborted).toBe(true)
  gate.resolve('Previous rule error')
  expect((await checking).status).toBe('outdated')
  expect(wrapper.text()).not.toContain('Previous rule error')
})
