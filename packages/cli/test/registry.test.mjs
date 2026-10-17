import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { readWorkspaceCatalog } from '../../../scripts/catalog.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const registryRoot = join(projectRoot, 'registry')
const registry = JSON.parse(await readFile(join(registryRoot, 'registry.json'), 'utf8'))
const catalog = await readWorkspaceCatalog()
const sourceExtensions = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.css'])
const importPattern =
  /^[\t ]*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]/gm

test('workspace dependencies use the shared version catalog', async () => {
  const manifests = [
    'package.json',
    'apps/docs/package.json',
    'packages/cli/package.json',
    'registry/package.json',
  ]

  for (const path of manifests) {
    const manifest = JSON.parse(await readFile(join(projectRoot, path), 'utf8'))
    for (const kind of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      for (const [name, version] of Object.entries(manifest[kind] ?? {})) {
        assert.equal(version, 'catalog:', `${path} must read ${name} from pnpm-workspace.yaml`)
        assert.ok(catalog[name], `pnpm-workspace.yaml needs a catalog version for ${name}`)
      }
    }
  }
})

async function expandAbsolutePath(absolutePath, sourcePath) {
  assert.ok(
    absolutePath.startsWith(`${registryRoot}${sep}`),
    `Registry source path escapes registry/: ${sourcePath}`,
  )

  const info = await stat(absolutePath).catch(() => undefined)
  assert.ok(info, `Registry source path does not exist: ${sourcePath}`)
  if (info.isFile()) return [absolutePath]

  const children = await readdir(absolutePath, { withFileTypes: true })
  const files = []
  for (const child of children) {
    const childPath = join(absolutePath, child.name)
    if (child.isDirectory()) {
      files.push(...(await expandAbsolutePath(childPath, sourcePath)))
    } else if (sourceExtensions.has(extname(child.name))) {
      files.push(childPath)
    }
  }
  return files
}

async function expandSourcePath(sourcePath) {
  return expandAbsolutePath(resolve(registryRoot, sourcePath), sourcePath)
}

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

function localSpecifier(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('/')
}

async function resolveLocalImport(importer, specifier) {
  const basePath = resolve(dirname(importer), specifier)
  const candidates = [
    basePath,
    ...[...sourceExtensions].map((extension) => `${basePath}${extension}`),
    ...[...sourceExtensions].map((extension) => join(basePath, `index${extension}`)),
  ]

  for (const candidate of candidates) {
    if ((await stat(candidate).catch(() => undefined))?.isFile()) return candidate
  }
  return undefined
}

async function collectImports(sourceFiles) {
  const imports = []
  for (const file of sourceFiles) {
    const source = await readFile(file, 'utf8')
    for (const match of source.matchAll(importPattern)) {
      imports.push({ file, specifier: match[1] ?? match[2] })
    }
  }
  return imports
}

test('registry sources exist, stay local, and declare each component import closure', async () => {
  const issues = []
  const coreFiles = (
    await Promise.all(registry.foundations.core.files.map(({ source }) => expandSourcePath(source)))
  ).flat()
  const coreFileSet = new Set(coreFiles)
  const coreDependencies = new Set([
    ...Object.keys(registry.foundations.core.dependencies ?? {}),
    ...Object.keys(registry.foundations.core.devDependencies ?? {}),
  ])

  for (const [name, component] of Object.entries(registry.components)) {
    const componentFiles = (
      await Promise.all(
        component.files.map((source) => expandSourcePath(join('components', source))),
      )
    ).flat()
    const declaredFiles = new Set([...coreFiles, ...componentFiles])
    const declaredDependencies = new Set([
      ...coreDependencies,
      ...Object.keys(component.dependencies ?? {}),
      'vue',
    ])

    assert.ok(
      component.files.some((file) => file.endsWith('/index.ts')),
      `${name} must declare a public index.ts entry point`,
    )

    for (const { file, specifier } of await collectImports(componentFiles)) {
      if (localSpecifier(specifier)) {
        const importedFile = await resolveLocalImport(file, specifier)
        if (!importedFile) {
          issues.push(`${name}: ${file} imports missing local source ${specifier}`)
          continue
        }
        if (!declaredFiles.has(importedFile)) {
          issues.push(
            `${name}: ${file} imports ${specifier}, but the imported file is not declared for copying`,
          )
        }
      } else {
        const importedPackage = packageName(specifier)
        if (!declaredDependencies.has(importedPackage)) {
          issues.push(
            `${name}: ${file} imports ${importedPackage}, but registry.json does not declare that dependency`,
          )
        }
      }
    }
  }

  for (const file of coreFiles) {
    for (const { specifier } of await collectImports([file])) {
      if (localSpecifier(specifier)) {
        const importedFile = await resolveLocalImport(file, specifier)
        if (!importedFile) {
          issues.push(`Core source ${file} imports missing local source ${specifier}`)
          continue
        }
        if (!coreFileSet.has(importedFile)) {
          issues.push(
            `Core source ${file} imports ${specifier}, but the imported file is not declared for copying`,
          )
        }
      } else {
        const importedPackage = packageName(specifier)
        if (!coreDependencies.has(importedPackage) && importedPackage !== 'vue') {
          issues.push(
            `Core source ${file} imports ${importedPackage}, but registry.json does not declare that dependency`,
          )
        }
      }
    }
  }

  assert.deepEqual(issues, [])
})
