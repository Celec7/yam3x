# Applying Material 3 Expressive with YAM3X

YAM3X provides theme foundations and Vue components. Your application still owns its page hierarchy, content layout, responsive behavior, and product-specific styling. This guide turns Material 3 Expressive guidance into practical choices for application developers and agents. Follow the linked official pages for design intent and each YAM3X component page for its implemented API and styling hooks.

## Choose a layout from the content and task

Choose a page structure from the task and the relationship between its content:

- Use a Feed to arrange many peer items, such as cards, for quick scanning.
- Use List-detail when people choose an item from a collection and inspect its details. This fits parent-child content.
- Use a Supporting pane when secondary content only makes sense in relation to a primary area, such as properties, comments, lessons, or tools.

Material's [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview) show these patterns at compact, medium, and expanded sizes: [Feed](https://m3.material.io/foundations/layout/canonical-examples/feed), [List-detail](https://m3.material.io/foundations/layout/canonical-examples/list-detail), and [Supporting pane](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane). Use them as starting structures, then fit the content and task.

Adaptive design can change layout structure, component placement, or behavior as the window changes, a person navigates, or input and device contexts differ. Resize, reflow, selectively show or hide content, and change presentation when that better supports the task; do not only shrink the same composition. Choose thresholds where the content and pane relationships still work. Design for touch, pointer, and keyboard input, and preserve reading and focus order when the visual layout changes. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design), the [layout overview](https://m3.material.io/foundations/layout/layout-overview/overview), and [Bidirectionality and RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl).

In Material's Supporting pane example, supporting content moves below the primary area at compact and medium sizes, then appears beside it at expanded size. YAM3X SplitPane is a project extension based on this pattern. Its [component page](/components/split-pane) documents the project's compact behavior, which does not select application routes.

## Build a readable type hierarchy

Material's type scale has five roles, each with large, medium, and small sizes:

- Display: short, important text or numerals.
- Headline: short, high-emphasis text or primary content regions.
- Title: medium-emphasis section and secondary-region headings.
- Body: longer reading passages.
- Label: short, utilitarian text such as control labels and captions.

Choose a role for its content purpose, not just because it is the next size in a ladder. YAM3X Heading maps Display, Headline, Title, and Label roles; use its **level** for document heading semantics independently of **variant**, **size**, and **emphasized** appearance. Use normal text semantics for Body copy. See [Heading](/components/heading) and Material's guidance on [applying type](https://m3.material.io/styles/typography/applying-type).

Material defines 15 baseline and 15 emphasized styles, but a product need not use all of them. Use baseline styles by default. Choose the emphasized counterpart of the same role and size when selection, an action, a headline, or another important state needs added emphasis; Material components do not use emphasized styles by default. See [type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens).

For Web text, line-height sets the height of the text bounding box; font metrics place the glyphs inside it. Use padding to provide space between that box, neighboring elements, and container edges. Avoid fixed content heights. If defining a custom type style, Material recommends a line-height near 1.2 times the type size for Display, Headline, and Title, and around 1.5 times for Body and Label. Prefer YAM3X type tokens where they fit. See the typesetting figures in [Applying type](https://m3.material.io/styles/typography/applying-type).

Add the correct **lang** to localized content. YAM3X maps common language tags to script-height categories for line-height, defaults to medium, and lets a subtree override the category with **data-md-language-height**. Taller scripts and translated text need room to wrap and grow; fixed-height elements can clip or overlap them. When text scales to 200%, preserve the default spacing relationships and let the content reflow instead of multiplying every gap. See [language height support](https://m3.material.io/styles/typography/type-scale-tokens) and [applying spacing](https://m3.material.io/styles/spacing/applying-spacing).

Use tabular figures for tables and numbers that change often, such as timers, so values stay aligned. See [Ensuring readability](https://m3.material.io/styles/typography/applying-type).

## Use spacing according to its owner

Material spacing uses an 8 dp base scale with recommended values; it does not require one universal gap. When a recommended value does not fit a recurring pattern, Material allows products to extend the scale consistently. See [Spacing overview](https://m3.material.io/styles/spacing/overview), [spacing tokens](https://m3.material.io/styles/spacing/tokens), and [applying spacing](https://m3.material.io/styles/spacing/applying-spacing).

Inside a component, use parent padding and gaps to organize its contents; Material recommends these before child margins. A component's internal spacing follows its own design guidance. At the page level, arrange panes, page margins, and gutters in the application shell, then use padding and gaps to organize content within each pane. Use logical inline properties so leading and trailing edges follow the writing direction.

The installed YAM3X foundation stylesheet exposes project CSS variables such as **--md-sys-spacing-16** and **--md-sys-spacing-24** for application-owned layout:

```css
.page-layout {
  display: grid;
  gap: var(--md-sys-spacing-24);
  padding-inline: var(--md-sys-spacing-16);
}
```

These names and their CSS-pixel values are YAM3X's Web implementation, not official Material CSS token names. The [theme guide](/guide/theme#spacing-for-application-layout) documents the available values and Tailwind aliases. The YAM3X density setting scales these shared spacing variables, including application layouts that use them, so check page fit at the density your app uses.

## Compose components through their public surface

Select a component that matches the task and use the props and slots documented on its page. Customize component styling only through CSS custom properties documented there. Put page structure, gutters, and layout rules on application-owned containers. Broad selectors and fixed-size overrides can bypass component states, text scaling, and content adaptation.

For theme roles and density configuration, see [Color and theming](/guide/theme). For pointer input and motion, see [Gestures and interaction](/guide/gestures) and Material's [motion guidance](https://m3.material.io/styles/motion/overview).

## Agent guidance in consumer projects

When the CLI initializes YAM3X core, it copies a short design route to **src/components/yam3x/AGENTS.md** if that file does not already exist. This scopes the instructions to the copied YAM3X component directory and points agents to this guide and the component pages. An existing app-root **AGENTS.md** remains independent; an existing file at the YAM3X target path is preserved. Merge the [distributed guidance source](https://github.com/Celec7/yam3x/blob/main/registry/foundations/AGENTS.md) into that target file when needed. See [Installation and first use](/guide/installation) for the initialization workflow.

## More guidance

- [Component catalog](/components/) for implemented APIs, examples, and component-specific styling hooks.
- [Design foundations](https://m3.material.io/) for the official Material 3 Expressive source; this guide links directly to the relevant typography, spacing, and layout pages.
