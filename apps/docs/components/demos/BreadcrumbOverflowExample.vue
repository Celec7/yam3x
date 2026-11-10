<script setup lang="ts">
import { ref } from 'vue'
import { Breadcrumb } from '@registry/components/breadcrumb'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const { direction, toggle } = useDemoDirection()
const wrap = ref(false)

const basePath = locale.value === 'zh' ? '/zh' : ''
const items = [
  { label: t('Workspace', '工作区'), href: `${basePath}/guide/start/installation` },
  { label: t('Design system', '设计系统'), href: `${basePath}/components/` },
  { label: t('Navigation components', '导航组件'), href: `${basePath}/components/breadcrumb` },
  {
    label: t('Interaction and selection', '交互与选择'),
    href: `${basePath}/components/segmented-button`,
  },
  { label: t('Current page', '当前页面') },
]
</script>

<template>
  <section
    class="breadcrumb-overflow-example"
    data-testid="breadcrumb-overflow"
  >
    <div class="breadcrumb-overflow-example__controls">
      <Checkbox
        v-model="wrap"
        :label="t('Wrap the long path', '让长路径换行')"
      />
      <Button
        variant="outlined"
        @click="toggle"
        >{{
          direction === 'ltr'
            ? t('Switch to right-to-left', '切换到从右到左')
            : t('Switch to left-to-right', '切换到从左到右')
        }}</Button
      >
    </div>
    <p class="breadcrumb-overflow-example__hint">
      {{
        t(
          'The trail scrolls inside its frame. Wrapping trades the single line for a taller trail.',
          '路径在框架内滚动。换行会用更高的路径替代单行显示。',
        )
      }}
    </p>
    <div class="breadcrumb-overflow-example__frame">
      <Breadcrumb
        :items="items"
        :aria-label="t('Documentation trail', '文档路径')"
        :wrap="wrap"
        :dir="direction"
      />
    </div>
  </section>
</template>

<style scoped>
.breadcrumb-overflow-example {
  display: grid;
  gap: 12px;
  min-inline-size: 0;
}
.breadcrumb-overflow-example__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.breadcrumb-overflow-example__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
.breadcrumb-overflow-example__frame {
  max-inline-size: 20rem;
  min-inline-size: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
}
</style>
