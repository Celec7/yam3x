<script setup lang="ts">
import { ref } from 'vue'
import { LocaleProvider } from '@registry/components/localization'
import { Pagination } from '@registry/components/pagination'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const page = ref(1)
</script>

<template>
  <section
    class="locale-overrides"
    data-testid="locale-overrides"
  >
    <p>
      {{
        t(
          'One provider sets the language. A component locale replaces it for that instance, and component messages replace both.',
          '一个 provider 设定语言；组件 locale 只替换该实例的语言，组件 messages 的优先级最高。',
        )
      }}
    </p>
    <LocaleProvider
      locale="en-US"
      :messages="{ pagination: { next: 'Continue' } }"
    >
      <div class="locale-overrides__row">
        <span>{{ t('Provider message override', 'Provider 文案覆盖') }}</span>
        <Pagination
          v-model:page="page"
          :total="30"
          :page-size="5"
        />
      </div>
      <div class="locale-overrides__row">
        <span>{{ t('Component locale', '组件 locale') }}</span>
        <Pagination
          locale="zh-CN"
          :total="30"
          :page-size="5"
        />
      </div>
      <div class="locale-overrides__row">
        <span>{{ t('Component message override', '组件文案覆盖') }}</span>
        <Pagination
          :total="30"
          :page-size="5"
          :messages="{ next: 'Next result' }"
        />
      </div>
    </LocaleProvider>
  </section>
</template>

<style scoped>
.locale-overrides {
  display: grid;
  gap: 16px;
  min-inline-size: 0;
}
.locale-overrides p,
.locale-overrides__row {
  margin: 0;
}
.locale-overrides__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
