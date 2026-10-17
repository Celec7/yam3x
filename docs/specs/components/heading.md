# Headings: project extension guide

## Scope

This project extension applies Material typography to semantic document headings. Material defines a visual type scale, not a Vue heading component or mapping to HTML heading levels.

## Design target

- Use Material's display, headline, title, label, and body roles to create a readable content hierarchy. The scale has three sizes for each role and both baseline and emphasized styles. See [Typography type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens).
- Use display for short, important content; headlines for short, high-emphasis passages; titles for shorter, medium-emphasis content; and body styles for longer passages. Use label styles for utilitarian component text and small captions. See [Applying type: role guidance](https://m3.material.io/styles/typography/applying-type).
- Use baseline and emphasized styles together where emphasis adds hierarchy. Material recommends emphasized styles for selection, actions, headlines, and other areas of emphasis. See [Typography type scale: emphasized styles](https://m3.material.io/styles/typography/type-scale-tokens).
- Keep body text readable at small sizes; avoid expressive or decorative typefaces for body content. See [Applying type: body styles](https://m3.material.io/styles/typography/applying-type).
- In Web layouts, use line height, bounding boxes, padding, and centering to control vertical typography placement. See [Applying type: Web typesetting](https://m3.material.io/styles/typography/applying-type).

## Project decisions

- `heading.extension.semantic-level` (project-defined): Consumers choose a native heading level separately from the visual Material type role. This avoids treating visual size as document structure.
- Project-defined API: The component exposes display, headline, title, and label variants, and an `emphasized` switch. It maps the selected family, size, and emphasis to the matching System typography tokens; Material defines the type styles, not this Vue API or its defaults.
