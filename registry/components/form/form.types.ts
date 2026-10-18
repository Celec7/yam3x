export type FormPhase = 'validation' | 'submission'
export type FormStatus = 'idle' | 'validating' | 'submitting' | 'error' | 'success'
export interface FormContext {
  form: HTMLFormElement
  data: FormData
  submitter: HTMLElement | null
  signal: AbortSignal
  paths?: readonly FormFieldPath[]
}
export interface FormValidation {
  fieldErrors?: Record<string, string>
  message?: string
}
export type FormSubmitResult =
  { status: 'success'; message?: string } | ({ status: 'error'; message: string } & FormValidation)
export interface FormIssue {
  name: string
  label: string
  message: string
}
export type FormFailure =
  | { kind: 'rejected'; result: FormValidation; context: FormContext }
  | { kind: 'exception'; error: unknown; phase: FormPhase | 'preparation'; context?: FormContext }

export type { FormMessages } from '../localization/messages.types'

/** Strings are literal native names; tuples retain nested property/index identity. */
export type FormFieldPath = string | ReadonlyArray<string | number>
export interface FormRuleContext extends FormContext {
  path: FormFieldPath
  name: string
  getValue: (path: FormFieldPath) => unknown
}
export type FormRule =
  | {
      message: string
      required?: boolean
      minLength?: number
      maxLength?: number
      min?: number
      max?: number
      pattern?: RegExp
    }
  | {
      validate: (value: unknown, context: FormRuleContext) => string | void | Promise<string | void>
    }
export interface FormFieldDefinition {
  path: FormFieldPath
  name?: string
  label?: string
  value?: () => unknown
  rules?: readonly FormRule[]
}
export interface FormSchemaIssue {
  path: FormFieldPath
  message: string
}

export type FormValidator = (
  context: FormContext,
) => FormValidation | void | Promise<FormValidation | void>
export interface FormValidationAdapter {
  validate: FormValidator
  validateFields?: (
    context: FormContext,
    paths: readonly FormFieldPath[],
  ) => FormValidation | void | Promise<FormValidation | void>
}
export interface FormValidationCheck {
  status: 'valid' | 'invalid' | 'busy' | 'outdated'
  issues: readonly FormIssue[]
  message: string
}
