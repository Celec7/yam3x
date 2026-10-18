export type FormPhase = 'validation' | 'submission'
export type FormStatus = 'idle' | 'validating' | 'submitting' | 'error' | 'success'
export interface FormContext {
  form: HTMLFormElement
  data: FormData
  submitter: HTMLElement | null
  signal: AbortSignal
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
