import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSfc } from '@vue/compiler-sfc'
import ts from 'typescript'
import { readWorkspaceCatalog } from './catalog.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = join(projectRoot, 'registry')
const componentsRoot = join(registryRoot, 'components')
const sourceExtensions = ['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json']
const packageSections = [
  ['runtime', 'dependencies'],
  ['peer', 'peerDependencies'],
  ['dev', 'devDependencies'],
]

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

function isLocal(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('/')
}

function addStringImport(imports, node, label) {
  if (ts.isStringLiteralLike(node)) {
    imports.push(node.text)
    return
  }
  throw new Error(`${label} must use a static string path.`)
}

function scanScript(source, filename) {
  const scriptKind =
    filename.endsWith('.tsx') || filename.endsWith('.jsx')
      ? ts.ScriptKind.TSX
      : filename.endsWith('.js') || filename.endsWith('.mjs') || filename.endsWith('.cjs')
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, scriptKind)
  const imports = []

  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      addStringImport(imports, node.moduleSpecifier, filename)
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        addStringImport(imports, node.arguments[0], filename)
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        addStringImport(imports, node.arguments[0], filename)
      }
    } else if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'URL'
    ) {
      const second = node.arguments?.[1]
      if (second && ts.isPropertyAccessExpression(second) && second.name.text === 'url') {
        addStringImport(imports, node.arguments[0], filename)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return imports
}

function scanCss(source) {
  const imports = []
  const importPattern = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?[^;]*;/g
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi
  for (const match of source.matchAll(importPattern)) imports.push(match[1])
  for (const match of source.matchAll(urlPattern)) imports.push(match[1].trim())
  return imports
}

function scanTemplate(source) {
  return [...source.matchAll(/\b(?:src|href)\s*=\s*["'](\.{1,2}\/[^"']+)["']/g)].map(
    (match) => match[1],
  )
}

async function sourceImports(file) {
  const source = await readFile(file, 'utf8')
  const extension = extname(file)
  if (extension === '.vue') {
    const { descriptor, errors } = parseSfc(source, { filename: file })
    assert.deepEqual(errors, [], `Could not parse ${relative(registryRoot, file)}`)
    const imports = []
    if (descriptor.script?.src) imports.push(descriptor.script.src)
    if (descriptor.scriptSetup?.src) imports.push(descriptor.scriptSetup.src)
    for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
      imports.push(...scanScript(block.content, file))
    }
    for (const style of descriptor.styles) {
      if (style.src) imports.push(style.src)
      imports.push(...scanCss(style.content))
    }
    if (descriptor.template) imports.push(...scanTemplate(descriptor.template.content))
    return imports
  }
  if (extension === '.css') return scanCss(source)
  if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(extension)) {
    return scanScript(source, file)
  }
  return []
}

