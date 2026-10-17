<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Icon, registerIcon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const filled = ref(false)
const deferredRegistration = ref(false)

const outlineStar = {
  viewBox: '0 0 24 24',
  path: 'M12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.7 5.8 21 7 14.2 2 9.3 8.9 8.3Z',
}
const filledStar = {
  viewBox: '0 0 24 24',
  path: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.7l-6.2 3.3L7 14.2l-5-4.9 6.9-1Z',
}
const outlineHome = {
  viewBox: '0 0 24 24',
  path: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
}
const filledHome = {
  viewBox: '0 0 24 24',
  path: 'm2 10 10-8 10 8v10a2 2 0 0 1-2 2h-5v-7H9v7H4a2 2 0 0 1-2-2Z',
}
const outlineSettings = {
  viewBox: '0 0 24 24',
  path: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 2 2 2.5-.3 1.1 2.3 2.3 1.1-.3 2.5 2 2-2 2 .3 2.5-2.3 1.1-1.1 2.3-2.5-.3-2 2-2-2-2.5.3-1.1-2.3-2.3-1.1.3-2.5-2-2 2-2-.3-2.5 2.3-1.1 1.1-2.3 2.5.3Z',
}
const filledSettings = {
  viewBox: '0 0 24 24',
  path: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-8 2.3 2.2 3.2-.4 1.4 2.9 2.9 1.4-.4 3.2L24 12l-2.6 2.7.4 3.2-2.9 1.4-1.4 2.9-3.2-.4L12 24l-2.7-2.6-3.2.4-1.4-2.9-2.9-1.4.4-3.2L0 12l2.2-2.3-.4-3.2 2.9-1.4 1.4-2.9 3.2.4Z',
}

registerIcon('favorite', 'outlined', { outlined: outlineStar, filled: filledStar })
registerIcon('home', 'rounded', { outlined: outlineHome, filled: filledHome })
registerIcon('settings', 'sharp', { outlined: outlineSettings, filled: filledSettings })

function registerDeferredIcon(replacement = false) {
  registerIcon('deferred', 'outlined', {
    outlined: replacement
      ? { viewBox: '0 0 48 48', path: 'M4 4h40v40H4z' }
      : { viewBox: '0 0 24 24', path: 'M3 3h18v18H3z' },
    filled: replacement
      ? { viewBox: '0 0 48 48', path: 'M2 2h44v44H2z' }
      : { viewBox: '0 0 24 24', path: 'M2 2h20v20H2z' },
  })
  deferredRegistration.value = true
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="yam3x-demo__row icon-example__row">
      <button
        :aria-pressed="filled"
        class="icon-example__toggle"
        type="button"
        :aria-label="t('Favorite', '收藏')"
        @click="filled = !filled"
      >
        <Icon
          data-testid="icon-favorite"
          name="favorite"
          aria-hidden="true"
          :filled="filled"
        />
      </button>
      <Icon
        data-testid="icon-home"
        name="home"
        variant="rounded"
        :aria-label="t('Home', '首页')"
      />
      <Icon
        data-testid="icon-settings"
        name="settings"
        variant="sharp"
        :aria-label="t('Settings', '设置')"
      />
      <span>{{
        t(
          'Registered SVGs can be self-hosted without font requests',
          '注册的 SVG 可自托管，不依赖字体请求',
        )
      }}</span>
    </div>
    <div class="yam3x-demo__row icon-example__sizes">
      <Icon
        name="favorite"
        aria-hidden="true"
        style="--yam3x-icon-size: 18px"
      />
      <Icon
        name="favorite"
        aria-hidden="true"
        style="--yam3x-icon-size: 24px"
      />
      <Icon
        name="favorite"
        aria-hidden="true"
        style="--yam3x-icon-size: 36px"
      />
      <Icon
        name="favorite"
        aria-hidden="true"
        style="--yam3x-icon-size: 48px"
      />
    </div>
    <div class="yam3x-demo__row icon-example__registration">
      <Icon
        data-testid="icon-deferred"
        name="deferred"
        :aria-label="t('Deferred icon', '延迟注册图标')"
      />
      <Button
        type="button"
        @click="registerDeferredIcon()"
        >{{ t('Register deferred icon', '延迟注册图标') }}</Button
      >
      <Button
        type="button"
        :disabled="!deferredRegistration"
        @click="registerDeferredIcon(true)"
        >{{ t('Replace registered icon', '替换已注册图标') }}</Button
      >
    </div>
  </div>
</template>

<style scoped>
.icon-example__row {
  align-items: center;
  gap: 28px;
}
.icon-example__sizes {
  align-items: center;
  min-height: 56px;
}
.icon-example__registration {
  align-items: center;
}
.yam3x-icon {
  color: var(--md-sys-color-primary);
}
.icon-example__toggle {
  display: grid;
  place-items: center;
  border: 0;
  padding: 8px;
  color: inherit;
  background: transparent;
  cursor: pointer;
}
</style>
