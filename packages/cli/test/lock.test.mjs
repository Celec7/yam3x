import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  canonicalHash,
  hashFile,
  LOCKFILE,
  lockDrift,
  normalizeLock,
  readLock,
  writeLock,
} from '../src/lock.mjs'

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'yam3x-lock-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  return directory
}

function lockWith(files, components = {}) {
  return {
    schemaVersion: 1,
    package: '@celec7/yam3x',
    registry: 'yam3x',
    components,
    files,
  }
}

test('canonical hashes ignore BOM and line-ending differences', () => {
  assert.equal(canonicalHash('\uFEFFa\r\nb\r\n'), canonicalHash('a\nb\n'))
  assert.notEqual(canonicalHash('a\nb\n'), canonicalHash('a\nb'))
})

test('lock writes are sorted, normalized, atomic, and readable', async (t) => {
  const directory = await fixture(t)
  const lock = lockWith(
    {
      'src/z.txt': {
        source: 'foundations/z.txt',
        version: '0.6.0',
        integrity: 'sha256-z',
      },
      'src/a.txt': {
        source: 'foundations/a.txt',
        version: '0.6.0',
        integrity: 'sha256-a',
        components: ['switch', 'button', 'button'],
        core: true,
      },
    },
    {
      switch: { entry: 'src/components/yam3x/switch/index.ts' },
      button: { entry: 'src/components/yam3x/button/index.ts' },
    },
  )

  await writeLock(directory, lock)

  const raw = await readFile(join(directory, LOCKFILE), 'utf8')
  assert.ok(raw.endsWith('\n'))
  assert.deepEqual(Object.keys(JSON.parse(raw).files), ['src/a.txt', 'src/z.txt'])
  assert.deepEqual(Object.keys(JSON.parse(raw).components), ['button', 'switch'])
  assert.deepEqual(JSON.parse(raw).files['src/a.txt'].components, ['button', 'switch'])
  assert.deepEqual(await readdir(directory), [LOCKFILE])
  assert.deepEqual(await readLock(directory), normalizeLock(lock))
})

test('invalid lock files fail without being rewritten', async (t) => {
  const directory = await fixture(t)
  await writeFile(
    join(directory, LOCKFILE),
    `${JSON.stringify({ schemaVersion: 2, package: '@celec7/yam3x', registry: 'yam3x' })}\n`,
  )

  await assert.rejects(() => readLock(directory), /Invalid yam3x\.lock\.json/)
})

test('hashFile distinguishes missing, clean, and modified files', async (t) => {
  const directory = await fixture(t)
  const target = join(directory, 'src/file.txt')
  assert.equal(await hashFile(target), undefined)

  await mkdir(join(directory, 'src'))
  await writeFile(target, 'one\n')
  const lock = lockWith({
    'src/file.txt': {
      source: 'foundations/file.txt',
      version: '0.6.0',
      integrity: canonicalHash('one\n'),
    },
  })

  assert.deepEqual(await lockDrift(lock, directory), { clean: 1, modified: 0, missing: 0 })
  await writeFile(target, 'two\n')
  assert.deepEqual(await lockDrift(lock, directory), { clean: 0, modified: 1, missing: 0 })
  await rm(target)
  assert.deepEqual(await lockDrift(lock, directory), { clean: 0, modified: 0, missing: 1 })
})
