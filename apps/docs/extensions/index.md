<script setup lang="ts">
import CatalogGroups from '../components/CatalogGroups.vue'
import { getComponentCatalog } from '../component-catalog'

const { extensionGroups } = getComponentCatalog('en')
</script>

# Project extensions

This catalog lists helper modules and extended capabilities that yam3x provides for Vue use cases. They can complement Material components, but do not necessarily correspond to standalone components in the official Material catalog.

<CatalogGroups :groups="extensionGroups" />

Follow [Installation and first use](/guide/installation) before using these modules. Each page documents the API in the current Vue source.
