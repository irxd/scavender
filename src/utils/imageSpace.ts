import { useState, useEffect } from 'react'

/**
 * The rendered rect of a background image inside the viewport.
 * offsetX/offsetY can be negative (image extends beyond viewport edge in cover mode)
 * or positive (image has letterbox bars in contain mode).
 */
export interface ImageRect {
  renderW: number
  renderH: number
  offsetX: number
  offsetY: number
}

/**
 * Compute the rendered rect for object-fit: cover.
 * Image fills the viewport; the dimension that would overflow is cropped (offset goes negative).
 */
export function getCoverRect(
  viewW: number,
  viewH: number,
  imgW: number,
  imgH: number
): ImageRect {
  const viewAspect = viewW / viewH
  const imgAspect = imgW / imgH

  let renderW: number, renderH: number, offsetX: number, offsetY: number

  if (imgAspect > viewAspect) {
    // Image is wider than viewport — scale to fit height, crop width
    renderH = viewH
    renderW = viewH * imgAspect
    offsetX = (viewW - renderW) / 2 // negative: left edge is off-screen
    offsetY = 0
  } else {
    // Image is taller than viewport — scale to fit width, crop height
    renderW = viewW
    renderH = viewW / imgAspect
    offsetX = 0
    offsetY = (viewH - renderH) / 2 // negative: top edge is off-screen
  }

  return { renderW, renderH, offsetX, offsetY }
}

/**
 * Compute the rendered rect for object-fit: contain.
 * Image fits entirely inside the viewport; letterbox bars fill the remaining space (offset positive).
 */
export function getContainRect(
  viewW: number,
  viewH: number,
  imgW: number,
  imgH: number
): ImageRect {
  const viewAspect = viewW / viewH
  const imgAspect = imgW / imgH

  let renderW: number, renderH: number, offsetX: number, offsetY: number

  if (imgAspect > viewAspect) {
    // Image wider — scale to fit width, letterbox top/bottom
    renderW = viewW
    renderH = viewW / imgAspect
    offsetX = 0
    offsetY = (viewH - renderH) / 2 // positive: top/bottom bars
  } else {
    // Image taller — scale to fit height, letterbox left/right
    renderH = viewH
    renderW = viewH * imgAspect
    offsetX = (viewW - renderW) / 2 // positive: left/right bars
    offsetY = 0
  }

  return { renderW, renderH, offsetX, offsetY }
}

/**
 * Get the appropriate image rect for the current viewport and image.
 * Uses cover for landscape (viewport wider than image is tall relative to wide),
 * and contain for portrait (narrow viewport, e.g. mobile).
 */
export function getImageRect(
  viewW: number,
  viewH: number,
  imgW: number,
  imgH: number
): ImageRect {
  const viewAspect = viewW / viewH
  // If the viewport is portrait (taller than wide), use contain so the full
  // image is visible. Otherwise use cover (standard desktop behavior).
  if (viewAspect < 1) {
    return getContainRect(viewW, viewH, imgW, imgH)
  }
  return getCoverRect(viewW, viewH, imgW, imgH)
}

/**
 * Convert image-space coordinates (0–1, relative to image natural size) →
 * viewport pixel position.
 */
export function imageToViewport(
  ix: number,
  iy: number,
  rect: ImageRect
): { x: number; y: number } {
  return {
    x: rect.offsetX + ix * rect.renderW,
    y: rect.offsetY + iy * rect.renderH,
  }
}

/**
 * Convert viewport pixel position → image-space coordinates (0–1).
 * Returns values outside [0,1] if the point is in a letterbox bar.
 */
export function viewportToImage(
  vx: number,
  vy: number,
  rect: ImageRect
): { x: number; y: number } {
  return {
    x: (vx - rect.offsetX) / rect.renderW,
    y: (vy - rect.offsetY) / rect.renderH,
  }
}

/**
 * React hook that returns the current ImageRect and updates whenever the
 * window is resized.
 */
export function useImageRect(imgW: number, imgH: number): ImageRect {
  const getRect = () =>
    getImageRect(window.innerWidth, window.innerHeight, imgW, imgH)

  const [rect, setRect] = useState<ImageRect>(getRect)

  useEffect(() => {
    const onResize = () => setRect(getRect())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [imgW, imgH])

  return rect
}
