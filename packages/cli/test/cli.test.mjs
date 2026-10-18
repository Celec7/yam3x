import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmod, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import semver from 'semver'
import { readWorkspaceCatalog } from '../../../scripts/catalog.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const cliPath = join(projectRoot, 'packages/cli/src/index.mjs')
const registry = JSON.parse(await readFile(join(projectRoot, 'registry/registry.json'), 'utf8'))
const catalog = await readWorkspaceCatalog()

function assertRegistryDependencies(packageJson, componentNames) {
  const requiredDependencies = { ...registry.foundations.core.dependencies }
  for (const name of componentNames) {
    Object.assign(requiredDependencies, registry.components[name].dependencies)
  }

  for (const [name, requiredRange] of Object.entries(requiredDependencies)) {
    assert.ok(packageJson.dependencies?.[name], `Missing registry dependency ${name}`)
    assert.ok(
      semver.intersects(packageJson.dependencies[name], requiredRange),
      `${name} range ${packageJson.dependencies[name]} does not satisfy ${requiredRange}`,
    )
  }
  for (const [name, requiredRange] of Object.entries(registry.foundations.core.devDependencies)) {
    assert.ok(packageJson.devDependencies?.[name], `Missing foundation dev dependency ${name}`)
    assert.ok(
      semver.intersects(packageJson.devDependencies[name], requiredRange),
      `${name} range ${packageJson.devDependencies[name]} does not satisfy ${requiredRange}`,
    )
  }
}

async function fixture(t, { isolatedDependencies = false } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'yam3x-cli-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  await mkdir(join(directory, 'src'), { recursive: true })
  await writeFile(
    join(directory, 'package.json'),
    JSON.stringify(
      {
        name: 'temporary-yam3x-consumer',
        version: '0.0.0',
        type: 'module',
        scripts: { build: 'vite build', typecheck: 'vue-tsc --noEmit' },
        dependencies: { vue: catalog.vue },
        devDependencies: {
          '@tailwindcss/vite': catalog['@tailwindcss/vite'],
          '@vitejs/plugin-vue': catalog['@vitejs/plugin-vue'],
          typescript: catalog.typescript,
          vite: catalog.vite,
          'vue-tsc': catalog['vue-tsc'],
        },
      },
      null,
      2,
    ),
  )
  await writeFile(
    join(directory, 'index.html'),
    '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>yam3x consumer</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    "import { createApp } from 'vue'\nimport App from './App.vue'\nimport { createThemeController } from './lib/yam3x/theme/controller'\nimport { getColorFromImage } from './lib/yam3x/theme/image'\nimport { bindGestures, longPress, pan, phase, repeat, rotate, scale, sequence, swipe, tap, transform, useGestures } from './lib/yam3x/gestures'\nvoid createThemeController\nvoid getColorFromImage\nvoid bindGestures\nvoid longPress\nvoid pan\nvoid phase\nvoid repeat\nvoid rotate\nvoid scale\nvoid sequence\nvoid swipe\nvoid tap\nvoid transform\nvoid useGestures\nvoid tap(() => {})\nvoid longPress(() => {})\nvoid pan(() => {})\nvoid swipe(() => {})\nvoid scale(() => {})\nvoid rotate(() => {})\nvoid repeat(() => {}, { count: 2 }, tap())\nvoid sequence(() => {}, tap(), tap())\nvoid useGestures\ncreateApp(App).mount('#app')\n",
  )
  await writeFile(
    join(directory, 'vite.config.ts'),
    "import tailwindcss from '@tailwindcss/vite'\nimport vue from '@vitejs/plugin-vue'\nexport default { plugins: [vue(), tailwindcss()] }\n",
  )
  await writeFile(
    join(directory, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          skipLibCheck: true,
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          lib: ['ESNext', 'DOM', 'DOM.Iterable'],
          types: ['vite/client'],
        },
        include: ['src/**/*.ts', 'src/**/*.vue'],
      },
      null,
      2,
    ),
  )
  await writeFile(join(directory, 'src/env.d.ts'), '/// <reference types="vite/client" />\n')
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import Avatar from './components/yam3x/avatar/avatar.vue'
import Badge from './components/yam3x/badge/badge.vue'
import Button from './components/yam3x/button/button.vue'
import ButtonGroup from './components/yam3x/button-group/button-group.vue'
import { Breadcrumb } from './components/yam3x/breadcrumb'
import Card from './components/yam3x/card/card.vue'
import Checkbox from './components/yam3x/checkbox/checkbox.vue'
import { RadioGroup, RadioButton } from './components/yam3x/radio-group'
import AssistChip from './components/yam3x/chips/assist-chip.vue'
import SuggestionChip from './components/yam3x/chips/suggestion-chip.vue'
import InputChipSet from './components/yam3x/chips/input-chip-set.vue'
import Dialog from './components/yam3x/dialog/dialog.vue'
import { HorizontalDivider as Divider } from './components/yam3x/divider'
import Fab from './components/yam3x/fab/floating-action-button.vue'
import Heading from './components/yam3x/heading/heading.vue'
import { Icon, registerIcon } from './components/yam3x/icon'
import FilterChip from './components/yam3x/filter-chip/filter-chip.vue'
import FilterChipSet from './components/yam3x/filter-chip-set/filter-chip-set.vue'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
import NavigationBar from './components/yam3x/navigation-bar/navigation-bar.vue'
import NavigationBarItem from './components/yam3x/navigation-bar/navigation-bar-item.vue'
import { NavigationRail } from './components/yam3x/navigation-rail'
import { CircularProgressIndicator, LinearProgressIndicator } from './components/yam3x/progress-indicator'
import { LoadingIndicator } from './components/yam3x/loading-indicator'
import { Toolbar } from './components/yam3x/toolbar'
import { Slider } from './components/yam3x/slider'
import { Tabs } from './components/yam3x/tabs'
import { Menu, type MenuItem } from './components/yam3x/menu'
import { SplitButton } from './components/yam3x/split-button'
import { Tooltip, RichTooltip, RichTooltipAction } from './components/yam3x/tooltip'
import { Search } from './components/yam3x/search'
import FormField from './components/yam3x/form-field/form-field.vue'
import DatePicker from './components/yam3x/date-picker/date-picker.vue'
import TimePicker from './components/yam3x/time-picker/time-picker.vue'
import TimeInput from './components/yam3x/time-picker/time-input.vue'
import TimePickerDialog from './components/yam3x/time-picker/time-picker-dialog.vue'
import DrawerContainer from './components/yam3x/drawer-container/drawer-container.vue'
import { Option as Option } from './components/yam3x/option'
import { Select as Select } from './components/yam3x/select'
import Switch from './components/yam3x/switch/switch.vue'
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'
import ThemePreviewIcon from './lib/yam3x/theme/theme-preview-icon.vue'

