import assert from 'node:assert/strict'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'
import { parse as parseSfc } from '@vue/compiler-sfc'
import ts from 'typescript'
import { readWorkspaceCatalog } from './catalog.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = join(projectRoot, 'registry')
const componentsRoot = join(registryRoot, 'components')
const registryPath = join(registryRoot, 'registry.json')
const sourceExtensions = ['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json']

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

function dependencyMap(packages, catalog, allowedDependencies, label) {
  const result = {}
  for (const name of [...packages].sort()) {
    if (!Object.hasOwn(allowedDependencies, name)) {
      throw new Error(`${label} imports ${name}, but registry/package.json does not declare it.`)
    }
    result[name] = catalogRange(catalog, name)
  }
  return result
}

async function buildRegistry() {
  const catalog = await readWorkspaceCatalog()
  const packageManifest = JSON.parse(await readFile(join(registryRoot, 'package.json'), 'utf8'))
  const foundationManifest = JSON.parse(
    await readFile(join(registryRoot, 'foundations/registry.json'), 'utf8'),
  )
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
  const corePackageNames = new Set(coreClosure.packages)
  for (const name of coreDevNames) corePackageNames.delete(name)
  const core = {
    files: coreSourceFiles.sort((a, b) => a.source.localeCompare(b.source)),
    dependencies: dependencyMap(
      corePackageNames,
      catalog,
      packageManifest.dependencies ?? {},
      'Foundation source',
    ),
    devDependencies: dependencyMap(
      coreDevNames,
      catalog,
      packageManifest.devDependencies ?? {},
      'Foundation setup',
    ),
  }

  const componentDirectories = (await readdir(componentsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
    .map((entry) => entry.name)
    .sort()
  const components = {}

  for (const name of componentDirectories) {
    const directory = join(componentsRoot, name)
    const entryPoint = join(directory, 'index.ts')
    assert.ok((await stat(entryPoint).catch(() => undefined))?.isFile(), `${name} needs index.ts.`)
    const closure = await collectClosure([entryPoint], componentsRoot, coreClosure.files)
    const componentFiles = [...closure.files]
      .filter((file) => file.startsWith(`${componentsRoot}${sep}`))
      .map((file) => relative(componentsRoot, file).split(sep).join('/'))
      .sort()
    const componentPackages = new Set(closure.packages)
    for (const name of corePackageNames) componentPackages.delete(name)
    for (const name of coreDevNames) componentPackages.delete(name)

    components[name] = {
      files: componentFiles,
      dependencies: dependencyMap(
        componentPackages,
        catalog,
        packageManifest.dependencies ?? {},
        `Component ${name}`,
      ),
      foundations: ['core'],
    }
  }

  return { schemaVersion: 3, foundations: { core }, components }
}

const prettierOptions = await prettier.resolveConfig(registryPath)
const generated = await prettier.format(JSON.stringify(await buildRegistry()), {
  ...prettierOptions,
  filepath: registryPath,
})
if (process.argv.includes('--check')) {
  const current = await readFile(registryPath, 'utf8').catch(() => '')
  if (current !== generated) {
    console.error('registry/registry.json is stale. Run `pnpm registry:generate`.')
    process.exitCode = 1
  }
} else {
  await writeFile(registryPath, generated)
}
