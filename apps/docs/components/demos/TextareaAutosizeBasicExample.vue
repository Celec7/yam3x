<script setup lang="ts">
import { ref } from 'vue'
import { vTextareaAutosize } from '@registry/components/textarea-autosize'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const note = ref('')
</script>

<template>
  <section
    class="textarea-basic"
    data-testid="autosize-basic"
  >
    <label for="autosize-basic-field">{{ t('Project note', '项目备注') }}</label>
    <textarea
      id="autosize-basic-field"
      v-model="note"
      v-textarea-autosize="{ minRows: 3, maxRows: 8 }"
      rows="3"
      name="note"
      :placeholder="t('Add a short note', '添加简短备注')"
    />
    <p class="textarea-basic__hint">
      {{
        t(
          'The field grows with the note, then scrolls at eight rows.',
          '字段随备注增高，达到八行后在内部滚动。',
        )
      }}
    </p>
  </section>
</template>

<style scoped>
.textarea-basic {
  display: grid;
  gap: 8px;
  max-width: 480px;
}
.textarea-basic textarea {
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
.textarea-basic__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
}
</style>
