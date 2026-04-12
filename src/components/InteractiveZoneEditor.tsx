import { useRef, useState } from 'react'
import type { InteractiveZone, ZonePolygon } from '../hooks/useInteractiveZones'

// Distinct accent colors cycling per zone index
const ZONE_COLORS = [
  '#ff6b6b', // red
  '#ffd93d', // yellow
  '#6bcb77', // green
  '#4d96ff', // blue
  '#c77dff', // purple
  '#ff9f1c', // orange
  '#2ec4b6', // teal
]

interface InteractiveZoneEditorProps {
  zones: InteractiveZone[]
  onUpdateZone: (id: string, patch: Partial<Omit<InteractiveZone, 'id'>>) => void
  onAddZone: () => string
  onRemoveZone: (id: string) => void
  visible: boolean
}

function CoordInput({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  const [local, setLocal] = useState(value.toString())

  // Sync if value changed externally (e.g. from state reset)
  const lastBaseValue = useRef(value)
  if (value !== lastBaseValue.current) {
    setLocal(value.toString())
    lastBaseValue.current = value
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
        {label}
      </span>
      <input
        type="text"
        value={local}
        onChange={e => {
          const val = e.target.value
          setLocal(val)
          // Only propagate if it's a valid floating number
          const parsed = parseFloat(val)
          if (!isNaN(parsed) && val !== '' && val !== '-' && val !== '.' && val !== '-.') {
            onChange(parsed)
          }
        }}
        onBlur={() => {
          // Cleanup on blur
          const parsed = parseFloat(local)
          if (isNaN(parsed)) {
            setLocal(value.toString())
          } else {
            setLocal(parsed.toString())
            onChange(parsed)
          }
        }}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '11px',
          padding: '4px 6px',
          outline: 'none',
          textAlign: 'center',
          fontFamily: 'inherit',
        }}
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}

function CommaSeparatedInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [local, setLocal] = useState(value.join(', '))

  // Sync if value changed externally
  const lastBaseValue = useRef(value)
  if (JSON.stringify(value) !== JSON.stringify(lastBaseValue.current)) {
    setLocal(value.join(', '))
    lastBaseValue.current = value
  }

  const handleChange = (val: string) => {
    setLocal(val)
    const items = val.split(',').map(s => s.trim()).filter(s => s.length > 0)
    onChange(items)
  }

  return (
    <input
      type="text"
      value={local}
      onChange={e => handleChange(e.target.value)}
      onBlur={() => {
        // Normalize on blur
        setLocal(value.join(', '))
      }}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '11px',
        padding: '5px 9px',
        outline: 'none',
        boxSizing: 'border-box'
      }}
      onClick={e => e.stopPropagation()}
    />
  )
}

