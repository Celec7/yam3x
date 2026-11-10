import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const components = path.join(root, 'apps/docs/components')
const zhComponents = path.join(root, 'apps/docs/zh/components')
const demos = path.join(components, 'demos')
const pages = (await readdir(components)).filter(
  (name) => name.endsWith('.md') && name !== 'index.md',
)
const errors = []

function headings(source) {
  return source
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.trim())
}

function fencedCode(source) {
  return [...source.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1])
}

const demoFiles = new Set(
  (await readdir(demos))
    .filter((name) => name.endsWith('.vue'))
    .map((name) => `components/demos/${name}`),
)
const usedDemos = new Set()

for (const file of await readdir(path.join(root, 'apps/docs/guide'))) {
  if (!file.endsWith('.md')) continue
  const source = await readFile(path.join(root, 'apps/docs/guide', file), 'utf8')
  for (const match of source.matchAll(/<<<\s+([^\s{]+)/g)) {
    const target = path.posix.normalize(path.posix.join('guide', match[1]))
    if (target.includes('/demos/')) usedDemos.add(target.replace('../components/', 'components/'))
  }
}

for (const page of pages) {
  const enPath = path.join(components, page)
  const zhPath = path.join(zhComponents, page)
  const en = await readFile(enPath, 'utf8')
  let zh = ''
  try {
    zh = await readFile(zhPath, 'utf8')
  } catch {
    errors.push(`${page}: missing Chinese mirror`)
    continue
  }

  if (!/^#\s+/m.test(en)) errors.push(`${page}: missing H1`)
  if (!/^## Use in your app$/m.test(en)) errors.push(`${page}: missing "Use in your app"`)
  if (!/^## API$/m.test(en) && page !== 'text-fields.md') errors.push(`${page}: missing "API"`)
  if (!/^## Material references$/m.test(en) && page !== 'localization.md') {
    errors.push(`${page}: missing "Material references"`)
  }

  const enHeadings = headings(en)
  const zhHeadings = headings(zh)
  if (enHeadings.length !== zhHeadings.length) {
    errors.push(`${page}: EN ${enHeadings.length} H2 sections, ZH ${zhHeadings.length}`)
  }

  for (const match of en.matchAll(/from '\.\/demos\/([^']+)'/g)) {
    const target = `components/demos/${match[1]}`
    if (!demoFiles.has(target)) errors.push(`${page}: missing ${target}`)
    usedDemos.add(target)
  }

  for (const match of en.matchAll(/<<<\s+\.\/demos\/([^\s{]+)/g)) {
    const target = `components/demos/${match[1]}`
    if (!demoFiles.has(target)) errors.push(`${page}: missing ${target}`)
    usedDemos.add(target)
  }

  for (const block of fencedCode(en)) {
    if (block.includes('@registry/')) errors.push(`${page}: page code fence uses @registry`)
  }
}

for (const demo of demoFiles) {
  const source = await readFile(path.join(root, 'apps/docs', demo), 'utf8')
  for (const match of source.matchAll(/from '\.\/([^']+\.vue)'/g)) {
    const target = `components/demos/${match[1]}`
    if (demoFiles.has(target)) usedDemos.add(target)
  }
}

for (const demo of demoFiles) {
  if (!usedDemos.has(demo)) errors.push(`${demo}: demo is not imported by a page or guide`)
}

if (errors.length) {
  console.error(`Docs check failed with ${errors.length} issue(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exitCode = 1
} else {
  console.log(`OK: ${pages.length} component page pairs and ${demoFiles.size} demos checked.`)
}
