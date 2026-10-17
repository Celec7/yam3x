import type { FabMenuPresentation, FabMenuVariant } from './fab-menu.types'

const fabMenuColorRoles = ['primary', 'secondary', 'tertiary'] as const
const fabMenuTypestyles = ['label-large', 'title-medium'] as const

export const fabMenuSystemTokenNames = [
  '--md-sys-color-on-surface',
  '--md-sys-color-on-surface-variant',
  '--md-sys-color-outline-variant',
  '--md-sys-color-surface-container',
  '--md-sys-color-surface-container-highest',
  '--md-sys-elevation-level2',
  '--md-sys-motion-spring-fast-effects',
  '--md-sys-motion-spring-fast-spatial',
  '--md-sys-shape-corner-extra-large',
  '--md-sys-shape-corner-extra-small',
  '--md-sys-shape-corner-full',
  ...fabMenuTypestyles.flatMap((style) =>
    ['font-family', 'font-size', 'font-weight', 'line-height', 'tracking'].map(
      (property) => `--md-sys-typescale-${style}-${property}`,
    ),
  ),
  ...fabMenuColorRoles.flatMap((role) => [
    `--md-sys-color-${role}`,
    `--md-sys-color-on-${role}`,
    `--md-sys-color-${role}-container`,
    `--md-sys-color-on-${role}-container`,
  ]),
] as const

export function syncFabMenuSystemTokens(host: HTMLElement, panel: HTMLElement): void {
  const styles = getComputedStyle(host)
  for (const name of fabMenuSystemTokenNames) {
    const value = styles.getPropertyValue(name).trim()
    if (value) panel.style.setProperty(name, value)
    else panel.style.removeProperty(name)
  }
}

export function findFabMenuThemeTarget(host: HTMLElement): HTMLElement {
  return host.closest<HTMLElement>('[data-theme]') ?? host.ownerDocument.documentElement
}

