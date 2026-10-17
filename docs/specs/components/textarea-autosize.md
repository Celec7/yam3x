# Auto-sizing text area: project extension guide

## Scope

This project extension lets a multi-line text field grow with its content within product-defined limits. Material defines multi-line text fields but does not require automatic resizing.

## Design target

- Preserve the Material field container, label, supporting text, error, and optional counter shown in [Text field specifications](https://m3.material.io/components/text-fields/specs).
- Keep native text-area editing, selection, keyboard, and form behavior. Follow the field's accessibility guidance in [Text fields accessibility](https://m3.material.io/components/text-fields/accessibility).
- Material's Web guidance recommends a fixed-height text area with internal vertical scrolling. An expanding multi-line field shifts content below it; use this project extension when that layout change fits the product.

## Project decisions

- Project-defined: Content-driven height and minimum/maximum bounds are extension behavior because Material does not prescribe auto-sizing. Keep entered text usable without clipping and use internal scrolling after the selected maximum height is reached.