export function InteractiveZoneEditor({
  zones,
  onUpdateZone,
  onAddZone,
  onRemoveZone,
  visible,
}: InteractiveZoneEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingNode = useRef<{ zoneId: string; nodeIdx: number } | null>(null)
  const draggingZone = useRef<{ zoneId: string; startX: number; startY: number; startPoly: ZonePolygon } | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    zones.length > 0 ? zones[0].id : null
  )
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)

  // Floating panel state
  const [panelPos, setPanelPos] = useState({ x: 14, y: 14 })
  const panelDragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null)

  if (!visible) return null

  // ── pointer handlers ──────────────────────────────────────────────────

  const handlePointerDown = (zoneId: string, nodeIdx: number, e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedZoneId(zoneId)
    draggingNode.current = { zoneId, nodeIdx }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    if (draggingNode.current) {
      const { zoneId, nodeIdx } = draggingNode.current
      const zone = zones.find(z => z.id === zoneId)
      if (!zone) return
      const next: ZonePolygon = zone.polygon.map((p, i) => (i === nodeIdx ? { x, y } : p))
      onUpdateZone(zoneId, { polygon: next })
      return
    }

    if (draggingZone.current) {
      const { zoneId, startX, startY, startPoly } = draggingZone.current
      const rawX = (e.clientX - rect.left) / rect.width
      const rawY = (e.clientY - rect.top) / rect.height
      const dx = rawX - startX
      const dy = rawY - startY

      const next: ZonePolygon = startPoly.map(p => ({
        // Using clamp here enforces boundaries but can deform shape if dragged hard against the edge.
        // For simple dragging, a simple clamp is fine.
        x: Math.max(0, Math.min(1, p.x + dx)),
        y: Math.max(0, Math.min(1, p.y + dy)),
      }))
      onUpdateZone(zoneId, { polygon: next })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode.current || draggingZone.current) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      draggingNode.current = null
      draggingZone.current = null
    }
  }

  const handleEdgeClick = (zoneId: string, edgeIdx: number) => {
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    const p1 = zone.polygon[edgeIdx]
    const p2 = zone.polygon[(edgeIdx + 1) % zone.polygon.length]
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    const next = [...zone.polygon]
    next.splice(edgeIdx + 1, 0, mid)
    onUpdateZone(zoneId, { polygon: next })
  }

  const handleRightClickNode = (zoneId: string, nodeIdx: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const zone = zones.find(z => z.id === zoneId)
    if (!zone || zone.polygon.length <= 3) return
    const next = zone.polygon.filter((_, i) => i !== nodeIdx)
    onUpdateZone(zoneId, { polygon: next })
  }

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div
      id="zone-editor-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        zIndex: 20,
      }}
    >
      {/* SVG canvas */}
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {zones.map((zone, zIdx) => {
          const color = ZONE_COLORS[zIdx % ZONE_COLORS.length]
          const isSelected = zone.id === selectedZoneId
          const pointsStr = zone.polygon.map(p => `${p.x * 100},${p.y * 100}`).join(' ')

          // centroid for label placement
          const cx = zone.polygon.reduce((s, p) => s + p.x, 0) / zone.polygon.length * 100
          const cy = zone.polygon.reduce((s, p) => s + p.y, 0) / zone.polygon.length * 100

          return (
            <g key={zone.id} onClick={() => setSelectedZoneId(zone.id)}>
              {/* Fill polygon */}
              <polygon
                points={pointsStr}
                fill={`${color}26`}
                stroke={color}
                strokeWidth={isSelected ? 0.35 : 0.2}
                strokeDasharray={isSelected ? undefined : '1,0.5'}
                style={{ cursor: 'move' }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setSelectedZoneId(zone.id)
                  if (!svgRef.current) return
                  const rect = svgRef.current.getBoundingClientRect()
                  const startX = (e.clientX - rect.left) / rect.width
                  const startY = (e.clientY - rect.top) / rect.height
                  draggingZone.current = { zoneId: zone.id, startX, startY, startPoly: zone.polygon }
                  e.currentTarget.setPointerCapture(e.pointerId)
                }}
              />

              {/* Zone label (SVG text, not editable — editable label is in sidebar) */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="2.5"
                fill={color}
                style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 600 }}
              >
                {zone.label}
              </text>

              {/* Edge midpoints (click to split) */}
              {zone.polygon.map((p, i) => {
                const nextP = zone.polygon[(i + 1) % zone.polygon.length]
                const midX = (p.x + nextP.x) / 2 * 100
                const midY = (p.y + nextP.y) / 2 * 100
                return (
                  <circle
                    key={`edge-${i}`}
                    cx={midX}
                    cy={midY}
                    r="0.5"
                    fill="rgba(255,255,255,0.4)"
                    stroke={color}
                    strokeWidth="0.15"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); handleEdgeClick(zone.id, i) }}
                  >
                    <title>Click to add point</title>
                  </circle>
                )
              })}

              {/* Corner nodes (drag to reshape) */}
              {zone.polygon.map((p, i) => (
                <circle
                  key={`node-${i}`}
                  cx={p.x * 100}
                  cy={p.y * 100}
                  r="0.9"
                  fill={color}
                  stroke="#fff"
                  strokeWidth="0.15"
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => handlePointerDown(zone.id, i, e)}
                  onContextMenu={(e) => handleRightClickNode(zone.id, i, e)}
                >
                  <title>Drag to move. Right-click to delete.</title>
                </circle>
              ))}
            </g>
          )
        })}
      </svg>

      {/* Sidebar panel */}
      <div
        style={{
          position: 'absolute',
          top: `${panelPos.y}px`,
          left: `${panelPos.x}px`,
          background: 'rgba(10,10,10,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          padding: '12px 14px',
          color: '#fff',
          fontSize: '12px',
          width: '260px', // slightly wider for inputs
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
          backdropFilter: 'blur(8px)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent',
        }}
        onPointerDown={(e) => e.stopPropagation()} // Prevent touches on panel from leaking to svg underlying
      >
        <div
          onPointerDown={(e) => {
            e.stopPropagation()
            panelDragRef.current = { startX: e.clientX, startY: e.clientY, initX: panelPos.x, initY: panelPos.y }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!panelDragRef.current) return
            const dx = e.clientX - panelDragRef.current.startX
            const dy = e.clientY - panelDragRef.current.startY
            setPanelPos({
              x: panelDragRef.current.initX + dx,
              y: Math.max(0, panelDragRef.current.initY + dy) // Ensure it doesn't get dragged above top of screen 
            })
          }}
          onPointerUp={(e) => {
            if (panelDragRef.current) {
              e.currentTarget.releasePointerCapture(e.pointerId)
              panelDragRef.current = null
            }
          }}
          style={{
            fontWeight: 700,
            marginBottom: '8px',
            fontSize: '13px',
            letterSpacing: '0.02em',
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          👁 Interactive Zones
        </div>

        {/* Zone list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {zones.map((zone, zIdx) => {
            const color = ZONE_COLORS[zIdx % ZONE_COLORS.length]
            const isSelected = zone.id === selectedZoneId
            const isEditingLabel = editingLabelId === zone.id

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: `1px solid ${isSelected ? color : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                {/* Color dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />

                {/* Label input / display */}
                {isEditingLabel ? (
                  <input
                    autoFocus
                    value={zone.label}
                    onChange={e => onUpdateZone(zone.id, { label: e.target.value })}
                    onBlur={() => setEditingLabelId(null)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingLabelId(null) }}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      borderBottom: `1px solid ${color}`, color: '#fff', fontSize: '12px',
                      outline: 'none', padding: '0 2px',
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingLabelId(zone.id) }}
                    style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title="Double-click to rename"
                  >
                    {zone.label}
                  </span>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveZone(zone.id); if (selectedZoneId === zone.id) setSelectedZoneId(zones.find(z => z.id !== zone.id)?.id ?? null) }}
                  title="Delete zone"
                  style={{
                    background: 'none', border: 'none', color: '#ff6b6b',
                    cursor: 'pointer', padding: '0', lineHeight: 1, fontSize: '14px', flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>

        {/* Add zone button */}
        <button
          onClick={() => { const id = onAddZone(); setSelectedZoneId(id) }}
          style={{
            width: '100%', padding: '6px', background: 'rgba(255,255,255,0.07)',
            border: '1px dashed rgba(255,255,255,0.25)', borderRadius: '6px',
            color: '#ccc', cursor: 'pointer', fontSize: '12px',
          }}
        >
          + Add Zone
        </button>

        {/* Dialog editor for selected zone */}
        {selectedZoneId && (() => {
          const sel = zones.find(z => z.id === selectedZoneId)
          if (!sel) return null
          return (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                💬 Dialog Text
              </div>
              <textarea
                value={sel.dialog ?? ''}
                onChange={e => onUpdateZone(sel.id, { dialog: e.target.value })}
                placeholder="Enter dialog text for this zone…"
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  padding: '7px 9px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onClick={e => e.stopPropagation()}
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                Shown when player clicks this zone.
              </div>

              <div style={{
                marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                💎 Items (Comma-separated IDs)
              </div>
              <CommaSeparatedInput
                value={sel.items ?? []}
                onChange={items => onUpdateZone(sel.id, { items })}
                placeholder="e.g. rebar, wire, wrench"
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                Items obtained upon interaction.
              </div>

              {sel.items && sel.items.length > 0 && (
                <>
                  <div style={{
                    marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    💬 Dialog (After Items Obtained)
                  </div>
                  <textarea
                    value={sel.dialogAfterItemsObtained ?? ''}
                    onChange={e => onUpdateZone(sel.id, { dialogAfterItemsObtained: e.target.value })}
                    placeholder="e.g. 'Nothing useful here anymore.'"
                    rows={2}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '7px 9px',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                </>
              )}

              <div style={{
                marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                🔒 Required Items (Comma-separated IDs)
              </div>
              <CommaSeparatedInput
                value={sel.requiredItems ?? []}
                onChange={requiredItems => onUpdateZone(sel.id, { requiredItems })}
                placeholder="e.g. wrench"
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                Items needed to succeed/transition.
              </div>

              {sel.requiredItems && sel.requiredItems.length > 0 && (
                <>
                  <div style={{
                    marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    💬 Dialog (Requirements Met / Before Items)
                  </div>
                  <textarea
                    value={sel.dialogAfterRequiredItems ?? ''}
                    onChange={e => onUpdateZone(sel.id, { dialogAfterRequiredItems: e.target.value })}
                    placeholder="e.g. 'Now I can pry this open!'"
                    rows={2}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '7px 9px',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                    Shown when requirements are fulfilled, right before the item is obtained.
                  </div>
                </>
              )}

              <div style={{
                marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                🚪 Level Transition
              </div>
              <input
                type="text"
                value={sel.transitionTo ?? ''}
                onChange={e => onUpdateZone(sel.id, { transitionTo: e.target.value })}
                placeholder="Next level ID (e.g. level1.2)"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '5px 9px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onClick={e => e.stopPropagation()}
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                If set, reaching this zone seamlessly loads the target level ID instead of showing dialog.
              </div>

              <div style={{
                marginTop: '16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                🧩 Puzzle ID
              </div>
              <input
                type="text"
                value={sel.puzzleId ?? ''}
                onChange={e => onUpdateZone(sel.id, { puzzleId: e.target.value })}
                placeholder="Puzzle ID (e.g. metro-vending)"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '5px 9px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onClick={e => e.stopPropagation()}
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                If set, triggers a puzzle modal before giving items.
              </div>

              <div style={{
                marginTop: '16px', fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                📍 Target Position (X, Y, Z)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <CoordInput
                    key={i}
                    label={['X', 'Y', 'Z'][i]}
                    value={sel.targetPos?.[i] ?? 0}
                    onChange={val => {
                      const next = [...(sel.targetPos ?? [0, 0, 0])] as [number, number, number]
                      next[i] = val
                      onUpdateZone(sel.id, { targetPos: next })
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                Character will walk here before dialog opens.
              </div>
            </div>
          )
        })()}

        {/* Help text */}
        <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', lineHeight: 1.5 }}>
          • Drag the center to move the zone.<br />
          • Drag nodes to reshape.<br />
          • Click edge midpoints to split.<br />
          • Right-click a node to delete.<br />
          • Double-click label to rename.
        </div>
      </div>
    </div>
  )
}