export function createFabMenuComponentTokens(
  variant: FabMenuVariant,
  presentation: FabMenuPresentation,
) {
  const pillStack = presentation === 'pill-stack'
  const itemContainer = pillStack
    ? `var(--yam3x-fab-menu-item-container-color, var(--yam3x-${variant}-fab-container-color, var(--md-sys-color-${variant}-container)))`
    : 'var(--yam3x-fab-menu-item-container-color, var(--md-sys-color-surface-container))'
  const itemContent = pillStack
    ? `var(--yam3x-fab-menu-item-content-color, var(--yam3x-${variant}-fab-color, var(--md-sys-color-on-${variant}-container)))`
    : 'var(--yam3x-fab-menu-item-content-color, var(--md-sys-color-on-surface))'
  const itemIconColor = pillStack ? itemContent : 'var(--md-sys-color-on-surface-variant)'
  const itemStateColor = pillStack
    ? `var(--yam3x-${variant}-fab-hover-color, ${itemContent})`
    : 'var(--yam3x-fab-menu-item-state-color, var(--md-sys-color-on-surface))'

  return {
    '--_yam3x-fab-menu-item-container': itemContainer,
    '--_yam3x-fab-menu-item-color': itemContent,
    '--_yam3x-fab-menu-item-icon-color': itemIconColor,
    '--_yam3x-fab-menu-item-state-color': itemStateColor,
    '--_yam3x-fab-menu-item-hover': itemStateColor,
    '--_yam3x-fab-menu-item-focus': pillStack
      ? `var(--yam3x-${variant}-fab-focus-color, ${itemContent})`
      : 'var(--yam3x-fab-menu-item-focus-color, var(--md-sys-color-on-surface))',
    '--_yam3x-fab-menu-item-ripple-color': pillStack
      ? `var(--yam3x-${variant}-fab-ripple-color, ${itemContent})`
      : 'var(--yam3x-fab-menu-item-ripple-color, var(--md-sys-color-on-surface))',
    '--_yam3x-fab-menu-item-selected-container': 'var(--md-sys-color-surface-container-highest)',
    '--_yam3x-fab-menu-item-disabled-container':
      'var(--yam3x-fab-menu-item-disabled-container-color, var(--md-sys-color-on-surface))',
    '--_yam3x-fab-menu-item-disabled-container-opacity':
      'var(--yam3x-fab-menu-item-disabled-container-opacity, 10%)',
    '--_yam3x-fab-menu-item-disabled-color':
      'var(--yam3x-fab-menu-item-disabled-color, var(--md-sys-color-on-surface))',
    '--_yam3x-fab-menu-item-disabled-opacity': 'var(--yam3x-fab-menu-item-disabled-opacity, 38%)',
    '--_yam3x-fab-menu-item-shape': pillStack
      ? 'var(--yam3x-fab-menu-item-shape, var(--md-sys-shape-corner-full, 999px))'
      : 'var(--yam3x-fab-menu-item-shape, var(--md-sys-shape-corner-extra-small, 4px))',
    '--_yam3x-fab-menu-item-height': pillStack
      ? 'max(56px, var(--yam3x-fab-menu-item-height, 56px))'
      : 'max(48px, var(--yam3x-fab-menu-item-height, 48px))',
    '--_yam3x-fab-menu-item-leading-space': pillStack
      ? 'var(--yam3x-fab-menu-item-leading-space, 24px)'
      : 'var(--yam3x-fab-menu-item-leading-space, 12px)',
    '--_yam3x-fab-menu-item-trailing-space': pillStack
      ? 'var(--yam3x-fab-menu-item-trailing-space, 24px)'
      : 'var(--yam3x-fab-menu-item-trailing-space, 12px)',
    '--_yam3x-fab-menu-item-top-space': pillStack
      ? 'var(--yam3x-fab-menu-item-top-space, 16px)'
      : 'var(--yam3x-fab-menu-item-top-space, 12px)',
    '--_yam3x-fab-menu-item-bottom-space': pillStack
      ? 'var(--yam3x-fab-menu-item-bottom-space, 16px)'
      : 'var(--yam3x-fab-menu-item-bottom-space, 12px)',
    '--_yam3x-fab-menu-item-spacing': pillStack
      ? 'var(--yam3x-fab-menu-item-spacing, 8px)'
      : 'var(--yam3x-fab-menu-item-spacing, 12px)',
    '--_yam3x-fab-menu-item-icon-size': 'var(--yam3x-fab-menu-item-icon-size, 24px)',
    '--_yam3x-fab-menu-item-font-size': pillStack
      ? 'var(--yam3x-fab-menu-item-font-size, var(--md-sys-typescale-title-medium-font-size, 16px))'
      : 'var(--yam3x-fab-menu-item-font-size, var(--md-sys-typescale-label-large-font-size, 14px))',
    '--_yam3x-fab-menu-item-font-weight': pillStack
      ? 'var(--yam3x-fab-menu-item-font-weight, var(--md-sys-typescale-title-medium-font-weight, 500))'
      : 'var(--yam3x-fab-menu-item-font-weight, var(--md-sys-typescale-label-large-font-weight, 500))',
    '--_yam3x-fab-menu-item-line-height': pillStack
      ? 'var(--yam3x-fab-menu-item-line-height, var(--md-sys-typescale-title-medium-line-height, 24px))'
      : 'var(--yam3x-fab-menu-item-line-height, var(--md-sys-typescale-label-large-line-height, 20px))',
    '--_yam3x-fab-menu-item-tracking': pillStack
      ? 'var(--yam3x-fab-menu-item-tracking, var(--md-sys-typescale-title-medium-tracking, 0.15px))'
      : 'var(--yam3x-fab-menu-item-tracking, var(--md-sys-typescale-label-large-tracking, 0.1px))',
    '--_yam3x-fab-menu-item-font-family': pillStack
      ? 'var(--md-sys-typescale-title-medium-font-family, inherit)'
      : 'var(--md-sys-typescale-label-large-font-family, inherit)',
    '--_yam3x-fab-menu-surface': 'var(--md-sys-color-surface-container)',
    '--_yam3x-fab-menu-outline': 'var(--md-sys-color-outline-variant)',
    '--_yam3x-fab-menu-focus-ring': pillStack
      ? 'var(--md-sys-color-primary)'
      : 'var(--md-sys-color-secondary)',
    '--_yam3x-fab-menu-panel-shape': pillStack
      ? 'var(--md-sys-shape-corner-extra-large, 28px)'
      : 'var(--md-sys-shape-corner-extra-small, 4px)',
    '--_yam3x-fab-menu-elevation': 'var(--md-sys-elevation-level2, 0 2px 6px rgb(0 0 0 / 18%))',
    '--_yam3x-fab-menu-min-width': pillStack ? '56px' : '112px',
    '--_yam3x-fab-menu-motion-effects':
      'var(--md-sys-motion-spring-fast-effects, 130ms cubic-bezier(0.31, 0.94, 0.34, 1))',
    '--_yam3x-fab-menu-motion-spatial':
      'var(--md-sys-motion-spring-fast-spatial, 472ms cubic-bezier(0.42, 1.67, 0.21, 0.9))',
    '--_yam3x-fab-menu-max-width': 'var(--yam3x-fab-menu-max-width, 280px)',
    '--_yam3x-fab-menu-spacing': 'var(--yam3x-fab-menu-spacing, 4px)',
  }
}
