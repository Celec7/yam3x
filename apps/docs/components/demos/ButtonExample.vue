<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { messages: text, t } = useDemoLocale({
  en: {
    save: 'Save',
    later: 'Later',
    view: 'View',
    cancel: 'Cancel',
    learnMore: 'Learn more',
    blockedActivationsLabel: 'Disabled button activations',
    saveSettings: 'Save settings',
    viewComponents: 'View components',
    submitting: 'Submitting',
    unavailableLink: 'Link unavailable',
    blockedActivations: 'Disabled interactive button activations:',
  },
  zh: {
    save: '保存',
    later: '稍后',
    view: '查看',
    cancel: '取消',
    learnMore: '了解更多',
    blockedActivationsLabel: '禁用交互按钮激活次数',
    saveSettings: '保存设置',
    viewComponents: '查看组件',
    submitting: '正在提交',
    unavailableLink: '暂不可用链接',
    blockedActivations: '禁用交互按钮激活次数：',
  },
})

const blockedActivations = ref(0)
const buttonSizes = [
  { value: 'extra-small', label: 'XS' },
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'extra-large', label: 'XL' },
] as const
const disabledVariants = ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'] as const
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="yam3x-demo__row">
      <Button variant="filled">{{ text.save }}</Button>
      <Button variant="filled-tonal">{{ text.later }}</Button>
      <Button variant="elevated">{{ text.view }}</Button>
      <Button variant="outlined">{{ text.cancel }}</Button>
      <Button variant="text">{{ text.learnMore }}</Button>
    </div>

    <div class="yam3x-demo__row">
      <Button
        v-for="size in buttonSizes"
        :key="size.value"
        :size="size.value"
      >
        <template #icon><Icon name="add" /></template>
        {{ size.label }} · {{ text.save }}
      </Button>
      <Button
        variant="outlined"
        shape="square"
      >
        {{ t('Square', '方形') }} · {{ text.save }}
      </Button>
    </div>

    <div class="yam3x-demo__row">
      <Button>{{ text.saveSettings }}</Button>
      <Button :href="t('/components/', '/zh/components/')">
        {{ text.viewComponents }}
        <template #trailing-icon>
          <Icon
            data-icon="trailing"
            name="arrow_forward"
          />
        </template>
      </Button>
      <Button
        disabled-interactive
        @click="blockedActivations++"
        >{{ text.submitting }}</Button
      >
      <Button
        :href="t('/components/button#api', '/zh/components/button#api')"
        disabled-interactive
        >{{ text.unavailableLink }}</Button
      >
    </div>
    <div class="yam3x-demo__row">
      <Button
        v-for="variant in disabledVariants"
        :key="variant"
        :variant="variant"
        disabled
      >
        {{ variant }}
      </Button>
    </div>
    <p
      role="status"
      :aria-label="text.blockedActivationsLabel"
    >
      {{ text.blockedActivations }} {{ blockedActivations }}
    </p>
  </div>
</template>
