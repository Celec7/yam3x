<script setup lang="ts">
import { Toolbar } from '@registry/components/toolbar'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const color = 'var(--md-sys-color-primary)'
</script>

<template>
  <section
    data-testid="toolbar-basic"
    class="toolbar-basic"
  >
    <Toolbar :aria-label="t('Document actions', '文档操作')">
      <IconButton
        variant="standard"
        :style="{ color }"
        :aria-label="t('Undo', '撤销')"
        ><Icon name="undo"
      /></IconButton>
      <IconButton
        variant="standard"
        :style="{ color }"
        :aria-label="t('Redo', '重做')"
        ><Icon name="redo"
      /></IconButton>
    </Toolbar>
  </section>
</template>

<style scoped>
.toolbar-basic {
  min-inline-size: 0;
}
</style>
