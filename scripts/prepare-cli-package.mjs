import assert from 'node:assert/strict'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRegistry } from './generate-registry.mjs'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = join(repositoryRoot, 'registry')
const cliPackageRoot = join(repositoryRoot, 'packages/cli')
const bundledRegistryRoot = join(cliPackageRoot, 'registry')
const manifest = await buildRegistry()
const registryFiles = new Set(['registry.json'])

await cp(join(repositoryRoot, 'LICENSE'), join(cliPackageRoot, 'LICENSE'))

for (const { source } of manifest.foundations.core.files) registryFiles.add(source)
for (const component of Object.values(manifest.components)) {
  for (const file of component.files) registryFiles.add(`components/${file}`)
}

await rm(bundledRegistryRoot, { recursive: true, force: true })
await mkdir(bundledRegistryRoot, { recursive: true })
await writeFile(
  join(bundledRegistryRoot, 'registry.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

for (const file of [...registryFiles].sort()) {
  if (file === 'registry.json') continue
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