const selected = ref(false)
const chips = ref<string[]>([])
const dialogOpen = ref(false)
const selectedView = ref('list')
const filter = ref<string | null>(null)
const volume = ref(40)
const selectedTab = ref('details')
const country = ref('jp')
const messageRows = { minRows: 1, maxRows: 4 }
const destinations = [{ label: 'Home', value: 'home', href: '/' }]
const menuItems: MenuItem[] = [{ value: 'more', label: 'More actions', items: [{ value: 'archive', label: 'Archive' }] }]
registerIcon('home', 'outlined', {
  outlined: { viewBox: '0 0 24 24', path: 'M3 10 12 3l9 7v10h-6v-7H9v7H3z' },
  filled: { viewBox: '0 0 24 24', path: 'M2 10 12 2l10 8v12h-7v-7H9v7H2z' },
})
</script>

<template>
  <main>
    <Avatar>AB</Avatar>
    <Badge size="small">3</Badge>
    <Button>Save</Button>
    <ButtonGroup v-model="selectedView" label="View" :options="[{ label: 'List', value: 'list' }]" />
    <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: 'Current' }]" />
    <Card>Card</Card>
    <Checkbox label="Accept" />
    <RadioGroup v-model="selectedView" label="View" name="view">
      <RadioButton value="list">List</RadioButton>
      <RadioButton value="grid">Grid</RadioButton>
    </RadioGroup>
    <AssistChip>Refresh</AssistChip>
    <SuggestionChip>Suggested</SuggestionChip>
    <InputChipSet v-model="chips" label="Keywords" />
    <Dialog v-model:open="dialogOpen" title="Confirm">Body</Dialog>
    <Divider />
    <Fab aria-label="Create" />
    <Heading :level="2">Heading</Heading>
    <Icon name="home" aria-label="Home" />
    <FilterChip v-model:selected="selected">Filter</FilterChip>
    <FilterChipSet v-model="filter" label="Topics" :options="[{ label: 'Vue', value: 'vue' }]" />
    <IconButton aria-label="Search">⌕</IconButton>
    <NavigationBar v-model="selectedView" label="Primary">
      <NavigationBarItem v-for="item in destinations" :key="item.value" v-bind="item">
        <template #icon>{{ item.label }}</template>
      </NavigationBarItem>
    </NavigationBar>
    <NavigationRail v-model="selectedView" label="Primary rail" :items="destinations">
      <template #icon><span>⌂</span></template>
    </NavigationRail>
    <LinearProgressIndicator :value="42" />
    <CircularProgressIndicator :value="42" />
    <LoadingIndicator aria-label="Loading account" />
    <Toolbar aria-label="Actions"><IconButton aria-label="Search">⌕</IconButton></Toolbar>
    <Search label="Search messages">Search results</Search>
    <Slider v-model="volume" label="Volume" />
    <Tabs v-model="selectedTab" label="Product sections" :items="[{ value: 'details', label: 'Details' }, { value: 'reviews', label: 'Reviews' }]">
      <template #panel="{ item }">{{ item.label }} content</template>
    </Tabs>
    <Menu label="File actions" :items="menuItems" />
    <SplitButton label="Save" :items="menuItems" />
    <button id="help-trigger" aria-label="Help">?</button>
    <Tooltip for="help-trigger">Show help</Tooltip>
    <button id="rich-trigger" aria-label="Feature details">i</button>
    <RichTooltip for="rich-trigger">
      <template #subhead>New feature</template>
      Additional context.
      <template #actions><button><RichTooltipAction>Learn more</RichTooltipAction></button></template>
    </RichTooltip>
    <Switch label="Notifications" />
    <textarea v-textarea-autosize="messageRows" rows="1" />
    <FormField label="Country"><Select v-model="country" name="country"><Option value="jp" label="Japan" /><Option value="kr" label="South Korea" /></Select></FormField>
    <DatePicker label="Date" />
    <TimePicker label="Time" />
    <TimeInput aria-label="Time input" />
    <TimePickerDialog label="Time dialog" />
    <DrawerContainer><template #start><button>Navigation</button></template></DrawerContainer>
    <ThemePreviewIcon color="#6750a4" scheme="light" />
  </main>
