<script setup lang="ts">
import { ref } from 'vue'
import { FloatingActionButton } from '@registry/components/fab'
import { Checkbox } from '@registry/components/checkbox'
import { Icon } from '@registry/components/icon'
import { Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const lowered = ref(false)
const docsHref = t('/components/', '/zh/components/')
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="fab-states"
  >
    <div class="yam3x-demo__row">
      <FloatingActionButton
        id="fab-example-lowered"
        :lowered="lowered"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-lowered">{{ t('Create project', '创建项目') }}</Tooltip>

      <FloatingActionButton
        id="fab-example-link"
        variant="secondary-container"
        :href="docsHref"
        :aria-label="t('View components', '查看组件')"
      >
        <Icon
          name="arrow_forward"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-link">{{ t('View components', '查看组件') }}</Tooltip>
    </div>

    <Checkbox
      v-model="lowered"
      :label="t('Lowered', '降低')"
    />
  </section>
</template>
