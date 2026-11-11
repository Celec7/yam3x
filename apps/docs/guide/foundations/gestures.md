<script setup>
import GestureExample from '../../components/demos/GestureExample.vue'
</script>

# Gestures and interaction

The gesture foundation normalizes Pointer Events and provides composable recognizers, competition arbitration, and Vue lifecycle bindings. Raw gestures do not replace the keyboard semantics of buttons and links, and they do not globally prevent scrolling. When an interaction needs dragging, set an appropriate `touch-action` value in the caller.

<GestureExample />

<<< ../../components/demos/GestureExample.vue

```ts
import {
  longPress,
  pan,
  repeat,
  rotate,
  scale,
  sequence,
  swipe,
  tap,
  transform,
  useGestures,
} from './lib/yam3x/gestures'

const hold = longPress({ minDuration: 450 })
hold.addListener(({ phase }) => console.log(phase))
useGestures(targetElementRef, hold) // automatically unbound when the scope is disposed or target changes

const drag = pan({ lockAxis: 'auto', minDisplacement: 4 })
drag.addListener(({ phase, totalDeltaX, totalDeltaY }) =>
  console.log(phase, totalDeltaX, totalDeltaY),
)
useGestures(dragTargetRef, drag)

const flick = swipe({ directions: ['left', 'right'], minVelocity: 0.3 })
flick.addListener(({ phase, direction, speed }) => console.log(phase, direction, speed))
useGestures(swipeTargetRef, flick)

const pinch = scale({ pointers: 2 })
const twist = rotate({ pointers: 2 })
const combinedTransform = transform({ pointers: 2 })
useGestures(canvasRef, combinedTransform) // emits translation, scale, and rotation together

const doubleTap = repeat({ count: 2 }, tap())
const pressThenTap = sequence(longPress(), tap())
useGestures(targetElementRef, doubleTap)
useGestures(targetElementRef, pressThenTap)
```

Available recognizers are `tap`, `longPress`, `pan`, `swipe`, `scale`, `rotate`, combined `transform`, `sequence`, and `repeat`.

See [Foundations](/guide/foundations/) for related state, motion, and touch-target guidance.

## Pointer capability variables

The copied foundation stylesheet sets read-only capability flags from CSS media queries:

- `--yam3x-pointer-fine`, `--yam3x-pointer-coarse`, `--yam3x-pointer-none`
- `--yam3x-any-pointer-fine`, `--yam3x-any-pointer-coarse`, `--yam3x-any-pointer-none`
- `--yam3x-hover`, `--yam3x-any-hover`

Each flag is `0` or `1`. Use the primary-pointer flags for layout sizing so hybrid devices do not resize when another pointer is present. Use an `any-*` flag only when a feature should be available whenever that capability exists. Prefer a direct media query for a simple rule; the flags are useful when composing a spacing calculation.

These flags describe device capability, not which input is active. Keep hover-only appearance behind `@media (hover: hover) and (pointer: fine)`, and do not change layout on pointer movement.

## Material references

[Motion overview](https://m3.material.io/styles/motion/overview) · [Interaction states](https://m3.material.io/styles/interaction-states/overview)