</template>
`,
  )
  if (!isolatedDependencies) {
    await symlink(
      join(projectRoot, 'apps/docs/node_modules'),
      join(directory, 'node_modules'),
      'dir',
    )
  }
  return directory
}

async function linkDeclaredPackages(directory) {
  const project = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  const sourceModules = join(projectRoot, 'apps/docs/node_modules')
  const targetModules = join(directory, 'node_modules')
  await mkdir(targetModules, { recursive: true })

  for (const name of new Set([
    ...Object.keys(project.dependencies ?? {}),
    ...Object.keys(project.devDependencies ?? {}),
  ])) {
    const source = join(sourceModules, name)
    const target = join(targetModules, name)
    await mkdir(dirname(target), { recursive: true })
    await symlink(source, target, 'dir')
  }

  const binDirectory = join(targetModules, '.bin')
  await mkdir(binDirectory, { recursive: true })
  for (const name of ['vite', 'vue-tsc']) {
    await symlink(join(sourceModules, '.bin', name), join(binDirectory, name), 'file')
  }
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args, '--cwd', cwd, '--no-install'], {
    cwd: projectRoot,
    encoding: 'utf8',
  })
}

test('prints its manifest version without requiring a target project', async () => {
  const manifest = JSON.parse(
    await readFile(join(projectRoot, 'packages/cli/package.json'), 'utf8'),
  )
  const result = spawnSync(process.execPath, [cliPath, '--version'], {
    cwd: projectRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.equal(result.stdout.trim(), `yam3x ${manifest.version}`)
})

test('add copies editable component sources and declares only required packages', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'button', 'switch', 'navigation-bar', 'breadcrumb'], directory)

  assert.equal(result.status, 0, result.stderr || result.stdout)
  const stylesheet = await readFile(join(directory, 'src/yam3x.css'), 'utf8')
  assert.match(
    stylesheet,
    /fonts\.googleapis\.com\/css2\?family=Roboto[^"]*&family=Material\+Symbols\+Outlined:/,
  )
  assert.ok(stylesheet.includes('family=Material+Symbols+Rounded'))
  assert.ok(stylesheet.includes('family=Material+Symbols+Sharp'))
  assert.match(stylesheet, /@import ['"]\.\/styles\/yam3x-base\.css['"];?/)
  assert.match(stylesheet, /@source ['"]\.\/components\/yam3x\//)
  assert.match(
    await readFile(join(directory, 'src/styles/yam3x-base.css'), 'utf8'),
    /\.yam3x-state-layer/,
  )
  assert.match(await readFile(join(directory, 'src/main.ts'), 'utf8'), /\.\/yam3x\.css/)
  assert.match(
    await readFile(join(directory, 'src/components/yam3x/button/button-base.vue'), 'utf8'),
    /buttonVariants/,
  )
  assert.match(
    await readFile(join(directory, 'src/components/yam3x/button/button-base.vue'), 'utf8'),
    /yam3x-button--elevated/,
  )
  assert.match(
    await readFile(join(directory, 'src/components/yam3x/switch/switch.vue'), 'utf8'),
    /@ark-ui\/vue\/switch/,
  )
  assert.match(
    await readFile(
      join(directory, 'src/components/yam3x/navigation-bar/navigation-bar.vue'),
      'utf8',
    ),
    /aria-current/,
  )
  assert.match(
    await readFile(
      join(directory, 'src/components/yam3x/navigation-bar/navigation-bar-item.vue'),
      'utf8',
    ),
    /navigationBarContextKey/,
  )
  assert.match(
    await readFile(join(directory, 'src/components/yam3x/breadcrumb/breadcrumb.vue'), 'utf8'),
    /aria-current/,
  )

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(packageJson, ['switch', 'navigation-bar', 'breadcrumb'])
})

test('add preserves a locally edited component file on a repeated add', async (t) => {
  const directory = await fixture(t)
  assert.equal(runCli(['add', 'button'], directory).status, 0)

  const componentPath = join(directory, 'src/components/yam3x/button/button.vue')
  await writeFile(componentPath, '<template><button>Local edit</button></template>\n')

  const result = runCli(['add', 'button'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.equal(
    await readFile(componentPath, 'utf8'),
    '<template><button>Local edit</button></template>\n',
  )
})

test('add installs foundation dependencies even when the component has no extra packages', async (t) => {
  const directory = await fixture(t)
  const bin = join(directory, 'bin')
  await mkdir(bin)
  const manager = join(bin, 'npm')
  await writeFile(manager, '#!/bin/sh\nprintf "%s" "$1" > install-called\n')
  await chmod(manager, 0o755)

  const result = spawnSync(process.execPath, [cliPath, 'add', 'card', '--cwd', directory], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /Declared dependencies:.*tailwindcss/)
  assert.match(result.stdout, /@material\/material-color-utilities/)
  assert.equal(await readFile(join(directory, 'install-called'), 'utf8'), 'install')
})

test('FormField installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'form-field'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  await readFile(join(directory, 'src/components/yam3x/form-field/form-field.vue'), 'utf8')

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { FormField } from './components/yam3x/form-field'
</script>
<template><FormField label="Email"><input type="email" /></FormField></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'FormField consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-form-field__container/,
  )
})

test('Autocomplete installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'autocomplete'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteOption, type AutocompleteVariant, type VirtualListOptions } from './components/yam3x/autocomplete'
const query = ref('')
const selected = ref<string | null>(null)
const variant: AutocompleteVariant = 'vibrant'
const virtual: VirtualListOptions = { estimateSize: 56, overscan: 3 }
const options: AutocompleteOption[] = [{ value: 'apple', label: 'Apple' }]
</script>
<template><Autocomplete v-model="query" v-model:selected="selected" :options="options" label="Fruit" :variant="variant" :virtual="virtual" /></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(packageJson, ['autocomplete'])

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Autocomplete consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-autocomplete__popup/,
  )
})

test('TreeView installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'tree-view'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import { TreeView, type TreeViewNode, type TreeViewKey, type VirtualListOptions } from './components/yam3x/tree-view'
const expanded = ref<TreeViewKey[]>([0])
const nodes: TreeViewNode[] = [{ key: 0, label: 'Root', children: [{ key: 'leaf', label: 'Leaf' }] }]
const virtual: VirtualListOptions = { estimateSize: 56, overscan: 3 }
</script>
<template><TreeView v-model:expanded-keys="expanded" :nodes="nodes" label="Records" :virtual="virtual" /></template>

`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(packageJson, ['tree-view'])

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'TreeView consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-tree-view__scroll--virtual/,
  )
})

