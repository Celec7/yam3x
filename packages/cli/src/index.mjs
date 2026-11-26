#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  emptyLock,
  lockVersions,
  normalizeLock,
  projectPath,
  readLock,
  toPosix,
  updateLockFromPlan,
  writeLock,
} from './lock.mjs'
import {
  applyJournal,
  journalFromSource,
  readJournal,
  recoverJournal,
  removeJournal,
  removeJournalTargets,
  resolveLockTarget,
  writeJournal,
} from './upgrade.mjs'
import {
  classifySource,
  filterSourceFiles,
  hasSourceChanges,
  sourceCounts,
  sourceNeedsAttention,
  sourceSummary,
} from './source.mjs'
import {
  applyPackagePlan,
  coreInstalled,
  DEFAULT_STYLE,
  describePackage,
  installedComponents,
  planNeedsAttention,
  planNeedsInstall,
  planReconcile,
} from './plan.mjs'

const cliDirectory = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(cliDirectory, '..')
const registryRoot = join(packageRoot, 'registry')
const manualActions = new Set(['manual', 'narrow', 'move', 'invalid'])

function parseOptions(args) {
  const options = {
    positional: [],
    cwd: process.cwd(),
    install: true,
    dryRun: false,
    json: false,
    component: undefined,
    from: '0.6.0',
    applyClean: false,
    finalize: false,
    resolve: [],
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--cwd') {
      const value = args[index + 1]
      if (!value) throw new Error('--cwd requires a project path.')
      options.cwd = isAbsolute(value) ? value : resolve(process.cwd(), value)
      index += 1
    } else if (argument === '--component') {
      const value = args[index + 1]
      if (!value) throw new Error('--component requires a component name.')
      options.component = value
      index += 1
    } else if (argument === '--from') {
      const value = args[index + 1]
      if (!value) throw new Error('--from requires a version.')
      options.from = value
      index += 1
    } else if (argument === '--apply-clean') {
      options.applyClean = true
    } else if (argument === '--finalize') {
      options.finalize = true
    } else if (argument === '--resolve') {
      const value = args[index + 1]
      if (!value) throw new Error('--resolve requires a target path.')
      options.resolve.push(value)
      index += 1
    } else if (argument === '--no-install') {
      options.install = false
    } else if (argument === '--dry-run') {
      options.dryRun = true
    } else if (argument === '--json') {
      options.json = true
    } else {
      options.positional.push(argument)
    }
  }

  return options
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

async function readRegistry() {
  const path = join(registryRoot, 'registry.json')
  try {
    return await readJson(path)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        'Registry metadata is missing. Run `pnpm registry:prepare` from the repository root.',
        { cause: error },
      )
    }
    throw error
  }
}

async function readBaseline(version) {
  const path = join(packageRoot, 'baselines', `${version}.json`)
  let source
  try {
    source = await readFile(path, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`No adopt baseline is available for version ${version}.`, { cause: error })
    }
    throw error
  }
  try {
    return normalizeLock(JSON.parse(source))
  } catch (error) {
    throw new Error(`Invalid baseline ${version}: ${error.message}`, { cause: error })
  }
}

function packageManager(project, projectRoot) {
  const declared = project.packageManager?.split('@')[0]
  if (declared && ['pnpm', 'npm', 'yarn', 'bun'].includes(declared)) return declared
  for (const [lock, name] of [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
    ['package-lock.json', 'npm'],
  ]) {
    if (existsSync(join(projectRoot, lock))) return name
  }
  return 'npm'
}

async function installDependencies(project, projectRoot) {
  const manager = packageManager(project, projectRoot)
  const args = manager === 'npm' ? ['install'] : ['install']
  const result = spawnSync(manager, args, { cwd: projectRoot, stdio: 'inherit' })

  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(`${manager} install failed with exit code ${result.status}.`)
}

async function copyIfMissing(source, destination) {
  if (existsSync(destination)) return false
  await mkdir(dirname(destination), { recursive: true })
  await cp(source, destination, { recursive: true, errorOnExist: true })
  return true
}

