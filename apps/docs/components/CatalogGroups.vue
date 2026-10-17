<script setup lang="ts">
import type { ComponentGroup } from '../component-catalog'

withDefaults(defineProps<{ groups: ComponentGroup[]; basePath?: string }>(), {
  basePath: '',
})
</script>

<template>
  <section
    v-for="group in groups"
    :key="group.title"
    class="catalog-group"
  >
    <h2>{{ group.title }}</h2>
    <p v-if="group.description">{{ group.description }}</p>
    <ul class="catalog-list">
      <li
        v-for="item in group.items"
        :key="item.path"
      >
        <a :href="`${basePath}/components/${item.path}`">{{ item.title }}</a>
        <span>{{ item.summary }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.catalog-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.catalog-list li {
  display: grid;
  gap: 0.25rem;
  align-content: start;
  min-height: 5rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
}

.catalog-list a {
  font-weight: 600;
}

.catalog-list span {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
</style>
