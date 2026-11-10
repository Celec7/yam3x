<script setup lang="ts">
import { SnackbarProvider } from '@registry/components/snackbar'
import SnackbarLifetimeControls from './SnackbarLifetimeControls.vue'
</script>

<template>
  <div class="vp-raw">
    <SnackbarProvider
      alignment="start"
      shortcut="Alt+Shift+S"
    >
      <SnackbarLifetimeControls />
    </SnackbarProvider>
  </div>
</template>