async function findExistingMain(projectRoot) {
  for (const name of ['main.ts', 'main.js']) {
    const path = join(projectRoot, 'src', name)
    if (existsSync(path)) return path
  }
  return undefined
}

async function requireMain(projectRoot) {
  const main = await findExistingMain(projectRoot)
  if (!main) {
    throw new Error(
      'Could not find src/main.ts or src/main.js. Create a Vue app entry before running this command.',
    )
  }
  return main
}

function setProjectConfig(project) {
  project.yam3x = {
    ...(project.yam3x ?? {}),
    registry: 'yam3x',
    style: project.yam3x?.style ?? DEFAULT_STYLE,
  }
}

async function injectStyleImport(projectRoot) {
  const mainPath = await findExistingMain(projectRoot)
  if (!mainPath) {
    throw new Error(
      'Could not find src/main.ts or src/main.js. Create a Vue app entry before running yam3x init.',
    )
  }
  let source = await readFile(mainPath, 'utf8')
  if (!source.includes("'./yam3x.css'") && !source.includes('"./yam3x.css"')) {
    source = `import './yam3x.css'\n${source}`
    await writeFile(mainPath, source)
  }
}

async function applyPlan(plan, project, { copyFiles = true } = {}) {
  const addedFiles = []
  if (copyFiles) {
    for (const file of plan.files) {
      if (await copyIfMissing(file.source, file.target)) addedFiles.push(file.relativeTarget)
    }
  }
  const changedPackages = applyPackagePlan(project, plan.packages)
  return { addedFiles, changedPackages }
}

function planBlocking(plan, actions) {
  return plan.errors.length > 0 || plan.packages.some((pkg) => actions.has(pkg.action))
}

function blockingMessage(plan, actions) {
  const lines = [...plan.errors]
  for (const pkg of plan.packages) {
    if (!actions.has(pkg.action)) continue
    if (pkg.status === 'missing') {
      lines.push(
        `Missing ${pkg.kind} dependency ${pkg.name} (${pkg.range}). Add it to the application before continuing.`,
      )
    } else if (pkg.status === 'invalid') {
      lines.push(
        `Existing ${pkg.kind} entry for ${pkg.name} (${pkg.declared}) is not a valid semver range. Update it before continuing.`,
      )
    } else {
      lines.push(
        `Existing ${pkg.kind} entry for ${pkg.name} (${pkg.declared}) does not satisfy the registry requirement (${pkg.range}). Update it before continuing.`,
      )
    }
  }
  return lines.join('\n')
}

function printPlan(plan, { json }) {
  if (json) {
    console.log(JSON.stringify(plan, null, 2))
    return
  }
  const issues = plan.packages.filter((pkg) => pkg.status !== 'ok')
  const missingFiles = plan.files.filter((file) => !file.exists)
  if (!issues.length && !missingFiles.length && !plan.errors.length) {
    console.log('Dependencies are up to date.')
    return
  }
  for (const pkg of issues) console.log(describePackage(pkg))
  if (missingFiles.length) {
    console.log(`Missing files: ${missingFiles.length}`)
    for (const file of missingFiles.slice(0, 10)) console.log(`  ${file.relativeTarget}`)
    if (missingFiles.length > 10) console.log(`  ...and ${missingFiles.length - 10} more`)
  }
  for (const error of plan.errors) console.log(`Error: ${error}`)
}

function printFileSummary(files) {
  console.log(
    files.length ? `Added ${files.length} source file(s).` : 'No new source files were needed.',
  )
}

function printDependencySummary(packages) {
  const names = [...new Set(packages)]
  console.log(
    names.length ? `Declared dependencies: ${names.join(', ')}` : 'No new npm dependencies.',
  )
}

function printLockSummary(lock, summary) {
  const versions = lockVersions(lock)
  const components = Object.keys(lock.components).length
  const files = Object.keys(lock.files).length
  console.log(
    `Lock baseline: ${versions.length ? versions.join(', ') : 'none'} (${components} component(s), ${files} file(s))`,
  )
  console.log(`Source: ${summary}`)
}