test('Descriptions installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'descriptions'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'
const items: DescriptionItem[] = [{ key: 'budget', label: 'Budget', value: 0 }]
</script>
<template><Descriptions :items="items" title="Project details" :columns="2" layout="inline" outlined /></template>

`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(packageJson, ['descriptions'])

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Descriptions consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-descriptions__list/,
  )
})

test('Avatar installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'avatar'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import Avatar from './components/yam3x/avatar/avatar.vue'
</script>
<template><Avatar>AB</Avatar></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Avatar consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-avatar__base/,
  )
})

test('Heading installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'heading'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import Heading from './components/yam3x/heading/heading.vue'
</script>
<template><Heading :level="2" variant="headline" emphasized>Heading</Heading></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Heading consumer build should emit component CSS')
  assert.match(await readFile(join(directory, 'dist/assets', cssFile), 'utf8'), /yam3x-heading/)
})

test('Icon installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'icon'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { Icon, registerIcon } from './components/yam3x/icon'
registerIcon('sample', 'outlined', {
  outlined: { viewBox: '0 0 24 24', path: 'M2 2h20v20H2z' },
  filled: { viewBox: '0 0 24 24', path: 'M2 2h20v20H2z' },
})
</script>
<template><Icon name="sample" aria-label="Sample icon" /></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const jsFiles = await readdir(join(directory, 'dist/assets'))
  assert.ok(
    jsFiles.some((name) => name.endsWith('.js')),
    'Icon consumer build should emit JS',
  )
  const cssFile = jsFiles.find((name) => name.endsWith('.css'))
  assert.ok(cssFile, 'Icon consumer build should emit component CSS')
  assert.match(await readFile(join(directory, 'dist/assets', cssFile), 'utf8'), /yam3x-icon__svg/)
})

test('Shape installs and builds as a standalone registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'shape'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { Shape, shapeNames } from './components/yam3x/shape'
void shapeNames
</script>
<template><Shape name="sunny" aria-hidden="true"><span>Decorative content</span></Shape></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Shape consumer build should emit component CSS')
  const css = await readFile(join(directory, 'dist/assets', cssFile), 'utf8')
  assert.match(css, /_yam3x-shape-clip-path/)
  assert.match(css, /_yam3x-shape-system-motion-spring-slow-spatial/)
})

test('adding FAB to a clean Vue fixture copies native button and link behavior', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'fab'], directory)

  assert.equal(result.status, 0, result.stderr || result.stdout)
  const source = await readFile(join(directory, 'src/components/yam3x/fab/fab-base.vue'), 'utf8')
  assert.match(source, /size\?: 'small' \| 'default' \| 'medium' \| 'large'/)
  assert.match(
    source,
    /variant\?:[\s\S]*'primary-container'[\s\S]*'secondary-container'[\s\S]*'tertiary-container'[\s\S]*'primary'/,
  )
  assert.match(source, /:is="isLink \? 'a' : 'button'"/)
  assert.match(source, /yam3x-floating-action-button--lowered/)
  assert.match(
    await readFile(join(directory, 'src/styles/yam3x-tokens.css'), 'utf8'),
    /--md-sys-elevation-level4/,
  )
  assert.match(
    await readFile(join(directory, 'src/styles/yam3x-base.css'), 'utf8'),
    /\.yam3x-elevation-5/,
  )

  const project = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(project, ['fab'])
  assert.equal(project.dependencies['lit'], undefined)
})

test('add with --no-install reports all new dependencies and foundation files', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'card'], directory)

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /Added \d+ source file\(s\)/)
  assert.match(
    await readFile(join(directory, 'src/lib/yam3x/theme/image.ts'), 'utf8'),
    /sourceColorFromImage/,
  )
  assert.match(
    await readFile(join(directory, 'src/lib/yam3x/theme/controller.ts'), 'utf8'),
    /createThemeController/,
  )
  assert.match(
    await readFile(join(directory, 'src/lib/yam3x/theme/theme-preview-icon.vue'), 'utf8'),
    /role="img"/,
  )
  assert.match(
    await readFile(join(directory, 'src/lib/yam3x/gestures/index.ts'), 'utf8'),
    /long-press/,
  )
  assert.match(
    await readFile(join(directory, 'src/lib/yam3x/gestures/long-press.ts'), 'utf8'),
    /class LongPressGestureRecognizer/,
  )
  assert.match(result.stdout, /Declared dependencies:.*tailwindcss/)
  assert.match(result.stdout, /Run your package manager install/)
})

test('add validates every component before modifying the project', async (t) => {
  for (const invalid of ['missing-component', 'constructor', '__proto__']) {
    const directory = await fixture(t)
    const before = await readFile(join(directory, 'package.json'), 'utf8')
    const result = runCli(['add', 'button', invalid], directory)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Unknown component/)
    assert.equal(await readFile(join(directory, 'package.json'), 'utf8'), before)
    assert.deepEqual(await readdir(join(directory, 'src')), ['App.vue', 'env.d.ts', 'main.ts'])
  }
})

test('add reports incompatible dependencies before copying registry files', async (t) => {
  const directory = await fixture(t)
  const packagePath = join(directory, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  packageJson.dependencies['@ark-ui/vue'] = '^4.0.0'
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  const before = await readFile(packagePath, 'utf8')
  const mainBefore = await readFile(join(directory, 'src/main.ts'), 'utf8')

  const result = runCli(['add', 'switch'], directory)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /does not satisfy the registry requirement/)
  assert.equal(await readFile(packagePath, 'utf8'), before)
  assert.equal(await readFile(join(directory, 'src/main.ts'), 'utf8'), mainBefore)
  assert.deepEqual(await readdir(join(directory, 'src')), ['App.vue', 'env.d.ts', 'main.ts'])
})

test('adding a button group includes its imported Button types', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'button-group'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(
    await readFile(join(directory, 'src/components/yam3x/button/button.variants.ts'), 'utf8'),
    /extra-large/,
  )
  await readFile(join(directory, 'src/components/yam3x/icon-button/icon-button.types.ts'), 'utf8')
  const project = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(project, ['button-group'])
  assert.match(
    await readFile(join(directory, 'src/styles/yam3x-base.css'), 'utf8'),
    /yam3x-touch-target/,
  )
  assert.match(
    await readFile(join(directory, 'src/styles/yam3x-tokens.css'), 'utf8'),
    /--md-sys-motion-spring-fast-spatial/,
  )
})

test('Button and Split button installs include their imported Button base', async (t) => {
  for (const component of ['button', 'split-button']) {
    const directory = await fixture(t)
    const result = runCli(['add', component], directory)
    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.match(
      await readFile(join(directory, 'src/components/yam3x/button/button-base.vue'), 'utf8'),
      /yam3x-button-container-color/,
    )
    if (component === 'button') {
      assert.match(
        await readFile(join(directory, 'src/components/yam3x/button/toggle-button.vue'), 'utf8'),
        /ButtonBase/,
      )
    } else {
      for (const file of [
        'split-button-layout.vue',
        'split-button-leading-button.vue',
        'split-button-trailing-button.vue',
        'split-button.context.ts',
        'split-button.types.ts',
        'split-button.tokens.ts',
      ]) {
        await readFile(join(directory, 'src/components/yam3x/split-button', file), 'utf8')
      }
    }
  }
})

test('Date picker installs its complete standalone source and builds without VitePress', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'date-picker'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  for (const file of [
    'date-picker.css',
    'date-picker-core.vue',
    'date-picker-range-fields.vue',
    'date-picker.types.ts',
    'date-range-picker.vue',
    'date-picker.components.ts',
    'date-utils.ts',
    'index.ts',
  ]) {
    await readFile(join(directory, 'src/components/yam3x/date-picker', file), 'utf8')
  }
  for (const file of ['icon.vue', 'icon-registry.ts', 'icon.types.ts']) {
    await readFile(join(directory, 'src/components/yam3x/icon', file), 'utf8')
  }
  await readFile(join(directory, 'src/components/yam3x/_shared/focus-trap.ts'), 'utf8')

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, type DateRangeValue } from './components/yam3x/date-picker'
const date = ref<string | null>(null)
const range = ref<DateRangeValue>({ start: null, end: null })
</script>
<template><DatePicker v-model="date" label="Date" /><DateRangePicker v-model="range" label="Range" /></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )
  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Date picker consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-date-picker__day/,
  )
})

test('Dialog installs its Icon dependency and builds without VitePress', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'dialog'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  for (const file of ['dialog.vue', 'index.ts']) {
    await readFile(join(directory, 'src/components/yam3x/dialog', file), 'utf8')
  }
  for (const file of ['icon.vue', 'icon-registry.ts', 'icon.types.ts']) {
    await readFile(join(directory, 'src/components/yam3x/icon', file), 'utf8')
  }
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import Dialog from './components/yam3x/dialog/dialog.vue'
const open = ref(true)
</script>
<template><Dialog v-model:open="open" title="Confirm" show-close-button>Body</Dialog></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )
  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'Dialog consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-dialog__content/,
  )
})

test('Calendar and DateInput install their Icon dependencies and build without VitePress', async (t) => {
  for (const component of [
    {
      key: 'calendar',
      source: `import { Calendar } from './components/yam3x/calendar'\n`,
      template: '<Calendar label="Calendar" />',
      cssSelector: /yam3x-calendar__day/,
    },
    {
      key: 'date-input',
      source: `import { DateInput } from './components/yam3x/date-input'\n`,
      template: '<DateInput label="Date" />',
      cssSelector: /yam3x-date-input__segment/,
    },
  ]) {
    const directory = await fixture(t)
    const result = runCli(['add', component.key], directory)
    assert.equal(result.status, 0, result.stderr || result.stdout)

    for (const file of ['icon.vue', 'icon-registry.ts', 'icon.types.ts']) {
      await readFile(join(directory, 'src/components/yam3x/icon', file), 'utf8')
    }

    await writeFile(
      join(directory, 'src/App.vue'),
      `<script setup lang="ts">\n${component.source}</script>\n<template>${component.template}</template>\n`,
    )
    await writeFile(
      join(directory, 'src/main.ts'),
      `import { createApp } from 'vue'\nimport App from './App.vue'\nimport './yam3x.css'\ncreateApp(App).mount('#app')\n`,
    )

    const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
      cwd: directory,
      encoding: 'utf8',
    })
    assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
    const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
      cwd: directory,
      encoding: 'utf8',
    })
    assert.equal(build.status, 0, build.stderr || build.stdout)
    const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
      name.endsWith('.css'),
    )
    assert.ok(cssFile, `${component.key} consumer build should emit component CSS`)
    assert.match(
      await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
      component.cssSelector,
    )
  }
})

test('Breadcrumb installs its Icon dependency and builds without VitePress', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'breadcrumb'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  for (const file of ['icon.vue', 'icon-registry.ts', 'icon.types.ts']) {
    await readFile(join(directory, 'src/components/yam3x/icon', file), 'utf8')
  }

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { Breadcrumb } from './components/yam3x/breadcrumb'
</script>
<template><Breadcrumb aria-label="Page path" :items="[{ label: 'Home', href: '/' }, { label: 'Current' }]" /></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
})

test('DrawerContainer installs its local dependencies and builds without VitePress', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'drawer-container'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  for (const file of [
    'src/components/yam3x/drawer-container/drawer-container.css',
    'src/components/yam3x/drawer-container/drawer-container.types.ts',
    'src/components/yam3x/_shared/focus-trap.ts',
  ]) {
    await readFile(join(directory, file), 'utf8')
  }

  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { DrawerContainer } from './components/yam3x/drawer-container'
</script>
<template><DrawerContainer start-mode="side"><template #start><aside>Tools</aside></template><main>Content</main></DrawerContainer></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'DrawerContainer consumer build should emit component CSS')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /yam3x-drawer__panel/,
  )
})

test('SplitPane installs and builds as an independent registry component', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'split-pane'], directory)
  assert.equal(result.status, 0, result.stderr || result.stdout)

  await readFile(join(directory, 'src/components/yam3x/split-pane/split-pane.vue'), 'utf8')
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { SplitPane } from './components/yam3x/split-pane'
</script>
<template><SplitPane label="Main content"><template #start><main>Main</main></template><template #end><aside>Related</aside></template></SplitPane></template>
`,
  )
  await writeFile(
    join(directory, 'src/main.ts'),
    `import { createApp } from 'vue'
import App from './App.vue'
import './yam3x.css'
createApp(App).mount('#app')
`,
  )

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'SplitPane consumer build should emit component CSS')
  const css = await readFile(join(directory, 'dist/assets', cssFile), 'utf8')
  assert.match(css, /yam3x-split-pane__separator/)
  assert.match(css, /_yam3x-split-pane-system-motion-default-spatial/)
})

