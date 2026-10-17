import { hexFromArgb, sourceColorFromImage } from '@material/material-color-utilities'

/** Extract a Material source color from a fully loaded image. */
export async function getColorFromImage(image: HTMLImageElement): Promise<string> {
  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    throw new TypeError('Expected a fully loaded image with non-zero dimensions.')
  }
  return hexFromArgb(await sourceColorFromImage(image))
}
