import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import {
  bindGestures,
  longPress,
  normalizePointerEvent,
  pan,
  phase,
  repeat,
  rotate,
  scale,
  sequence,
  swipe,
  tap,
  transform,
  useGestures,
} from '../../../registry/foundations/gestures'
import { GestureRecognizerBase } from '../../../registry/foundations/gestures/recognizer'
import type { GestureDetail } from '../../../registry/foundations/gestures/types'
import type { PointerInput } from '../../../registry/foundations/gestures/input'

class ClaimRecognizer extends GestureRecognizerBase<GestureDetail> {
  accepted = false
  rejected = false

  constructor(priority: number) {
    super({ priority })
    this.options = { priority, buttons: ['primary'], pointerTypes: ['mouse', 'pen', 'touch'] }
  }

  protected override onPointerDown(input: PointerInput): void {
    this.disposition(input.inputId, 'defer')
  }

  protected override onPointerUp(input: PointerInput): void {
    this.disposition(input.inputId, 'accept')
  }

  protected override onAccept(_inputId: number): void {
    this.accepted = true
  }
  protected override onReject(_inputId: number): void {
    this.rejected = true
  }
  reset(): void {
    this.accepted = false
    this.rejected = false
  }
}

class HoldingClaimRecognizer extends ClaimRecognizer {
  protected override onPointerDown(input: PointerInput): void {
    this.disposition(input.inputId, 'hold')
  }
}

class ImmediateClaimRecognizer extends ClaimRecognizer {
  protected override onPointerDown(input: PointerInput): void {
    this.disposition(input.inputId, 'accept')
  }
}

class HoldThenAcceptRecognizer extends ClaimRecognizer {
  protected override onPointerDown(input: PointerInput): void {
    this.disposition(input.inputId, 'hold')
  }

  acceptHeld(inputId: number): void {
    this.disposition(inputId, 'accept')
  }
}

class DelayedClaimRecognizer extends ClaimRecognizer {
  protected override onPointerUp(input: PointerInput): void {
    this.disposition(input.inputId, 'hold')
  }
  acceptHeld(inputId: number): void {
    this.disposition(inputId, 'accept')
  }
}

class EagerClaimRecognizer extends ClaimRecognizer {
  get eager(): boolean {
    return true
  }
}

class RecordingClaimRecognizer extends ClaimRecognizer {
  acceptedInputs: number[] = []
  rejectedInputs: number[] = []

  protected override onAccept(inputId: number): void {
    super.onAccept(inputId)
    this.acceptedInputs.push(inputId)
  }

  protected override onReject(inputId: number): void {
    super.onReject(inputId)
    this.rejectedInputs.push(inputId)
  }

  override reset(): void {
    super.reset()
    this.acceptedInputs = []
    this.rejectedInputs = []
  }
}

function pointer(
  target: Element,
  type: string,
  overrides: Partial<PointerEventInit> & { timeStamp?: number } = {},
) {
  const { timeStamp, ...init } = overrides
  const event = new PointerEvent(type, {
    pointerId: 7,
    pointerType: 'mouse',
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    clientX: 20,
    clientY: 30,
    bubbles: true,
    ...init,
  })
  if (timeStamp !== undefined) Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  target.dispatchEvent(event)
  return event
}

