import assert from 'node:assert/strict'
import test from 'node:test'
import { journalFromSource, normalizeJournal, removeJournalTargets } from '../src/upgrade.mjs'

const integrity = (value) => `sha256-${value}`

test('journalFromSource records only apply and conflict states', () => {
  const journal = journalFromSource(
    {
      files: [
        {
          target: 'src/b.vue',
          source: 'components/b.vue',
          state: 'upstream-only',
          baseIntegrity: integrity('base-b'),
          upstreamIntegrity: integrity('upstream-b'),
        },
        {
          target: 'src/a.vue',
          source: 'components/a.vue',
          state: 'conflict',
          baseIntegrity: integrity('base-a'),
          upstreamIntegrity: integrity('upstream-a'),
        },
        {
          target: 'src/c.vue',
          source: 'components/c.vue',
          state: 'local-only',
          baseIntegrity: integrity('base-c'),
          upstreamIntegrity: integrity('base-c'),
        },
      ],
    },
    '0.7.0',
  )

  assert.equal(journal.targetVersion, '0.7.0')
  assert.deepEqual(
    journal.files.map((file) => [file.target, file.kind]),
    [
      ['src/a.vue', 'conflict'],
      ['src/b.vue', 'apply'],
    ],
  )
})

test('journal normalization sorts and validates entries', () => {
  const journal = normalizeJournal({
    schemaVersion: 1,
    package: '@celec7/yam3x',
    registry: 'yam3x',
    targetVersion: '0.7.0',
    files: [
      {
        target: 'src/b.vue',
        source: 'components/b.vue',
        baseIntegrity: integrity('base-b'),
        targetIntegrity: integrity('target-b'),
        kind: 'apply',
      },
      {
        target: 'src/a.vue',
        source: 'components/a.vue',
        baseIntegrity: integrity('base-a'),
        targetIntegrity: integrity('target-a'),
        kind: 'conflict',
      },
    ],
  })

  assert.deepEqual(
    journal.files.map((file) => file.target),
    ['src/a.vue', 'src/b.vue'],
  )
})

test('journal target removal keeps unrelated entries', () => {
  const journal = normalizeJournal({
    schemaVersion: 1,
    package: '@celec7/yam3x',
    registry: 'yam3x',
    targetVersion: '0.7.0',
    files: [
      {
        target: 'src/a.vue',
        source: 'components/a.vue',
        baseIntegrity: integrity('base-a'),
        targetIntegrity: integrity('target-a'),
        kind: 'conflict',
      },
      {
        target: 'src/b.vue',
        source: 'components/b.vue',
        baseIntegrity: integrity('base-b'),
        targetIntegrity: integrity('target-b'),
        kind: 'apply',
      },
    ],
  })

  assert.deepEqual(
    removeJournalTargets(journal, ['src/a.vue']).files.map((file) => file.target),
    ['src/b.vue'],
  )
})

test('journal normalization rejects unknown kinds', () => {
  assert.throws(
    () =>
      normalizeJournal({
        schemaVersion: 1,
        package: '@celec7/yam3x',
        registry: 'yam3x',
        targetVersion: '0.7.0',
        files: [
          {
            target: 'src/a.vue',
            source: 'components/a.vue',
            baseIntegrity: integrity('base-a'),
            targetIntegrity: integrity('target-a'),
            kind: 'delete',
          },
        ],
      }),
    /kind/,
  )
})
