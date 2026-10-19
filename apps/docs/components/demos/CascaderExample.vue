<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cascader, type CascaderOption } from '@registry/components/cascader'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { LocaleProvider } from '@registry/components/localization'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const value = ref(['product', 'design', 'brief'])
const rtl = ref(false)
const disabled = ref(false)
const branches = ref(false)
const cancel = ref(false)
const empty = ref(false)
const options = computed<CascaderOption[]>(() =>
  empty.value
    ? []
    : [
        {
          value: 'product',
          label: t('Product', '产品'),
          children: [
            {
              value: 'design',
              label: t('Design', '设计'),
              children: [
                { value: 'brief', label: t('Brief', '简报') },
                { value: 'tokens', label: t('Tokens', '令牌') },
                { value: 'locked', label: t('Unavailable', '暂不可用'), disabled: true },
              ],
            },
            {
              value: 'engineering',
              label: t('Engineering', '研发'),
              children: [{ value: 'release', label: t('Release', '发布') }],
            },
          ],
        },
        {
          value: 'docs',
          label: t('Documentation', '文档'),
          children: [
            {
              value: 'design',
              label: t('Design', '设计'),
              children: [
                { value: 'guide', label: t('Guide', '指南') },
                { value: 'api', label: 'API' },
              ],
            },
          ],
        },
        {
          value: 'archive',
          label: t('Archive', '归档'),
          disabled: true,
          children: [{ value: 'old', label: t('Old material', '旧资料') }],
        },
      ],
)
</script>
<template>
  <LocaleProvider :locale="locale === 'zh' ? 'zh-CN' : 'en-US'">
    <section
      class="cascader-demo"
      data-testid="cascader-demo"
      :dir="rtl ? 'rtl' : 'ltr'"
    >
      <div class="cascader-demo__controls">
        <Checkbox
          v-model="rtl"
          :label="t('Mirror path picker', '镜像路径选择器')"
        />
        <Checkbox
          v-model="disabled"
          :label="t('Disable path field', '禁用路径字段')"
        />
        <Checkbox
          v-model="branches"
          :label="t('Allow branch confirmation', '允许确认分支')"
        />
        <Checkbox
          v-model="cancel"
          :label="t('Reject path changes', '拒绝路径更改')"
        />
        <Checkbox
          v-model="empty"
          :label="t('Empty catalog', '空目录')"
        />
      </div>
      <form id="cascader-form">
        <fieldset :disabled="disabled">
          <FormField :label="t('Destination', '目标位置')"
            ><Cascader
              v-model="value"
              :options="options"
              :label="t('Destination', '目标位置')"
              :select-branches="branches"
              name="destination"
              searchable
              clearable
              required
              @beforeinput="cancel && $event.preventDefault()"
          /></FormField>
        </fieldset>
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset destination', '重置目标位置') }}</Button
        >
      </form>
      <p>
        {{ t('Accepted path', '已确认路径') }}: <output>{{ JSON.stringify(value) }}</output>
      </p>
    </section>
  </LocaleProvider>
</template>
<style>
.cascader-demo {
  display: grid;
  gap: 24px;
}
.cascader-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.cascader-demo form {
  display: grid;
  justify-items: start;
  gap: 16px;
}
.cascader-demo fieldset {
  min-inline-size: 0;
  padding: 0;
  border: 0;
}
.cascader-demo .yam3x-form-field {
  inline-size: min(100%, 320px);
}
</style>