test('adding a checkbox copies its native form control without Ark UI', async (t) => {
  const directory = await fixture(t)
  const result = runCli(['add', 'checkbox'], directory)

  assert.equal(result.status, 0, result.stderr || result.stdout)
  const source = await readFile(
    join(directory, 'src/components/yam3x/checkbox/checkbox-base.vue'),
    'utf8',
  )
  assert.match(source, /type="checkbox"/)
  assert.match(source, /indeterminate/)
  const project = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assert.equal(project.dependencies['@ark-ui/vue'], undefined)
  assertRegistryDependencies(project, ['checkbox'])
})

test('Data table filters install and build with their Menu and IconButton dependencies', async (t) => {
  const directory = await fixture(t, { isolatedDependencies: true })
  const add = runCli(['add', 'data-table'], directory)
  assert.equal(add.status, 0, add.stderr || add.stdout)
  await linkDeclaredPackages(directory)
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import { DataTable, type DataTableColumn, type DataTableFilters, type DataTableQuery } from './components/yam3x/data-table'
interface Row { id: number; status: string }
const rows: Row[] = [{ id: 1, status: 'active' }]
const columns: DataTableColumn<Row>[] = [{ id: 'status', label: 'Status', value: row => row.status, fixed: 'start', width: '12rem', filter: { options: [{ value: 'active', label: 'Active' }] } }]
const filters = ref<DataTableFilters>({})
const query = ref<DataTableQuery>()
</script>
<template><DataTable v-model:filters="filters" sticky-header max-height="20rem" caption="Projects" :rows="rows" :columns="columns" :row-key="row => row.id" @change="query = $event" /></template>
`,
  )
  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
})

test('Form field registration and scoped validation install and build without docs dependencies', async (t) => {
  const directory = await fixture(t, { isolatedDependencies: true })
  const add = runCli(['add', 'form'], directory)
  assert.equal(add.status, 0, add.stderr || add.stdout)
  await linkDeclaredPackages(directory)
  await writeFile(
    join(directory, 'src/Registered.vue'),
    `<script setup lang="ts">
import { useFormField } from './components/yam3x/form'
const value = defineModel<string>({ required: true })
useFormField({ path: ['profile', 'alias'], value: () => value.value, rules: [{ minLength: 3, message: 'Three characters needed' }] })
</script>
<template><input v-model="value" name="profile.alias" /></template>
`,
  )
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form, formFieldName, formValidationFromIssues, type FormFieldDefinition, type FormValidationAdapter } from './components/yam3x/form'
import Registered from './Registered.vue'
const api = ref<InstanceType<typeof Form>>()
const name = ref('Ada')
const alias = ref('writer')
const fields: FormFieldDefinition[] = [{ path: ['profile', 'name'], name: 'display-name', value: () => name.value, rules: [{ required: true, message: 'Name needed' }] }]
const adapter: FormValidationAdapter = { validate: () => formValidationFromIssues([], fields), validateFields: (context, paths) => { void context.signal; void paths; return {} } }
onMounted(async () => {
  const release = api.value!.registerField({ path: 'extra', value: () => 'provided' })
  const result = await api.value!.validateFields([['profile']])
  void result.status
  api.value!.focusField(['profile', 'name'])
  release()
  void formFieldName(['profile', 'name'])
})
</script>
<template><Form ref="api" :fields="fields" :validate="adapter" :submit="() => {}"><input v-model="name" name="display-name" /><Registered v-model="alias" /></Form></template>
`,
  )
  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
})

