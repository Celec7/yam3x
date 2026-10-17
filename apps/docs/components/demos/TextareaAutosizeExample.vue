<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { vTextareaAutosize } from '@registry/components/textarea-autosize'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const message = ref('')
const enabled = ref(true)
const present = ref(true)
const options = computed(() => ({ minRows: 2, maxRows: 4, enabled: enabled.value }))
function fillProgrammatically() {
  message.value = [
    'programmatic one',
    'programmatic two',
    'programmatic three',
    'programmatic four',
  ].join('\n')
}
</script>

<template>
  <section>
    <form class="autosize-example">
      <label for="autosize-message">{{ t('Message', '留言') }}</label>
      <textarea
        v-if="present"
        id="autosize-message"
        v-model="message"
        v-textarea-autosize="options"
        rows="2"
        style="height: 96px"
        name="message"
        :placeholder="t('Enter multiple lines', '输入多行内容')"
        data-testid="autosize-textarea"
      />
      <Checkbox
        v-model="enabled"
        class="toggle"
        :label="t('Automatically adjust height', '自动调整高度')"
      />
      <div class="actions">
        <Button type="reset">{{ t('Reset native form', '重置原生表单') }}</Button>
        <Button
          type="button"
          data-testid="programmatic-fill"
          @click="fillProgrammatically"
          >{{ t('Update value programmatically', '程序更新值') }}</Button
        >
        <Button
          type="button"
          data-testid="remove-textarea"
          @click="present = false"
          >{{ t('Remove field', '移除字段') }}</Button
        >
      </div>
    </form>
    <output data-testid="autosize-value">{{ message }}</output>
  </section>
</template>

<style scoped>
.autosize-example {
  display: grid;
  gap: 12px;
  max-width: 560px;
}
.actions {
  display: flex;
  gap: 8px;
}
.autosize-example textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 12px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  line-height: 24px;
  resize: vertical;
}
.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.autosize-example output {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
