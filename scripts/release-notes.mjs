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
