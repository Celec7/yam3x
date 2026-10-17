<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import ThemePreviewIcon from '@registry/foundations/theme/theme-preview-icon.vue'
import { createThemeController, type ThemeController } from '@registry/foundations/theme/controller'
import { defaultThemeSource } from '@registry/foundations/theme/generate'
import { getColorFromImage } from '@registry/foundations/theme/image'
import type { ThemeContrast, ThemeMotion, ThemeVariant } from '@registry/foundations/theme/types'
import { docsDemoTheme } from '../../.vitepress/theme/demo-theme'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const target = ref<HTMLElement>()
const activeTheme = docsDemoTheme.value
const color = ref(activeTheme?.color ?? defaultThemeSource.color)
const mode = ref<'system' | 'light' | 'dark'>(activeTheme?.mode ?? 'system')
const variant = ref<ThemeVariant>(activeTheme?.variant ?? defaultThemeSource.variant)
const contrast = ref<ThemeContrast>(activeTheme?.contrast ?? 'standard')
const motion = ref<ThemeMotion>(activeTheme?.motion ?? 'expressive')
const strongFocus = ref(activeTheme?.strongFocus ?? false)
const density = ref<0 | -1 | -2>(activeTheme?.density ?? 0)
const changeCount = ref(0)
const demoThemeActive = computed(() => docsDemoTheme.value !== null)
const image = ref<HTMLImageElement>()
const colorInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const imageError = ref(false)
let controller: ThemeController | undefined

const configuration = computed(() => ({
  color: color.value,
  mode: mode.value,
  variant: variant.value,
  contrast: contrast.value,
  motion: motion.value,
  strongFocus: strongFocus.value,
  density: density.value,
}))

function onThemeChange() {
  changeCount.value += 1
}

async function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !image.value) return

  const imageUrl = URL.createObjectURL(file)
  imageError.value = false
  try {
    image.value.src = imageUrl
    await image.value.decode()
    color.value = await getColorFromImage(image.value)
  } catch {
    imageError.value = true
  } finally {
    URL.revokeObjectURL(imageUrl)
    input.value = ''
  }
}

onMounted(() => {
  if (!target.value) return
  controller = createThemeController(target.value, configuration.value)
  target.value.addEventListener('change', onThemeChange)
})

watch(configuration, (value) => {
  controller?.update(value)
  if (docsDemoTheme.value) docsDemoTheme.value = value
})

function toggleDemoTheme() {
  docsDemoTheme.value = docsDemoTheme.value ? null : configuration.value
}

function setDensity(value: string | string[] | null) {
  if (value === '0' || value === '-1' || value === '-2')
    density.value = Number(value) as 0 | -1 | -2
}

onBeforeUnmount(() => {
  target.value?.removeEventListener('change', onThemeChange)
  controller?.dispose()
})
</script>

