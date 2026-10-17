# Avatars: project extension guide

## Scope

Material 3 does not define a standalone Avatar component or an avatar-specific visual contract. This project extension presents a person or entity with a concise identity cue.

## Design target

- Material color roles define `container` as a fill for foreground elements and pair it with the corresponding `on` role for text or icons. Keep these pairings intact so dynamic color and contrast changes remain supported. See [Color roles: general concepts and pairing](https://m3.material.io/styles/color/roles).
- Use Material's shape and typography foundations as visual references. The [full corner token](https://m3.material.io/styles/shape/corner-radius-scale) produces a fully rounded corner, and [typography roles](https://m3.material.io/styles/typography/applying-type) provide a shared type scale. Material does not map those roles to an Avatar or specify Avatar dimensions.

## Project decisions

- Project-defined extension: An Avatar may use an image, initials, or an icon as its identity cue because Material does not prescribe an Avatar component.
- Project-defined visual mapping: Use the full system corner, `primary-container` with `on-primary-container`, and `title-medium` for initials. These are coherent shared tokens selected for this extension; they are not official Avatar component tokens.
- Project-defined default size: Use a 40px square box as a compact identity marker. Consumers may intentionally override its size and appearance.
- Project-defined: Crop identity images consistently while keeping the subject recognizable; use legible text and sufficient contrast for initials, and do not rely on color alone to identify a person or state.
- `avatar.extension.accessible-name` (project-defined): Give an informative Avatar an accessible name; treat it as decorative when nearby text already supplies the same identity, avoiding a duplicate announcement.
- Project-defined: Keep shape and sizing coherent within a context. Add a badge or motion only when it has a clear meaning supplied by the surrounding design.
