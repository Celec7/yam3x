# Foundations

YAM3X provides theme foundations and Vue components. Your application still owns its page hierarchy, content layout, responsive behavior, and product-specific styling. This guide turns Material 3 Expressive guidance into practical choices for application developers and agents. Follow the linked official pages for design intent and each YAM3X component page for its implemented API and styling hooks.

## Choose a foundation

- [Layout and adaptive structure](/guide/foundations/layout): feed, list-detail, supporting pane, and adaptive behavior.
- [Typography](/guide/foundations/typography): type roles, heading semantics, Web typesetting, and language height.
- [Color and theming](/guide/foundations/color): dynamic color, theme tokens, and application styles.
- [Spacing and density](/guide/foundations/spacing): spacing ownership, application spacing tokens, and density.
- [Gestures and interaction](/guide/foundations/gestures): pointer recognizers and pointer capability flags.

## Compose components through their public surface

Select a component that matches the task and use the props and slots documented on its page. Customize component styling only through CSS custom properties documented there. Put page structure, gutters, and layout rules on application-owned containers. Broad selectors and fixed-size overrides can bypass component states, text scaling, and content adaptation.

For theme roles and density configuration, see [Color and theming](/guide/foundations/color). For pointer input and motion, see [Gestures and interaction](/guide/foundations/gestures) and Material's [motion guidance](https://m3.material.io/styles/motion/overview).

## Agent guidance in consumer projects

When the CLI initializes YAM3X core, it copies a short design route to **src/components/yam3x/AGENTS.md** if that file does not already exist. This scopes the instructions to the copied YAM3X component directory and points agents to this guide and the component pages. An existing app-root **AGENTS.md** remains independent; an existing file at the YAM3X target path is preserved. Merge the [distributed guidance source](https://github.com/Celec7/yam3x/blob/main/registry/foundations/AGENTS.md) into that target file when needed. See [Installation and first use](/guide/start/installation) for the initialization workflow.

## More guidance

- [Component catalog](/components/) for implemented APIs, examples, and component-specific styling hooks.
- [Design foundations](https://m3.material.io/) for the official Material 3 Expressive source; this guide links directly to the relevant typography, spacing, and layout pages.

