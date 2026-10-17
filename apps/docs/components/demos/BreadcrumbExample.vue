<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Breadcrumb } from '@registry/components/breadcrumb'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()

const wrap = ref(false)
const basePath = locale.value === 'zh' ? '/zh' : ''
const items = [
  { label: t('Get started', '开始使用'), href: `${basePath}/guide/installation` },
  { label: t('Components', '组件'), href: `${basePath}/components/` },
  {
    label: t('Interaction and selection', '交互与选择'),
    href: `${basePath}/components/segmented-button`,
  },
]
const iconItems = [
  { label: t('Home', '首页'), href: basePath ? `${basePath}/` : '/', iconOnly: true },
  { label: t('Unavailable', '不可访问'), href: `${basePath}/unavailable`, disabled: true },
  { label: t('Current page', '当前页面') },
]
</script>

<template>
  <section class="breadcrumb-demo">
    <Checkbox
      v-model="wrap"
      :label="t('Allow path wrapping', '允许路径换行')"
    />
    <div class="breadcrumb-demo__frame">
      <Breadcrumb
        :items="items"
        :aria-label="t('Page path', '页面路径')"
        :current-index="2"
        :wrap="wrap"
      />
    </div>
    <div class="breadcrumb-demo__frame">
      <Breadcrumb
        :items="iconItems"
        :aria-label="t('Supporting states example', '辅助状态示例')"
      >
        <template #icon="{ index }"
          ><Icon
            v-if="index === 0 || index === 2"
            name="home"
        /></template>
        <template #separator>/</template>
      </Breadcrumb>
    </div>
  </section>
</template>

<style scoped>
.breadcrumb-demo {
  display: grid;
  gap: 16px;
}
.breadcrumb-demo__frame {
  max-inline-size: 100%;
  min-inline-size: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
}
.breadcrumb-demo__frame :deep(.yam3x-breadcrumb__list) {
  max-inline-size: 100%;
}
</style>
