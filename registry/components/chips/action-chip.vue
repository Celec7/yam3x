<script setup lang="ts">
import { computed } from 'vue'
import { vRipple } from '../_shared/ripple'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    kind: 'assist' | 'suggestion'
    variant?: 'outlined' | 'elevated'
    href?: string
    target?: string
    rel?: string
    download?: string | boolean
    type?: 'button' | 'submit' | 'reset'
    name?: string
    value?: string
    form?: string
    disabled?: boolean
  }>(),
  {
    variant: 'outlined',
    href: undefined,
    target: undefined,
    rel: undefined,
    download: undefined,
    type: 'button',
    name: undefined,
    value: undefined,
    form: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const isLink = computed(() => props.href !== undefined)
function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-ripple
    v-bind="$attrs"
    class="yam3x-chip yam3x-chip--action yam3x-state-layer yam3x-touch-target"
    :class="[
      `yam3x-chip--${kind}`,
      `yam3x-chip--${variant}`,
      { 'yam3x-chip--has-icon': Boolean($slots.icon) },
    ]"
    :href="isLink && !disabled ? href : undefined"
    :target="isLink && !disabled ? target : undefined"
    :rel="isLink && !disabled ? rel : undefined"
    :download="
      isLink && !disabled && download !== false && download !== undefined
        ? download === true
          ? ''
          : download
        : undefined
    "
    :type="isLink ? undefined : type"
    :name="isLink ? undefined : name"
    :value="isLink ? undefined : value"
    :form="isLink ? undefined : form"
    :disabled="isLink ? undefined : disabled"
    :role="isLink && disabled ? 'link' : undefined"
    :tabindex="isLink && disabled ? -1 : undefined"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    @click="onClick"
  >
    <span
      v-if="$slots.icon"
      class="yam3x-chip__icon"
      aria-hidden="true"
      ><slot name="icon"
    /></span>
    <span class="yam3x-chip__label"><slot /></span>
  </component>
</template>

<style src="./chip.styles.css"></style>
