import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractReleaseNotes, validateReleaseNotes } from './release-notes.mjs'

test('release notes contain only the requested version and retain Markdown structure', () => {
  const changelog =
    '# Changelog\n\n## 0.3.0\n\nFuture changes\n\n## 0.2.0\n\n### Added\n\n- New component\n\n[Upgrade guide](https://example.com/upgrade)\n\n## 0.1.1\n\nEarlier changes\n'
  assert.equal(
    extractReleaseNotes(changelog, '0.2.0'),
    '### Added\n\n- New component\n\n[Upgrade guide](https://example.com/upgrade)\n',
  )
})

test('CRLF changelogs produce the same release body', () => {
  assert.equal(
    extractReleaseNotes('# Changelog\r\n## 0.2.0\r\n\r\nChanges\r\n', '0.2.0'),
    'Changes\n',
  )
})

test('missing, duplicate, and empty release sections fail before publishing', () => {
  for (const changelog of [
    '## 0.1.1\nOld',
    '## 0.2.0\nFirst\n## 0.2.0\nSecond',
    '## 0.2.0\n\n## 0.1.1\nOld',
  ]) {
    assert.throws(() => extractReleaseNotes(changelog, '0.2.0'), /CHANGELOG.md/)
  }
})

test('every release requires an Upgrade section', () => {
  assert.doesNotThrow(() =>
    validateReleaseNotes('## 0.7.0\n\nChanges\n\n### Upgrade\n\nNo API migration.\n', '0.7.0'),
  )
  assert.throws(
    () => validateReleaseNotes('## 0.7.0\n\nChanges\n', '0.7.0'),
    /must include a "### Upgrade" section/,
  )
})

test('breaking releases require a migration link and bilingual pages', () => {
  const notes =
    '## 0.7.0\n\n### Breaking changes\n\n- Renamed API.\n\n### Upgrade\n\nSee [migration](/guide/maintain/migrations/0.7.0).\n'

  assert.doesNotThrow(() => validateReleaseNotes(notes, '0.7.0', { migrationExists: true }))
  assert.throws(
    () => validateReleaseNotes(notes, '0.7.0', { migrationExists: false }),
    /Chinese mirror are required/,
  )

  const withoutLink =
    '## 0.7.0\n\n### Breaking changes\n\n- Renamed API.\n\n### Upgrade\n\nMerge source.\n'
  assert.throws(
    () => validateReleaseNotes(withoutLink, '0.7.0', { migrationExists: true }),
    /must link \/guide\/maintain\/migrations\/0\.7\.0/,
  )
})

test('the current package version has valid release notes and migration pages', () => {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url))
  const { version } = JSON.parse(
    readFileSync(join(projectRoot, 'packages/cli/package.json'), 'utf8'),
  )
  const changelog = readFileSync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
  const migrationExists = ['apps/docs', 'apps/docs/zh'].every((prefix) =>
    existsSync(join(projectRoot, prefix, 'guide/maintain/migrations', `${version}.md`)),
  )

  assert.ok(validateReleaseNotes(changelog, version, { migrationExists }).trim())
})
