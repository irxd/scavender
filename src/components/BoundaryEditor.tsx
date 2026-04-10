import { useRef } from 'react'
import type { BoundaryPolygon } from '../hooks/useBoundary'

interface BoundaryEditorProps {
  boundary: BoundaryPolygon
  setBoundary: (next: BoundaryPolygon | ((prev: BoundaryPolygon) => BoundaryPolygon)) => void
  visible: boolean
}

export function BoundaryEditor({ boundary, setBoundary, visible }: BoundaryEditorProps) {
  const draggingIdx = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation()
    draggingIdx.current = idx
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx.current === null || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    setBoundary(prev => {
      const next = [...prev]
      next[draggingIdx.current!] = { x, y }
      return next
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIdx.current !== null) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      draggingIdx.current = null
    }
  }

  const handleEdgeClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!svgRef.current) return
    
    setBoundary(prev => {
      const next = [...prev]
      const p1 = prev[idx]
      const p2 = prev[(idx + 1) % prev.length]
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      next.splice(idx + 1, 0, { x: mx, y: my })
      return next
    })
  }

  const handleRightClickPoint = (idx: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBoundary(prev => {
      if (prev.length <= 3) return prev // A polygon must have at least 3 points
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })
  }

  if (!visible) return null

  const pointsStr = boundary.map(p => `${p.x * 100},${p.y * 100}`).join(' ')

  return (
    <div id="boundary-overlay" className="editing" style={{ pointerEvents: 'auto' }}>
      <svg 
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <polygon 
          points={pointsStr} 
          fill="rgba(0, 255, 128, 0.15)" 
          stroke="#00ff80" 
          strokeWidth="0.2" 
        />
        {/* Draw midpoints for splitting edges */}
        {boundary.map((p, i) => {
          const nextP = boundary[(i + 1) % boundary.length]
          const midX = (p.x + nextP.x) / 2 * 100
          const midY = (p.y + nextP.y) / 2 * 100
          return (
            <circle
              key={`edge-${i}`}
              cx={midX}
              cy={midY}
              r="0.5"
              fill="rgba(255, 255, 255, 0.4)"
              stroke="#00ff80"
              strokeWidth="0.1"
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleEdgeClick(i, e)}
            >
              <title>Click to add point</title>
            </circle>
          )
        })}
        {/* Draw corners for dragging */}
        {boundary.map((p, i) => (
          <circle 
            key={`node-${i}`}
            cx={p.x * 100} 
            cy={p.y * 100} 
            r="0.8" 
            fill="#00ff80" 
            stroke="#fff"
            strokeWidth="0.1"
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => handlePointerDown(i, e)}
            onContextMenu={(e) => handleRightClickPoint(i, e)}
          >
            <title>Drag to move. Right-click to delete.</title>
          </circle>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#00ff80', textShadow: '1px 1px 0 #000', pointerEvents: 'none' }}>
        <strong>Walkable Zone</strong><br/>
        <small style={{ fontSize: '12px' }}>
          • Drag points to adjust.<br/>
          • Click faded edge midpoints to add a point.<br/>
          • Right-click a point to delete it.
        </small>
      </div>
    </div>
  )
}
