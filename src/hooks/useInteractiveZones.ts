import { useState, useCallback, useEffect } from 'react'

export type ZonePoint = {
  /** Fraction of viewport width/height: 0–1 */
  x: number
  y: number
}

export type ZonePolygon = ZonePoint[]

export type InteractiveZone = {
  id: string
  label: string
  dialog?: string
  transitionTo?: string
  targetPos?: [number, number, number]
  polygon: ZonePolygon
}

const STORAGE_KEY_PREFIX = 'scavender_interactive_zones_'

const DEFAULT_ZONES: InteractiveZone[] = []

function load(levelId: string): InteractiveZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + levelId)
    if (raw) return JSON.parse(raw) as InteractiveZone[]
  } catch {
    // ignore
  }
  return DEFAULT_ZONES.map(z => ({ ...z, polygon: [...z.polygon] }))
}

function save(levelId: string, zones: InteractiveZone[]) {
  localStorage.setItem(STORAGE_KEY_PREFIX + levelId, JSON.stringify(zones))
}

let nextIdCounter = Date.now()
let nextLabelNum = 1

export function useInteractiveZones(levelId: string = 'global') {
  const [zones, setZonesState] = useState<InteractiveZone[]>(() => load(levelId))

  useEffect(() => {
    setZonesState(load(levelId))
  }, [levelId])
  
  const setZones = useCallback(
    (next: InteractiveZone[] | ((prev: InteractiveZone[]) => InteractiveZone[])) => {
      setZonesState(prev => {
        const resolved = typeof next === 'function' ? next(prev) : next
        save(levelId, resolved)
        return resolved
      })
    },
    [levelId]
  )

  const addZone = useCallback(() => {
    const id = `zone-${++nextIdCounter}`
    const label = `Zone ${nextLabelNum++}`
    const newZone: InteractiveZone = {
      id,
      label,
      polygon: [
        { x: 0.4, y: 0.4 },
        { x: 0.6, y: 0.4 },
        { x: 0.6, y: 0.6 },
        { x: 0.4, y: 0.6 },
      ],
      targetPos: [0, 0, 10],
    }
    setZones(prev => [...prev, newZone])
    return id
  }, [setZones])

  const removeZone = useCallback(
    (id: string) => {
      setZones(prev => prev.filter(z => z.id !== id))
    },
    [setZones]
  )

  const updateZone = useCallback(
    (id: string, patch: Partial<Omit<InteractiveZone, 'id'>>) => {
      setZones(prev =>
        prev.map(z => (z.id === id ? { ...z, ...patch } : z))
      )
    },
    [setZones]
  )

  const resetZones = useCallback(() => {
    const fresh = DEFAULT_ZONES.map(z => ({ ...z, polygon: [...z.polygon] }))
    save(levelId, fresh)
    setZonesState(fresh)
  }, [levelId])

  return { zones, setZones, addZone, removeZone, updateZone, resetZones }
}
