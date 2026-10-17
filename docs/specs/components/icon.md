# Icons: project extension guide

## Scope

This project extension renders Material Symbols and project-provided SVG icons in interface contexts. Material defines iconography guidance, not this Vue component or its registration API.

## Design target

- Use Material Symbols with the outlined, rounded, or sharp style that fits the surrounding visual language. See [Icons overview](https://m3.material.io/styles/icons/overview) and [Applying icons: styles](https://m3.material.io/styles/icons/applying-icons).
- Standard icons are 24dp; additional common sizes are 20, 40, and 48dp. For standard 24dp symbols, use a minimum weight of 200, with regular weight 400 as the recommendation. The optical-size axis spans 20–48dp. Grade 0 suits dark icons on light backgrounds; grade -25 suits light icons on dark backgrounds. See [Designing icons](https://m3.material.io/styles/icons/designing-icons) and [Applying icons: axes](https://m3.material.io/styles/icons/applying-icons).
- Size and color icons according to their containing component. Match symbol and text sizes and optical weights where they appear together. The parent control owns the interaction target; Material recommends a 48dp target for a 24dp symbol. See [Applying icons: typography and target size](https://m3.material.io/styles/icons/applying-icons).
- Material recommends labels for complex or key-action icons below 20dp and caution when omitting labels from navigation icons. See [Applying icons: accessibility](https://m3.material.io/styles/icons/applying-icons).

## Project decisions

- Project-defined extension: The component accepts registered symbols and project-provided SVGs; this does not add a Material component or redefine the Material Symbols family.
- Project default: `grade="auto"` maps the active light theme to grade 0 and the active dark theme to grade -25. The nearest explicit `data-theme` or `.dark` target takes precedence; without an explicit theme target, the System color preference provides the default. `--yam3x-icon-auto-grade` is a project override for exceptional theme integrations.
- `icon.extension.accessible-name` (project-defined): An informative standalone icon exposes an accessible name; an icon that repeats its control's meaning is decorative, with the name remaining on the containing control. This keeps the icon from creating duplicate or unlabeled accessibility content.
