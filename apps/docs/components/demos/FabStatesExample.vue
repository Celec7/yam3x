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

    <details class="fab-states__compat">
      <summary>{{ t('Compatibility example: unavailable FAB', '兼容示例：不可用的 FAB') }}</summary>
      <p>
        {{
          t(
            'Compatibility only. Material recommends omitting a FAB while its action is unavailable.',
            '仅用于兼容既有流程。Material 建议操作不可用时省略 FAB。',
          )
        }}
      </p>
      <FloatingActionButton
        id="fab-example-unavailable"
        disabled
        disabled-interactive
        :aria-label="t('Cannot create project; sign in first', '无法创建项目；请先登录')"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-unavailable">
        {{ t('Sign in to create a project.', '登录后即可创建项目。') }}
      </Tooltip>
    </details>
  </section>
</template>

<style scoped>
.fab-states__compat {
  margin-block-start: 8px;
}
.fab-states__compat > p {
  max-width: 48rem;
}
.fab-states__compat :deep(.yam3x-floating-action-button) {
  margin-block-start: 16px;
}
</style>
