# Carousel: project design guide

## Scope

A carousel presents a scrollable collection of visual items that move partly on and off screen. Material defines six layouts; choose among them for the content and available space. See [Carousel overview](https://m3.material.io/components/carousel/overview).

## Design target

### Layout and content

- The six layouts are Multi-browse, Uncontained, Uncontained multi-aspect ratio, Hero, Center-aligned hero, and Full-screen. Use the [Carousel layout and measurement figures](https://m3.material.io/components/carousel/specs) for each layout's item sizes, padding, spacing, and corner radius.
- Multi-browse shows large, medium, and small items for browsing many visuals. Uncontained keeps items at one size and scrolls to the edge; use the multi-aspect-ratio form when content widths vary. Hero spotlights one large visual with a preview of what follows; Center-aligned hero centers the large item with previews on both sides. Full-screen presents one edge-to-edge, vertically scrolling item for portrait use at compact and medium breakpoints. See [Carousel guidelines](https://m3.material.io/components/carousel/guidelines).
- Items resize within a layout to show what comes next. Small items remain 40–56 dp wide, while large items must remain wide enough for their content to be recognizable. Use the [Carousel measurement figures](https://m3.material.io/components/carousel/specs) for exact sizing.
- Uncontained layouts use ordinary scrolling by default. Multi-browse, Hero, and Full-screen use snap-scrolling to preserve their layout when scrolling ends. See [Carousel guidelines: scrolling](https://m3.material.io/components/carousel/guidelines).
- Keep content primarily visual and labels brief. At compact widths, avoid showing more than three labeled items unless each remains easy to understand; prefer Uncontained for text-heavy content. See [Carousel guidelines: content](https://m3.material.io/components/carousel/guidelines).

### Interaction and accessibility

- On a vertically scrolling page, provide a way to reach every item without horizontal scrolling, such as a page-level “Show all” action. Keep that action outside the carousel. Full-screen carousels are exempt. See [Carousel accessibility: browsing all items](https://m3.material.io/components/carousel/accessibility).
- Give the container a clear label and each item an accessible name that includes its position and the total item count. Focus enters at the first item; Tab or arrow keys move among items; Up or Down leaves a horizontal carousel for adjacent page content. Space or Enter activates an actionable item. See [Carousel accessibility: keyboard navigation and labeling](https://m3.material.io/components/carousel/accessibility).
- Under reduced motion, remove parallax and expanding item sizes, let content reach the window edge, and keep the Hero preview visible. See [Carousel accessibility: reduced motion](https://m3.material.io/components/carousel/accessibility).

## Project decisions

- Project layout ownership: `full-screen` does not inspect viewport orientation or size. The consuming layout must use it only in portrait compact or medium windows; the documentation demo disables it outside that context.
