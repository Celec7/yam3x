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

function headingLevels(source) {
  return source
    .split('\n')
    .filter((line) => /^#{2,3} /.test(line))
    .map((line) => line.slice(0, line.indexOf(' ')))
}

function fencedCode(source) {
  return [...source.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1])
}

const guideRoot = path.join(root, 'apps/docs/guide')
const zhGuideRoot = path.join(root, 'apps/docs/zh/guide')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await markdownFiles(target)))
    else if (entry.name.endsWith('.md')) files.push(target)
  }
  return files
}

function isRedirect(source) {
  return /http-equiv:\s*refresh/.test(source)
}

const guidePages = await markdownFiles(guideRoot)
for (const enPath of guidePages) {
  const relative = path.relative(guideRoot, enPath)
  const zhPath = path.join(zhGuideRoot, relative)
  const en = await readFile(enPath, 'utf8')
  let zh
  try {
    zh = await readFile(zhPath, 'utf8')
  } catch {
    errors.push(`guide/${relative}: missing Chinese mirror`)
    continue
  }
  if (isRedirect(en) || isRedirect(zh)) continue
  if (!/^#\s+/m.test(en)) errors.push(`guide/${relative}: missing H1`)
  if (headingLevels(en).join(',') !== headingLevels(zh).join(',')) {
    errors.push(`guide/${relative}: EN and ZH heading levels differ`)
  }
}

const oldGuideRoutes = new Set([
  '/guide/',
  '/guide/installation',
  '/guide/updating',
  '/guide/design',
  '/guide/theme',
  '/guide/gestures',
])
const markdownSources = [
  ...(await markdownFiles(path.join(root, 'apps/docs/components'))),
  ...(await markdownFiles(path.join(root, 'apps/docs/zh/components'))),
  ...guidePages,
  ...(await markdownFiles(zhGuideRoot)),
]
for (const sourcePath of markdownSources) {
  const source = await readFile(sourcePath, 'utf8')
  const prose = source.replace(/```[^\n]*\n[\s\S]*?```/g, '')
  for (const match of prose.matchAll(/\]\(((?:\/zh)?\/guide\/[^)\s#]*)(?:#[^)]*)?\)/g)) {
    const route = match[1]
    if (oldGuideRoutes.has(route)) {
      errors.push(`${path.relative(root, sourcePath)}: old guide route ${route}`)
      continue
    }
    const relative = route.replace(/^\/zh\//, '').replace(/^\//, '')
    const target = route.endsWith('/') ? `${relative}index.md` : `${relative}.md`
    const targetPath = path.join(root, 'apps/docs', route.startsWith('/zh/') ? 'zh' : '', target)
    try {
      await readFile(targetPath, 'utf8')
    } catch {
      errors.push(`${path.relative(root, sourcePath)}: missing guide target ${route}`)
    }
  }
}

const demoFiles = new Set(
  (await readdir(demos))
    .filter((name) => name.endsWith('.vue'))
    .map((name) => `components/demos/${name}`),
)
const usedDemos = new Set()

for (const filePath of guidePages) {
  const source = await readFile(filePath, 'utf8')
  const relative = path.relative(path.join(root, 'apps/docs/guide'), filePath)
  for (const match of source.matchAll(/<<<\s+([^\s{]+)/g)) {
    const target = path.posix.normalize(path.posix.join('guide', path.dirname(relative), match[1]))
    if (target.includes('/demos/')) usedDemos.add(target.replace('../components/', 'components/'))
  }
}

for (const page of pages) {
  const enPath = path.join(components, page)
  const zhPath = path.join(zhComponents, page)
  const en = await readFile(enPath, 'utf8')
  let zh
  try {
    zh = await readFile(zhPath, 'utf8')
  } catch {
    errors.push(`${page}: missing Chinese mirror`)
    continue
  }

  if (!/^#\s+/m.test(en)) errors.push(`${page}: missing H1`)
  if (!/^## Examples$/m.test(en) && page !== 'text-fields.md') {
    errors.push(`${page}: missing "Examples"`)
  }
  if (!/^## Use in your app$/m.test(en)) errors.push(`${page}: missing "Use in your app"`)
  if (!/^## Behavior and accessibility$/m.test(en) && page !== 'text-fields.md') {
    errors.push(`${page}: missing "Behavior and accessibility"`)
  }
  if (!/^## API$/m.test(en) && page !== 'text-fields.md') errors.push(`${page}: missing "API"`)
  if (!/^## Material references$/m.test(en) && page !== 'localization.md') {
    errors.push(`${page}: missing "Material references"`)
  }

  const enHeadings = headings(en)
  const zhHeadings = headings(zh)
  if (page !== 'text-fields.md') {
    const actual = enHeadings.map((heading) => heading.slice(3))
    const expected = ['Examples', 'Use in your app', 'Behavior and accessibility', 'API']
    if (actual.includes('Styling')) expected.push('Styling')
    if (page !== 'localization.md') expected.push('Material references')
    if (actual.join('|') !== expected.join('|')) {
      errors.push(`${page}: section order is ${actual.join(' → ')}`)
    }
  }
  if (enHeadings.length !== zhHeadings.length) {
    errors.push(`${page}: EN ${enHeadings.length} H2 sections, ZH ${zhHeadings.length}`)
  }
  const enLevels = headingLevels(en)
  const zhLevels = headingLevels(zh)
  if (enLevels.join(',') !== zhLevels.join(',')) {
    errors.push(`${page}: EN and ZH heading levels differ`)
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
  console.log(
  `OK: ${pages.length} component page pairs, ${guidePages.length} guide pages, and ${demoFiles.size} demos checked.`,
)
}