async function resolveLocalImport(importer, rawSpecifier, targetMappings = []) {
  const specifier = rawSpecifier.replace(/[?#].*$/, '')
  const base = resolve(dirname(importer), specifier)
  const candidates = [base]
  if (!sourceExtensions.includes(extname(base))) {
    for (const extension of sourceExtensions) candidates.push(`${base}${extension}`)
    for (const extension of sourceExtensions) candidates.push(join(base, `index${extension}`))
  }
  for (const candidate of candidates) {
    if ((await stat(candidate).catch(() => undefined))?.isFile()) return candidate
  }
  const importerSource = relative(registryRoot, importer).split(sep).join('/')
  const importerMapping = targetMappings.find((mapping) => mapping.source === importerSource)
  if (importerMapping) {
    const outputPath = resolve(dirname(join(projectRoot, importerMapping.target)), specifier)
    const outputRelative = relative(projectRoot, outputPath).split(sep).join('/')
    const outputMapping = targetMappings.find((mapping) => mapping.target === outputRelative)
    if (outputMapping) return resolve(registryRoot, outputMapping.source)
  }
  throw new Error(
    `${relative(registryRoot, importer)} imports missing local source ${rawSpecifier}`,
  )
}

async function collectClosure(
  entries,
  allowedRoot,
  existingFiles = new Set(),
  targetMappings = [],
) {
  const files = new Set(existingFiles)
  const packages = new Set()
  const visited = new Set()
  const pending = [...entries]

  while (pending.length) {
    const file = pending.pop()
    if (visited.has(file)) continue
    visited.add(file)
    const relativeFile = relative(allowedRoot, file)
    if (relativeFile.startsWith('..') || relativeFile === '') {
      throw new Error(`Source import escapes ${relative(registryRoot, allowedRoot)}: ${file}`)
    }
    files.add(file)

    for (const specifier of await sourceImports(file)) {
      if (/^(?:https?:|data:|#)/i.test(specifier)) continue
      if (!isLocal(specifier)) {
        packages.add(packageName(specifier))
        continue
      }
      const imported = await resolveLocalImport(file, specifier, targetMappings)
      const importedRelative = relative(allowedRoot, imported)
      if (importedRelative.startsWith('..')) {
        throw new Error(
          `${relative(registryRoot, file)} imports source outside its distribution root: ${specifier}`,
        )
      }
      pending.push(imported)
    }
  }

  return { files, packages }
}

async function expandMapping({ source, target }) {
  const absoluteSource = resolve(registryRoot, source)
  const info = await stat(absoluteSource).catch(() => undefined)
  assert.ok(info, `Foundation source does not exist: ${source}`)
  if (info.isFile()) return [{ source, target }]

  const result = []
  async function walk(directory) {
    for (const child of (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const childPath = join(directory, child.name)
      if (child.isDirectory()) await walk(childPath)
      else if (child.isFile()) {
        result.push({
          source: relative(registryRoot, childPath).split(sep).join('/'),
          target: join(target, relative(absoluteSource, childPath)).split(sep).join('/'),
        })
      }
    }
  }
  await walk(absoluteSource)
  return result
}

function catalogRange(catalog, name) {
  const version = catalog[name]
  if (typeof version !== 'string' || !version || version.startsWith('catalog:')) {
    throw new Error(`No concrete package version is defined for ${name} in pnpm-workspace.yaml.`)
  }
  return version
}

function packageKinds(manifest) {
  const kinds = new Map()
  for (const [kind, section] of packageSections) {
    for (const name of Object.keys(manifest[section] ?? {})) {
      if (kinds.has(name)) {
        throw new Error(`registry/package.json declares ${name} in more than one section.`)
      }
      kinds.set(name, kind)
    }
  }
  return kinds
}

function partitionPackages(names, kinds, label) {
  const result = {
    dependencies: [],
    peerDependencies: [],
    devDependencies: [],
  }
  for (const name of [...names].sort()) {
    const kind = kinds.get(name)
    if (!kind) {
      throw new Error(`${label} imports ${name}, but registry/package.json does not declare it.`)
    }
    if (kind === 'runtime') result.dependencies.push(name)
    else if (kind === 'peer') result.peerDependencies.push(name)
    else result.devDependencies.push(name)
  }
  return result
}

export async function buildRegistry() {
  const catalog = await readWorkspaceCatalog()
  const packageManifest = JSON.parse(await readFile(join(registryRoot, 'package.json'), 'utf8'))
  const foundationManifest = JSON.parse(
    await readFile(join(registryRoot, 'foundations/registry.json'), 'utf8'),
  )
  const kinds = packageKinds(packageManifest)
  for (const name of kinds.keys()) catalogRange(catalog, name)

  const coreSourceFiles = (
    await Promise.all(foundationManifest.core.files.map(expandMapping))
  ).flat()
  const coreTargets = new Set(coreSourceFiles.map(({ target }) => target))
  assert.equal(coreTargets.size, coreSourceFiles.length, 'Foundation target paths must be unique.')

  const coreClosure = await collectClosure(
    coreSourceFiles.map(({ source }) => resolve(registryRoot, source)),
    registryRoot,
    new Set(),
    coreSourceFiles,
  )
  const coreSourcePaths = new Set(coreSourceFiles.map(({ source }) => source))
  for (const file of coreClosure.files) {
    const source = relative(registryRoot, file).split(sep).join('/')
    if (!coreSourcePaths.has(source)) {
      throw new Error(
        `Foundation import ${source} has no source-to-target mapping in registry/foundations/registry.json.`,
      )
    }
  }

  const coreDevNames = new Set(foundationManifest.core.devDependencies ?? [])
  for (const name of coreDevNames) {
    if (kinds.get(name) !== 'dev') {
      throw new Error(`Foundation setup tool ${name} must be declared in devDependencies.`)
    }
  }
  for (const name of coreClosure.packages) {
    if (kinds.get(name) === 'dev') {
      throw new Error(`Foundation source imports dev-only package ${name}.`)
    }
  }
  const coreNames = new Set([...coreClosure.packages, ...coreDevNames])
  const corePackages = partitionPackages(coreNames, kinds, 'Foundation source')

  const componentDirectories = (await readdir(componentsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
    .map((entry) => entry.name)
    .sort()
  const components = {}
  const componentPackages = new Set()

  for (const name of componentDirectories) {
    const directory = join(componentsRoot, name)
    const entryPoint = join(directory, 'index.ts')
    assert.ok((await stat(entryPoint).catch(() => undefined))?.isFile(), `${name} needs index.ts.`)
    const closure = await collectClosure([entryPoint], componentsRoot, coreClosure.files)
    const componentFiles = [...closure.files]
      .filter((file) => file.startsWith(`${componentsRoot}${sep}`))
      .map((file) => relative(componentsRoot, file).split(sep).join('/'))
      .sort()
    const names = new Set(closure.packages)
    for (const coreName of coreNames) names.delete(coreName)
    for (const packageName of names) {
      if (kinds.get(packageName) === 'dev') {
        throw new Error(`Component ${name} imports dev-only package ${packageName}.`)
      }
      componentPackages.add(packageName)
    }
    const packages = partitionPackages(names, kinds, `Component ${name}`)

    components[name] = {
      files: componentFiles,
      dependencies: packages.dependencies,
      peerDependencies: packages.peerDependencies,
      foundations: ['core'],
    }
  }

  const usedNames = new Set([...coreNames, ...componentPackages])
  for (const name of kinds.keys()) {
    if (!usedNames.has(name)) {
      throw new Error(
        `registry/package.json declares ${name}, but no registry source imports it. Remove the entry or add the import.`,
      )
    }
  }
  const packages = Object.fromEntries(
    [...usedNames].sort().map((name) => [
      name,
      {
        range: catalogRange(catalog, name),
        kind: kinds.get(name),
      },
    ]),
  )

  return {
    schemaVersion: 4,
    packages,
    foundations: {
      core: {
        files: coreSourceFiles.sort((a, b) => a.source.localeCompare(b.source)),
        dependencies: corePackages.dependencies,
        peerDependencies: corePackages.peerDependencies,
        devDependencies: corePackages.devDependencies,
      },
    },
    components,
  }
}

async function run() {
  const registry = await buildRegistry()
  if (process.argv.includes('--check')) {
    console.log(
      `OK: ${Object.keys(registry.components).length} component(s), ${Object.keys(registry.packages).length} package(s), 0 issues.`,
    )
    return
  }
  console.log(JSON.stringify(registry, null, 2))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