test('Select data and searchable options install their row implementation and build independently', async (t) => {
  const directory = await fixture(t, { isolatedDependencies: true })
  const add = runCli(['add', 'select'], directory)
  assert.equal(add.status, 0, add.stderr || add.stdout)
  await linkDeclaredPackages(directory)
  await writeFile(
    join(directory, 'src/App.vue'),
    `<script setup lang="ts">
import { ref } from 'vue'
import { Select, type SelectOption, type SelectFilter, type VirtualListOptions } from './components/yam3x/select'
const options: readonly SelectOption[] = [{ value: 'ts', label: 'TypeScript' }, { value: 'rust', label: 'Rust', disabled: true }]
const value = ref<string | string[] | null>('ts')
const values = ref(['ts'])
const virtual: VirtualListOptions = { estimateSize: 56, overscan: 3 }
const filter: SelectFilter = (option, query) => option.label.toLowerCase().includes(query.toLowerCase())
</script>
<template><Select v-model="value" :options="options" :virtual="virtual" searchable :filter="filter" aria-label="Language" name="language"><template #option="{ option, selected }">{{ option.label }} {{ selected ? 'chosen' : '' }}</template></Select><Select v-model="values" :options="options" searchable multiple selection-display="chips" aria-label="Languages" /></template>
`,
  )
  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)
  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
})

