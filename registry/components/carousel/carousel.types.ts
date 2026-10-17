export type CarouselLayout =
  | 'multi-browse'
  | 'uncontained'
  | 'uncontained-multi-aspect-ratio'
  | 'hero'
  | 'center-aligned-hero'
  | 'full-screen'

export type CarouselLength = string | number

export interface CarouselItem {
  key: string | number
  label: string
  href?: string
  actionable?: boolean
  disabled?: boolean
  image?: string
  /** A ratio such as `16:9`, used by the uncontained multi-aspect layout. */
  aspectRatio?: string
}

export interface CarouselItemSlotProps<T extends CarouselItem = CarouselItem> {
  item: T
  index: number
  sizeRole: 'large' | 'medium' | 'small'
}
