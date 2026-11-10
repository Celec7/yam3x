<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { TreeView, type TreeViewKey, type TreeViewNode } from '@registry/components/tree-view'
import { workspaceNodes } from './tree-view-demo-data'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const rtl = ref(false)
const disabled = ref(false)
const multiple = ref(false)
const selected = ref<TreeViewKey[]>([])
const expanded = ref<TreeViewKey[]>([0])
const nodes = computed<TreeViewNode[]>(() => workspaceNodes(t))
</script>

<template>
  <div
    class="tree-view-demo"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <div class="tree-view-demo__tools">
      <Checkbox
        v-model="rtl"
        :label="t('Use RTL', '使用 RTL')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disable tree actions', '禁用树操作')"
      />
      <Checkbox
        v-model="multiple"
        :label="t('Allow multiple selection', '允许多选')"
      />
    </div>
    <section
      data-testid="tree-explorer"
      class="tree-view-demo__section"
    >
      <TreeView
        v-model:expanded-keys="expanded"
        v-model:selected-keys="selected"
        :nodes="nodes"
        :label="t('Workspace explorer', '工作区浏览')"
        :selection-mode="multiple ? 'multiple' : 'single'"
        :disabled="disabled"
        :locale="fieldLocale"
      />
      <p data-testid="tree-selected">
        {{ t('Selected:', '已选择：') }} {{ selected.join(', ') || '—' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.tree-view-demo,
.tree-view-demo__section {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.tree-view-demo p {
  margin: 0;
  overflow-wrap: anywhere;
}
.tree-view-demo__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
