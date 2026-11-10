<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { useSnackbar } from '@registry/components/snackbar'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const snackbar = useSnackbar()
const lastResult = ref('')

function track(result: 'action' | 'dismissed'): void {
  lastResult.value = result
}

function showPersistent(): void {
  void snackbar
    .show({
      message: t(
        'This notice has no close button and no timer.',
        '此通知没有关闭按钮，也没有计时器。',
      ),
      dismissible: false,
      key: 'persistent',
    })
    .then(track)
}

function showActionable(): void {
  void snackbar
    .show({
      message: t('Draft deleted', '草稿已删除'),
      actionLabel: t('Undo', '撤销'),
      onAction: () => {
        lastResult.value = 'action'
      },
      key: 'actionable',
    })
    .then(track)
}
</script>

<template>
  <div class="yam3x-snackbar-lifetime-demo">
    <p>
      {{
        t(
          'This provider uses Alt+Shift+S to focus the active notification’s action or close button.',
          '此 provider 使用 Alt+Shift+S 聚焦当前通知的操作或关闭按钮。',
        )
      }}
    </p>
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="showPersistent"
    >
      {{ t('Show non-dismissible notice', '显示不可关闭通知') }}
    </Button>
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="showActionable"
    >
      {{ t('Show actionable notice', '显示带操作通知') }}
    </Button>
    <Button
      variant="outlined"
      size="medium"
      type="button"
      @click="snackbar.dismiss()"
    >
      {{ t('Dismiss the current notice', '关闭当前通知') }}
    </Button>
    <p
      data-testid="snackbar-lifetime-result"
      aria-live="polite"
    >
      {{ t('Result:', '结果：') }}
      {{ lastResult || t('No result yet', '尚无结果') }}
    </p>
  </div>
</template>

<style scoped>
.yam3x-snackbar-lifetime-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
}

.yam3x-snackbar-lifetime-demo > p {
  flex-basis: 100%;
}
</style>
