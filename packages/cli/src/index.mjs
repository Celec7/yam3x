#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--cwd') {
      const value = args[index + 1]
      if (!value) throw new Error('--cwd requires a project path.')
      options.cwd = isAbsolute(value) ? value : resolve(process.cwd(), value)
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
      'Usage: yam3x --version\n       yam3x list\n       yam3x init [--cwd <project>] [--no-install]\n       yam3x add <component> [component ...] [--cwd <project>] [--no-install]\n       yam3x status [--cwd <project>] [--json]\n       yam3x sync [--cwd <project>] [--dry-run] [--no-install]',
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
    setProjectConfig(project)
    await injectStyleImport(options.cwd)
    await writeJson(packagePath, project)
    printFileSummary(addedFiles)
    printDependencySummary(changedPackages)
    await installIfNeeded(plan, project, options)
    return
  }

  if (command === 'add') {
    const components = [...new Set(options.positional)]
    if (components.length === 0) throw new Error('yam3x add requires at least one component name.')
    await requireMain(options.cwd)
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
    setProjectConfig(project)
    await injectStyleImport(options.cwd)
    await writeJson(packagePath, project)
    printFileSummary(addedFiles)
    printDependencySummary(changedPackages)
    await installIfNeeded(plan, project, options)
    return
  }

  if (command === 'status') {
    const components = installedComponents(registry, options.cwd)
    const includeCore = coreInstalled(options.cwd, project) || components.length > 0
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
    printPlan(plan, options)
    if (planNeedsAttention(plan)) process.exitCode = 1
    return
  }

  if (command === 'sync') {
    const components = installedComponents(registry, options.cwd)
    const includeCore = coreInstalled(options.cwd, project) || components.length > 0
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
