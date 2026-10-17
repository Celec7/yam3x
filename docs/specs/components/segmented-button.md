# Segmented buttons: project design guide

## Scope

Material 3 continues to document classic Segmented buttons. The M3 Expressive update recommends Connected Button Groups for new compact-choice designs. This guide preserves the official classic design target for continued support; it does not define a replacement or migration. See [Segmented buttons overview](https://m3.material.io/components/segmented-buttons/overview).

## Design target

### Current direction

- For new compact choices or view-switching controls, use Connected Button Groups and follow their current variant, selection, responsive, geometry, and accessibility guidance. See [Button groups overview](https://m3.material.io/components/button-groups/overview).

### Legacy appearance and states

- `segmented-button.legacy.geometry`: When maintaining the classic control, use the 40 dp visual height, 1 dp outline, fully rounded outer corners, and 48 dp interactive target shown in the classic [Segmented buttons measurement figures](https://m3.material.io/components/segmented-buttons/specs).
- `segmented-button.legacy.selection-modes`: The classic control supports single-select and multi-select groups, with icons, labels, or both; selection may be indicated with a check icon. See [Segmented buttons guidelines](https://m3.material.io/components/segmented-buttons/guidelines) and [specifications](https://m3.material.io/components/segmented-buttons/specs).
- `segmented-button.legacy.keyboard`: The first enabled segment is the initial Tab stop in LTR; the last enabled segment is the initial stop in RTL. Arrow keys move focus among segments; Space or Enter activates the focused segment. Expose single-select options with radio semantics and multi-select options with checkbox semantics. See [Segmented buttons accessibility](https://m3.material.io/components/segmented-buttons/accessibility).

## Project decisions

- Project decision: Retain SegmentedButton and its classic official-spec implementation for continued use. Recommend Connected Button Groups for new designs without treating them as a replacement or migration path.
- Project decision: Home and End move focus to the first and last enabled segments. These keys supplement the documented arrow-key navigation.
