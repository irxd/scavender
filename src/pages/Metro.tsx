import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
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

const SPAWN_POS: [number, number, number] = [4.46, 0, 7.35]

export default function Metro() {
  const keys = useKeyboard()
  const { boundary, setBoundary, reset } = useBoundary()
  const { zones, addZone, removeZone, updateZone } = useInteractiveZones()

  const gameRootRef = useRef<HTMLDivElement>(null)

  const [boundaryEditorVisible, setBoundaryEditorVisible] = useState(false)
  const [zoneEditorVisible, setZoneEditorVisible] = useState(false)

  const [activeDialog, setActiveDialog] = useState<InteractiveZone | null>(null)

  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(SPAWN_POS)
  const [autoWalkTarget, setAutoWalkTarget] = useState<[number, number, number] | null>(null)
  const [pendingZone, setPendingZone] = useState<InteractiveZone | null>(null)

  const handleAnimChange = useCallback((anim: string) => {
    setCurrentAnim(anim)
  }, [])

  const handlePositionChange = useCallback((pos: [number, number, number]) => {
    setCharPos(pos)
    // If movement is manual (keys pressed), cancel auto-walk
    const isManual = keys.current.forward || keys.current.backward || keys.current.left || keys.current.right
    if (isManual && autoWalkTarget) {
      setAutoWalkTarget(null)
      setPendingZone(null)
    }
  }, [keys, autoWalkTarget])

  const handleZoneHover = useCallback((zoneId: string | null) => {
    if (!gameRootRef.current) return
    // Don't change cursor while dialog is open
    gameRootRef.current.style.cursor = zoneId
      ? `url('/eye-white.svg') 16 16, crosshair`
      : 'default'
  }, [])

  const handleZoneClick = useCallback((zone: InteractiveZone) => {
    if (!zone.dialog?.trim()) return

    const targetPos = zone.targetPos || [charPos[0], charPos[1], charPos[2]]
    const dist = Math.sqrt(
      Math.pow(charPos[0] - targetPos[0], 2) +
      Math.pow(charPos[2] - targetPos[2], 2)
    )

    // Interaction distance threshold: 1.5 units
    if (dist < 1.5) {
      setActiveDialog(zone)
      setAutoWalkTarget(null)
      setPendingZone(null)
    } else {
      setAutoWalkTarget(targetPos)
      setPendingZone(zone)
    }
  }, [charPos])

  const handleDestinationReached = useCallback(() => {
    if (pendingZone) {
      setActiveDialog(pendingZone)
    }
    setAutoWalkTarget(null)
    setPendingZone(null)
  }, [pendingZone])

  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null)
  }, [])

  const toggleBoundaryEditor = () => setBoundaryEditorVisible(v => !v)
  const toggleZoneEditor = () => setZoneEditorVisible(v => !v)

  return (
    <div id="game-root" ref={gameRootRef}>
      {/* 
        This is a real stage.
        Background corresponds to level 1.1 right now.
        Later we can dynamically swap this.
      */}
      <Background src="/assets/images/background/level1.1.jpg" />

      {/* R3F Canvas */}
      <div id="canvas-layer">
        <Canvas
          shadows
          style={{ background: 'transparent' }}
          camera={{ position: [3.29, 8, 22], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <Scene
            keys={keys}
            boundary={boundary}
            initialPosition={SPAWN_POS}
            autoWalkTarget={autoWalkTarget}
            onAnimChange={handleAnimChange}
            onPositionChange={handlePositionChange}
            onDestinationReached={handleDestinationReached}
            cameraConfig={{
              camY: 2.0,
              camZ: 15.0,
              fov: 50,
              lookAtY: 2.0,
              lookAtX: 0.0
            }}
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

      {/* HUD components could be changed for Metro, but we'll leave basic instructions for now */}
      <div id="hud">
        <div className="hud-badge">WASD / ↑↓←→ Move</div>
        <div className="hud-badge">Shift + Move = Run</div>
      </div>
    </div>
  )
}
