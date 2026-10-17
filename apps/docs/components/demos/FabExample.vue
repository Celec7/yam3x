<script setup lang="ts">
import FloatingActionButton from '@registry/components/fab/floating-action-button.vue'
import { Icon } from '@registry/components/icon'
import { Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo">
    <p>{{ t('Icon-only FAB sizes', '纯图标 FAB 尺寸') }}</p>
    <div class="fab-demo__sizes">
      <FloatingActionButton
        id="fab-example-default"
        size="default"
        aria-label="Create project"
      >
        <Icon name="add" />
      </FloatingActionButton>
      <Tooltip for="fab-example-default">{{ t('Create project', '创建项目') }}</Tooltip>
      <FloatingActionButton
        id="fab-example-create"
        size="medium"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon name="add" />
      </FloatingActionButton>
      <Tooltip for="fab-example-create">{{ t('Create project', '创建项目') }}</Tooltip>
      <FloatingActionButton
        id="fab-example-large"
        size="large"
        variant="tertiary-container"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon name="add" />
      </FloatingActionButton>
      <Tooltip for="fab-example-large">{{ t('Create project', '创建项目') }}</Tooltip>
    </div>
    <p>
      {{
        t(
          'These are alternate sizes for one primary action. Use one FAB per screen.',
          '这些是同一主要操作的不同尺寸。每个屏幕只使用一个 FAB。',
        )
      }}
    </p>
    <details class="fab-demo__compat">
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
        <template #icon><Icon name="add" /></template>
      </FloatingActionButton>
      <Tooltip for="fab-example-unavailable">{{
        t('Sign in to create a project.', '登录后即可创建项目。')
      }}</Tooltip>
    </details>
  </div>
</template>

<style scoped>
.fab-demo__sizes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  padding: 16px 8px;
}
.fab-demo__compat {
  margin-block-start: 24px;
}
.fab-demo__compat > p {
  max-width: 48rem;
}
</style>
