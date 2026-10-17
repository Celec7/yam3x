#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

const cliDirectory = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(cliDirectory, '..')
const workspaceRoot = resolve(packageRoot, '../..')
const isWorkspacePackage = existsSync(join(workspaceRoot, 'packages/cli/package.json'))
const registryRoot = isWorkspacePackage
  ? join(workspaceRoot, 'registry')
  : join(packageRoot, 'registry')

function parseOptions(args) {
  const options = { positional: [], cwd: process.cwd(), install: true }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--cwd') {
      const value = args[index + 1]
      if (!value) throw new Error('--cwd requires a project path.')
      options.cwd = isAbsolute(value) ? value : resolve(process.cwd(), value)
      index += 1
    } else if (argument === '--no-install') {
      options.install = false
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

async function exists(path) {
  try {
    await readFile(path)
    return true
  } catch {
    return false
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
  if (await exists(destination)) return false
  await mkdir(dirname(destination), { recursive: true })
  await cp(source, destination, { recursive: true, errorOnExist: true })
  return true
}

function validateDependencyRequirements(packageJson, dependencyMap, kind = 'dependencies') {
  const current = packageJson[kind] ?? {}
  for (const [name, requiredRange] of Object.entries(dependencyMap)) {
    const currentRange = current[name]
    if (!currentRange) continue
    if (
      !semver.validRange(currentRange) ||
      !semver.validRange(requiredRange) ||
      !semver.intersects(currentRange, requiredRange)
    ) {
      throw new Error(
        `Existing ${kind} entry for ${name} (${currentRange}) does not satisfy the registry requirement (${requiredRange}). Update it before adding this component.`,
      )
    }
  }
}

async function addDependencies(packageJson, dependencyMap, kind = 'dependencies') {
  validateDependencyRequirements(packageJson, dependencyMap, kind)
  const current = packageJson[kind] ?? {}
  const pending = Object.fromEntries(
    Object.entries(dependencyMap).filter(([name]) => !current[name]),
  )
  packageJson[kind] = { ...current, ...pending }
  return Object.keys(pending)
}

async function initProject(projectRoot, registry) {
  const packagePath = join(projectRoot, 'package.json')
  const project = await readJson(packagePath)
  const core = registry.foundations.core
  validateDependencyRequirements(project, core.dependencies ?? {})
  validateDependencyRequirements(project, core.devDependencies ?? {}, 'devDependencies')
  const existingMainPath = await findExistingMain(projectRoot)

  if (!existingMainPath) {
    throw new Error(
      'Could not find src/main.ts or src/main.js. Create a Vue app entry before running yam3x init.',
    )
  }

  const created = []
  for (const { source, target } of core.files) {
    if (await copyIfMissing(join(registryRoot, source), join(projectRoot, target)))
      created.push(target)
  }

  let mainSource = await readFile(existingMainPath, 'utf8')
  if (!mainSource.includes("'./yam3x.css'") && !mainSource.includes('"./yam3x.css"')) {
    mainSource = `import './yam3x.css'\n${mainSource}`
    await writeFile(existingMainPath, mainSource)
  }

  const viteConfig = await findViteConfig(projectRoot)
  if (viteConfig) {
    const configText = await readFile(viteConfig, 'utf8')
    if (!configText.includes('@tailwindcss/vite')) {
      console.warn('Add @tailwindcss/vite() to your existing Vite plugins before building.')
    }
  } else {
    console.warn('Add @tailwindcss/vite() to your Vite config before building.')
  }

  const devAdded = await addDependencies(project, core.devDependencies ?? {}, 'devDependencies')
  const runtimeAdded = await addDependencies(project, core.dependencies ?? {})
  project.yam3x = { ...(project.yam3x ?? {}), registry: 'yam3x', style: 'src/yam3x.css' }
  await writeJson(packagePath, project)

  return { project, created, dependencies: [...devAdded, ...runtimeAdded] }
}

async function findExistingMain(projectRoot) {
  for (const name of ['main.ts', 'main.js']) {
    const path = join(projectRoot, 'src', name)
    if (await exists(path)) return path
  }
  return undefined
}

async function findViteConfig(projectRoot) {
  for (const name of ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs']) {
    const path = join(projectRoot, name)
    if (await exists(path)) return path
  }
  return undefined
}

async function addComponent(projectRoot, name, registry) {
  const entry = registry.components[name]
  const core = entry.foundations?.includes('core') ? registry.foundations.core : undefined
  const project = await readJson(join(projectRoot, 'package.json'))
  const dependencies = { ...(core?.dependencies ?? {}), ...(entry.dependencies ?? {}) }
  validateDependencyRequirements(project, dependencies)
  if (core) validateDependencyRequirements(project, core.devDependencies ?? {}, 'devDependencies')
  const initialized = core ? await initProject(projectRoot, registry) : undefined
  const updatedProject = await readJson(join(projectRoot, 'package.json'))

  const addedFiles = [...(initialized?.created ?? [])]
  for (const file of entry.files) {
    const source = join(registryRoot, 'components', file)
    const target = join(projectRoot, 'src/components/yam3x', file)
    if (await copyIfMissing(source, target)) addedFiles.push(target)
  }

  const addedDependencies = [
    ...(initialized?.dependencies ?? []),
    ...(await addDependencies(updatedProject, dependencies)),
  ]
  await writeJson(join(projectRoot, 'package.json'), updatedProject)

  return { project: updatedProject, addedFiles, addedDependencies }
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
      'Usage: yam3x --version\n       yam3x list\n       yam3x init [--cwd <project>] [--no-install]\n       yam3x add <component> [component ...] [--cwd <project>] [--no-install]',
    )
    return
  }

  const registry = await readJson(join(registryRoot, 'registry.json'))
  if (command === 'list') {
    console.log(Object.keys(registry.components).sort().join('\n'))
    return
  }

  const options = parseOptions(args)
  let project = await readJson(join(options.cwd, 'package.json'))
  const allFiles = []
  const allDependencies = []

  if (command === 'init') {
    const result = await initProject(options.cwd, registry)
    project = result.project
    allFiles.push(...result.created)
    allDependencies.push(...result.dependencies)
  } else if (command === 'add') {
    const components = options.positional
    if (components.length === 0) throw new Error('yam3x add requires at least one component name.')
    for (const component of components) {
      if (!Object.hasOwn(registry.components, component)) {
        throw new Error(
          `Unknown component "${component}". Available: ${Object.keys(registry.components).join(', ')}`,
        )
      }
    }
    for (const component of components) {
      const result = await addComponent(options.cwd, component, registry)
      project = result.project
      allFiles.push(...result.addedFiles)
      allDependencies.push(...result.addedDependencies)
    }
  } else {
    throw new Error(`Unknown command "${command}".`)
  }

  console.log(
    allFiles.length
      ? `Added ${allFiles.length} source file(s).`
      : 'No new source files were needed.',
  )
  console.log(
    allDependencies.length
      ? `Declared dependencies: ${[...new Set(allDependencies)].join(', ')}`
      : 'No new npm dependencies.',
  )

  if (options.install && allDependencies.length > 0) {
    await installDependencies(project, options.cwd)
  } else if (allDependencies.length > 0) {
    console.log('Run your package manager install command to resolve the new dependencies.')
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
