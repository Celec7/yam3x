<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from '@registry/components/navigation-bar/navigation-bar.vue'
import NavigationBarItem from '@registry/components/navigation-bar/navigation-bar-item.vue'
import NavigationRail from '@registry/components/navigation-rail/navigation-rail.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const active = ref('overview')
const localizedItems = [
  { label: t('Overview', '概览'), value: 'overview', href: '/' },
  { label: t('Components', '组件'), value: 'components', href: '/components/' },
  { label: t('Design foundations', '设计基础'), value: 'foundations', href: '/guide/design' },
]
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <NavigationBar
      v-model="active"
      class="navigation-bar-example__bar"
      :label="t('Documentation navigation', '文档导航')"
      layout="auto"
    >
      <NavigationBarItem
        value="overview"
        :label="t('Overview', '概览')"
        href="/"
      >
        <template #icon="{ selected }">
          <Icon
            name="dashboard"
            :filled="selected"
          />
        </template>
        <template #selected-icon
          ><Icon
            name="dashboard"
            filled
        /></template>
      </NavigationBarItem>
      <NavigationBarItem
        value="components"
        :label="t('Components', '组件')"
        href="/components/"
      >
        <template #icon="{ selected }">
          <Icon
            name="widgets"
            :filled="selected"
          />
        </template>
        <template #selected-icon
          ><Icon
            name="widgets"
            filled
        /></template>
        <template #badge>
          <span
            class="navigation-bar-example__badge"
            role="img"
            :aria-label="t('3 new components', '3 个新组件')"
            >3</span
          >
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="foundations"
        :label="t('Design foundations', '设计基础')"
        href="/guide/design"
      >
        <template #icon="{ selected }">
          <Icon
            name="architecture"
            :filled="selected"
          />
        </template>
        <template #selected-icon
          ><Icon
            name="architecture"
            filled
        /></template>
      </NavigationBarItem>
    </NavigationBar>
    <NavigationRail
      v-model="active"
      class="navigation-bar-example__rail"
      :items="localizedItems"
      :label="t('Documentation navigation', '文档导航')"
      mode="auto"
      :show-menu="false"
    >
      <template #icon="{ item }">
        <Icon
          v-if="item.value === 'overview'"
          name="dashboard"
        />
        <Icon
          v-else-if="item.value === 'components'"
          name="widgets"
        />
        <Icon
          v-else
          name="architecture"
        />
      </template>
      <template #selected-icon="{ item }">
        <Icon
          v-if="item.value === 'overview'"
          name="dashboard"
          filled
        />
        <Icon
          v-else-if="item.value === 'components'"
          name="widgets"
          filled
        />
        <Icon
          v-else
          name="architecture"
          filled
        />
      </template>
    </NavigationRail>
    <p class="yam3x-demo__status">{{ t('Current destination:', '当前目标：') }} {{ active }}</p>
  </div>
</template>

<style scoped>
.navigation-bar-example__badge {
  min-width: 16px;
  padding-inline: 4px;
  border-radius: 9999px;
  color: var(--md-sys-color-on-error);
  background: var(--md-sys-color-error);
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}
.navigation-bar-example__rail {
  display: none;
  height: 420px;
}
@media (min-width: 960px) {
  .navigation-bar-example__bar {
    display: none;
  }
  .navigation-bar-example__rail {
    display: block;
  }
}
</style>
