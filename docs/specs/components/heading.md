# Headings: project extension guide

## Scope

This project extension applies Material typography to semantic document headings. Material defines a visual type scale, not a Vue heading component or mapping to HTML heading levels. The closest Compose equivalent is Text with a heading semantic and a Material typography style.

## Design target

- Use Material's display, headline, title, label, and body roles to create a readable content hierarchy. The scale has three sizes for each role and both baseline and emphasized styles. See [Typography type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens).
- Use display for short, important content; headlines for short, high-emphasis passages; titles for shorter, medium-emphasis content; and body styles for longer passages. Use label styles for utilitarian component text and small captions. See [Applying type: role guidance](https://m3.material.io/styles/typography/applying-type).
- Use baseline and emphasized styles together where emphasis adds hierarchy. Material recommends emphasized styles for selection, actions, headlines, and other areas of emphasis. See [Typography type scale: emphasized styles](https://m3.material.io/styles/typography/type-scale-tokens).
- Keep body text readable at small sizes; avoid expressive or decorative typefaces for body content. See [Applying type: body styles](https://m3.material.io/styles/typography/applying-type).
- In Web layouts, use line height, bounding boxes, padding, and centering to control vertical typography placement. See [Applying type: Web typesetting](https://m3.material.io/styles/typography/applying-type).

## Project decisions

The following are project decisions.

- `heading.extension.semantic-level`: Consumers choose a native heading level separately from the visual Material type role. This avoids treating visual size as document structure. Omitting the level is the deliberate visual-only mode and renders ordinary text without heading semantics.
- `heading.composition.levels`: Built-in compositions that render a title supply a semantic level. Page-level error summaries and modal dialog titles use level 2; embedded empty states, inline messages, and description-list titles use level 3. Callers may override the level to match the surrounding outline; the visual role remains independent.
