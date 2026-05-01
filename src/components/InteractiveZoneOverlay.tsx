import { useEffect, useState, useMemo } from 'react'
import type { InteractiveZone } from '../hooks/useInteractiveZones'
import { useInventoryStore } from '../store/useInventoryStore'
import { viewportToImage, imageToViewport, type ImageRect } from '../utils/imageSpace'

interface InteractiveZoneOverlayProps {
  zones: InteractiveZone[]
  imageRect: ImageRect
  /** Called with zoneId when entering a zone, null when leaving */
  onHoverChange: (zoneId: string | null) => void
  /** Called when a zone is clicked */
  onZoneClick: (zone: InteractiveZone) => void
  /** When true (editor open), disable click-to-dialog */
  editorOpen?: boolean
  /** Toggle hint dots */
  hintsEnabled?: boolean
}

/** Point-in-polygon (ray casting) on image-space [0,1] fractions */
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
  imageRect,
  onHoverChange,
  onZoneClick,
  editorOpen = false,
  hintsEnabled = true,
}: InteractiveZoneOverlayProps) {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)
  const { hasItem, obtainedItems } = useInventoryStore()

  useEffect(() => {
    let currentHit: string | null = null

    const clientToImage = (clientX: number, clientY: number) =>
      viewportToImage(clientX, clientY, imageRect)

    const checkHit = (clientX: number, clientY: number) => {
      const { x: fx, y: fy } = clientToImage(clientX, clientY)

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

    const isOverlayActive = () => {
      return !!document.querySelector(
        '.inventory-overlay-container, .puzzle-overlay-container, .decision-overlay-container, .dialog-container, .item-obtained-overlay-container'
      )
    }

    const onMove = (e: MouseEvent) => {
      if (editorOpen || isOverlayActive()) return
      checkHit(e.clientX, e.clientY)
    }

    const onClick = (e: MouseEvent) => {
      if (editorOpen || isOverlayActive()) return
      const { x: fx, y: fy } = clientToImage(e.clientX, e.clientY)

      for (const zone of zones) {
        if (isPointInPolygon(fx, fy, zone.polygon)) {
          onZoneClick(zone)
          break
        }
      }
    }

    // Touch support — treat first touch as mouse equivalent
    const onTouchMove = (e: TouchEvent) => {
      if (editorOpen || isOverlayActive()) return
      const t = e.touches[0]
      checkHit(t.clientX, t.clientY)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (editorOpen || isOverlayActive()) return
      const t = e.changedTouches[0]
      const { x: fx, y: fy } = clientToImage(t.clientX, t.clientY)

      for (const zone of zones) {
        if (isPointInPolygon(fx, fy, zone.polygon)) {
          e.preventDefault()
          onZoneClick(zone)
          break
        }
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      // Ensure cursor is reset when zones change or unmount
      onHoverChange(null)
    }
  }, [zones, imageRect, onHoverChange, onZoneClick, editorOpen])

  const zoneCentroids = useMemo(() => {
    return zones.map(zone => {
      const n = zone.polygon.length
      if (n === 0) return { id: zone.id, cx: 0, cy: 0, status: 'default', hasItems: false }
      
      const sum = zone.polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
      const cx = sum.x / n
      const cy = sum.y / n

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
        cx, // image-space centroid
        cy,
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
      {zoneCentroids.map(centroid => {
        // Convert image-space centroid → viewport pixel, then → CSS %
        const { x: px, y: py } = imageToViewport(centroid.cx, centroid.cy, imageRect)
        return (
          <div
            key={centroid.id}
            className={`interactive-dot ${centroid.status} ${centroid.hasItems ? 'has-items' : ''} ${hoveredZoneId === centroid.id ? 'hidden' : ''}`}
            style={{
              left: `${px}px`,
              top: `${py}px`,
            }}
          />
        )
      })}
    </div>
  )
}
