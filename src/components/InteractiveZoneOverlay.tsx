import { useEffect } from 'react'
import type { InteractiveZone } from '../hooks/useInteractiveZones'

interface InteractiveZoneOverlayProps {
  zones: InteractiveZone[]
  /** Called with zoneId when entering a zone, null when leaving */
  onHoverChange: (zoneId: string | null) => void
  /** Called when a zone is clicked */
  onZoneClick: (zone: InteractiveZone) => void
  /** When true (editor open), disable click-to-dialog */
  editorOpen?: boolean
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
}: InteractiveZoneOverlayProps) {
  useEffect(() => {
    let currentHit: string | null = null

    const onMove = (e: MouseEvent) => {
      const fx = e.clientX / window.innerWidth
      const fy = e.clientY / window.innerHeight

      let hit: string | null = null
      for (const zone of zones) {
        if (isPointInPolygon(fx, fy, zone.polygon)) {
          hit = zone.id
          break
        }
      }

      if (hit !== currentHit) {
        currentHit = hit
        onHoverChange(hit)
      }
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
    }
  }, [zones, onHoverChange, onZoneClick, editorOpen])

  return null
}
