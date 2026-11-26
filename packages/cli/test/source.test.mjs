import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterSourceFiles,
  hasSourceChanges,
  sourceCounts,
  sourceNeedsAttention,
  sourceState,
  sourceSummary,
} from '../src/source.mjs'

test('sourceState classifies base, local, and upstream hashes', () => {
  const cases = [
    [{ base: 'a', local: 'a', upstream: 'a' }, 'current'],
    [{ base: 'a', local: 'a', upstream: 'b' }, 'upstream-only'],
    [{ base: 'a', local: 'b', upstream: 'a' }, 'local-only'],
    [{ base: 'a', local: 'b', upstream: 'b' }, 'converged'],
    [{ base: 'a', local: 'b', upstream: 'c' }, 'conflict'],
    [{ base: 'a', local: undefined, upstream: 'a' }, 'missing'],
    [{ base: 'a', local: 'a', upstream: undefined }, 'removed'],
  ]

  for (const [input, expected] of cases) {
    assert.equal(sourceState(input), expected)
  }
})

test('source summaries count states and expose actionable changes', () => {
  const files = [
    { state: 'current', components: ['button'] },
    { state: 'current', components: ['button'] },
    { state: 'local-only', components: ['button'] },
    { state: 'conflict', components: ['switch'] },
    { state: 'missing', components: ['switch'], core: true },
  ]
  const counts = sourceCounts(files)

  assert.equal(counts.current, 2)
  assert.equal(counts['local-only'], 1)
  assert.equal(counts.conflict, 1)
  assert.equal(counts.missing, 1)
  assert.equal(counts['upstream-only'], 0)
  assert.match(sourceSummary(counts), /^2 current, 1 local-only, 1 conflict, 1 missing$/)
  assert.equal(sourceNeedsAttention(counts), true)
  assert.equal(hasSourceChanges(files), true)

  const clean = files.slice(0, 2)
  assert.equal(hasSourceChanges(clean), false)
  assert.equal(sourceNeedsAttention(sourceCounts(clean)), false)
})

test('component filtering keeps only files owned by that component', () => {
  const files = [
    { target: 'button.vue', components: ['button'] },
    { target: 'switch.vue', components: ['switch'] },
    { target: 'shared.ts', components: ['button', 'switch'] },
  ]

  assert.deepEqual(
    filterSourceFiles(files, 'button').map((file) => file.target),
    ['button.vue', 'shared.ts'],
  )
  assert.deepEqual(filterSourceFiles(files), files)
})
