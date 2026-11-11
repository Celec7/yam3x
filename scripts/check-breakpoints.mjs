import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const sourceRoots = ['registry', 'apps/docs/components/demos']
const ignoredDirectories = new Set(['node_modules', 'dist', '.vitepress', '--host', 'test-results'])
const canonical = new Set([599.98, 600, 839.98, 840, 1199.98, 1200, 1599.98, 1600])
const exceptions = new Map([
  ['registry/components/bottom-sheet/bottom-sheet.css', new Set([640])],
  ['registry/components/bottom-sheet/bottom-sheet.vue', new Set([640])],
  ['registry/components/date-picker/date-picker.css', new Set([480])],
])
const errors = []
let checked = 0

async function sourceFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(target)))
    else if (/\.(?:vue|css|ts|mts|js|mjs)$/.test(entry.name)) files.push(target)
  }
  return files
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function lineBreakpointValues(line) {
  if (line.includes('@container')) return []
  const values = []
  if (line.includes('@media') || line.includes('matchMedia') || line.includes('innerWidth')) {
    for (const match of line.matchAll(/\(\s*(?:min|max)-width\s*:\s*([\d.]+)px\s*\)/g)) {
      values.push(Number(match[1]))
    }
    for (const match of line.matchAll(/\(\s*width\s*(?:[<>]=?)\s*([\d.]+)px\s*\)/g)) {
      values.push(Number(match[1]))
    }
  }
  for (const match of line.matchAll(/innerWidth\s*[<>]=?\s*([\d.]+)/g)) {
    values.push(Number(match[1]))
  }
  return values
}

for (const sourceRoot of sourceRoots) {
  for (const file of await sourceFiles(path.join(root, sourceRoot))) {
    const relative = path.relative(root, file).split(path.sep).join('/')
    const allowed = new Set([...canonical, ...(exceptions.get(relative) ?? [])])
    const lines = stripComments(await readFile(file, 'utf8')).split('\n')
    lines.forEach((line, index) => {
      for (const value of lineBreakpointValues(line)) {
        checked += 1
        if (allowed.has(value)) continue
        errors.push(
          `${relative}:${index + 1}: breakpoint ${value} is not allowed. ` +
            'Use 600, 840, 1200, or 1600, or add a documented component-specific exception.',
        )
      }
    })
  }
}

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log(`OK: ${checked} responsive breakpoint value(s) checked.`)
}