<template>
  <section class="theme-example">
    <div class="theme-example__controls">
      <Button
        class="theme-example__color-picker"
        variant="outlined"
        size="small"
        type="button"
        @click="colorInput?.click()"
      >
        <span
          class="theme-example__swatch"
          :style="{ backgroundColor: color }"
          aria-hidden="true"
        ></span>
        {{ t('Source color', '源色') }} · {{ color }}
      </Button>
      <input
        ref="colorInput"
        v-model="color"
        class="theme-example__native-color"
        type="color"
        tabindex="-1"
        aria-hidden="true"
      />
      <label
        >{{ t('Color scheme', '配色模式') }}
        <Select
          v-model="mode"
          :aria-label="t('Color scheme', '配色模式')"
          ><Option
            value="system"
            :label="t('Follow system', '跟随系统')" /><Option
            value="light"
            :label="t('Light', '浅色')" /><Option
            value="dark"
            :label="t('Dark', '深色')"
        /></Select>
      </label>
      <label
        >{{ t('Variant', '变体') }}
        <Select
          v-model="variant"
          :aria-label="t('Variant', '变体')"
        >
          <Option
            value="expressive"
            :label="t('Expressive', '表现力')"
          /><Option
            value="vibrant"
            :label="t('Vibrant', '鲜明')"
          /><Option
            value="tonal-spot"
            :label="t('Tonal Spot', '色调点缀')"
          /><Option
            value="neutral"
            :label="t('Neutral', '中性')"
          />
        </Select>
      </label>
      <label
        >{{ t('Contrast', '对比度') }}
        <Select
          v-model="contrast"
          :aria-label="t('Contrast', '对比度')"
          ><Option
            value="standard"
            :label="t('Standard', '标准')" /><Option
            value="medium"
            :label="t('Medium', '中')" /><Option
            value="high"
            :label="t('High', '高')"
        /></Select>
      </label>
      <label
        >{{ t('Motion', '动效') }}
        <Select
          v-model="motion"
          :aria-label="t('Motion', '动效')"
          ><Option
            value="standard"
            :label="t('Standard', '标准')" /><Option
            value="expressive"
            :label="t('Expressive', 'Expressive')"
        /></Select>
      </label>
      <label
        >{{ t('Density', '密度') }}
        <Select
          :model-value="String(density)"
          :aria-label="t('Density', '密度')"
          @update:model-value="setDensity"
          ><Option
            value="0"
            :label="t('Default', '默认')" /><Option
            value="-1"
            :label="t('Compact', '紧凑')" /><Option
            value="-2"
            :label="t('More compact', '更紧凑')"
        /></Select>
      </label>
      <Checkbox
        v-model="strongFocus"
        :label="t('Strong focus indicator', '强焦点指示器')"
      />
      <Button
        variant="outlined"
        size="small"
        type="button"
        @click="imageInput?.click()"
        >{{ t('Choose an image on this device', '从本地选择图片') }}</Button
      >
      <input
        ref="imageInput"
        class="theme-example__native-color"
        type="file"
        accept="image/*"
        tabindex="-1"
        aria-hidden="true"
        @change="onImageSelected"
      />
      <Button
        variant="filled-tonal"
        size="small"
        type="button"
        @click="toggleDemoTheme"
        >{{
          demoThemeActive
            ? t('Reset component demo theme', '重置组件演示主题')
            : t('Apply to component demos', '应用到组件演示')
        }}</Button
      >
    </div>
    <div
      ref="target"
      class="theme-example__surface"
      data-testid="theme-target"
    >
      <div>
        <h3>{{ t('Dynamic theme', '动态主题') }}</h3>
        <p>
          {{
            t(
              'Theme configuration affects semantic colors, motion, density, and focus tokens in the app.',
              '主题配置会影响应用的语义颜色、动效、密度与焦点令牌。',
            )
          }}
        </p>
        <Button
          variant="filled"
          type="button"
          >{{ t('Primary action', '主要操作') }}</Button
        >
        <Button
          variant="filled-tonal"
          type="button"
          >{{ t('Secondary action', '次要操作') }}</Button
        >
      </div>
      <ThemePreviewIcon
        :color="color"
        :variant="variant"
        :scheme="mode === 'system' ? 'auto' : mode"
        :label="t('Current theme preview', '当前主题预览')"
      />
    </div>
    <output data-testid="theme-changes"
      >{{ t('Theme change events:', '主题变更事件：') }} {{ changeCount }}</output
    >
    <output
      v-if="imageError"
      role="status"
      >{{
        t('This image could not be read. Choose another image.', '无法读取此图片，请选择其他图片。')
      }}</output
    >
    <img
      ref="image"
      alt=""
      hidden
    />
  </section>
</template>

<style scoped>
.theme-example {
  display: grid;
  gap: 1rem;
}
.theme-example__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
}
.theme-example__controls label {
  display: grid;
  gap: 0.3rem;
  font-size: 0.875rem;
}
.theme-example__native-color {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.theme-example__color-picker {
  gap: 0.5rem;
}
.theme-example__swatch {
  inline-size: 1rem;
  block-size: 1rem;
  border-radius: 50%;
  outline: 1px solid var(--md-sys-color-outline);
}
.theme-example__surface {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}
.theme-example__surface h3 {
  margin: 0;
  color: var(--md-sys-color-primary);
}
.theme-example__surface p {
  max-width: 34rem;
}
@media (max-width: 640px) {
  .theme-example__surface {
    align-items: start;
  }
}
</style>
