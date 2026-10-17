<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { Option, OptionGroup } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const language = ref('typescript')
const filters = ref<string[]>(['stable'])
const requiredValue = ref<string | null>(null)
const selectionEvents = ref<string[]>([])
function record(event: string) {
  selectionEvents.value = [...selectionEvents.value.slice(-5), event]
}
</script>

<template>
  <section class="select-demo">
    <form id="select-demo-form">
      <FormField
        :label="t('Default language', '默认语言')"
        :hint="t('Choose the project’s primary programming language.', '选择项目的主要开发语言。')"
      >
        <Select
          v-model="language"
          name="language"
          required
          @open="record('open')"
          @close="record('close')"
          @change="(detail) => record(`change:${detail.value}`)"
        >
          <OptionGroup :label="t('Frontend', '前端')">
            <Option
              value="typescript"
              label="TypeScript"
            />
            <Option
              value="javascript"
              label="JavaScript"
            />
          </OptionGroup>
          <OptionGroup :label="t('Other', '其他')">
            <Option
              value="python"
              label="Python"
            />
            <Option
              value="rust"
              label="Rust"
            />
            <Option
              value="disabled"
              :label="t('Unavailable', '暂不可用')"
              disabled
            />
          </OptionGroup>
        </Select>
      </FormField>

      <FormField
        :label="t('Release channels', '发布渠道')"
        :hint="t('You can select multiple channels.', '可以同时选择多个渠道。')"
      >
        <Select
          v-model="filters"
          name="channels"
          multiple
        >
          <Option
            value="stable"
            :label="t('Stable', '稳定版')"
          />
          <Option
            value="beta"
            :label="t('Beta', '测试版')"
          />
          <Option
            value="nightly"
            :label="t('Nightly', '每日构建版')"
          />
        </Select>
      </FormField>

      <FormField
        id="required-select"
        :label="t('Required release status', '必选发布状态')"
      >
        <Select
          v-model="requiredValue"
          name="release-status"
          required
        >
          <Option
            value="draft"
            :label="t('Draft', '草稿')"
          />
          <Option
            value="published"
            :label="t('Published', '已发布')"
          />
        </Select>
      </FormField>

      <FormField :label="t('Disabled', '已禁用')">
        <Select
          model-value="locked"
          disabled
        >
          <Option
            value="locked"
            :label="t('Locked', '已锁定')"
          />
        </Select>
      </FormField>

      <FormField :label="t('No options', '暂无选项')">
        <Select>
          <template #no-data>{{ t('No options available', '暂无可选项') }}</template>
        </Select>
      </FormField>

      <output aria-live="polite"
        >{{ t('Single:', '单选：') }} {{ language }} · {{ t('Multiple:', '多选：') }}
        {{ filters.join(', ') || t('None', '无') }} · {{ t('Required:', '必选项：') }}
        {{ requiredValue || t('None', '无') }} · {{ t('Events:', '事件：') }}
        {{ selectionEvents.join(' → ') || t('None', '无') }}</output
      >
    </form>

    <FormField :label="t('External form', '外置表单')">
      <Select
        model-value="external"
        name="external-choice"
        form="external-select-form"
      >
        <Option
          value="external"
          :label="t('Externally associated value', '外部关联值')"
        />
      </Select>
    </FormField>
    <form id="external-select-form"></form>
  </section>
</template>

<style scoped>
.select-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
}
.select-demo form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.select-demo output {
  flex-basis: 100%;
  overflow-wrap: anywhere;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
