<script setup lang="ts">
import { ref } from 'vue'
import { TreeView, type TreeViewKey, type TreeViewNode } from '@registry/components/tree-view'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t, locale } = useDemoLocale()
const expanded = ref<TreeViewKey[]>([0])
const selected = ref<TreeViewKey[]>([])
const checked = ref<TreeViewKey[]>([])
const rtl = ref(false)
const nodes: TreeViewNode[] = [
  {
    key: 0,
    label: 'Catalog',
    children: Array.from({ length: 10000 }, (_, index) => ({
      key: `item-${index}`,
      label: `Item ${index + 1}`,
      description:
        index % 7 === 0
          ? 'Additional context that can wrap as text or viewport sizes change. Complete record details remain readable without fixing the row height or truncating descriptions, even when the tree shares a narrow column with other content.'
          : undefined,
      disabled: index === 9998,
      ...(index === 9999 ? { children: [{ key: 'nested', label: 'Nested record' }] } : {}),
    })),
  },
]
function reset() {
  expanded.value = [0]
  selected.value = []
  checked.value = []
}
</script>

<template>
  <section
    class="tree-virtual-demo"
    data-testid="tree-virtual"
  >
    <TreeView
      v-model:expanded-keys="expanded"
      v-model:selected-keys="selected"
      v-model:checked-keys="checked"
      :nodes="nodes"
      :label="t('Large record tree', '大型记录树')"
      :locale="locale === 'zh' ? 'zh-CN' : 'en-US'"
      :dir="rtl ? 'rtl' : 'ltr'"
      selection-mode="multiple"
      check-mode="independent"
      virtual
    />
    <div class="tree-virtual-demo__actions">
      <Button
        variant="text"
        @click="expanded = []"
        >{{ t('Collapse all', '全部折叠') }}</Button
      >
      <Button
        variant="text"
        @click="reset"
        >{{ t('Reset tree', '重置树') }}</Button
      >
      <Checkbox
        v-model="rtl"
        :label="t('Mirror large tree', '镜像大型树')"
      />
    </div>
    <p>
      {{ t('Selected keys', '已选键') }}:
      <output data-testid="virtual-tree-selected">{{ selected.join(', ') || '—' }}</output>
    </p>
    <p>
      {{ t('Checked keys', '已勾选键') }}:
      <output data-testid="virtual-tree-checked">{{ checked.join(', ') || '—' }}</output>
    </p>
  </section>
</template>

<style>
.tree-virtual-demo {
  display: grid;
  gap: 16px;
}
.tree-virtual-demo__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
</style>