describe('gesture foundations', () => {
  it('normalizes pointer IDs, types, buttons, and target-local coordinates', () => {
    const element = document.createElement('div')
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 12,
      left: 10,
      top: 12,
      right: 110,
      bottom: 112,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    } as DOMRect)
    const event = new PointerEvent('pointermove', {
      pointerId: 42,
      pointerType: 'pen',
      button: 0,
      buttons: 1,
      clientX: 35,
      clientY: 47,
      ctrlKey: true,
    })

    expect(normalizePointerEvent(event, element)).toMatchObject({
      inputId: 42,
      kind: 'pointermove',
      pointerType: 'pen',
      clientX: 35,
      clientY: 47,
      localX: 25,
      localY: 35,
      ctrlKey: true,
      button: 0,
      buttons: 1,
      currentTarget: element,
    })
  })

  it('preserves unknown pointer types so configured filters can reject them', () => {
    const element = document.createElement('div')
    const event = new PointerEvent('pointerdown', { pointerType: '', buttons: 1 })
    const input = normalizePointerEvent(event, element)
    expect(input.pointerType).toBe('')
    expect(tap().canReceiveInput(input)).toBe(false)
  })

  it('suppresses native Safari gesture events and removes those listeners on destroy', () => {
    const element = document.createElement('div')
    const binding = bindGestures(element)
    const start = new Event('gesturestart', { cancelable: true })
    element.dispatchEvent(start)
    expect(start.defaultPrevented).toBe(true)
    binding.destroy()

    const change = new Event('gesturechange', { cancelable: true })
    element.dispatchEvent(change)
    expect(change.defaultPrevented).toBe(false)
  })

  it('recognizes a tap, reports phases and releases pointer capture on completion', () => {
    const element = document.createElement('div')
    document.body.append(element)
    const recognizer = tap()
    const phases: string[] = []
    const details: unknown[] = []
    recognizer.addListener((detail) => {
      phases.push(detail.phase)
      details.push(detail)
    })
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown')
    pointer(element, 'pointerup', { clientX: 21, clientY: 30 })

    expect(phases).toEqual(['start', 'end'])
    expect(details.at(-1)).toMatchObject({
      gestureName: 'tap',
      phase: 'end',
      inputId: [7],
      clientX: 20,
      clientY: 30,
    })
    binding.destroy()
    element.remove()
  })

  it('does not cancel an active multi-pointer gesture after releasing one captured pointer', () => {
    const element = document.createElement('div')
    const captured = new Set<number>()
    Object.defineProperties(element, {
      setPointerCapture: { value: (pointerId: number) => captured.add(pointerId) },
      hasPointerCapture: { value: (pointerId: number) => captured.has(pointerId) },
      releasePointerCapture: { value: (pointerId: number) => captured.delete(pointerId) },
    })
    const recognizer = scale()
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 11, clientX: 0, clientY: 30, timeStamp: 100 })
    pointer(element, 'pointerdown', { pointerId: 12, clientX: 20, clientY: 30, timeStamp: 110 })
    pointer(element, 'pointermove', { pointerId: 12, clientX: 30, clientY: 30, timeStamp: 120 })
    pointer(element, 'pointermove', { pointerId: 12, clientX: 40, clientY: 30, timeStamp: 130 })
    pointer(element, 'pointerup', {
      pointerId: 11,
      clientX: 0,
      clientY: 30,
      buttons: 0,
      timeStamp: 140,
    })
    pointer(element, 'lostpointercapture', { pointerId: 11, buttons: 0, timeStamp: 141 })
    pointer(element, 'pointerup', {
      pointerId: 12,
      clientX: 40,
      clientY: 30,
      buttons: 0,
      timeStamp: 150,
    })

    expect(phases).toEqual(['start', 'update', 'end'])
    expect(captured.size).toBe(0)
    binding.destroy()
  })

  it('resets active recognizers when disabled and filters buttons by the pressed-button bitmask', () => {
    const element = document.createElement('div')
    const recognizer = tap()
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 13 })
    recognizer.disabled = true
    pointer(element, 'pointerup', { pointerId: 13, buttons: 0 })
    expect(phases).toEqual(['start'])

    recognizer.disabled = false
    pointer(element, 'pointerdown', { pointerId: 14, button: 2, buttons: 1 })
    pointer(element, 'pointerup', { pointerId: 14, button: 2, buttons: 0 })
    expect(phases).toEqual(['start', 'start', 'end'])
    binding.destroy()
  })

  it('routes gesture details to phase-specific handlers', () => {
    const calls: string[] = []
    const listener = phase<GestureDetail>({
      onStart: () => calls.push('start'),
      onUpdate: () => calls.push('update'),
      onEnd: () => calls.push('end'),
      onCancel: () => calls.push('cancel'),
    })
    for (const phaseName of ['start', 'update', 'end', 'cancel'] as const) {
      listener({ gestureName: 'sample', phase: phaseName, inputId: 1, timestamp: 10 })
    }
    expect(calls).toEqual(['start', 'update', 'end', 'cancel'])
  })

  it('merges partial option updates and propagates swipe thresholds to its delegated pan recognizer', () => {
    const tapListener = vi.fn()
    const tapRecognizer = tap(tapListener, { maxDuration: 180 })
    expect(tapRecognizer.options.maxDuration).toBe(180)
    tapRecognizer.options = { maxDisplacement: 20 }
    expect(tapRecognizer.options).toMatchObject({
      maxDisplacement: 20,
      maxDuration: 180,
      maxPressInterval: 120,
      maxReleaseInterval: 120,
      pointers: 1,
      buttons: ['primary'],
    })

    const element = document.createElement('div')
    const swipeRecognizer = swipe()
    const phases: string[] = []
    swipeRecognizer.addListener((detail) => phases.push(detail.phase))
    swipeRecognizer.options = { startThreshold: 10 }
    const binding = bindGestures(element, swipeRecognizer)
    pointer(element, 'pointerdown', { pointerId: 15, clientX: 0, timeStamp: 100 })
    pointer(element, 'pointermove', { pointerId: 15, clientX: 6, timeStamp: 110 })
    expect(phases).toEqual([])
    pointer(element, 'pointermove', { pointerId: 15, clientX: 11, timeStamp: 120 })
    expect(phases).toEqual(['start'])
    binding.destroy()
  })

  it('requires all configured tap pointers and enforces the release interval', () => {
    const element = document.createElement('div')
    const recognizer = tap({ pointers: 2, maxPressInterval: 40, maxReleaseInterval: 30 })
    const phases: string[] = []
    const details: GestureDetail[] = []
    recognizer.addListener((detail) => {
      phases.push(detail.phase)
      details.push(detail)
    })
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 25, clientX: 0, clientY: 30, timeStamp: 100 })
    expect(phases).toEqual([])
    pointer(element, 'pointerdown', { pointerId: 26, clientX: 20, clientY: 30, timeStamp: 110 })
    expect(phases).toEqual(['start'])
    pointer(element, 'pointerup', {
      pointerId: 25,
      clientX: 0,
      clientY: 30,
      buttons: 0,
      timeStamp: 120,
    })
    expect(phases).toEqual(['start'])
    pointer(element, 'pointerup', {
      pointerId: 26,
      clientX: 20,
      clientY: 30,
      buttons: 0,
      timeStamp: 160,
    })
    expect(phases).toEqual(['start', 'cancel'])
    expect(details.at(-1)).toMatchObject({ phase: 'cancel', timestamp: 120, duration: 10 })

    pointer(element, 'pointerdown', { pointerId: 27, clientX: 0, clientY: 30, timeStamp: 200 })
    pointer(element, 'pointerdown', { pointerId: 28, clientX: 20, clientY: 30, timeStamp: 260 })
    expect(phases).toEqual(['start', 'cancel'])
    binding.destroy()
  })

  it('cancels when the pointer drifts beyond the threshold or the browser cancels it', () => {
    const element = document.createElement('div')
    const recognizer = tap({ maxDisplacement: 6 })
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown')
    pointer(element, 'pointermove', { clientX: 30 })
    pointer(element, 'pointerup', { clientX: 30 })
    expect(phases).toEqual(['start', 'cancel'])

    pointer(element, 'pointerdown', { pointerId: 8 })
    pointer(element, 'pointercancel', { pointerId: 8, buttons: 0 })
    expect(phases).toEqual(['start', 'cancel', 'start', 'cancel'])
    binding.destroy()
  })

  it('keeps tap cancellation details at the last tracked sample and does not fold in the terminal event', () => {
    const element = document.createElement('div')
    const recognizer = tap()
    const details: GestureDetail[] = []
    recognizer.addListener((detail) => details.push(detail))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { timeStamp: 100, clientX: 20, clientY: 30 })
    pointer(element, 'pointermove', { timeStamp: 140, clientX: 24, clientY: 30 })
    pointer(element, 'pointercancel', { timeStamp: 160, clientX: 80, clientY: 90, buttons: 0 })

    expect(details.map((detail) => detail.phase)).toEqual(['start', 'cancel'])
    expect(details.at(-1)).toMatchObject({ timestamp: 140, duration: 40 })
    binding.destroy()
  })

  it('reports a discrete long-press release from the last tracked pointer sample', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = longPress({ minDuration: 300, discrete: true })
    const details: GestureDetail[] = []
    recognizer.addListener((detail) => details.push(detail))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { timeStamp: 100, clientX: 20, clientY: 30 })
    vi.advanceTimersByTime(300)
    pointer(element, 'pointerup', { timeStamp: 420, clientX: 80, clientY: 90, buttons: 0 })

    expect(details.map((detail) => detail.phase)).toEqual(['start', 'end'])
    expect(details.at(-1)).toMatchObject({ timestamp: 100, duration: 0 })
    binding.destroy()
    vi.useRealTimers()
  })

  it('does not fold a canceled long-press terminal sample into its cancel detail', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = longPress({ minDuration: 300, discrete: true })
    const details: GestureDetail[] = []
    recognizer.addListener((detail) => details.push(detail))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { timeStamp: 100, clientX: 20, clientY: 30 })
    vi.advanceTimersByTime(300)
    pointer(element, 'pointermove', { timeStamp: 350, clientX: 24, clientY: 30 })
    pointer(element, 'pointercancel', { timeStamp: 370, clientX: 80, clientY: 90, buttons: 0 })

    expect(details.map((detail) => detail.phase)).toEqual(['start', 'cancel'])
    expect(details.at(-1)).toMatchObject({ timestamp: 350, duration: 250 })
    binding.destroy()
    vi.useRealTimers()
  })

  it('filters pointer types and primary buttons before recognition', () => {
    const element = document.createElement('div')
    const recognizer = tap({ pointerTypes: ['touch'] })
    const listener = vi.fn()
    recognizer.addListener(listener)
    const binding = bindGestures(element, recognizer)
    pointer(element, 'pointerdown', { pointerType: 'mouse' })
    pointer(element, 'pointerup', { pointerType: 'mouse', buttons: 0 })
    expect(listener).not.toHaveBeenCalled()
    pointer(element, 'pointerdown', { pointerId: 9, pointerType: 'touch', button: 0 })
    pointer(element, 'pointerup', { pointerId: 9, pointerType: 'touch', button: 0, buttons: 0 })
    expect(listener).toHaveBeenCalledTimes(2)
    binding.destroy()
  })

  it('starts a long press after its duration and cancels when movement exceeds its bound', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = longPress({ minDuration: 300, maxDisplacement: 8, discrete: true })
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 10 })
    vi.advanceTimersByTime(300)
    expect(phases).toEqual(['start'])
    pointer(element, 'pointermove', { pointerId: 10, clientX: 29 })
    expect(phases).toEqual(['start', 'cancel'])
    pointer(element, 'pointerup', { pointerId: 10, buttons: 0 })
    expect(phases).toEqual(['start', 'cancel'])

    binding.destroy()
    vi.useRealTimers()
  })

  it('rebinds a Vue target ref and removes listeners when its scope is disposed', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    const target = ref<HTMLElement | undefined>(first)
    const recognizer = tap()
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const scope = effectScope()
    scope.run(() => useGestures(target, recognizer))
    await nextTick()

    pointer(first, 'pointerdown', { pointerId: 21 })
    pointer(first, 'pointerup', { pointerId: 21, buttons: 0 })
    expect(phases).toEqual(['start', 'end'])

    target.value = second
    await nextTick()
    pointer(first, 'pointerdown', { pointerId: 22 })
    pointer(first, 'pointerup', { pointerId: 22, buttons: 0 })
    expect(phases).toEqual(['start', 'end'])

    pointer(second, 'pointerdown', { pointerId: 23 })
    pointer(second, 'pointerup', { pointerId: 23, buttons: 0 })
    expect(phases).toEqual(['start', 'end', 'start', 'end'])
    scope.stop()
    pointer(second, 'pointerdown', { pointerId: 24 })
    pointer(second, 'pointerup', { pointerId: 24, buttons: 0 })
    expect(phases).toEqual(['start', 'end', 'start', 'end'])
  })

  it('completes a continuous long press after the duration without waiting for pointer release', async () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = longPress({ minDuration: 250 })
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)
    pointer(element, 'pointerdown', { pointerId: 29 })
    expect(phases).toEqual(['start'])
    vi.advanceTimersByTime(250)
    vi.runOnlyPendingTimers()
    await Promise.resolve()
    expect(phases).toEqual(['start', 'end'])
    binding.destroy()
    vi.useRealTimers()
  })

  it('completes a multi-pointer long press at the press-interval boundary and resets after a late pointer', async () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = longPress({ pointers: 2, maxPressInterval: 40, minDuration: 100 })
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 31, timeStamp: 100 })
    pointer(element, 'pointerdown', { pointerId: 32, timeStamp: 140 })
    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()
    await Promise.resolve()
    expect(phases).toEqual(['start', 'end'])

    pointer(element, 'pointerdown', { pointerId: 33, timeStamp: 300 })
    pointer(element, 'pointerdown', { pointerId: 34, timeStamp: 341 })
    expect(phases).toEqual(['start', 'end'])

    pointer(element, 'pointerdown', { pointerId: 35, timeStamp: 400 })
    pointer(element, 'pointerdown', { pointerId: 36, timeStamp: 420 })
    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()
    await Promise.resolve()
    expect(phases).toEqual(['start', 'end', 'start', 'end'])

    binding.destroy()
    vi.useRealTimers()
  })

  it('arbitrates competing recognizers by priority after every recognizer sees the terminal event', () => {
    const element = document.createElement('div')
    const low = new ClaimRecognizer(1)
    const high = new ClaimRecognizer(5)
    const binding = bindGestures(element, low, high)
    pointer(element, 'pointerdown')
    pointer(element, 'pointerup', { buttons: 0 })

    expect(high.accepted).toBe(true)
    expect(low.rejected).toBe(true)
    binding.destroy()
  })

  it('prefers eager recognizers and resolves independent pointer streams separately', () => {
    const element = document.createElement('div')
    const eager = new EagerClaimRecognizer(1)
    const higherPriority = new RecordingClaimRecognizer(10)
    const binding = bindGestures(element, eager, higherPriority)
    pointer(element, 'pointerdown', { pointerId: 201 })
    pointer(element, 'pointerup', { pointerId: 201, buttons: 0 })
    expect(eager.accepted).toBe(true)
    expect(higherPriority.rejectedInputs).toEqual([201])
    binding.destroy()

    const first = new RecordingClaimRecognizer(4)
    const second = new RecordingClaimRecognizer(8)
    const concurrent = bindGestures(element, first, second)
    pointer(element, 'pointerdown', { pointerId: 202 })
    pointer(element, 'pointerdown', { pointerId: 203 })
    pointer(element, 'pointerup', { pointerId: 202, buttons: 0 })
    pointer(element, 'pointerup', { pointerId: 203, buttons: 0 })
    expect(second.acceptedInputs).toEqual([202, 203])
    expect(first.rejectedInputs).toEqual([202, 203])
    concurrent.destroy()
  })

  it('gives an equal-priority holder that later accepts the first resolution opportunity', () => {
    const element = document.createElement('div')
    const immediate = new ImmediateClaimRecognizer(1)
    const held = new HoldThenAcceptRecognizer(1)
    const binding = bindGestures(element, immediate, held)

    pointer(element, 'pointerdown', { pointerId: 24 })
    pointer(element, 'pointerup', { pointerId: 24, buttons: 0 })

    expect(held.accepted).toBe(true)
    expect(immediate.rejected).toBe(true)
    binding.destroy()
  })

  it('waits for explicit stream resolution when a non-eager holder accepts mid-stream', () => {
    const element = document.createElement('div')
    const immediate = new ImmediateClaimRecognizer(1)
    const held = new HoldThenAcceptRecognizer(1)
    const binding = bindGestures(element, immediate, held)

    pointer(element, 'pointerdown', { pointerId: 26 })
    pointer(element, 'pointermove', { pointerId: 26 })
    held.acceptHeld(26)

    expect(immediate.accepted).toBe(false)
    expect(immediate.rejected).toBe(false)
    expect(held.accepted).toBe(false)
    expect(held.rejected).toBe(false)

    pointer(element, 'pointerup', { pointerId: 26, buttons: 0 })
    expect(held.accepted).toBe(true)
    expect(immediate.rejected).toBe(true)
    binding.destroy()
  })

  it('does not resolve a held claim before the current input dispatch reaches every recognizer', () => {
    const element = document.createElement('div')
    const held = new HoldingClaimRecognizer(1)
    const higher = new ClaimRecognizer(5)
    const binding = bindGestures(element, held, higher)
    pointer(element, 'pointerdown', { pointerId: 6 })
    pointer(element, 'pointerup', { pointerId: 6, buttons: 0 })
    expect(higher.accepted).toBe(true)
    expect(held.rejected).toBe(true)
    binding.destroy()
  })

  it('retries an explicitly unresolved stream when its delayed holder later accepts', async () => {
    const element = document.createElement('div')
    const delayed = new DelayedClaimRecognizer(1)
    const binding = bindGestures(element, delayed)
    pointer(element, 'pointerdown', { pointerId: 12 })
    pointer(element, 'pointerup', { pointerId: 12, buttons: 0 })
    expect(delayed.accepted).toBe(false)
    delayed.acceptHeld(12)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(delayed.accepted).toBe(true)
    binding.destroy()
  })

  it('emits pan start, update, and end details after crossing the movement threshold', () => {
    const element = document.createElement('div')
    const recognizer = pan({ minDisplacement: 4 })
    const details: Array<{ phase: string; totalDeltaX: number }> = []
    recognizer.addListener((detail) => details.push(detail))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 31, clientX: 10, clientY: 20, timeStamp: 100 })
    pointer(element, 'pointermove', { pointerId: 31, clientX: 13, clientY: 20, timeStamp: 110 })
    expect(details).toHaveLength(0)
    pointer(element, 'pointermove', { pointerId: 31, clientX: 16, clientY: 20, timeStamp: 120 })
    pointer(element, 'pointermove', { pointerId: 31, clientX: 22, clientY: 20, timeStamp: 130 })
    pointer(element, 'pointerup', {
      pointerId: 31,
      clientX: 22,
      clientY: 20,
      buttons: 0,
      timeStamp: 140,
    })

    expect(details.map((detail) => detail.phase)).toEqual(['start', 'update', 'end'])
    expect(details.at(-1)).toMatchObject({ totalDeltaX: 12, totalDeltaY: 0, axis: 'x', speed: 0.6 })
    binding.destroy()
  })

  it('enforces Pan multi-pointer press interval and recovers after a late pointer', () => {
    const element = document.createElement('div')
    const recognizer = pan({ pointers: 2, maxPressInterval: 40, minDisplacement: 0 })
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 51, timeStamp: 100 })
    pointer(element, 'pointerdown', { pointerId: 52, timeStamp: 141 })
    expect(phases).toEqual([])

    pointer(element, 'pointerdown', { pointerId: 53, timeStamp: 200 })
    pointer(element, 'pointerdown', { pointerId: 54, timeStamp: 240 })
    expect(phases).toEqual(['start'])

    binding.destroy()
  })

  it('recognizes fast swipes with allowed direction and cancels disallowed directions', () => {
    const element = document.createElement('div')
    const recognizer = swipe({ directions: ['right'] })
    const details: Array<{
      phase: string
      direction: string
      speed: number
      displacement: number
    }> = []
    recognizer.addListener((detail) => details.push(detail))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 41, clientX: 0, clientY: 30, timeStamp: 200 })
    pointer(element, 'pointermove', { pointerId: 41, clientX: 8, timeStamp: 210 })
    pointer(element, 'pointermove', { pointerId: 41, clientX: 34, timeStamp: 230 })
    pointer(element, 'pointermove', { pointerId: 41, clientX: 40, timeStamp: 240 })
    pointer(element, 'pointerup', { pointerId: 41, clientX: 99, buttons: 0, timeStamp: 250 })
    expect(details.map((detail) => detail.phase)).toEqual(['start', 'update', 'update', 'end'])
    expect(details.at(-1)).toMatchObject({ direction: 'right', speed: 0.6, displacement: 40 })

    pointer(element, 'pointerdown', { pointerId: 42, clientX: 0, clientY: 30, timeStamp: 300 })
    pointer(element, 'pointermove', { pointerId: 42, clientX: -8, timeStamp: 310 })
    pointer(element, 'pointermove', { pointerId: 42, clientX: -34, timeStamp: 330 })
    pointer(element, 'pointermove', { pointerId: 42, clientX: -40, timeStamp: 340 })
    pointer(element, 'pointerup', { pointerId: 42, clientX: -40, buttons: 0, timeStamp: 350 })
    expect(details.at(-1)).toMatchObject({ phase: 'cancel', direction: 'left' })
    binding.destroy()
  })

  it('recognizes two-pointer scale and rotation with a shared transform detail', () => {
    const element = document.createElement('div')
    const scaler = scale()
    const scaleDetails: Array<{
      phase: string
      scale: number
      initialDistance: number
      currentDistance: number
    }> = []
    scaler.addListener((detail) => scaleDetails.push(detail))
    const scaleBinding = bindGestures(element, scaler)
    pointer(element, 'pointerdown', { pointerId: 51, clientX: 0, clientY: 30, timeStamp: 100 })
    pointer(element, 'pointerdown', { pointerId: 52, clientX: 20, clientY: 30, timeStamp: 110 })
    pointer(element, 'pointermove', { pointerId: 52, clientX: 30, clientY: 30, timeStamp: 120 })
    pointer(element, 'pointermove', { pointerId: 52, clientX: 40, clientY: 30, timeStamp: 130 })
    pointer(element, 'pointerup', {
      pointerId: 51,
      clientX: 0,
      clientY: 30,
      buttons: 0,
      timeStamp: 140,
    })
    const phaseCountAfterFirstRelease = scaleDetails.length
    pointer(element, 'pointermove', { pointerId: 52, clientX: 50, clientY: 30, timeStamp: 145 })
    expect(scaleDetails).toHaveLength(phaseCountAfterFirstRelease)
    pointer(element, 'pointerup', {
      pointerId: 52,
      clientX: 40,
      clientY: 30,
      buttons: 0,
      timeStamp: 150,
    })
    expect(scaleDetails.map((detail) => detail.phase)).toEqual(['start', 'update', 'end'])
    expect(scaleDetails[1]).toMatchObject({
      scale: 4 / 3,
      initialDistance: 15,
      currentDistance: 20,
    })
    scaleBinding.destroy()

    const rotator = rotate()
    const rotateDetails: Array<{ phase: string; rotation: number; currentAngle: number }> = []
    rotator.addListener((detail) => rotateDetails.push(detail))
    const rotateBinding = bindGestures(element, rotator)
    pointer(element, 'pointerdown', { pointerId: 61, clientX: 0, clientY: 30, timeStamp: 200 })
    pointer(element, 'pointerdown', { pointerId: 62, clientX: 20, clientY: 30, timeStamp: 210 })
    pointer(element, 'pointermove', { pointerId: 62, clientX: 10, clientY: 50, timeStamp: 220 })
    pointer(element, 'pointermove', { pointerId: 62, clientX: 0, clientY: 50, timeStamp: 230 })
    pointer(element, 'pointerup', {
      pointerId: 61,
      clientX: 0,
      clientY: 30,
      buttons: 0,
      timeStamp: 240,
    })
    pointer(element, 'pointerup', {
      pointerId: 62,
      clientX: 0,
      clientY: 50,
      buttons: 0,
      timeStamp: 250,
    })
    expect(rotateDetails.map((detail) => detail.phase)).toEqual(['start', 'update', 'end'])
    expect(rotateDetails[1]?.rotation).toBeCloseTo(Math.PI / 2 - Math.atan2(20, 10))
    rotateBinding.destroy()

    const transformer = transform()
    const transformDetails: Array<{
      phase: string
      translationX: number
      scale: number
      rotation: number
    }> = []
    transformer.addListener((detail) => transformDetails.push(detail))
    const transformBinding = bindGestures(element, transformer)
    pointer(element, 'pointerdown', { pointerId: 71, clientX: 0, clientY: 30, timeStamp: 300 })
    pointer(element, 'pointerdown', { pointerId: 72, clientX: 20, clientY: 30, timeStamp: 310 })
    pointer(element, 'pointermove', { pointerId: 72, clientX: 30, clientY: 30, timeStamp: 320 })
    pointer(element, 'pointermove', { pointerId: 72, clientX: 40, clientY: 40, timeStamp: 330 })
    expect(transformDetails.at(-1)).toMatchObject({ phase: 'update', translationX: 10 })
    pointer(element, 'pointerup', {
      pointerId: 71,
      clientX: 0,
      clientY: 30,
      buttons: 0,
      timeStamp: 340,
    })
    pointer(element, 'pointerup', {
      pointerId: 72,
      clientX: 40,
      clientY: 40,
      buttons: 0,
      timeStamp: 350,
    })
    expect(transformDetails.at(-1)?.phase).toBe('end')
    transformBinding.destroy()
  })

  it('composes ordered sequences and repeated recognizers and cancels interrupted compositions', async () => {
    const element = document.createElement('div')
    const repeatDetails: Array<{ phase: string; details: readonly unknown[] }> = []
    const repeated = repeat((detail) => repeatDetails.push(detail), { count: 2 }, tap())
    const repeatBinding = bindGestures(element, repeated)
    pointer(element, 'pointerdown', { pointerId: 91 })
    pointer(element, 'pointerup', { pointerId: 91, buttons: 0 })
    expect(repeatDetails.map((detail) => detail.phase)).toEqual(['start'])
    pointer(element, 'pointerdown', { pointerId: 92 })
    pointer(element, 'pointerup', { pointerId: 92, buttons: 0 })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(repeatDetails.map((detail) => detail.phase)).toEqual(['start', 'end'])
    expect(repeatDetails.at(-1)?.details).toHaveLength(2)
    repeatBinding.destroy()

    const sequenceDetails: Array<{ phase: string; details: readonly unknown[] }> = []
    const ordered = sequence((detail) => sequenceDetails.push(detail), tap(), tap())
    const sequenceBinding = bindGestures(element, ordered)
    pointer(element, 'pointerdown', { pointerId: 93 })
    pointer(element, 'pointerup', { pointerId: 93, buttons: 0 })
    expect(sequenceDetails.map((detail) => detail.phase)).toEqual(['start'])
    pointer(element, 'pointerdown', { pointerId: 94 })
    pointer(element, 'pointercancel', { pointerId: 94, buttons: 0 })
    expect(sequenceDetails.map((detail) => detail.phase)).toEqual(['start', 'cancel'])
    sequenceBinding.destroy()

    const completedSequence = sequence(tap(), tap())
    const completedDetails: Array<{ phase: string; details: readonly unknown[] }> = []
    completedSequence.addListener((detail) => completedDetails.push(detail))
    const completedBinding = bindGestures(element, completedSequence)
    pointer(element, 'pointerdown', { pointerId: 95 })
    pointer(element, 'pointerup', { pointerId: 95, buttons: 0 })
    pointer(element, 'pointerdown', { pointerId: 96 })
    pointer(element, 'pointerup', { pointerId: 96, buttons: 0 })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(completedDetails.map((detail) => detail.phase)).toEqual(['start', 'end'])
    expect(completedDetails.at(-1)?.details).toHaveLength(2)
    completedBinding.destroy()
  })

  it('cancels incomplete repeated gestures when the interval expires', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = repeat({ count: 2, maxInterval: 40 }, tap())
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)
    pointer(element, 'pointerdown', { pointerId: 101 })
    pointer(element, 'pointerup', { pointerId: 101, buttons: 0 })
    expect(phases).toEqual(['start'])
    vi.advanceTimersByTime(41)
    expect(phases).toEqual(['start', 'cancel'])
    binding.destroy()
    vi.useRealTimers()
  })

  it('cancels an incomplete sequence at its interval and accepts a fresh sequence afterward', async () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    const recognizer = sequence({ maxInterval: 40 }, tap(), tap())
    const phases: string[] = []
    recognizer.addListener((detail) => phases.push(detail.phase))
    const binding = bindGestures(element, recognizer)

    pointer(element, 'pointerdown', { pointerId: 111 })
    pointer(element, 'pointerup', { pointerId: 111, buttons: 0 })
    expect(phases).toEqual(['start'])
    vi.advanceTimersByTime(40)
    expect(phases).toEqual(['start', 'cancel'])

    pointer(element, 'pointerdown', { pointerId: 112 })
    pointer(element, 'pointerup', { pointerId: 112, buttons: 0 })
    pointer(element, 'pointerdown', { pointerId: 113 })
    pointer(element, 'pointerup', { pointerId: 113, buttons: 0 })
    vi.runOnlyPendingTimers()
    await Promise.resolve()
    expect(phases).toEqual(['start', 'cancel', 'start', 'end'])

    binding.destroy()
    vi.useRealTimers()
  })
})
