# Layout and adaptive structure

Choose a page structure from the task and the relationship between its content, then adapt it deliberately as the window changes.

## Choose a layout from the content and task

Choose a page structure from the task and the relationship between its content:

- Use a Feed to arrange many peer items, such as cards, for quick scanning.
- Use List-detail when people choose an item from a collection and inspect its details. This fits parent-child content.
- Use a Supporting pane when secondary content only makes sense in relation to a primary area, such as properties, comments, lessons, or tools.

Material's [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview) show these patterns at compact, medium, and expanded sizes: [Feed](https://m3.material.io/foundations/layout/canonical-examples/feed), [List-detail](https://m3.material.io/foundations/layout/canonical-examples/list-detail), and [Supporting pane](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane). Use them as starting structures, then fit the content and task.

Adaptive design can change layout structure, component placement, or behavior as the window changes, a person navigates, or input and device contexts differ. Resize, reflow, selectively show or hide content, and change presentation when that better supports the task; do not only shrink the same composition. Choose thresholds where the content and pane relationships still work. Design for touch, pointer, and keyboard input, and preserve reading and focus order when the visual layout changes. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design), the [layout overview](https://m3.material.io/foundations/layout/layout-overview/overview), and [Bidirectionality and RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl).

In Material's Supporting pane example, supporting content moves below the primary area at compact and medium sizes, then appears beside it at expanded size. YAM3X SplitPane is a project extension based on this pattern. Its [component page](/components/split-pane) documents the project's compact behavior, which does not select application routes.


## Material references

[Layout overview](https://m3.material.io/foundations/layout/layout-overview/overview) · [Canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design) · [Bidirectionality and RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl)
