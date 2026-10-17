<script setup>
import GestureExample from '../../components/demos/GestureExample.vue'
</script>

# 手势与交互

手势基础层将 Pointer Events 归一化，并提供可组合的识别器、竞争仲裁和 Vue 生命周期绑定。原始手势不会替代按钮、链接的键盘语义，也不会全局阻止滚动；需要拖动时由调用方设置合适的 `touch-action`。

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
useGestures(targetElementRef, hold) // scope dispose 或目标替换时自动解绑

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
useGestures(canvasRef, combinedTransform) // translation、scale 和 rotation 合并输出

const doubleTap = repeat({ count: 2 }, tap())
const pressThenTap = sequence(longPress(), tap())
useGestures(targetElementRef, doubleTap)
useGestures(targetElementRef, pressThenTap)
```

目前提供 `tap`、`longPress`、`pan`、`swipe`、`scale`、`rotate`、组合变换 `transform`、`sequence` 和 `repeat`。

相关状态层、动效与触控尺寸见[设计基础](/zh/guide/design)。
