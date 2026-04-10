import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { Background } from '../components/Background'
import { BoundaryEditor } from '../components/BoundaryEditor'
import { DialogBox } from '../components/DialogBox'
import { InteractiveZoneEditor } from '../components/InteractiveZoneEditor'
import { InteractiveZoneOverlay } from '../components/InteractiveZoneOverlay'
import { Scene } from '../components/Scene'
import { useKeyboard } from '../hooks/useKeyboard'
import { useBoundary } from '../hooks/useBoundary'
import { useInteractiveZones } from '../hooks/useInteractiveZones'
import type { InteractiveZone } from '../hooks/useInteractiveZones'

function DebugOverlay({
  anim,
  pos,
}: {
  anim: string
  pos: [number, number, number]
}) {
  useControls('Character', {
    status: { value: anim, editable: false, label: 'Current State' },
    position: {
      value: { x: pos[0], y: pos[1], z: pos[2] },
      editable: false,
      label: 'World Position',
    },
  }, { collapsed: true }, [anim, pos])

  return null
}

const SPAWN_POS: [number, number, number] = [3.29, 0, 9.7]

export default function Sandbox() {
  const keys = useKeyboard()
  const { boundary, setBoundary, reset } = useBoundary()
  const { zones, addZone, removeZone, updateZone } = useInteractiveZones()

  const gameRootRef = useRef<HTMLDivElement>(null)

  const [boundaryEditorVisible, setBoundaryEditorVisible] = useState(false)
  const [zoneEditorVisible, setZoneEditorVisible] = useState(false)
  const [activeDialog, setActiveDialog] = useState<InteractiveZone | null>(null)
  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(SPAWN_POS)

  const handleAnimChange = useCallback((anim: string) => {
    setCurrentAnim(anim)
  }, [])

  const handlePositionChange = useCallback((pos: [number, number, number]) => {
    setCharPos(pos)
  }, [])

  const handleZoneHover = useCallback((zoneId: string | null) => {
    if (!gameRootRef.current) return
    // Don't change cursor while dialog is open or editor is open
    gameRootRef.current.style.cursor = zoneId
      ? `url('/eye-white.svg') 16 16, crosshair`
      : 'default'
  }, [])

  const handleZoneClick = useCallback((zone: InteractiveZone) => {
    // Only open dialog if zone has dialog text configured
    if (zone.dialog?.trim()) {
      setActiveDialog(zone)
    }
  }, [])

  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null)
  }, [])

  const toggleBoundaryEditor = () => setBoundaryEditorVisible(v => !v)
  const toggleZoneEditor = () => setZoneEditorVisible(v => !v)

  return (
    <div id="game-root" ref={gameRootRef}>
      {/* Leva panel */}
      <Leva collapsed={false} titleBar={{ title: '🎮 Sandbox Debug' }} />

      {/* Static background */}
      <Background src="/assets/images/sandbox-background.png" />

      {/* R3F Canvas */}
      <div id="canvas-layer">
        <Canvas
          shadows
          style={{ background: 'transparent' }}
          camera={{ position: [3.29, 8, 22], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <DebugOverlay anim={currentAnim} pos={charPos} />
          <Scene
            keys={keys}
            boundary={boundary}
            initialPosition={SPAWN_POS}
            onAnimChange={handleAnimChange}
            onPositionChange={handlePositionChange}
          />
        </Canvas>
      </div>

      {/* Interactive zone hover + click detection (always active) */}
      <InteractiveZoneOverlay
        zones={zones}
        onHoverChange={handleZoneHover}
        onZoneClick={handleZoneClick}
        editorOpen={zoneEditorVisible}
      />

      {/* Zone editor overlay */}
      <InteractiveZoneEditor
        zones={zones}
        onUpdateZone={updateZone}
        onAddZone={addZone}
        onRemoveZone={removeZone}
        visible={zoneEditorVisible}
      />

      {/* Boundary editor overlay */}
      <BoundaryEditor
        boundary={boundary}
        setBoundary={setBoundary}
        visible={boundaryEditorVisible}
      />

      {/* Dialog box — shown when player clicks an interactive zone */}
      {activeDialog && (
        <DialogBox zone={activeDialog} onClose={handleCloseDialog} />
      )}

      {/* Toolbar */}
      <div id="toolbar">
        <button
          className={`toolbar-btn ${boundaryEditorVisible ? 'active' : ''}`}
          onClick={toggleBoundaryEditor}
          title="Toggle boundary editor"
        >
          ✏️ Boundary Editor
        </button>
        <button
          className={`toolbar-btn ${zoneEditorVisible ? 'active' : ''}`}
          onClick={toggleZoneEditor}
          title="Toggle zone editor"
        >
          👁 Zone Editor
        </button>
        <button
          className="toolbar-btn"
          onClick={reset}
          title="Reset boundary to default"
        >
          ↺ Reset
        </button>
      </div>

      {/* HUD */}
      <div id="hud">
        <div className="hud-badge">WASD / ↑↓←→ Move</div>
        <div className="hud-badge">Shift + Move = Run</div>
      </div>
    </div>
  )
}
