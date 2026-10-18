<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Dialog } from '@registry/components/dialog'
import { InlineMessage } from '@registry/components/inline-message'
import { useSnackbar } from '@registry/components/snackbar'

const open = ref(false)
const note = ref('Pending note')
const result = ref('')
const snackbar = useSnackbar()
function showNotification() {
  result.value = ''
  void snackbar
    .show({
      message: 'Saved record / 已保存记录',
      timeoutMs: 4000,
      inlineFeedback: true,
      dismissible: true,
    })
    .then((value) => {
      result.value = value
    })
}
</script>

<template>
  <section data-testid="locale-actions">
    <InlineMessage dismissible>Saved content / 已保存内容</InlineMessage>
    <Button @click="open = true">Edit note / 编辑笔记</Button>
    <Dialog
      v-model:open="open"
      title="Edit note / 编辑笔记"
      show-close-button
    >
      <label for="locale-note">Note / 笔记</label>
      <input
        id="locale-note"
        v-model="note"
      />
    </Dialog>
    <Button @click="showNotification">Show notification / 显示通知</Button>
    <output data-testid="locale-notification-result">{{ result }}</output>
  </section>
</template>
