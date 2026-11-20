<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import ScrollField from '@registry/components/scroll-field/scroll-field.vue'
import type { ScrollFieldInvalidDetail } from '@registry/components/scroll-field/index'
import type { ScrollFieldMode } from '@registry/components/scroll-field/scroll-field.types'

const minutes = ref(30)
const smallValue = ref(4)
const mediumValue = ref(42)
const largeValue = ref(1284)
const loopValue = ref(7)
const inputValue = ref(15)
const disabledValue = ref(12)
const mode = ref<ScrollFieldMode>('scroll')
const error = ref('')
const lastChange = ref<number | null>(null)

function toggleMode() {
  mode.value = mode.value === 'scroll' ? 'input' : 'scroll'
}

function onInvalid(detail: ScrollFieldInvalidDetail) {
  error.value = `Expected a value from 0 to 59 in steps of 1 (${detail.reason}).`
}

function onValid() {
  error.value = ''
}

function onCommit(value: number) {
  lastChange.value = value
}
</script>

<template>
  <div class="scroll-field-example">
    <div class="scroll-field-example__row">
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Minutes</span>
        <ScrollField
          v-model="minutes"
          label="Minutes"
          unit="minutes"
          data-testid="scroll-field-minutes"
          @change="onCommit"
        />
      </div>
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Looping digits</span>
        <ScrollField
          v-model="loopValue"
          label="Looping digit"
          size="small"
          :min="0"
          :max="9"
          loop
          data-testid="scroll-field-loop"
        />
      </div>
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Disabled</span>
        <ScrollField
          v-model="disabledValue"
          label="Disabled value"
          size="small"
          disabled
          data-testid="scroll-field-disabled"
        />
      </div>
    </div>

    <div class="scroll-field-example__row">
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Small · 1–2 digits</span>
        <ScrollField
          v-model="smallValue"
          label="Small value"
          size="small"
          :min="0"
          :max="99"
          data-testid="scroll-field-small"
        />
      </div>
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Medium · 3 digits</span>
        <ScrollField
          v-model="mediumValue"
          label="Medium value"
          size="medium"
          :min="0"
          :max="999"
          data-testid="scroll-field-medium"
        />
      </div>
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Large · 4 digits</span>
        <ScrollField
          v-model="largeValue"
          label="Large value"
          size="large"
          :min="1000"
          :max="9999"
          data-testid="scroll-field-large"
        />
      </div>
    </div>

    <div class="scroll-field-example__row">
      <div class="scroll-field-example__cell">
        <span class="scroll-field-example__label">Scroll or input</span>
        <ScrollField
          v-model="inputValue"
          v-model:mode="mode"
          label="Scroll or input value"
          unit="minutes"
          :error="error"
          data-testid="scroll-field-input"
          @invalid="onInvalid"
          @valid="onValid"
        />
      </div>
      <Button
        variant="filled-tonal"
        data-testid="scroll-field-mode"
        @click="toggleMode"
      >
        {{ mode === 'scroll' ? 'Enter a value' : 'Use the wheel' }}
      </Button>
      <p
        class="scroll-field-example__status"
        aria-live="polite"
      >
        Committed: {{ lastChange ?? minutes }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.scroll-field-example {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.scroll-field-example__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
}
.scroll-field-example__cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scroll-field-example__label {
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-sys-typescale-label-large-font-family);
  font-size: var(--md-sys-typescale-label-large-font-size);
  line-height: var(--md-sys-typescale-label-large-line-height);
}
.scroll-field-example__status {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-font-size);
}
</style>
