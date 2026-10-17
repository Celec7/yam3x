import { inject, type InjectionKey } from 'vue'

export interface SnackbarOptions {
  message: string
  actionLabel?: string
  onAction?: () => void | Promise<void>
  dismissible?: boolean
  dismissLabel?: string
  timeoutMs?: number
  inlineFeedback?: boolean
  key?: string
}

export type SnackbarResult = 'action' | 'dismissed'

export interface SnackbarApi {
  show(options: SnackbarOptions): Promise<SnackbarResult>
  dismiss(): void
}

export const snackbarKey: InjectionKey<SnackbarApi> = Symbol('yam3x:snackbar')

export function useSnackbar(): SnackbarApi {
  const snackbar = inject(snackbarKey)
  if (!snackbar) throw new Error('useSnackbar() must be used inside a <SnackbarProvider>.')
  return snackbar
}
