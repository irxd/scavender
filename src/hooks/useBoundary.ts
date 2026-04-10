import { useState, useCallback } from 'react'

export type BoundaryPoint = {
  /** Fraction of viewport width/height: 0–1 */
  x: number
  y: number
}
export type BoundaryPolygon = BoundaryPoint[]

const STORAGE_KEY = 'scavender_boundary_poly'

const DEFAULT_BOUNDARY: BoundaryPolygon = [
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.1 },
  { x: 0.9, y: 0.9 },
  { x: 0.1, y: 0.9 },
]

function load(): BoundaryPolygon {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as BoundaryPolygon
  } catch {
    // ignore
  }
  return [...DEFAULT_BOUNDARY]
}

function save(b: BoundaryPolygon) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
}

export function useBoundary() {
  const [boundary, setBoundaryState] = useState<BoundaryPolygon>(load)

  const setBoundary = useCallback((next: BoundaryPolygon | ((prev: BoundaryPolygon) => BoundaryPolygon)) => {
    setBoundaryState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      save(resolved)
      return resolved
    })
  }, [])

  const reset = useCallback(() => {
    save(DEFAULT_BOUNDARY)
    setBoundaryState([...DEFAULT_BOUNDARY])
  }, [])

  return { boundary, setBoundary, reset }
}
