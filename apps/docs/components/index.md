<script setup lang="ts">
import CatalogGroups from './CatalogGroups.vue'
import { getComponentCatalog } from '../component-catalog'

const { materialComponentGroups } = getComponentCatalog('en')
</script>

# Components

Copy these Vue components into your app with the CLI. The categories follow the [Material Components catalog](https://m3.material.io/components) and include entries documented in this project. Browse [Project extensions](/extensions/) for project-defined helpers, and follow [Installation and first use](/guide/installation) before using the source.

<CatalogGroups :groups="materialComponentGroups" />

## CLI names

The names accepted by `add` come from the bundled registry. Run `list` to see the names available in the CLI version you are using, then pass one or more names to `add`:

```sh
pnpm dlx @celec7/yam3x@latest list
pnpm dlx @celec7/yam3x@latest add button switch
```

For setup and import examples, see [Installation and first use](/guide/installation).
