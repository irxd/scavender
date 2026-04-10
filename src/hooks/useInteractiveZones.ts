import { useState, useCallback } from 'react'

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
  polygon: ZonePolygon
}

const STORAGE_KEY = 'scavender_interactive_zones'

const DEFAULT_ZONES: InteractiveZone[] = [
  {
    id: 'zone-1',
    label: 'Zone 1',
    dialog: '',
    polygon: [
      { x: 0.3, y: 0.3 },
      { x: 0.5, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.3, y: 0.5 },
    ],
  },
]

function load(): InteractiveZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as InteractiveZone[]
  } catch {
    // ignore
  }
  return DEFAULT_ZONES.map(z => ({ ...z, polygon: [...z.polygon] }))
}

function save(zones: InteractiveZone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
}

let nextIdCounter = Date.now()
let nextLabelNum = 2 // Zone 1 already exists in defaults

export function useInteractiveZones() {
  const [zones, setZonesState] = useState<InteractiveZone[]>(load)

  const setZones = useCallback(
    (next: InteractiveZone[] | ((prev: InteractiveZone[]) => InteractiveZone[])) => {
      setZonesState(prev => {
        const resolved = typeof next === 'function' ? next(prev) : next
        save(resolved)
        return resolved
      })
    },
    []
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
    save(fresh)
    setZonesState(fresh)
  }, [])

  return { zones, setZones, addZone, removeZone, updateZone, resetZones }
}
