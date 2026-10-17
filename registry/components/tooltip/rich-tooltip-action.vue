<script setup lang="ts">
import { inject } from 'vue'
import { richTooltipContextKey } from './tooltip.types'

const props = withDefaults(defineProps<{ disableRestoreFocus?: boolean }>(), {
  disableRestoreFocus: false,
})
const tooltip = inject(richTooltipContextKey, null)
function dismiss(): void {
  tooltip?.hide(!props.disableRestoreFocus)
}
</script>

<template>
  <span
    class="yam3x-rich-tooltip-action"
    @click="dismiss"
    ><slot
  /></span>
</template>

<style scoped>
.yam3x-rich-tooltip-action {
  display: contents;
}
</style>
