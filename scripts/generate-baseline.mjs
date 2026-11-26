import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2] ?? '0.6.0'
const ref = process.argv[3] ?? `v${version}`
const worktree = join(projectRoot, `.baseline-${process.pid}`)
const output = join(projectRoot, 'packages/cli/baselines', `${version}.json`)

function toPosix(path) {
  return path.split(sep).join('/')
}

function canonicalHash(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  return `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`
}

async function hash(file) {
  return canonicalHash(await readFile(file, 'utf8'))
}

try {
  execFileSync('git', ['worktree', 'add', '--detach', worktree, ref], {
    cwd: projectRoot,
    stdio: 'inherit',
  })
  await symlink(join(projectRoot, 'node_modules'), join(worktree, 'node_modules'), 'dir')

  const { buildRegistry } = await import(
    pathToFileURL(join(worktree, 'scripts/generate-registry.mjs')).href
  )
  const manifest = await buildRegistry()
  const registryRoot = join(worktree, 'registry')
  const components = {}
  const files = {}
  const componentFiles = new Map()

  for (const [name, component] of Object.entries(manifest.components)) {
    const entry = component.files.find((file) => file.endsWith('/index.ts'))
    if (!entry) throw new Error(`${name} has no entry file.`)
    components[name] = {
      entry: toPosix(join('src/components/yam3x', entry)),
    }
    for (const file of component.files) {
      const target = toPosix(join('src/components/yam3x', file))
      const source = toPosix(join('components', file))
      const current = componentFiles.get(target) ?? { source, components: new Set() }
      current.components.add(name)
      componentFiles.set(target, current)
    }
  }

  for (const { source, target } of manifest.foundations.core.files) {
    files[toPosix(target)] = {
      source: toPosix(source),
      version,
      integrity: await hash(join(registryRoot, source)),
      core: true,
    }
  }

  for (const [target, { source, components: owners }] of [...componentFiles].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    files[target] = {
      source,
      version,
      integrity: await hash(join(registryRoot, source)),
      components: [...owners].sort(),
    }
  }

  await mkdir(dirname(output), { recursive: true })
  await writeFile(
    output,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        package: '@celec7/yam3x',
        registry: 'yam3x',
        components,
        files,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`Wrote ${relative(projectRoot, output)} (${Object.keys(files).length} files).`)
} finally {
  await rm(join(worktree, 'node_modules'), { force: true }).catch(() => {})
  try {
    execFileSync('git', ['worktree', 'remove', '--force', worktree], {
      cwd: projectRoot,
      stdio: 'ignore',
    })
  } catch {
    // The worktree may not have been created when git worktree add fails.
  }
}
