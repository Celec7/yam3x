let activeLocks = 0
let savedOverflow: { body: string; root: string } | undefined
let savedPaddingRight: string | undefined
const classCounts = new Map<string, number>()

export function acquirePageScrollLock(className?: string): () => void {
  if (typeof document === 'undefined') return () => {}

  const root = document.documentElement
  const body = document.body
  if (activeLocks === 0) {
    savedOverflow = { body: body.style.overflow, root: root.style.overflow }
    savedPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - root.clientWidth
    if (scrollbarWidth > 0 && scrollbarWidth < 64) {
      const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
  }
  activeLocks += 1

  if (className) {
    const count = classCounts.get(className) ?? 0
    if (count === 0) root.classList.add(className)
    classCounts.set(className, count + 1)
  }

  let released = false
  return () => {
    if (released) return
    released = true

    if (className) {
      const count = classCounts.get(className) ?? 0
      if (count <= 1) {
        classCounts.delete(className)
        root.classList.remove(className)
      } else {
        classCounts.set(className, count - 1)
      }
    }

    activeLocks -= 1
    if (activeLocks === 0 && savedOverflow) {
      body.style.overflow = savedOverflow.body
      root.style.overflow = savedOverflow.root
      body.style.paddingRight = savedPaddingRight ?? ''
      savedOverflow = undefined
      savedPaddingRight = undefined
    }
  }
}
