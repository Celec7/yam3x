import type { CascaderOption } from './cascader.types'

export function validateCascaderOptions(options: readonly CascaderOption[]) {
  const ancestors = new Set<CascaderOption>()
  function visit(list: readonly CascaderOption[]) {
    if (!Array.isArray(list)) throw new TypeError('Cascader options must be arrays.')
    const siblings = new Set<string>()
    for (const option of list) {
      if (
        !option ||
        typeof option.value !== 'string' ||
        !option.value ||
        typeof option.label !== 'string'
      )
        throw new TypeError('Cascader options need non-empty string values and string labels.')
      if (siblings.has(option.value)) throw new Error('Cascader sibling values must be unique.')
      if (ancestors.has(option)) throw new Error('Cascader options must be acyclic.')
      siblings.add(option.value)
      ancestors.add(option)
      if (option.children !== undefined) visit(option.children)
      ancestors.delete(option)
    }
  }
  visit(options)
}

export function resolveCascaderPath(options: readonly CascaderOption[], values: readonly string[]) {
  const nodes: CascaderOption[] = []
  let list = options
  for (const value of values) {
    const option = list.find((candidate) => candidate.value === value)
    if (!option) break
    nodes.push(option)
    list = option.children ?? []
  }
  return {
    nodes,
    disabled: nodes.some((node) => node.disabled),
    complete: nodes.length === values.length,
  }
}

export function cascaderPaths(options: readonly CascaderOption[], branches: boolean) {
  const result: Array<{ values: string[]; nodes: CascaderOption[]; disabled: boolean }> = []
  function visit(list: readonly CascaderOption[], parents: CascaderOption[]) {
    for (const option of list) {
      const nodes = [...parents, option]
      if (branches || !option.children?.length)
        result.push({
          values: nodes.map((node) => node.value),
          nodes,
          disabled: nodes.some((node) => node.disabled),
        })
      if (option.children?.length) visit(option.children, nodes)
    }
  }
  visit(options, [])
  return result
}
