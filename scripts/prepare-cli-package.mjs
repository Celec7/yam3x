import assert from 'node:assert/strict'
import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = join(repositoryRoot, 'registry')
const cliPackageRoot = join(repositoryRoot, 'packages/cli')
const bundledRegistryRoot = join(cliPackageRoot, 'registry')
await cp(join(repositoryRoot, 'LICENSE'), join(cliPackageRoot, 'LICENSE'))
const manifest = JSON.parse(await readFile(join(registryRoot, 'registry.json'), 'utf8'))
const registryFiles = new Set(['registry.json'])

for (const { source } of manifest.foundations.core.files) registryFiles.add(source)
for (const component of Object.values(manifest.components)) {
  for (const file of component.files) registryFiles.add(`components/${file}`)
}

await rm(bundledRegistryRoot, { recursive: true, force: true })
await mkdir(bundledRegistryRoot, { recursive: true })

for (const file of [...registryFiles].sort()) {
  const sourcePath = resolve(registryRoot, file)
  const sourceRelative = relative(registryRoot, sourcePath)
  assert.ok(
    sourceRelative && !sourceRelative.startsWith(`..${sep}`) && sourceRelative !== '..',
    `Registry package path escapes the registry: ${file}`,
  )
  await mkdir(dirname(join(bundledRegistryRoot, sourceRelative)), { recursive: true })
  await cp(sourcePath, join(bundledRegistryRoot, sourceRelative))
}

console.log(`Prepared CLI registry with ${registryFiles.size - 1} source files.`)
