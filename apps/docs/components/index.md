<script setup lang="ts">
import CatalogGroups from './CatalogGroups.vue'
import { getComponentCatalog } from '../component-catalog'

const { materialComponentGroups } = getComponentCatalog('en')
</script>

# Components

Copy these Vue components into your app with the CLI. The categories follow the [Material Components catalog](https://m3.material.io/components) and include entries documented in this project. Browse [Project extensions](/extensions/) for project-defined helpers, and follow [Installation and first use](/guide/installation) before using the source.

<CatalogGroups :groups="materialComponentGroups" />

Each component page shows its registry slug above the page title. Pass that slug to `add`; run `pnpm dlx @celec7/yam3x@latest list` to see all slugs supported by the CLI version you use. For setup and import examples, see [Installation and first use](/guide/installation).
