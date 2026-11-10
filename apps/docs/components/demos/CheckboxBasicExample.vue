<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const updates = ref(true)
const digest = ref(false)

const summary = computed(() =>
  [
    t('Email updates', '邮件更新'),
    updates.value ? t('on', '开启') : t('off', '关闭'),
    t('Weekly digest', '每周摘要'),
    digest.value ? t('on', '开启') : t('off', '关闭'),
  ].join(' · '),
)
</script>

<template>
  <section
    data-testid="checkbox-basic"
    class="yam3x-demo yam3x-demo__stack"
  >
    <Checkbox
      v-model="updates"
      :label="t('Email updates', '邮件更新')"
      name="email-updates"
      :description="t('Account and security notices', '账户与安全通知')"
    />
    <Checkbox
      v-model="digest"
      :label="t('Weekly digest', '每周摘要')"
      name="weekly-digest"
    />
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ summary }}
    </p>
  </section>
</template>
