<script setup>
import GestureExample from '../../../components/demos/GestureExample.vue'
</script>

# 手势与交互

手势基础层将 Pointer Events 归一化，并提供可组合的识别器、竞争仲裁和 Vue 生命周期绑定。原始手势不会替代按钮、链接的键盘语义，也不会全局阻止滚动；需要拖动时由调用方设置合适的 `touch-action`。

<GestureExample />

<<< ../../../components/demos/GestureExample.vue

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

相关状态层、动效与触控尺寸见[基础总览](/zh/guide/foundations/)。

## 指针能力变量

复制的基础样式表会通过 CSS 媒体查询设置只读的能力标志：

- `--yam3x-pointer-fine`、`--yam3x-pointer-coarse`、`--yam3x-pointer-none`
- `--yam3x-any-pointer-fine`、`--yam3x-any-pointer-coarse`、`--yam3x-any-pointer-none`
- `--yam3x-hover`、`--yam3x-any-hover`

每个标志的值为 `0` 或 `1`。布局尺寸应使用主指针标志，避免混合设备在存在其他指针时反复改变尺寸；只有当某项能力存在时功能就应可用时，才使用 `any-*` 标志。简单规则优先直接使用媒体查询；需要在间距计算中组合条件时再使用这些标志。

这些标志描述设备能力，不描述当前正在使用的输入方式。仅悬停可用的外观应放在 `@media (hover: hover) and (pointer: fine)` 中，且不要在指针移动时改变布局。

## Material 参考

[动效概览](https://m3.material.io/styles/motion/overview) · [交互状态](https://m3.material.io/styles/interaction-states/overview)
