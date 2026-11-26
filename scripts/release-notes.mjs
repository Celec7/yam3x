export function extractReleaseNotes(changelog, version) {
  const matches = changelog
    .split(/^##[ \t]+/m)
    .slice(1)
    .map((section) => {
      const [heading, ...body] = section.split(/\r?\n/)
      return { heading: heading.trim(), body: body.join('\n').trim() }
    })
    .filter(({ heading }) => heading === version)

  if (matches.length !== 1) {
    throw new Error(`CHANGELOG.md must contain exactly one "## ${version}" section.`)
  }
  if (!matches[0].body) {
    throw new Error(`CHANGELOG.md release notes for ${version} must not be empty.`)
  }
  return `${matches[0].body}\n`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function validateReleaseNotes(changelog, version, { migrationExists = false } = {}) {
  const notes = extractReleaseNotes(changelog, version)
  const breaking = /^### Breaking changes[ \t]*$/m.test(notes)
  const upgrade = /^### Upgrade[ \t]*$/m.test(notes)
  if (!upgrade) {
    throw new Error(
      `CHANGELOG.md release notes for ${version} must include a "### Upgrade" section.`,
    )
  }
  if (!breaking) return notes

  const migrationLink = new RegExp(
    `/guide/maintain/migrations/${escapeRegExp(version)}(?:[)#/?]|$)`,
  )
  if (!migrationLink.test(notes)) {
    throw new Error(
      `CHANGELOG.md release notes for ${version} must link /guide/maintain/migrations/${version}.`,
    )
  }
  if (!migrationExists) {
    throw new Error(
      `Migration page apps/docs/guide/maintain/migrations/${version}.md and its Chinese mirror are required.`,
    )
  }
  return notes
}