test('all installable components typecheck and build in a disposable Vue/Vite consumer', async (t) => {
  const directory = await fixture(t)
  const componentKeys = Object.keys(registry.components)
  const add = runCli(['add', ...componentKeys], directory)
  assert.equal(add.status, 0, add.stderr || add.stdout)

  const componentImports = componentKeys
    .map((component, index) => {
      const indexFile = registry.components[component].files.find((file) =>
        file.endsWith('/index.ts'),
      )
      assert.ok(indexFile, `${component} must declare its public index.ts file`)
      const componentPath = indexFile.slice(0, -'/index.ts'.length)
      return `import * as Component${index} from './components/yam3x/${componentPath}'\nvoid Component${index}`
    })
    .join('\n')
  await writeFile(join(directory, 'src/all-components.ts'), `${componentImports}\n`)
  await writeFile(
    join(directory, 'src/main.ts'),
    `import './all-components'\n${await readFile(join(directory, 'src/main.ts'), 'utf8')}`,
  )

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assertRegistryDependencies(packageJson, componentKeys)

  const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(typecheck.status, 0, typecheck.stderr || typecheck.stdout)

  const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
    cwd: directory,
    encoding: 'utf8',
  })
  assert.equal(build.status, 0, build.stderr || build.stdout)
  const cssFile = (await readdir(join(directory, 'dist/assets'))).find((name) =>
    name.endsWith('.css'),
  )
  assert.ok(cssFile, 'consumer build should emit a stylesheet')
  assert.match(
    await readFile(join(directory, 'dist/assets', cssFile), 'utf8'),
    /fonts\.googleapis\.com\/css2\?family=Roboto[^"]*&family=Material\+Symbols\+Outlined:/,
  )
})

