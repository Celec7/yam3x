import { readFile, writeFile } from 'node:fs/promises'
import { foundationTokens } from '../registry/foundations/tokens/foundation-tokens.mjs'
import {
  defaultThemeSource,
  generateTheme,
  getThemeTokenValues,
} from '../registry/foundations/theme/generate-core.mjs'

const cssPath = new URL('../registry/foundations/styles/tokens.css', import.meta.url)
const original = await readFile(cssPath, 'utf8')
const lightColorMarkers =
  /\/\* Generated baseline light color tokens: pnpm tokens:generate \*\/[\s\S]*?\/\* End generated baseline light color tokens \*\/\/?/
const darkColorMarkers =
  /\/\* Generated baseline dark color tokens: pnpm tokens:generate \*\/[\s\S]*?\/\* End generated baseline dark color tokens \*\/\/?/
const motionMarkers =
  /\/\* Generated motion tokens: pnpm tokens:generate \*\/[\s\S]*?\/\* End generated motion tokens \*\/\/?/

const declarations = (values, indent = '  ') =>
  Object.entries(values)
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join('\n')
const defaultTheme = generateTheme(defaultThemeSource.color, defaultThemeSource)
const lightColorBlock = [
  '/* Generated baseline light color tokens: pnpm tokens:generate */',
  declarations(getThemeTokenValues(defaultTheme, 'light')),
  '  /* End generated baseline light color tokens */',
].join('\n')
const darkColorBlock = [
  '/* Generated baseline dark color tokens: pnpm tokens:generate */',
  ":root[data-theme='dark'],",
  ':root.dark {',
  '  color-scheme: dark;',
  declarations(getThemeTokenValues(defaultTheme, 'dark')),
  '}',
  '@media (prefers-color-scheme: dark) {',
  '  :root:not([data-theme]):not(.dark) {',
  '    color-scheme: dark;',
  declarations(getThemeTokenValues(defaultTheme, 'dark'), '    '),
  '  }',
  '}',
  '/* End generated baseline dark color tokens */',
].join('\n')

const motionDeclarations = Object.entries(foundationTokens.motion.expressive)
  .flatMap(([name, value]) => [
    `  --md-sys-motion-spring-${name}: ${value.duration} ${value.easing};`,
    `  --md-sys-motion-duration-${name}: ${value.duration};`,
    `  --md-sys-motion-easing-${name}: ${value.easing};`,
  ])
  .join('\n')
const motionBlock = [
  '/* Generated motion tokens: pnpm tokens:generate */',
  motionDeclarations,
  '  /* End generated motion tokens */',
].join('\n')

if (
  !lightColorMarkers.test(original) ||
  !darkColorMarkers.test(original) ||
  !motionMarkers.test(original)
) {
  throw new Error('Token CSS is missing generated color or motion markers.')
}

const next = original
  .replace(lightColorMarkers, lightColorBlock)
  .replace(darkColorMarkers, darkColorBlock)
  .replace(motionMarkers, motionBlock)
if (next !== original) await writeFile(cssPath, next)
