import { createHash } from 'node:crypto'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { COMPONENTS_DIR, componentEntryFile } from './plan.mjs'

export const LOCKFILE = 'yam3x.lock.json'
export const LOCK_SCHEMA_VERSION = 1
export const LOCK_PACKAGE = '@celec7/yam3x'
export const LOCK_REGISTRY = 'yam3x'

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function compareKeys(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function toPosix(path) {
  return path.split(sep).join('/')
}

export function projectPath(projectRoot, target) {
  return join(projectRoot, ...target.split('/'))
}

export function canonicalHash(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  return `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`
}

export async function hashFile(path) {
  try {
    return canonicalHash(await readFile(path, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

export function emptyLock() {
  return {
    schemaVersion: LOCK_SCHEMA_VERSION,
    package: LOCK_PACKAGE,
    registry: LOCK_REGISTRY,
    components: {},
    files: {},
  }
}

function validateLock(lock) {
  if (!isRecord(lock)) throw new Error('lockfile must be an object')
  if (lock.schemaVersion !== LOCK_SCHEMA_VERSION) {
    throw new Error(`unsupported schemaVersion ${JSON.stringify(lock.schemaVersion)}`)
  }
  if (lock.package !== LOCK_PACKAGE) {
    throw new Error(`package must be ${LOCK_PACKAGE}`)
  }
  if (lock.registry !== LOCK_REGISTRY) {
    throw new Error(`registry must be ${LOCK_REGISTRY}`)
  }
  if (!isRecord(lock.components)) throw new Error('components must be an object')
  if (!isRecord(lock.files)) throw new Error('files must be an object')

  for (const [name, component] of Object.entries(lock.components)) {
    if (!isRecord(component) || typeof component.entry !== 'string' || !component.entry) {
      throw new Error(`components.${name}.entry must be a nonempty string`)
    }
  }

  for (const [target, file] of Object.entries(lock.files)) {
    if (!isRecord(file)) throw new Error(`files.${target} must be an object`)
    if (typeof file.source !== 'string' || !file.source) {
      throw new Error(`files.${target}.source must be a nonempty string`)
    }
    if (typeof file.version !== 'string' || !file.version) {
      throw new Error(`files.${target}.version must be a nonempty string`)
    }
    if (typeof file.integrity !== 'string' || !file.integrity.startsWith('sha256-')) {
      throw new Error(`files.${target}.integrity must be a sha256- integrity`)
    }
    if (
      file.components !== undefined &&
      (!Array.isArray(file.components) || file.components.some((name) => typeof name !== 'string'))
    ) {
      throw new Error(`files.${target}.components must be an array of strings`)
    }
    if (file.core !== undefined && typeof file.core !== 'boolean') {
      throw new Error(`files.${target}.core must be a boolean`)
    }
  }
}

export function normalizeLock(lock) {
  validateLock(lock)
  const components = Object.fromEntries(
    Object.entries(lock.components)
      .sort(([a], [b]) => compareKeys(a, b))
      .map(([name, component]) => [name, { entry: component.entry }]),
  )
  const files = Object.fromEntries(
    Object.entries(lock.files)
      .sort(([a], [b]) => compareKeys(a, b))
      .map(([target, file]) => {
        const entry = {
          source: file.source,
          version: file.version,
          integrity: file.integrity,
        }
        const components = [...new Set(file.components ?? [])].sort(compareKeys)
        if (components.length > 0) entry.components = components
        if (file.core) entry.core = true
        return [target, entry]
      }),
  )
  return {
    schemaVersion: LOCK_SCHEMA_VERSION,
    package: LOCK_PACKAGE,
    registry: LOCK_REGISTRY,
    components,
    files,
  }
}

export function lockContents(lock) {
  return `${JSON.stringify(normalizeLock(lock), null, 2)}\n`
}

export async function readLock(projectRoot) {
  const path = join(projectRoot, LOCKFILE)
  let source
  try {
    source = await readFile(path, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }

  try {
    return normalizeLock(JSON.parse(source))
  } catch (error) {
    throw new Error(`Invalid ${LOCKFILE}: ${error.message}`, { cause: error })
  }
}

export async function writeLock(projectRoot, lock) {
  const path = join(projectRoot, LOCKFILE)
  const temporary = join(projectRoot, `.${LOCKFILE}.${process.pid}.tmp`)
  try {
    await writeFile(temporary, lockContents(lock))
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

export function lockVersions(lock) {
  return [...new Set(Object.values(lock.files).map((file) => file.version))].sort(compareKeys)
}

export async function lockDrift(lock, projectRoot) {
  const drift = { clean: 0, modified: 0, missing: 0 }
  for (const [target, file] of Object.entries(lock.files)) {
    const current = await hashFile(projectPath(projectRoot, target))
    if (!current) drift.missing += 1
    else if (current === file.integrity) drift.clean += 1
    else drift.modified += 1
  }
  return drift
}

export async function updateLockFromPlan({
  lock,
  plan,
  registry,
  registryRoot,
  version,
  addedFiles = [],
}) {
  if (typeof version !== 'string' || !version) throw new Error('A lock version is required.')

  const next = normalizeLock(lock ?? emptyLock())
  const added = new Set(addedFiles.map(toPosix))
  const coreTargets = new Set(registry.foundations.core.files.map((file) => toPosix(file.target)))
  const ownersByTarget = new Map()

  for (const name of plan.componentNames) {
    const component = registry.components[name]
    for (const file of component.files) {
      const target = toPosix(join(COMPONENTS_DIR, file))
      if (!ownersByTarget.has(target)) ownersByTarget.set(target, new Set())
      ownersByTarget.get(target).add(name)
    }
    const entry = componentEntryFile(component)
    if (entry) next.components[name] = { entry: toPosix(join(COMPONENTS_DIR, entry)) }
  }

  for (const file of plan.files) {
    const target = toPosix(file.relativeTarget)
    const source = toPosix(relative(registryRoot, file.source))
    if (!source || source === '..' || source.startsWith('../')) {
      throw new Error(`Registry source is outside the registry: ${file.source}`)
    }

    const upstream = await hashFile(file.source)
    if (!upstream) throw new Error(`Registry source is missing: ${source}`)
    const local = await hashFile(file.target)
    const current = next.files[target]
    const owners = ownersByTarget.get(target)
    const core = coreTargets.has(target)

    if (current) {
      if (owners) {
        const merged = new Set([...(current.components ?? []), ...owners])
        if (merged.size !== (current.components ?? []).length)
          current.components = [...merged].sort(compareKeys)
      }
      if (core) current.core = true
      if (added.has(target)) {
        current.source = source
        current.version = version
        current.integrity = upstream
      }
      continue
    }

    if (!local || local !== upstream) continue

    const entry = {
      source,
      version,
      integrity: upstream,
    }
    if (owners) entry.components = [...owners].sort(compareKeys)
    if (core) entry.core = true
    next.files[target] = entry
  }

  if (!lock && Object.keys(next.files).length === 0) {
    return { lock: next, changed: false }
  }

  const before = lockContents(lock ?? emptyLock())
  const after = lockContents(next)
  return { lock: next, changed: before !== after }
}
