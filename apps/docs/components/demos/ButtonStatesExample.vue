<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const blockedActivations = ref(0)
const docsHref = t('/components/', '/zh/components/')
const disabledVariants = ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'] as const
const variantLabels = {
  filled: t('Filled', '填充'),
  'filled-tonal': t('Tonal', '色调'),
  elevated: t('Elevated', '浮起'),
  outlined: t('Outlined', '描边'),
  text: t('Text', '文字'),
}
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="button-states"
  >
    <div class="yam3x-demo__row">
      <Button
        disabled-interactive
        @click="blockedActivations++"
      >
        {{ t('Submitting', '正在提交') }}
      </Button>
      <Button
        :href="docsHref"
        disabled-interactive
      >
        {{ t('Link unavailable', '暂不可用链接') }}
      </Button>
      <Button
        :href="docsHref"
        disabled
      >
        {{ t('Link disabled', '链接已禁用') }}
      </Button>
      <Button :href="docsHref">
        {{ t('View components', '查看组件') }}
        <template #trailing-icon>
          <Icon
            data-icon="trailing"
            name="arrow_forward"
          />
        </template>
      </Button>
    </div>

    <div class="yam3x-demo__row">
      <Button
        v-for="variant in disabledVariants"
        :key="variant"
        :variant="variant"
        disabled
      >
        {{ variantLabels[variant] }}
      </Button>
    </div>

    <p
      role="status"
      :aria-label="t('Disabled button activations', '禁用交互按钮激活次数')"
    >
      {{ t('Disabled interactive button activations:', '禁用交互按钮激活次数：') }}
      {{ blockedActivations }}
    </p>
  </section>
</template>
