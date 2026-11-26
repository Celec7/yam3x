import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import semver from 'semver'

export const COMPONENTS_DIR = 'src/components/yam3x'
export const DEFAULT_STYLE = 'src/yam3x.css'

const sectionByKind = {
  runtime: 'dependencies',
  peer: 'peerDependencies',
  dev: 'devDependencies',
}

export function componentEntryFile(component) {
  return component.files.find((file) => file.endsWith('/index.ts'))
}

export function installedComponents(registry, projectRoot, lock) {
  const names = new Set()
  if (lock) {
    for (const name of Object.keys(lock.components)) {
      if (Object.hasOwn(registry.components, name)) names.add(name)
    }
  }
  for (const name of Object.keys(registry.components)) {
    const entry = componentEntryFile(registry.components[name])
    if (entry && existsSync(join(projectRoot, COMPONENTS_DIR, entry))) names.add(name)
  }
  return [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

export function coreInstalled(projectRoot, project, lock) {
  if (lock && Object.values(lock.files).some((file) => file.core)) return true
  return existsSync(join(projectRoot, project.yam3x?.style ?? DEFAULT_STYLE))
}

export function requiredPackageNames(registry, componentNames, includeCore) {
  const names = new Set()
  const add = (values) => {
    for (const value of values ?? []) names.add(value)
  }

  if (includeCore) {
    const core = registry.foundations.core
    add(core.dependencies)
    add(core.peerDependencies)
    add(core.devDependencies)
  }
  for (const name of componentNames) {
    const component = Object.hasOwn(registry.components, name)
      ? registry.components[name]
      : undefined
    if (!component) throw new Error(`Unknown component "${name}".`)
    add(component.dependencies)
    add(component.peerDependencies)
  }
  return names
}

function packageRequirements(registry, names) {
  return [...names].sort().map((name) => {
    const pkg = registry.packages[name]
    if (!pkg) throw new Error(`Registry metadata is missing package "${name}".`)
    return { name, range: pkg.range, kind: pkg.kind }
  })
}

function declaredDependency(project, name, kind) {
  if (kind === 'peer') {
    for (const section of ['peerDependencies', 'dependencies']) {
      if (project[section]?.[name]) return { section, range: project[section][name] }
    }
    return {}
  }

  const section = sectionByKind[kind]
  if (project[section]?.[name]) return { section, range: project[section][name] }
  for (const other of ['dependencies', 'peerDependencies', 'devDependencies']) {
    if (other !== section && project[other]?.[name]) {
      return { section: other, range: project[other][name], misplaced: true }
    }
  }
  return {}
}

async function installedVersion(projectRoot, name) {
  const path = join(projectRoot, 'node_modules', ...name.split('/'), 'package.json')
  try {
    return JSON.parse(await readFile(path, 'utf8')).version
  } catch {
    return undefined
  }
}

async function packagePlan(projectRoot, project, requirement) {
  const declared = declaredDependency(project, requirement.name, requirement.kind)
  const actual = await installedVersion(projectRoot, requirement.name)
  let status = 'ok'
  let action = 'none'

  if (!declared.range) {
    status = 'missing'
    action = requirement.kind === 'peer' ? 'manual' : 'add'
  } else if (!semver.validRange(declared.range)) {
    status = 'invalid'
    action = 'manual'
  } else if (!semver.subset(declared.range, requirement.range)) {
    status = 'unsafe'
    action = requirement.kind === 'peer' ? 'manual' : 'narrow'
  } else if (declared.misplaced) {
    status = 'misplaced'
    action = 'move'
  }

  if (actual && !semver.satisfies(actual, requirement.range) && status === 'ok') {
    status = 'installed-unsafe'
    action = 'install'
  }

  return {
    ...requirement,
    declared: declared.range,
    section: declared.section,
    misplaced: declared.misplaced ?? false,
    actual,
    status,
    action,
  }
}

function filePlan(registry, registryRoot, projectRoot, componentNames, includeCore) {
  const files = new Map()

  function add(relativeTarget, source) {
    const target = join(projectRoot, relativeTarget)
    const current = files.get(relativeTarget)
    assert.ok(
      !current || current.source === source,
      `Registry target ${relativeTarget} has more than one source.`,
    )
    if (!current)
      files.set(relativeTarget, { source, target, relativeTarget, exists: existsSync(target) })
  }

  if (includeCore) {
    for (const { source, target } of registry.foundations.core.files) {
      add(target, join(registryRoot, source))
    }
  }
  for (const name of componentNames) {
    const component = Object.hasOwn(registry.components, name)
      ? registry.components[name]
      : undefined
    if (!component) throw new Error(`Unknown component "${name}".`)
    for (const file of component.files) {
      add(join(COMPONENTS_DIR, file), join(registryRoot, 'components', file))
    }
  }
  return [...files.values()].sort((a, b) => a.relativeTarget.localeCompare(b.relativeTarget))
}

export async function planReconcile({
  registry,
  registryRoot,
  projectRoot,
  project,
  componentNames,
  includeCore,
}) {
  const errors = []
  for (const name of componentNames) {
    if (!Object.hasOwn(registry.components, name)) errors.push(`Unknown component "${name}".`)
  }
  const knownComponents = componentNames.filter((name) => Object.hasOwn(registry.components, name))
  const requirements = packageRequirements(
    registry,
    requiredPackageNames(registry, knownComponents, includeCore),
  )
  const packages = await Promise.all(
    requirements.map((requirement) => packagePlan(projectRoot, project, requirement)),
  )
  const files = filePlan(registry, registryRoot, projectRoot, knownComponents, includeCore)
  return { componentNames: knownComponents, includeCore, packages, files, errors }
}

export function planNeedsAttention(plan) {
  return (
    plan.errors.length > 0 ||
    plan.files.some((file) => !file.exists) ||
    plan.packages.some((pkg) => pkg.status !== 'ok')
  )
}

export function planNeedsInstall(plan) {
  return plan.packages.some(
    (pkg) =>
      pkg.action === 'add' ||
      pkg.action === 'narrow' ||
      pkg.action === 'move' ||
      pkg.action === 'install',
  )
}

export function applyPackagePlan(project, packages) {
  const changed = []
  for (const pkg of packages) {
    if (pkg.action === 'none' || pkg.action === 'install' || pkg.action === 'manual') continue
    const section = sectionByKind[pkg.kind]
    if (pkg.section && pkg.section !== section) delete project[pkg.section][pkg.name]
    project[section] ??= {}
    project[section][pkg.name] = pkg.range
    changed.push(pkg.name)
  }
  return changed
}

export function describePackage(pkg) {
  const declared = pkg.declared ? `${pkg.declared} (${pkg.section})` : 'missing'
  const actual = pkg.actual ? `, installed ${pkg.actual}` : ''
  return `${pkg.name} ${pkg.kind}: declared ${declared}, required ${pkg.range}${actual} [${pkg.status}]`
}
