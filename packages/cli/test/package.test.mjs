import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const cliRoot = join(repositoryRoot, 'packages/cli')

test('packed CLI contains a runnable registry and installs a component', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'yam3x-pack-'))

  try {
    const packResult = spawnSync('pnpm', ['pack', '--pack-destination', temporaryRoot], {
      cwd: cliRoot,
      encoding: 'utf8',
    })
    assert.equal(packResult.status, 0, `${packResult.stdout}\n${packResult.stderr}`)

    const tarball = join(temporaryRoot, 'yam3x-0.1.0.tgz')
    assert.ok(existsSync(tarball), 'pnpm pack should create the CLI tarball')
    const packageRoot = join(temporaryRoot, 'package')
    await mkdir(packageRoot)
    execFileSync('tar', ['-xzf', tarball, '-C', packageRoot])

    const manifest = JSON.parse(await readFile(join(packageRoot, 'package/package.json'), 'utf8'))
    assert.equal(manifest.name, 'yam3x')
    assert.deepEqual(manifest.bin, { yam3x: 'src/index.mjs' })
    assert.ok(manifest.dependencies.semver)
    assert.ok(existsSync(join(packageRoot, 'package/registry/registry.json')))
    assert.match(
      await readFile(join(packageRoot, 'package/LICENSE'), 'utf8'),
      /Copyright \(c\) 2026 Cccc_/,
    )

    const modulesRoot = join(packageRoot, 'package/node_modules')
    await mkdir(modulesRoot, { recursive: true })
    await symlink(join(repositoryRoot, 'node_modules/semver'), join(modulesRoot, 'semver'), 'dir')

    const consumerRoot = join(temporaryRoot, 'consumer')
    await mkdir(join(consumerRoot, 'src'), { recursive: true })
    await writeFile(
      join(consumerRoot, 'package.json'),
      JSON.stringify({
        name: 'consumer',
        version: '1.0.0',
        type: 'module',
        dependencies: { vue: '^3.5.0' },
      }),
    )
    await writeFile(join(consumerRoot, 'src/main.ts'), "import { createApp } from 'vue'\n")

    const runResult = spawnSync(
      process.execPath,
      [
        join(packageRoot, 'package/src/index.mjs'),
        'add',
        'button',
        '--cwd',
        consumerRoot,
        '--no-install',
      ],
      { cwd: consumerRoot, encoding: 'utf8' },
    )
    assert.equal(runResult.status, 0, `${runResult.stdout}\n${runResult.stderr}`)
    assert.ok(existsSync(join(consumerRoot, 'src/components/yam3x/button/button.vue')))
    assert.ok(existsSync(join(consumerRoot, 'src/yam3x.css')))
    assert.ok(
      JSON.parse(await readFile(join(consumerRoot, 'package.json'), 'utf8')).dependencies[
        'tailwind-variants'
      ],
    )
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})