function printSourceDiff(files) {
  const changes = files.filter((file) => file.state !== 'current' && file.state !== 'converged')
  if (changes.length === 0) {
    console.log('Source is up to date.')
    return
  }
  for (const file of changes) console.log(`${file.state.padEnd(14)} ${file.target}`)
}

const UPGRADE_BLOCKERS = new Set([
  'upstream-only',
  'conflict',
  'missing',
  'untracked',
  'added',
  'removed',
])

function upgradeBlockers(files) {
  return files.filter((file) => UPGRADE_BLOCKERS.has(file.state))
}

function printUpgradePlan(source, journal) {
  printSourceDiff(source.files)
  const apply = source.files.filter((file) => file.state === 'upstream-only').length
  const conflict = source.files.filter((file) => file.state === 'conflict').length
  if (apply > 0 || conflict > 0) {
    console.log(`Apply ${apply} clean file(s); resolve ${conflict} conflict(s).`)
  }
  if (journal?.files.length) {
    console.log(
      `Journal: ${journal.files.length} unresolved entr${journal.files.length === 1 ? 'y' : 'ies'}.`,
    )
  }
}

async function recordSourceBaseline({ lock, plan, registry, version, addedFiles, projectRoot }) {
  const { lock: nextLock, changed } = await updateLockFromPlan({
    lock,
    plan,
    registry,
    registryRoot,
    version,
    addedFiles,
  })
  if (!changed) return false
  await writeLock(projectRoot, nextLock)
  return true
}

async function installIfNeeded(plan, project, options) {
  if (!planNeedsInstall(plan)) return
  if (options.install) {
    await installDependencies(project, options.cwd)
  } else {
    console.log('Run your package manager install command to resolve the new dependencies.')
  }
}