test('each registry component builds with only its declared dependencies', async (t) => {
  for (const component of Object.keys(registry.components)) {
    const directory = await fixture(t, { isolatedDependencies: true })
    const add = runCli(['add', component], directory)
    assert.equal(add.status, 0, `${component}: ${add.stderr || add.stdout}`)

    const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
    assertRegistryDependencies(packageJson, [component])
    await linkDeclaredPackages(directory)

    await writeFile(
      join(directory, 'src/App.vue'),
      `<script setup lang="ts">
import * as RegistryComponent from './components/yam3x/${component}'
void RegistryComponent
</script>
<template><main /></template>
`,
    )
    await writeFile(
      join(directory, 'src/main.ts'),
      `import { createApp } from 'vue'
import App from './App.vue'
import * as RegistryComponent from './components/yam3x/${component}'
import './yam3x.css'
void RegistryComponent
createApp(App).mount('#app')
`,
    )

    const typecheck = spawnSync(join(directory, 'node_modules/.bin/vue-tsc'), ['--noEmit'], {
      cwd: directory,
      encoding: 'utf8',
    })
    assert.equal(typecheck.status, 0, `${component}: ${typecheck.stderr || typecheck.stdout}`)

    const build = spawnSync(join(directory, 'node_modules/.bin/vite'), ['build'], {
      cwd: directory,
      encoding: 'utf8',
    })
    assert.equal(build.status, 0, `${component}: ${build.stderr || build.stdout}`)
  }
})
