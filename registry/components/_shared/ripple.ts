import type { ObjectDirective } from 'vue'

function transitionDurationMs(element: HTMLElement) {
  return Math.max(
    ...window
      .getComputedStyle(element)
      .transitionDuration.split(',')
      .map((value) => {
        const duration = Number.parseFloat(value)
        return value.trim().endsWith('ms') ? duration : duration * 1000
      }),
  )
}

interface RippleWave {
  element: HTMLSpanElement
  frame: number
  removeTimer?: number
  minimumTimer?: number
  startedAt: number
  released: boolean
  visible: boolean
}

export const vRipple: ObjectDirective<HTMLElement> = {
  mounted(host) {
    const waves = new Map<string, RippleWave>()
    const container = document.createElement('span')
    container.className = 'yam3x-ripple-container'
    container.setAttribute('aria-hidden', 'true')
    const containerTarget = host.dataset.yam3xRippleContainerTarget
      ? host.querySelector<HTMLElement>(host.dataset.yam3xRippleContainerTarget)
      : null
    ;(containerTarget ?? host).append(container)

    const finishRelease = (key: string) => {
      const wave = waves.get(key)
      if (!wave) return

      wave.released = true
      host.toggleAttribute(
        'data-yam3x-pressed',
        [...waves.values()].some((value) => !value.released),
      )
      if (wave.visible) {
        if (wave.removeTimer !== undefined) return
        wave.element.classList.add('yam3x-ripple--exiting')
        wave.removeTimer = window.setTimeout(
          () => {
            wave.element.remove()
            waves.delete(key)
          },
          transitionDurationMs(wave.element) + 34,
        )
      }
    }

    const release = (key: string) => {
      const wave = waves.get(key)
      if (!wave || wave.released || wave.minimumTimer !== undefined) return
      const minimumDuration = Number(host.dataset.yam3xRippleMinPressedDuration) || 0
      const remaining = minimumDuration - (performance.now() - wave.startedAt)
      if (remaining > 0) {
        wave.minimumTimer = window.setTimeout(() => {
          wave.minimumTimer = undefined
          finishRelease(key)
        }, remaining)
        return
      }
      finishRelease(key)
    }

    const start = (key: string, clientX: number, clientY: number): boolean => {
      if (
        !(host.classList.contains('yam3x-state-layer') || host.hasAttribute('data-yam3x-ripple')) ||
        host.matches(':disabled, [aria-disabled="true"]')
      )
        return false
      const previous = waves.get(key)
      if (previous && !previous.released) return true
      if (previous) {
        window.cancelAnimationFrame(previous.frame)
        if (previous.removeTimer !== undefined) window.clearTimeout(previous.removeTimer)
        previous.element.remove()
        waves.delete(key)
      }

      const targetSelector = host.dataset.yam3xRippleTarget
      const target = targetSelector ? host.querySelector<HTMLElement>(targetSelector) : host
      const bounds = (target ?? host).getBoundingClientRect()
      const x = Math.max(0, Math.min(bounds.width, clientX - bounds.left))
      const y = Math.max(0, Math.min(bounds.height, clientY - bounds.top))
      const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y))
      const diameter = radius * 2
      const element = document.createElement('span')
      element.className = 'yam3x-ripple'
      element.setAttribute('aria-hidden', 'true')
      element.style.width = `${diameter}px`
      element.style.height = `${diameter}px`
      element.style.left = `${x - radius}px`
      element.style.top = `${y - radius}px`
      container.append(element)
      // Commit the scale(0) state before the next frame applies the visible class.
      void element.getBoundingClientRect()
      host.setAttribute('data-yam3x-pressed', '')

      const wave: RippleWave = {
        element,
        frame: 0,
        startedAt: performance.now(),
        released: false,
        visible: false,
      }
      waves.set(key, wave)
      wave.frame = window.requestAnimationFrame(() => {
        wave.visible = true
        element.classList.add('yam3x-ripple--visible')
        if (wave.released) finishRelease(key)
      })
      return true
    }

    const pointerKeys = new Map<number, string>()
    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
      const key = `pointer:${event.pointerId}`
      if (!start(key, event.clientX, event.clientY)) return
      pointerKeys.set(event.pointerId, key)
      syncGlobalListeners()
    }
    const onPointerEnd = (event: PointerEvent) => {
      const key = pointerKeys.get(event.pointerId)
      if (!key) return
      pointerKeys.delete(event.pointerId)
      release(key)
      syncGlobalListeners()
    }

    const pressedKeys = new Set<string>()
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key !== ' ' && event.key !== 'Enter') ||
        event.repeat ||
        pressedKeys.has(event.key)
      )
        return
      const isSpaceControl =
        host.dataset.yam3xRippleRole === 'checkbox' || host.dataset.yam3xRippleRole === 'radio'
      const isButton =
        host instanceof HTMLButtonElement ||
        host.getAttribute('role') === 'button' ||
        host.dataset.yam3xRippleRole === 'button'
      const isLink = host instanceof HTMLAnchorElement && host.hasAttribute('href')
      if (
        isSpaceControl
          ? event.key !== ' '
          : (event.key === ' ' && !isButton) || (event.key === 'Enter' && !isButton && !isLink)
      )
        return
      const bounds =
        (host.dataset.yam3xRippleTarget
          ? host.querySelector<HTMLElement>(host.dataset.yam3xRippleTarget)
          : host
        )?.getBoundingClientRect() ?? host.getBoundingClientRect()
      if (
        !start(`key:${event.key}`, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
      )
        return
      pressedKeys.add(event.key)
      syncGlobalListeners()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (!pressedKeys.delete(event.key)) return
      release(`key:${event.key}`)
      syncGlobalListeners()
    }

    const releaseAll = () => {
      pointerKeys.clear()
      pressedKeys.clear()
      for (const key of waves.keys()) release(key)
      syncGlobalListeners()
    }

    let trackingGlobally = false
    const syncGlobalListeners = () => {
      const shouldTrack = pointerKeys.size > 0 || pressedKeys.size > 0
      if (trackingGlobally === shouldTrack) return
      trackingGlobally = shouldTrack
      if (shouldTrack) {
        window.addEventListener('pointerup', onPointerEnd)
        window.addEventListener('pointercancel', onPointerEnd)
        window.addEventListener('keyup', onKeyUp)
        window.addEventListener('blur', releaseAll)
      } else {
        window.removeEventListener('pointerup', onPointerEnd)
        window.removeEventListener('pointercancel', onPointerEnd)
        window.removeEventListener('keyup', onKeyUp)
        window.removeEventListener('blur', releaseAll)
      }
    }

    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('keydown', onKeyDown)
    host.addEventListener('blur', releaseAll)

    ;(host as HTMLElement & { __m3RippleCleanup?: () => void }).__m3RippleCleanup = () => {
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('keydown', onKeyDown)
      pointerKeys.clear()
      pressedKeys.clear()
      syncGlobalListeners()
      host.removeEventListener('blur', releaseAll)
      for (const wave of waves.values()) {
        window.cancelAnimationFrame(wave.frame)
        if (wave.removeTimer !== undefined) window.clearTimeout(wave.removeTimer)
        if (wave.minimumTimer !== undefined) window.clearTimeout(wave.minimumTimer)
        wave.element.remove()
      }
      waves.clear()
      container.remove()
      host.removeAttribute('data-yam3x-pressed')
    }
  },

  unmounted(host) {
    ;(host as HTMLElement & { __m3RippleCleanup?: () => void }).__m3RippleCleanup?.()
    delete (host as HTMLElement & { __m3RippleCleanup?: () => void }).__m3RippleCleanup
  },
}
