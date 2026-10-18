import type {
  FormContext,
  FormFieldDefinition,
  FormFieldPath,
  FormRule,
  FormSchemaIssue,
  FormValidation,
} from './form.types'

export interface ResolvedFormField extends FormFieldDefinition {
  name: string
  rules: readonly FormRule[]
}
export function formFieldName(path: FormFieldPath): string {
  return typeof path === 'string' ? path : path.map(String).join('.')
}
export function sameFormPath(left: FormFieldPath, right: FormFieldPath): boolean {
  if (typeof left === 'string' || typeof right === 'string') return left === right
  return left.length === right.length && left.every((segment, index) => segment === right[index])
}
export function resolveFormFields(fields: readonly FormFieldDefinition[]): ResolvedFormField[] {
  const names = new Set<string>()
  const paths: FormFieldPath[] = []
  return fields.map((field) => {
    const name = field.name ?? formFieldName(field.path)
    if (!name || names.has(name))
      throw new Error(`Form field names must be nonempty and unique: ${name}`)
    if (Array.isArray(field.path) && !field.path.length)
      throw new Error('Form field paths must not be empty.')
    if (paths.some((path) => sameFormPath(path, field.path)))
      throw new Error('Form field paths must be unique.')
    paths.push(field.path)
    names.add(name)
    return {
      ...field,
      path: typeof field.path === 'string' ? field.path : [...field.path],
      name,
      rules: field.rules?.map((rule) => ({ ...rule })) ?? [],
    }
  })
}
export function sameFormFields(
  left: readonly ResolvedFormField[],
  right: readonly ResolvedFormField[],
): boolean {
  return (
    left.length === right.length &&
    left.every((field, index) => {
      const other = right[index]!
      return (
        field.name === other.name &&
        sameFormPath(field.path, other.path) &&
        field.rules.length === other.rules.length &&
        field.rules.every((rule, ruleIndex) => {
          const candidate = other.rules[ruleIndex]!
          return (
            Object.keys(rule).length === Object.keys(candidate).length &&
            Object.entries(rule).every(([key, value]) =>
              Object.is(value, candidate[key as keyof typeof candidate]),
            )
          )
        })
      )
    })
  )
}
function dataValue(data: FormData, name: string): unknown {
  const values = data.getAll(name)
  return values.length > 1 ? values : values[0]
}
function constraintFails(value: unknown, rule: Exclude<FormRule, { validate: unknown }>): boolean {
  const empty =
    value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
  if (empty) return Boolean(rule.required)
  const length = typeof value === 'string' || Array.isArray(value) ? value.length : undefined
  return (
    (rule.minLength !== undefined && (length === undefined || length < rule.minLength)) ||
    (rule.maxLength !== undefined && (length === undefined || length > rule.maxLength)) ||
    (rule.min !== undefined &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < rule.min)) ||
    (rule.max !== undefined &&
      (typeof value !== 'number' || !Number.isFinite(value) || value > rule.max)) ||
    (rule.pattern !== undefined &&
      (typeof value !== 'string' ||
        !new RegExp(rule.pattern.source, rule.pattern.flags).test(value)))
  )
}
function constraintMessage(
  value: unknown,
  rule: Exclude<FormRule, { validate: unknown }>,
): string | undefined {
  if (!constraintFails(value, rule)) return
  if (!rule.message.trim())
    throw new Error('Form constraint rules require a nonempty error message.')
  return rule.message
}
export async function validateFormFields(
  fields: readonly ResolvedFormField[],
  context: FormContext,
  selected?: ReadonlySet<string>,
): Promise<FormValidation> {
  // Capture every registered value before an asynchronous rule can yield.
  const values = new Map(
    fields.map((field) => [
      field.name,
      field.value ? field.value() : dataValue(context.data, field.name),
    ]),
  )
  const getValue = (path: FormFieldPath) => {
    const field = fields.find((field) =>
      typeof path === 'string' ? field.name === path : sameFormPath(field.path, path),
    )
    return field ? values.get(field.name) : dataValue(context.data, formFieldName(path))
  }
  const errors: Array<[string, string]> = []
  for (const field of fields) {
    if (selected && !selected.has(field.name)) continue
    for (const rule of field.rules) {
      if (context.signal.aborted) return {}
      const message =
        'validate' in rule
          ? await rule.validate(values.get(field.name), {
              ...context,
              path: field.path,
              name: field.name,
              getValue,
            })
          : constraintMessage(values.get(field.name), rule)
      if (message) {
        errors.push([field.name, message])
        break
      }
    }
  }
  return { fieldErrors: Object.fromEntries(errors) }
}
/** Converts schema-library issue paths into the native names used by Form feedback. */
export function formValidationFromIssues(
  issues: readonly FormSchemaIssue[],
  fields: readonly FormFieldDefinition[] = [],
): FormValidation {
  const errors = new Map<string, string>()
  let message: string | undefined
  for (const issue of issues) {
    if (typeof issue.path !== 'string' && !issue.path.length) {
      if (issue.message) message ??= issue.message
      continue
    }
    const field = fields.find((field) => sameFormPath(field.path, issue.path))
    const name = field?.name ?? formFieldName(issue.path)
    if (issue.message && !errors.has(name)) errors.set(name, issue.message)
  }
  return { fieldErrors: Object.fromEntries(errors), ...(message ? { message } : {}) }
}

export function formFieldScope(
  fields: readonly ResolvedFormField[],
  paths: readonly FormFieldPath[],
): Set<string> {
  const names = new Set(paths.filter((path): path is string => typeof path === 'string'))
  for (const field of fields) {
    if (
      paths.some((path) =>
        typeof path === 'string'
          ? field.name === path
          : typeof field.path !== 'string' &&
            path.length <= field.path.length &&
            path.every((segment, index) => segment === field.path[index]),
      )
    )
      names.add(field.name)
  }
  return names
}
