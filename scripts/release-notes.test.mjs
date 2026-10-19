import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { extractReleaseNotes } from './release-notes.mjs'

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

test('the current package version has release notes', () => {
  const { version } = JSON.parse(
    readFileSync(new URL('../packages/cli/package.json', import.meta.url), 'utf8'),
  )
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
  assert.ok(extractReleaseNotes(changelog, version).trim())
})
