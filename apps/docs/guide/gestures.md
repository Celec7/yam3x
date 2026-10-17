<script setup>
import GestureExample from '../components/demos/GestureExample.vue'
</script>

# Gestures and interaction

The gesture foundation normalizes Pointer Events and provides composable recognizers, competition arbitration, and Vue lifecycle bindings. Raw gestures do not replace the keyboard semantics of buttons and links, and they do not globally prevent scrolling. When an interaction needs dragging, set an appropriate `touch-action` value in the caller.

<GestureExample />

<<< ../components/demos/GestureExample.vue

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

See [Design foundations](/guide/design) for related state, motion, and touch-target guidance.
