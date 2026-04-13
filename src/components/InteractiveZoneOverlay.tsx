import { useEffect, useState, useMemo } from 'react'
import type { InteractiveZone } from '../hooks/useInteractiveZones'
import { useInventoryStore } from '../store/useInventoryStore'

interface InteractiveZoneOverlayProps {
  zones: InteractiveZone[]
  /** Called with zoneId when entering a zone, null when leaving */
  onHoverChange: (zoneId: string | null) => void
  /** Called when a zone is clicked */
  onZoneClick: (zone: InteractiveZone) => void
  /** When true (editor open), disable click-to-dialog */
  editorOpen?: boolean
  /** Toggle hint dots */
  hintsEnabled?: boolean
}

/** Point-in-polygon (ray casting) on [0,1] viewport fractions */
function isPointInPolygon(px: number, py: number, polygon: { x: number; y: number }[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    const intersect = (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function InteractiveZoneOverlay({
  zones,
  onHoverChange,
  onZoneClick,
  editorOpen = false,
  hintsEnabled = true,
}: InteractiveZoneOverlayProps) {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)
  const { hasItem, obtainedItems } = useInventoryStore()

  useEffect(() => {
    let currentHit: string | null = null

    const checkHit = (clientX: number, clientY: number) => {
      const fx = clientX / window.innerWidth
      const fy = clientY / window.innerHeight

      let hit: string | null = null
      for (const zone of zones) {
        if (isPointInPolygon(fx, fy, zone.polygon)) {
          hit = zone.id
          break
        }
      }

      if (hit !== currentHit) {
        currentHit = hit
        setHoveredZoneId(hit)
        onHoverChange(hit)
      }
    }

    const onMove = (e: MouseEvent) => {
      if (editorOpen) return
      checkHit(e.clientX, e.clientY)
    }

    const onClick = (e: MouseEvent) => {
      if (editorOpen) return
      const fx = e.clientX / window.innerWidth
      const fy = e.clientY / window.innerHeight

      for (const zone of zones) {
        if (isPointInPolygon(fx, fy, zone.polygon)) {
          onZoneClick(zone)
          break
        }
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      // Ensure cursor is reset when zones change or unmount
      onHoverChange(null)
    }
  }, [zones, onHoverChange, onZoneClick, editorOpen])

  const zoneCentroids = useMemo(() => {
    return zones.map(zone => {
      const n = zone.polygon.length
      if (n === 0) return { id: zone.id, x: 0, y: 0, status: 'default', hasItems: false }
      
      const sum = zone.polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
      
      // Calculate status for color
      const hasReq = zone.requiredItems && zone.requiredItems.length > 0
      const reqMet = hasReq && zone.requiredItems!.every(id => hasItem(id))
      const hasItems = zone.items && zone.items.length > 0
      const itemsFullyObtained = hasItems && zone.items!.every(id => hasItem(id))
      
      let status = 'default'
      if (hasReq && !reqMet) {
        status = 'locked'
      } else if (hasReq && reqMet && hasItems && !itemsFullyObtained) {
        status = 'unlocked'
      }

      return {
        id: zone.id,
        x: (sum.x / n) * 100,
        y: (sum.y / n) * 100,
        status,
        hasItems: hasItems && !itemsFullyObtained // Only glow if there are items LEFT to get
      }
    })
  }, [zones, hasItem, obtainedItems])

  if (editorOpen) return null

  return (
    <div id="interactive-dots-layer" style={{ 
      position: 'absolute', 
      inset: 0, 
      pointerEvents: 'none', 
      zIndex: 5,
      opacity: hintsEnabled ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {zoneCentroids.map(centroid => (
        <div
          key={centroid.id}
          className={`interactive-dot ${centroid.status} ${centroid.hasItems ? 'has-items' : ''} ${hoveredZoneId === centroid.id ? 'hidden' : ''}`}
          style={{
            left: `${centroid.x}%`,
            top: `${centroid.y}%`,
          }}
        />
      ))}
    </div>
  )
}
