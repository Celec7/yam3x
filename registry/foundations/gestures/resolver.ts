import type { GestureDisposition, GestureRecognizer } from './types'

type Stream = {
  acceptors: GestureRecognizer[]
  holders: Set<GestureRecognizer>
  deferrers: Set<GestureRecognizer>
  stale: boolean
  timeout?: ReturnType<typeof setTimeout>
}

export class GestureResolver {
  #recognizers = new Set<GestureRecognizer>()
  #streams = new Map<number, Stream>()
  #dispatching = new Map<number, number>()

  add(recognizer: GestureRecognizer): void {
    if (this.#recognizers.has(recognizer)) return
    this.#recognizers.add(recognizer)
    recognizer.reset()
    recognizer.onDisposition = (inputId, disposition) =>
      this.#report(recognizer, inputId, disposition)
  }

  remove(recognizer: GestureRecognizer): void {
    if (!this.#recognizers.delete(recognizer)) return
    recognizer.onDisposition = undefined
    recognizer.reset()
    for (const [inputId, stream] of this.#streams) {
      stream.acceptors = stream.acceptors.filter((x) => x !== recognizer)
      stream.holders.delete(recognizer)
      stream.deferrers.delete(recognizer)
      if (!stream.acceptors.length && !stream.holders.size && !stream.deferrers.size) {
        clearTimeout(stream.timeout)
        this.#streams.delete(inputId)
      } else this.#resolve(inputId)
    }
  }

  dispatch(inputId: number, callback: (recognizer: GestureRecognizer) => void): void {
    this.#dispatching.set(inputId, (this.#dispatching.get(inputId) ?? 0) + 1)
    try {
      for (const recognizer of [...this.#recognizers]) callback(recognizer)
    } finally {
      const depth = (this.#dispatching.get(inputId) ?? 1) - 1
      if (depth > 0) this.#dispatching.set(inputId, depth)
      else this.#dispatching.delete(inputId)
    }
  }

  resolve(inputId: number): void {
    this.#resolve(inputId, true)
  }

  clear(): void {
    for (const stream of this.#streams.values()) clearTimeout(stream.timeout)
    this.#streams.clear()
  }

  destroy(): void {
    for (const recognizer of [...this.#recognizers]) this.remove(recognizer)
    this.clear()
  }

  #report(recognizer: GestureRecognizer, inputId: number, disposition: GestureDisposition): void {
    const stream = this.#streams.get(inputId) ?? {
      acceptors: [],
      holders: new Set(),
      deferrers: new Set(),
      stale: false,
    }
    this.#streams.set(inputId, stream)
    switch (disposition) {
      case 'accept': {
        const releasedHold = stream.holders.delete(recognizer)
        if (!stream.acceptors.includes(recognizer)) {
          if (releasedHold) stream.acceptors.unshift(recognizer)
          else stream.acceptors.push(recognizer)
        }
        stream.deferrers.delete(recognizer)
        if (recognizer.eager || stream.stale) this.#scheduleResolution(inputId, stream)
        break
      }
      case 'reject':
        {
          const held = stream.holders.delete(recognizer)
          stream.acceptors = stream.acceptors.filter((x) => x !== recognizer)
          stream.deferrers.delete(recognizer)
          recognizer.onResolution(inputId, 'reject')
          if (held && !stream.holders.size && stream.acceptors.length) this.#resolve(inputId)
        }
        break
      case 'hold':
        stream.holders.add(recognizer)
        stream.deferrers.delete(recognizer)
        break
      case 'release':
        {
          const released = stream.holders.delete(recognizer)
          stream.deferrers.delete(recognizer)
          if (released && !stream.holders.size && stream.acceptors.length) this.#resolve(inputId)
        }
        break
      case 'defer':
        stream.acceptors = stream.acceptors.filter((x) => x !== recognizer)
        stream.holders.delete(recognizer)
        stream.deferrers.add(recognizer)
        break
    }
    if (!stream.holders.size && !stream.acceptors.length && !stream.deferrers.size) {
      clearTimeout(stream.timeout)
      this.#streams.delete(inputId)
    }
  }

  #resolve(inputId: number, explicit = false): void {
    const stream = this.#streams.get(inputId)
    if (!stream) return
    if (stream.holders.size || !stream.acceptors.length) {
      if (explicit) stream.stale = true
      return
    }
    const eager = stream.acceptors.filter((x) => x.eager)
    const candidates = eager.length ? eager : stream.acceptors
    const winner = candidates.reduce((best, candidate) =>
      candidate.options.priority > best.options.priority ? candidate : best,
    )
    const losers = new Set([...stream.acceptors.filter((x) => x !== winner), ...stream.deferrers])
    clearTimeout(stream.timeout)
    this.#streams.delete(inputId)
    winner.onResolution(inputId, 'accept')
    for (const recognizer of losers) recognizer.onResolution(inputId, 'reject')
  }

  #scheduleResolution(inputId: number, stream: Stream): void {
    clearTimeout(stream.timeout)
    stream.timeout = setTimeout(() => {
      stream.timeout = undefined
      this.#resolve(inputId)
    })
  }
}