async function run() {
  const [command, ...args] = process.argv.slice(2)
  if (command === '--version' || command === '-v') {
    const { version } = await readJson(join(packageRoot, 'package.json'))
    console.log(`yam3x ${version}`)
    return
  }

  if (!command || command === '--help' || command === '-h') {
    console.log(
      'Usage: yam3x --version\n       yam3x list\n       yam3x init [--cwd <project>] [--no-install]\n       yam3x add <component> [component ...] [--cwd <project>] [--no-install]\n       yam3x adopt [--from <version>] [--cwd <project>] [--dry-run]\n       yam3x status [--cwd <project>] [--json]\n       yam3x diff [--component <component>] [--cwd <project>] [--json]\n       yam3x upgrade [--apply-clean] [--resolve <target>] [--finalize] [--cwd <project>] [--json]\n       yam3x sync [--cwd <project>] [--dry-run] [--no-install]',
    )
    return
  }

  const registry = await readRegistry()
  if (command === 'list') {
    console.log(Object.keys(registry.components).sort().join('\n'))
    return
  }

  const options = parseOptions(args)
  const packagePath = join(options.cwd, 'package.json')
  const project = await readJson(packagePath)

  if (command === 'init') {
    await requireMain(options.cwd)
    const lock = await readLock(options.cwd)
    const plan = await planReconcile({
      registry,
      registryRoot,
      projectRoot: options.cwd,
      project,
      componentNames: [],
      includeCore: true,
    })
    if (planBlocking(plan, manualActions)) throw new Error(blockingMessage(plan, manualActions))
    if (options.dryRun) {
      printPlan(plan, options)
      return
    }
    const { addedFiles, changedPackages } = await applyPlan(plan, project)
    const { version } = await readJson(join(packageRoot, 'package.json'))
    const recorded = await recordSourceBaseline({
      lock,
      plan,
      registry,
      version,
      addedFiles,
      projectRoot: options.cwd,
    })
    setProjectConfig(project)
    await injectStyleImport(options.cwd)
    await writeJson(packagePath, project)
    printFileSummary(addedFiles)
    printDependencySummary(changedPackages)
    if (recorded) console.log('Recorded source baseline in yam3x.lock.json.')
    await installIfNeeded(plan, project, options)
    return
  }

  if (command === 'add') {
    const components = [...new Set(options.positional)]
    if (components.length === 0) throw new Error('yam3x add requires at least one component name.')
    await requireMain(options.cwd)
    const lock = await readLock(options.cwd)
    const plan = await planReconcile({
      registry,
      registryRoot,
      projectRoot: options.cwd,
      project,
      componentNames: components,
      includeCore: true,
    })
    if (planBlocking(plan, manualActions)) throw new Error(blockingMessage(plan, manualActions))
    if (options.dryRun) {
      printPlan(plan, options)
      return
    }
    const { addedFiles, changedPackages } = await applyPlan(plan, project)
    const { version } = await readJson(join(packageRoot, 'package.json'))
    const recorded = await recordSourceBaseline({
      lock,
      plan,
      registry,
      version,
      addedFiles,
      projectRoot: options.cwd,
    })
    setProjectConfig(project)
    await injectStyleImport(options.cwd)
    await writeJson(packagePath, project)
    printFileSummary(addedFiles)
    printDependencySummary(changedPackages)
    if (recorded) console.log('Recorded source baseline in yam3x.lock.json.')
    await installIfNeeded(plan, project, options)
    return
  }

  if (command === 'adopt') {
    const baseline = await readBaseline(options.from)
    if (await readLock(options.cwd)) throw new Error('yam3x.lock.json already exists.')
    const installed = new Set()
    for (const [name, component] of Object.entries(baseline.components)) {
      if (existsSync(projectPath(options.cwd, component.entry))) installed.add(name)
    }
    const core = existsSync(projectPath(options.cwd, project.yam3x?.style ?? DEFAULT_STYLE))
    if (installed.size === 0 && !core) {
      throw new Error('No YAM3X source was found to adopt.')
    }

    const nextLock = emptyLock()
    for (const name of installed) nextLock.components[name] = baseline.components[name]
    for (const [target, file] of Object.entries(baseline.files)) {
      const owners = (file.components ?? []).filter((name) => installed.has(name))
      const required = file.core ? core : owners.length > 0
      if (!required) continue
      const entry = {
        source: file.source,
        version: file.version,
        integrity: file.integrity,
      }
      if (owners.length > 0) entry.components = owners
      if (file.core) entry.core = true
      nextLock.files[target] = entry
    }
    const lock = normalizeLock(nextLock)
    const files = Object.keys(lock.files).length
    const summary = `Adopted ${options.from} baseline: ${installed.size} component(s), ${files} file(s).`
    if (options.dryRun) {
      console.log(summary)
      return
    }
    await writeLock(options.cwd, lock)
    console.log(summary)
    return
  }

  if (command === 'status') {
    const lock = await readLock(options.cwd)
    const components = installedComponents(registry, options.cwd, lock)
    const includeCore = coreInstalled(options.cwd, project, lock) || components.length > 0
    if (!components.length && !includeCore) {
      console.log('No YAM3X components are installed.')
      return
    }
    const plan = await planReconcile({
      registry,
      registryRoot,
      projectRoot: options.cwd,
      project,
      componentNames: components,
      includeCore,
    })
    if (lock) {
      const { version } = await readJson(join(packageRoot, 'package.json'))
      const source = await classifySource({
        lock,
        plan,
        registry,
        registryRoot,
        projectRoot: options.cwd,
      })
      plan.lock = {
        versions: lockVersions(lock),
        components: Object.keys(lock.components).length,
        files: Object.keys(lock.files).length,
      }
      plan.source = { targetVersion: version, ...source }
      if (!options.json) printLockSummary(lock, sourceSummary(source.counts))
      if (sourceNeedsAttention(source.counts)) process.exitCode = 1
    }
    printPlan(plan, options)
    if (planNeedsAttention(plan)) process.exitCode = 1
    return
  }

  if (command === 'diff') {
    const lock = await readLock(options.cwd)
    if (!lock) throw new Error('No yam3x.lock.json found.')
    const components = installedComponents(registry, options.cwd, lock)
    const includeCore = coreInstalled(options.cwd, project, lock) || components.length > 0
    if (!components.length && !includeCore) {
      console.log('No YAM3X components are installed.')
      return
    }
    if (options.component && !components.includes(options.component)) {
      throw new Error(`Component "${options.component}" is not installed.`)
    }
    const plan = await planReconcile({
      registry,
      registryRoot,
      projectRoot: options.cwd,
      project,
      componentNames: components,
      includeCore,
    })
    const source = await classifySource({
      lock,
      plan,
      registry,
      registryRoot,
      projectRoot: options.cwd,
    })
    const files = filterSourceFiles(source.files, options.component)
    const counts = sourceCounts(files)
    const { version } = await readJson(join(packageRoot, 'package.json'))
    if (options.json) {
      console.log(JSON.stringify({ targetVersion: version, counts, files }, null, 2))
    } else {
      printSourceDiff(files)
    }
    if (hasSourceChanges(files)) process.exitCode = 1
    return
  }

  if (command === 'upgrade') {
    if (options.applyClean && (options.finalize || options.resolve.length > 0)) {
      throw new Error('--apply-clean cannot be combined with --resolve or --finalize.')
    }
    if (options.finalize && options.resolve.length > 0) {
      throw new Error('--finalize cannot be combined with --resolve.')
    }
    if (options.dryRun && (options.resolve.length > 0 || options.finalize)) {
      throw new Error('--dry-run supports upgrade planning only.')
    }

    const lock = await readLock(options.cwd)
    if (!lock) throw new Error('No yam3x.lock.json found.')
    const components = installedComponents(registry, options.cwd, lock)
    const includeCore = coreInstalled(options.cwd, project, lock) || components.length > 0
    if (!components.length && !includeCore) {
      console.log('No YAM3X components are installed.')
      return
    }

    const { version } = await readJson(join(packageRoot, 'package.json'))
    const makePlan = () =>
      planReconcile({
        registry,
        registryRoot,
        projectRoot: options.cwd,
        project,
        componentNames: components,
        includeCore,
      })
    const classify = async (plan) =>
      classifySource({
        lock,
        plan,
        registry,
        registryRoot,
        projectRoot: options.cwd,
      })

    let plan = await makePlan()
    let source = await classify(plan)
    let journal = await readJournal(options.cwd)
    const needsRecovery =
      !options.dryRun && (options.applyClean || options.finalize || options.resolve.length > 0)
    if (journal && needsRecovery) {
      const recovered = await recoverJournal({ journal, lock, projectRoot: options.cwd })
      journal = recovered.journal
      if (recovered.lockChanged) await writeLock(options.cwd, lock)
      if (journal.files.length > 0) {
        await writeJournal(options.cwd, journal)
      } else {
        await removeJournal(options.cwd)
        journal = undefined
      }
      plan = await makePlan()
      source = await classify(plan)
    }

    if (options.resolve.length > 0) {
      const targets = options.resolve.map(toPosix)
      const resolved = []
      let lockChanged = false
      for (const target of targets) {
        const file = source.files.find((item) => item.target === target)
        if (!file) throw new Error(`Unknown source file "${target}".`)
        if (file.state !== 'conflict' && file.state !== 'converged') {
          throw new Error(
            `Cannot resolve ${target} in state ${file.state}; only conflict or converged files can be resolved.`,
          )
        }
        if (resolveLockTarget(lock, file, version)) lockChanged = true
        resolved.push(target)
      }
      if (lockChanged) await writeLock(options.cwd, lock)
      if (journal) {
        journal = removeJournalTargets(journal, resolved)
        if (journal.files.length > 0) {
          await writeJournal(options.cwd, journal)
        } else {
          await removeJournal(options.cwd)
          journal = undefined
        }
      }
      plan = await makePlan()
      source = await classify(plan)
      if (options.json) {
        console.log(
          JSON.stringify(
            { targetVersion: version, resolved, counts: source.counts, files: source.files },
            null,
            2,
          ),
        )
      } else {
        console.log(`Resolved ${resolved.length} conflict(s).`)
        console.log(`Source: ${sourceSummary(source.counts)}`)
        printSourceDiff(source.files)
      }
      if (journal?.files.length) process.exitCode = 1
      return
    }

    if (options.finalize) {
      if (journal?.files.length) {
        throw new Error(
          'The upgrade journal still has unresolved entries. Run --apply-clean or --resolve first.',
        )
      }
      const blockers = upgradeBlockers(source.files)
      if (blockers.length > 0) {
        throw new Error(
          `Cannot finalize with unresolved source states: ${blockers
            .map((file) => `${file.state} ${file.target}`)
            .join(', ')}`,
        )
      }
      if (journal) await removeJournal(options.cwd)
      if (options.json) {
        console.log(
          JSON.stringify(
            { targetVersion: version, finalized: true, counts: source.counts, files: source.files },
            null,
            2,
          ),
        )
      } else {
        console.log('Upgrade finalized.')
        console.log(`Source: ${sourceSummary(source.counts)}`)
      }
      return
    }

    if (!options.applyClean || options.dryRun) {
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              targetVersion: version,
              counts: source.counts,
              files: source.files,
              journal: journal ?? null,
            },
            null,
            2,
          ),
        )
      } else {
        printUpgradePlan(source, journal)
        console.log(`Source: ${sourceSummary(source.counts)}`)
      }
      return
    }

    const nextJournal = journalFromSource(source, version)
    if (nextJournal.files.length > 0) {
      await writeJournal(options.cwd, nextJournal)
    } else {
      await removeJournal(options.cwd)
    }
    const applied = await applyJournal({
      journal: nextJournal,
      lock,
      plan,
      projectRoot: options.cwd,
    })
    if (applied.lockChanged) await writeLock(options.cwd, lock)
    journal = applied.journal.files.length > 0 ? applied.journal : undefined
    if (journal) {
      await writeJournal(options.cwd, journal)
    } else {
      await removeJournal(options.cwd)
    }

    plan = await makePlan()
    source = await classify(plan)
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            targetVersion: version,
            applied: applied.applied,
            counts: source.counts,
            files: source.files,
            journal: journal ?? null,
          },
          null,
          2,
        ),
      )
    } else {
      console.log(`Applied ${applied.applied.length} clean file(s).`)
      console.log(`Source: ${sourceSummary(source.counts)}`)
      printSourceDiff(source.files)
    }
    if (journal?.files.length || upgradeBlockers(source.files).length > 0) {
      process.exitCode = 1
    }
    return
  }

  if (command === 'sync') {
    const lock = await readLock(options.cwd)
    const components = installedComponents(registry, options.cwd, lock)
    const includeCore = coreInstalled(options.cwd, project, lock) || components.length > 0
    if (!components.length && !includeCore) {
      console.log('No YAM3X components are installed.')
      return
    }
    const plan = await planReconcile({
      registry,
      registryRoot,
      projectRoot: options.cwd,
      project,
      componentNames: components,
      includeCore,
    })
    const blocking = new Set(['manual', 'invalid'])
    if (planBlocking(plan, blocking)) throw new Error(blockingMessage(plan, blocking))
    if (options.dryRun) {
      printPlan(plan, options)
      return
    }
    const { changedPackages } = await applyPlan(plan, project, { copyFiles: false })
    if (changedPackages.length > 0) await writeJson(packagePath, project)
    if (changedPackages.length > 0) {
      console.log(`Updated dependencies: ${changedPackages.join(', ')}`)
    } else if (!planNeedsInstall(plan)) {
      console.log('Dependencies are up to date.')
    }
    await installIfNeeded(plan, project, options)
    return
  }

  throw new Error(`Unknown command "${command}".`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
