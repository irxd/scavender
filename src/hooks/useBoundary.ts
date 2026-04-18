import { useState, useCallback, useEffect } from 'react'

export type BoundaryPoint = {
  /** Fraction of viewport width/height: 0–1 */
  x: number
  y: number
}
export type BoundaryPolygon = BoundaryPoint[]

const STORAGE_KEY_PREFIX = 'scavender_boundary_poly_'

const DEFAULT_BOUNDARY: BoundaryPolygon = [
  { x: 0.4, y: 0.4 },
  { x: 0.6, y: 0.4 },
  { x: 0.6, y: 0.6 },
  { x: 0.4, y: 0.6 },
]

function load(levelId: string): BoundaryPolygon {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + levelId)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Filter out any nulls or invalid points
        const valid = parsed.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number')
        if (valid.length >= 3) return valid
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_BOUNDARY]
}

function save(levelId: string, b: BoundaryPolygon) {
  localStorage.setItem(STORAGE_KEY_PREFIX + levelId, JSON.stringify(b))
}

export function useBoundary(levelId: string = 'global', initialBoundary?: BoundaryPolygon) {
  const [boundary, setBoundaryState] = useState<BoundaryPolygon>(() => {
    const saved = load(levelId)
    // If we have stage-specific hardcoded boundary and NO saved data (or it matches default), use hardcoded
    if (initialBoundary && (JSON.stringify(saved) === JSON.stringify(DEFAULT_BOUNDARY))) {
      return initialBoundary
    }
    return saved
  })

  useEffect(() => {
    const saved = load(levelId)
    if (initialBoundary && (JSON.stringify(saved) === JSON.stringify(DEFAULT_BOUNDARY))) {
       setBoundaryState(initialBoundary)
    } else {
       setBoundaryState(saved)
    }
  }, [levelId, initialBoundary])

  const setBoundary = useCallback((next: BoundaryPolygon | ((prev: BoundaryPolygon) => BoundaryPolygon)) => {
    setBoundaryState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      save(levelId, resolved)
      return resolved
    })
  }, [levelId])

  const reset = useCallback(() => {
    const target = initialBoundary || DEFAULT_BOUNDARY
    save(levelId, target)
    setBoundaryState([...target])
  }, [levelId, initialBoundary])

  return { boundary, setBoundary, reset }
}
