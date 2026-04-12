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
import { useControls } from 'leva'

type LevelConfig = {
  background: string
  cameraConfig: {
    camY: number
    camZ: number
    fov: number
    lookAtY: number
    lookAtX: number
  }
  spawns: Record<string, [number, number, number, number?]>
}

const LEVELS: Record<string, LevelConfig> = {
  'level1.1': {
    background: '/assets/images/background/level1.1.jpg',
    cameraConfig: { camY: 2.0, camZ: 15.0, fov: 50, lookAtY: 2.0, lookAtX: 0.0 },
    spawns: {
      default: [4.46, 0, 7.35, 20],
      'level1.2': [6.8, 0, 6.11, -60],
      'level1.3': [-1.58, 0, 8.80, 0],
    },
  },
  'level1.2': {
    background: '/assets/images/background/level1.2.jpg',
    cameraConfig: { camY: 1.5, camZ: 1.0, fov: 24, lookAtY: 1.5, lookAtX: -0.5 },
    spawns: {
      default: [-11.68, 0, -10.46, 75],
      'level1.1': [-11.68, 0, -10.46, 75],
    },
  },
}

function DebugOverlay({
  anim,
  pos,
  rot,
}: {
  anim: string
  pos: [number, number, number]
  rot: number
}) {
  useControls('Character', {
    status: { value: anim, editable: false, label: 'Current State' },
    position: {
      value: { x: pos[0], y: pos[1], z: pos[2] },
      editable: false,
      label: 'World Position',
    },
    rotation: {
      value: (rot * (180 / Math.PI)).toFixed(2) + '°',
      editable: false,
      label: 'Rotation (Y)',
    },
  }, { collapsed: true }, [anim, pos, rot])

  return null
}

export default function Metro() {
  const keys = useKeyboard()
  const [levelState, setLevelState] = useState({ id: 'level1.1', from: 'default' })
  const currentLevelId = levelState.id
  const previousLevelId = levelState.from

  const level = LEVELS[currentLevelId] || LEVELS['level1.1']
  const spawnData = level.spawns[previousLevelId] || level.spawns['default'] || [0, 0, 0, 0]
  const spawnPos: [number, number, number] = [spawnData[0], spawnData[1], spawnData[2]]
  const spawnRot = spawnData[3] ?? 0

  const { boundary, setBoundary, reset } = useBoundary(currentLevelId)
  const { zones, addZone, removeZone, updateZone } = useInteractiveZones(currentLevelId)

  const gameRootRef = useRef<HTMLDivElement>(null)

  const [boundaryEditorVisible, setBoundaryEditorVisible] = useState(false)
  const [zoneEditorVisible, setZoneEditorVisible] = useState(false)

  const [activeDialog, setActiveDialog] = useState<InteractiveZone | null>(null)

  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(spawnPos)
  const [charRotation, setCharRotation] = useState(0)
  const [autoWalkTarget, setAutoWalkTarget] = useState<[number, number, number] | null>(null)
  const [pendingZone, setPendingZone] = useState<InteractiveZone | null>(null)

  // Handlers
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

  const handleRotationChange = useCallback((rot: number) => {
    setCharRotation(rot)
  }, [])

  const handleZoneHover = useCallback((zoneId: string | null) => {
    if (!gameRootRef.current) return

    let cursorUrl = '/eye-white.svg'
    if (zoneId) {
      const zone = zones.find(z => z.id === zoneId)
      if (zone?.transitionTo?.trim()) {
        cursorUrl = '/door-white.svg'
      }
    }

    // Update cursor icon appropriately
    gameRootRef.current.style.cursor = zoneId
      ? `url('${cursorUrl}') 16 16, crosshair`
      : 'default'
  }, [zones])

  const handleZoneClick = useCallback((zone: InteractiveZone) => {
    if (!zone.dialog?.trim() && !zone.transitionTo?.trim()) return

    const targetPos = zone.targetPos || [charPos[0], charPos[1], charPos[2]]
    const dist = Math.sqrt(
      Math.pow(charPos[0] - targetPos[0], 2) +
      Math.pow(charPos[2] - targetPos[2], 2)
    )

    // Interaction distance threshold: 1.5 units
    if (dist < 1.5) {
      if (zone.transitionTo?.trim()) {
        const nextId = zone.transitionTo.trim()
        setLevelState({ id: nextId, from: currentLevelId })
      } else {
        setActiveDialog(zone)
      }
      setAutoWalkTarget(null)
      setPendingZone(null)
    } else {
      setAutoWalkTarget(targetPos)
      setPendingZone(zone)
    }
  }, [charPos, currentLevelId])

  const handleDestinationReached = useCallback(() => {
    if (pendingZone) {
      if (pendingZone.transitionTo?.trim()) {
        const nextId = pendingZone.transitionTo.trim()
        setLevelState({ id: nextId, from: currentLevelId })
      } else {
        setActiveDialog(pendingZone)
      }
    }
    setAutoWalkTarget(null)
    setPendingZone(null)
  }, [pendingZone, currentLevelId])

  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null)
  }, [])

  const toggleBoundaryEditor = () => setBoundaryEditorVisible(v => !v)
  const toggleZoneEditor = () => setZoneEditorVisible(v => !v)

  return (
    <div id="game-root" ref={gameRootRef}>
      {/* 
        This is a real stage.
        Background dynamically swaps based on currentLevelId.
      */}
      <Background src={level.background} />

      {/* R3F Canvas */}
      <div id="canvas-layer">
        <Canvas
          shadows
          style={{ background: 'transparent' }}
          camera={{ position: [3.29, 8, 22], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <DebugOverlay anim={currentAnim} pos={charPos} rot={charRotation} />
          <Scene
            key={currentLevelId}
            keys={keys}
            boundary={boundary}
            initialPosition={spawnPos}
            initialRotation={spawnRot}
            autoWalkTarget={autoWalkTarget}
            onAnimChange={handleAnimChange}
            onPositionChange={handlePositionChange}
            onRotationChange={handleRotationChange}
            onDestinationReached={handleDestinationReached}
            cameraConfig={level.cameraConfig}
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
