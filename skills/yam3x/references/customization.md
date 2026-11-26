# Customization

YAM3X ships editable source, so there are two different kinds of change: configuring a component through its documented surface, and adapting the copied source. Choose the smallest kind that solves the need.

## Public surface order

Use the first option that works:

1. **Props, models, events, and slots.** These are the component's intended API.
2. **Documented CSS custom properties.** Use only `--yam3x-{component}-*` hooks listed on the component page.
3. **Application-level semantic tokens.** Use `--md-sys-*` color, type, shape, spacing, and motion roles for application-owned styles.
4. **Private aliases.** Do not depend on `--_yam3x-*`; they are implementation details and may change.

Do not use raw reference palettes for ordinary styling. Do not duplicate a token mapping in both CSS and TypeScript.

## Component styling

- Keep component-owned selectors scoped to the component.
- Do not style host list items, form wrappers, or page ancestors from a component.
- Reset the component's own margins when host typography or list rules would enter its box.
- Do not use broad global selectors or `!important` to override component internals.
- Use logical properties such as `padding-inline` and `margin-block` so RTL works.
- Prefer a new composition over a one-off restyle of a shared component.

## When to edit copied source

The copied source belongs to the application after installation. Editing it is allowed; treat the edit as a local extension:

- Make the smallest change that satisfies the need.
- Preserve the documented public API unless the application owns the migration.
- Keep the component's token layer and state behavior intact.
- Scope selectors to the component; do not leak styles to the host layout.
- Record why the divergence exists in the application's own notes or pull request.
- Re-check the divergence when merging an upstream update.

Prefer a composition, prop, slot, or documented CSS hook when it meets the need. Edit the source when the product needs behavior or presentation the documented surface does not expose.

## Application-level styling

Use semantic tokens for application-owned surfaces:

```css
.notice {
  padding: var(--md-sys-spacing-16);
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font:
    var(--md-sys-typescale-body-medium-font-weight) var(--md-sys-typescale-body-medium-font-size) /
      var(--md-sys-typescale-body-medium-line-height) Roboto,
    sans-serif;
}
```

Prefer the theme controller and semantic roles over hand-maintained palettes. For component internals, use the component page's documented hooks.

## Imports

- Consumer code: `./components/yam3x/<slug>`.
- The copied source is application-owned; imports do not come from an npm runtime package.
- Site demos use `@registry`; never copy that path into an application.
- Add or update the `localization` component when an application needs the public locale provider.

## Updating copied source

`add` copies missing files only. It does not overwrite edited files or merge upstream changes automatically.

Record the source baseline and inspect drift with the `yam3x-upgrade` skill before merging. The update guide owns the commands and state definitions; the upgrade skill owns the merge judgment. Preserve local extensions deliberately and re-check them after merging shared helpers and foundation files.

See [Update copied source](https://yam3x.iscccc.cc/guide/maintain/updating) for the public procedure.
