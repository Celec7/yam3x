<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { TreeView, type TreeViewKey, type TreeViewNode } from '@registry/components/tree-view'
import { workspaceNodes } from './tree-view-demo-data'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const combined = ref(false)
const checked = ref<TreeViewKey[]>([])
const batchSelected = ref<TreeViewKey[]>([])
const batchExpanded = ref<TreeViewKey[]>([0, 'design'])
const nodes = computed<TreeViewNode[]>(() => workspaceNodes(t))
</script>

<template>
  <div class="tree-view-demo">
    <section
      data-testid="tree-batch"
      class="tree-view-demo__section"
    >
      <Checkbox
        v-model="combined"
        :label="t('Inspect and check separately', '分别查看与勾选')"
      />
      <TreeView
        v-model:expanded-keys="batchExpanded"
        v-model:selected-keys="batchSelected"
        v-model:checked-keys="checked"
        :nodes="nodes"
        :label="t('Batch records', '批量记录')"
        check-mode="cascade"
        :selection-mode="combined ? 'single' : 'none'"
        :description="
          t(
            'Selection identifies the item to inspect; checks mark records for a separate batch action. Disabled records keep their stored checks.',
            '选择表示要查看的条目，勾选表示独立批量操作中的记录。禁用记录保留其已有勾选。',
          )
        "
        :locale="fieldLocale"
      />
      <p data-testid="tree-checked">
        {{ t('Checked:', '已勾选：') }} {{ checked.join(', ') || '—' }}
      </p>
      <p data-testid="tree-inspected">
        {{ t('Inspecting:', '正在查看：') }} {{ batchSelected.join(', ') || '—' }}
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
</style>
