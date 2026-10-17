# Component design and implementation

This page explains how Material 3 Expressive guidance, project design guides, Vue source, public documentation, and verification evidence fit together. See [Design and implementation references](references.md) for source authority and [project component design guides](specs/README.md) for the template and index.

## Workflow

1. **Select the design source.** Find the official component or foundation page on m3.material.io. When the site offers multiple versions or implementations, choose the one marked Expressive. Review relevant diagrams and images; they can define details not repeated in prose. If there is no direct Material component, state that the work is a project extension and identify the Material guidance it builds on.
2. **Write the project design guide.** Use the [spec template](specs/TEMPLATE.md) to state the adopted design in source-linked, project-authored language. Group criteria by applicable design topic, use the official Expressive name for a mapped component, and keep project decisions separate. Preserve whether Material requires, recommends, or permits a behavior; do not copy upstream passages or expand every state combination into a matrix. Give a stable lowercase dotted ID to criteria with an automated test, and reference that ID in the owning test's title or a nearby comment.
3. **Design the Vue API on its own merits.** Use Vue and native Web conventions and the project's existing architecture. Shared private helpers are not public components merely because they have source files. Comparison libraries may reveal options, but do not determine component scope, public names, props, events, or selection behavior.
4. **Implement and document current behavior.** Keep source files and [`registry/registry.json`](../registry/registry.json) aligned. The public `apps/docs` pages describe the current API and examples; update them when implementation facts change and keep the English/Chinese pair aligned.
5. **Verify implementation separately.** Use focused unit/browser checks and consumer build checks appropriate to the change. Tests may reference design criterion IDs.

## Keeping design guidance stable

A design guide describes the intended project design even when current code differs. When they disagree, retain the guide as the target and track the implementation gap with its code or verification work. Change the guide only when the applicable Material 3 Expressive source changes or the project deliberately changes its own design decision.

Link to canonical sources instead of recording inspection dates, fixed comparison-library commits, detailed histories, or volatile implementation status. Cite a specific external revision only when a project decision depends on that exact observation.
