# Start here

Choose the path that matches your project. Installation and maintenance are separate flows; design decisions live under Foundations.

## New application

1. [Installation and first use](/guide/start/installation) sets up the CLI, copies foundation files, and adds your first components.
2. [Foundations](/guide/foundations/) explains layout, typography, color, spacing, and interaction before you build screens.
3. [Component catalog](/components/) documents implemented APIs, examples, and styling hooks.

## Existing copied source

- [Update copied source](/guide/maintain/updating) explains how to record the 0.6.0 baseline, inspect source drift with `status` and `diff`, and merge a newer YAM3X version without overwriting local edits.
- Keep component imports from `./components/yam3x/`; the site-only `@registry` path is for demo source.

## Agents in consumer projects

Installation copies a short design route to `src/components/yam3x/AGENTS.md` when that file does not exist. The app-root `AGENTS.md` remains independent; see [Installation and first use](/guide/start/installation) for the preserved-file behavior. Agents that support Agent Skills can also install the published skill with `npx skills add Celec7/yam3x@yam3x`. Install `npx skills add Celec7/yam3x@yam3x-upgrade` when the task is adopting a newer copied-source version.

## Reference

- [Foundations](/guide/foundations/) for design decisions and official Material links.
- [Components](/components/) for the component catalog.
- [Extensions](/extensions/) for project-defined components and compositions.
