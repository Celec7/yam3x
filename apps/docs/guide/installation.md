# Installation and first use

YAM3X uses a CLI to copy Vue component source into your application. The target project needs Vue, Vite, Tailwind CSS v4, a `package.json`, and either `src/main.ts` or `src/main.js`.

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

Run `init` and `add` from the target app's root. `init` copies shared foundation files, declares their dependencies, and imports `yam3x.css` from the app entry point. When `add` initializes core, it copies the same foundation files. Core setup also adds the YAM3X design route as `src/components/yam3x/AGENTS.md` if no file exists there; an existing app-root `AGENTS.md` is independent, and an existing file at the YAM3X path is preserved. `add` copies component source and declares component dependencies. To find accepted component names, run `pnpm dlx @celec7/yam3x@latest list` from any directory; see the [component catalog](/components/) for categorized documentation. If Tailwind's Vite plugin is not configured, add it to the existing Vite configuration:

```ts
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

The generated `yam3x.css` loads Roboto and three Material Symbols font variants from Google Fonts at runtime. For offline apps or restrictive content security policies, host the fonts yourself and replace that import while keeping the `Roboto`, `Material Symbols Outlined`, `Material Symbols Rounded`, and `Material Symbols Sharp` family names.

Assuming the following file is the target project's `src/App.vue`, import the copied source:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Button from './components/yam3x/button/button.vue'
import Switch from './components/yam3x/switch/switch.vue'

const enabled = ref(false)
</script>

<template>
  <Button>Save</Button>
  <Switch
    v-model="enabled"
    label="Notifications"
  />
</template>
```

Build the target app to confirm that the Vite plugin and dependencies are ready. Demo source on the component pages uses the site-only `@registry` path; when copying an example, use the corresponding `./components/yam3x/` path in your app.

`--no-install` updates project files and dependency declarations without running a package manager. Use `--cwd <project>` to target a directory other than the current one. The CLI preserves existing files in the target app, including `src/components/yam3x/AGENTS.md`; merge the [distributed YAM3X guidance](https://github.com/Celec7/yam3x/blob/main/registry/foundations/AGENTS.md) into that file when needed. Running `add` again does not overwrite copied or edited source. See [Update copied source](/guide/updating) for later merges.
