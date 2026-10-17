<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { hexFromArgb, MaterialDynamicColors } from '@material/material-color-utilities'
import { defaultThemeSource, generateTheme } from './generate'
import type { ThemeVariant } from './types'

defineOptions({ inheritAttrs: true })

const props = withDefaults(
  defineProps<{
    color?: string
    variant?: ThemeVariant
    scheme?: 'auto' | 'light' | 'dark'
    label?: string
  }>(),
  {
    color: defaultThemeSource.color,
    variant: defaultThemeSource.variant,
    scheme: 'auto',
    label: 'Theme preview',
  },
)

const systemDark = ref(false)
let media: MediaQueryList | undefined
const isDark = computed(
  () => props.scheme === 'dark' || (props.scheme === 'auto' && systemDark.value),
)
const colors = computed(() => {
  const theme = generateTheme(props.color, { variant: props.variant })
  const dynamic = new MaterialDynamicColors()
  const scheme = theme.schemes[isDark.value ? 'dark' : 'light']
  return {
    surface: hexFromArgb(dynamic.surface().getArgb(scheme)),
    primary: hexFromArgb(dynamic.primary().getArgb(scheme)),
  }
})
const iconStyle = computed(() => ({
  '--_theme-icon-container-color': colors.value.surface,
  '--_theme-icon-color': colors.value.primary,
}))

function onSystemChange(event: MediaQueryListEvent) {
  systemDark.value = event.matches
}

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  media = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = media.matches
  media.addEventListener('change', onSystemChange)
})

onBeforeUnmount(() => media?.removeEventListener('change', onSystemChange))
</script>

<template>
  <span
    class="yam3x-theme-preview-icon"
    :style="iconStyle"
    role="img"
    :aria-label="label"
    v-bind="$attrs"
  >
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
    >
      <path
        class="yam3x-theme-preview-icon__container"
        d="M77.87 0C79.05 0 80 .95 80 2.13v75.74c0 1.17-.95 2.13-2.13 2.13H2.13C.96 80 0 79.04 0 77.87V2.13C0 .95.96 0 2.13 0h75.74z"
      />
      <path
        class="yam3x-theme-preview-icon__primary"
        d="M54 40c3.32 0 6 2.69 6 6 0 1.2 0-1.2 0 0 0 3.31-2.68 6-6 6H26c-3.31 0-6-2.69-6-6 0-1.2 0 1.2 0 0 0-3.31 2.69-6 6-6h28z"
      />
      <path
        class="yam3x-theme-preview-icon__primary"
        d="M0 0h80v17.24H0V0z"
      />
    </svg>
  </span>
</template>

<style scoped>
.yam3x-theme-preview-icon {
  display: inline-block;
  flex: none;
  width: var(--yam3x-theme-icon-size, 24px);
  height: var(--yam3x-theme-icon-size, 24px);
  overflow: hidden;
  border-radius: var(--yam3x-theme-icon-shape, var(--md-sys-shape-corner-extra-small, 4px));
  outline: solid 1px
    color-mix(
      in srgb,
      var(--yam3x-theme-icon-outline-color, var(--md-sys-color-outline-variant, #cac4d0))
        var(--yam3x-theme-icon-outline-opacity, 50%),
      transparent
    );
}
.yam3x-theme-preview-icon[hidden] {
  display: none;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
}
.yam3x-theme-preview-icon__container {
  fill: var(--yam3x-theme-icon-container-color, var(--_theme-icon-container-color));
}
.yam3x-theme-preview-icon__primary {
  fill: var(--yam3x-theme-icon-color, var(--_theme-icon-color));
}
</style>
