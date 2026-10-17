<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'outlined' | 'elevated'
    value?: string
  }>(),
  { variant: 'outlined', value: undefined },
)
</script>

<template>
  <span
    class="yam3x-chip"
    :class="[
      `yam3x-chip--${variant}`,
      {
        'yam3x-chip--has-icon': Boolean($slots.icon),
        'yam3x-chip--has-trailing': Boolean($slots.trailing),
      },
    ]"
    :data-value="value"
  >
    <span
      v-if="$slots.icon"
      class="yam3x-chip__icon"
      aria-hidden="true"
      ><slot name="icon"
    /></span>
    <span class="yam3x-chip__label"><slot /></span>
    <span
      v-if="$slots.trailing"
      class="yam3x-chip__trailing"
      aria-hidden="true"
      ><slot name="trailing"
    /></span>
  </span>
</template>

<style src="./chip.styles.css"></style>
