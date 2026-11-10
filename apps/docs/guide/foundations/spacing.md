# Spacing and density

Material spacing is a shared scale with owners, not a universal gap. Density changes component spacing without shrinking text or the minimum interactive target.

## Use spacing according to its owner

Material spacing uses an 8 dp base scale with recommended values; it does not require one universal gap. When a recommended value does not fit a recurring pattern, Material allows products to extend the scale consistently. See [Spacing overview](https://m3.material.io/styles/spacing/overview), [spacing tokens](https://m3.material.io/styles/spacing/tokens), and [applying spacing](https://m3.material.io/styles/spacing/applying-spacing).

Inside a component, use parent padding and gaps to organize its contents; Material recommends these before child margins. A component's internal spacing follows its own design guidance. At the page level, arrange panes, page margins, and gutters in the application shell, then use padding and gaps to organize content within each pane. Use logical inline properties so leading and trailing edges follow the writing direction.

The application spacing section below documents the installed YAM3X variables and their density behavior.

## Spacing for application layout

The copied foundation stylesheet provides reusable spacing variables at 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, and 64 CSS pixels at default density. Names such as **--md-sys-spacing-16** and **--md-sys-spacing-24** are YAM3X's Web implementation of a spacing scale, not official Material CSS token names. Use them for application-owned page gutters and layout gaps:

```css
.page-layout {
  display: grid;
  gap: var(--md-sys-spacing-24);
  padding-inline: var(--md-sys-spacing-16);
}
```

These variables scale with the YAM3X density setting, including values used by application layouts. Check page gutters and content fit at the density used by your app. For design guidance, see [Spacing overview](https://m3.material.io/styles/spacing/overview), [spacing tokens](https://m3.material.io/styles/spacing/tokens), and [applying spacing](https://m3.material.io/styles/spacing/applying-spacing).


## Density

`density` accepts `0`, `-1`, or `-2`. The compact settings scale component spacing to 87.5% or 75% and reduce supported container dimensions. Font sizes and the 48px minimum interactive target remain unchanged. The factors and density levels are project decisions.

## Material references

[Spacing overview](https://m3.material.io/styles/spacing/overview) · [Spacing tokens](https://m3.material.io/styles/spacing/tokens) · [Applying spacing](https://m3.material.io/styles/spacing/applying-spacing)
