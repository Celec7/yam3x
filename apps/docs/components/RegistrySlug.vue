<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import registry from '@registry/registry.json'

const route = useRoute()
const pageSlugs: Record<string, string[]> = {
  chips: ['chips', 'filter-chip', 'filter-chip-set'],
  'extended-fab': ['fab'],
  'text-fields': ['form-field'],
}

const slugs = computed(() => {
  const pagePath = route.path.replace(/^\/zh(?=\/)/, '').replace(/\/$/, '')
  const pageId = pagePath.startsWith('/components/') ? pagePath.slice('/components/'.length) : ''

  if (!pageId || pageId.includes('/')) return []

  const candidates = pageSlugs[pageId] ?? [pageId]
  return candidates.filter((slug) => Object.hasOwn(registry.components, slug))
})

const label = computed(() => (route.path.startsWith('/zh/') ? '注册表 slug' : 'Registry slug'))
</script>

<template>
  <p
    v-if="slugs.length"
    class="registry-slug"
  >
    <span>{{ label }}:</span>
    <code
      v-for="slug in slugs"
      :key="slug"
    >
      {{ slug }}
    </code>
  </p>
</template>

<style scoped>
.registry-slug {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.registry-slug code {
  color: var(--vp-c-text-1);
}
</style>
