import { useState, useCallback, useEffect } from 'react'

export type BoundaryPoint = {
  /** Fraction of viewport width/height: 0–1 */
  x: number
  y: number
}
export type BoundaryPolygon = BoundaryPoint[]

const STORAGE_KEY_PREFIX = 'scavender_boundary_poly_'

const DEFAULT_BOUNDARY: BoundaryPolygon = [
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.1 },
  { x: 0.9, y: 0.9 },
  { x: 0.1, y: 0.9 },
]

function load(levelId: string): BoundaryPolygon {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + levelId)
    if (raw) return JSON.parse(raw) as BoundaryPolygon
  } catch {
    // ignore
  }
  return [...DEFAULT_BOUNDARY]
}

function save(levelId: string, b: BoundaryPolygon) {
  localStorage.setItem(STORAGE_KEY_PREFIX + levelId, JSON.stringify(b))
}

export function useBoundary(levelId: string = 'global') {
  const [boundary, setBoundaryState] = useState<BoundaryPolygon>(() => load(levelId))

  useEffect(() => {
    setBoundaryState(load(levelId))
  }, [levelId])

  const setBoundary = useCallback((next: BoundaryPolygon | ((prev: BoundaryPolygon) => BoundaryPolygon)) => {
    setBoundaryState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      save(levelId, resolved)
      return resolved
    })
  }, [levelId])

  const reset = useCallback(() => {
    save(levelId, DEFAULT_BOUNDARY)
    setBoundaryState([...DEFAULT_BOUNDARY])
  }, [levelId])

  return { boundary, setBoundary, reset }
}
