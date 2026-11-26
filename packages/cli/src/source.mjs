import { join, relative } from 'node:path'
import { COMPONENTS_DIR } from './plan.mjs'
import { hashFile, projectPath, toPosix } from './lock.mjs'

export const SOURCE_STATES = [
  'current',
  'converged',
  'upstream-only',
  'local-only',
  'conflict',
  'missing',
  'untracked',
  'added',
  'removed',
]

export function sourceState({ base, local, upstream }) {
  if (!upstream) return 'removed'
  if (!local) return 'missing'
  if (local === base && upstream === base) return 'current'
  if (local === upstream) return 'converged'
  if (local === base) return 'upstream-only'
  if (upstream === base) return 'local-only'
  return 'conflict'
}

export function sourceCounts(files) {
  const counts = Object.fromEntries(SOURCE_STATES.map((state) => [state, 0]))
  for (const file of files) counts[file.state] += 1
  return counts
}

export function sourceSummary(counts) {
  const parts = [`${counts.current} current`]
  for (const state of SOURCE_STATES.slice(1)) {
    if (counts[state] > 0) parts.push(`${counts[state]} ${state}`)
  }
  return parts.join(', ')
}

export function sourceNeedsAttention(counts) {
  return counts.conflict > 0 || counts.missing > 0
}

export function hasSourceChanges(files) {
  return files.some((file) => file.state !== 'current' && file.state !== 'converged')
}

export function filterSourceFiles(files, component) {
  if (!component) return files
  return files.filter((file) => file.components.includes(component))
}

function sourcePath(registryRoot, file) {
  const source = toPosix(relative(registryRoot, file.source))
  if (!source || source === '..' || source.startsWith('../')) {
    throw new Error(`Registry source is outside the registry: ${file.source}`)
  }
  return source
}

export async function classifySource({ lock, plan, registry, registryRoot, projectRoot }) {
  const hashes = new Map()
  async function hash(path) {
    if (!hashes.has(path)) hashes.set(path, await hashFile(path))
    return hashes.get(path)
  }

  const planByTarget = new Map(plan.files.map((file) => [toPosix(file.relativeTarget), file]))
  const ownersByTarget = new Map()
  for (const name of plan.componentNames) {
    for (const file of registry.components[name].files) {
      const target = toPosix(join(COMPONENTS_DIR, file))
      if (!ownersByTarget.has(target)) ownersByTarget.set(target, new Set())
      ownersByTarget.get(target).add(name)
    }
  }
  const coreTargets = new Set(registry.foundations.core.files.map((file) => toPosix(file.target)))
  const files = []

  for (const [target, entry] of Object.entries(lock.files)) {
    const current = planByTarget.get(target)
    const upstream = current ? await hash(current.source) : undefined
    if (current && !upstream) throw new Error(`Registry source is missing: ${entry.source}`)
    const local = await hash(projectPath(projectRoot, target))
    files.push({
      target,
      source: current ? sourcePath(registryRoot, current) : entry.source,
      version: entry.version,
      components: [...new Set(entry.components ?? ownersByTarget.get(target) ?? [])].sort(),
      core: entry.core === true || coreTargets.has(target),
      baseIntegrity: entry.integrity,
      upstreamIntegrity: upstream ?? null,
      state: sourceState({ base: entry.integrity, local, upstream }),
    })
  }

  for (const current of plan.files) {
    const target = toPosix(current.relativeTarget)
    if (lock.files[target]) continue
    const upstream = await hash(current.source)
    if (!upstream)
      throw new Error(`Registry source is missing: ${sourcePath(registryRoot, current)}`)
    const local = await hash(current.target)
    files.push({
      target,
      source: sourcePath(registryRoot, current),
      version: null,
      components: [...(ownersByTarget.get(target) ?? [])].sort(),
      core: coreTargets.has(target),
      baseIntegrity: null,
      upstreamIntegrity: upstream,
      state: local ? 'untracked' : 'added',
    })
  }

  files.sort((a, b) => (a.target < b.target ? -1 : a.target > b.target ? 1 : 0))
  return { files, counts: sourceCounts(files) }
}
