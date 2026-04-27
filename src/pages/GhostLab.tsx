import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useImageRect } from '../utils/imageSpace'
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
import { useInventoryStore } from '../store/useInventoryStore'
import { ITEMS } from '../config/items'
import { ItemObtainedOverlay } from '../components/ItemObtainedOverlay'
import { InventoryOverlay } from '../components/InventoryOverlay'
import { PuzzleOverlay } from '../components/PuzzleOverlay'

type LevelConfig = {
  background: string
  imageW: number
  imageH: number
  cameraConfig: {
    camY: number
    camZ: number
    fov: number
    lookAtY: number
    lookAtX: number
    lookAtZ?: number
  }
  spawns: Record<string, [number, number, number, number?]>
  boundary?: import('../hooks/useBoundary').BoundaryPolygon
  zones?: InteractiveZone[]
}

// All backgrounds are 1920×1080 (16:9)
const IMG_W = 1920
const IMG_H = 1080

const LEVELS: Record<string, LevelConfig> = {
  'level3.1': {
    background: '/assets/images/background/level3.1.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 2.5, camZ: 7, fov: 21, lookAtY: 2, lookAtX: -0.5 },
    spawns: {
      default: [-0.52, 0, -2.6, 180],
      'level3.2': [-0.65, 0, -9, 0],
    },
    boundary: [
      { "x": 0.1, "y": 0.9 },
      { "x": 0.9, "y": 0.9 },
      { "x": 0.9, "y": 0.1 },
      { "x": 0.1, "y": 0.1 }
    ],
    zones: [
      {
        "id": "zone-1",
        "label": "level3.2",
        "polygon": [
          { "x": 0.8, "y": 0.2 },
          { "x": 0.9, "y": 0.2 },
          { "x": 0.9, "y": 0.4 },
          { "x": 0.8, "y": 0.4 }
        ],
        "targetPos": [4.38, 0, -2.9],
        "transitionTo": "level3.2"
      },
      {
        "id": "zone-2",
        "label": "level3.3",
        "polygon": [
          { "x": 0.1, "y": 0.2 },
          { "x": 0.2, "y": 0.2 },
          { "x": 0.2, "y": 0.4 },
          { "x": 0.1, "y": 0.4 }
        ],
        "targetPos": [-6.91, 0, -7.37],
        "transitionTo": "level3.3"
      }
    ],
  },
  'level3.2': {
    background: '/assets/images/background/level3.2.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 2.5, camZ: 22, fov: 24, lookAtY: 0.5, lookAtX: -6, lookAtZ: -5.0 },
    spawns: {
      default: [-1.33, 0, 2.95, 0],
      'level3.1': [-1.33, 0, 2.95, 0],
    },
    boundary: [
      { "x": 0.1, "y": 0.9 },
      { "x": 0.9, "y": 0.9 },
      { "x": 0.9, "y": 0.1 },
      { "x": 0.1, "y": 0.1 }
    ],
    zones: [
      {
        "id": "zone-3",
        "label": "level3.1",
        "polygon": [
          { "x": 0.05, "y": 0.8 },
          { "x": 0.2, "y": 0.8 },
          { "x": 0.2, "y": 0.95 },
          { "x": 0.05, "y": 0.95 }
        ],
        "targetPos": [-6.17, 0, 5.66],
        "transitionTo": "level3.1"
      },
      {
        "id": "zone-4",
        "label": "level3.3",
        "polygon": [
          { "x": 0.7, "y": 0.1 },
          { "x": 0.8, "y": 0.1 },
          { "x": 0.8, "y": 0.3 },
          { "x": 0.7, "y": 0.3 }
        ],
        "targetPos": [3.41, 0, -6.07],
        "transitionTo": "level3.3"
      }
    ],
  },
  'level3.3': {
    background: '/assets/images/background/level3.3.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 5.0, camZ: 9.5, fov: 25, lookAtY: 1.5, lookAtX: 0.0 },
    spawns: {
      default: [4.91, 0, -6.5, -30],
    },
    boundary: [
      { "x": 0.1, "y": 0.9 },
      { "x": 0.9, "y": 0.9 },
      { "x": 0.9, "y": 0.1 },
      { "x": 0.1, "y": 0.1 }
    ],
    zones: [
      {
        "id": "zone-5",
        "label": "level3.1",
        "polygon": [
          { "x": 0.05, "y": 0.4 },
          { "x": 0.15, "y": 0.4 },
          { "x": 0.15, "y": 0.6 },
          { "x": 0.05, "y": 0.6 }
        ],
        "targetPos": [-7.24, 0, -0.33],
        "transitionTo": "level3.1"
      },
      {
        "id": "zone-6",
        "label": "level3.2",
        "polygon": [
          { "x": 0.9, "y": 0.4 },
          { "x": 0.98, "y": 0.4 },
          { "x": 0.98, "y": 0.6 },
          { "x": 0.9, "y": 0.6 }
        ],
        "targetPos": [7.57, 0, -0.35],
        "transitionTo": "level3.2"
      }
    ],
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

export default function GhostLab() {
  const navigate = useNavigate()
  const keys = useKeyboard()
  const { currentLevelId: savedLevelId, setCurrentLevel } = useInventoryStore()

  // Set default level if entering the stage for the first time
  const initLevelId = savedLevelId.startsWith('level3.') ? savedLevelId : 'level3.1'

  const [levelState, setLevelState] = useState({ id: initLevelId, from: 'default' })
  const currentLevelId = levelState.id
  const previousLevelId = levelState.from

  // Sync level state if store changes externally (e.g. reset)
  useEffect(() => {
    if (savedLevelId !== levelState.id && savedLevelId.startsWith('level3.')) {
      setLevelState({ id: savedLevelId, from: 'default' })
    }
  }, [savedLevelId, levelState.id])

  // Update store when level changes
  useEffect(() => {
    if (currentLevelId !== savedLevelId) {
      setCurrentLevel(currentLevelId)
    }
  }, [currentLevelId, savedLevelId, setCurrentLevel])

  const level = LEVELS[currentLevelId] || LEVELS['level3.1']
  const spawnData = level.spawns[previousLevelId] || level.spawns['default'] || [0, 0, 0, 0]

  const spawnPos = (useMemo(() =>
    [spawnData[0], spawnData[1], spawnData[2]],
    [spawnData]
  ) as [number, number, number])

  const spawnRot = spawnData[3] ?? 0

  const { boundary, setBoundary, reset } = useBoundary(currentLevelId, level.boundary)
  const { zones, addZone, removeZone, updateZone } = useInteractiveZones(currentLevelId, level.zones)

  // Image-space coordinate rect — updates on window resize
  const imageRect = useImageRect(level.imageW, level.imageH)

  const gameRootRef = useRef<HTMLDivElement>(null)

  const [boundaryEditorVisible, setBoundaryEditorVisible] = useState(false)
  const [zoneEditorVisible, setZoneEditorVisible] = useState(false)
  const [inventoryVisible, setInventoryVisible] = useState(false)

  const [activeDialog, setActiveDialog] = useState<InteractiveZone | null>(null)
  const [activePuzzleZone, setActivePuzzleZone] = useState<InteractiveZone | null>(null)
  const [pendingPuzzleZone, setPendingPuzzleZone] = useState<InteractiveZone | null>(null)

  // Refs to always have fresh dialog/puzzle/item state in event listeners (avoids stale closures)
  const activeDialogRef = useRef<InteractiveZone | null>(null)
  const activePuzzleZoneRef = useRef<InteractiveZone | null>(null)
  const pendingItemsRef = useRef<string[]>([])
  const closeItemOverlayRef = useRef<(() => void) | null>(null)
  const inventoryVisibleRef = useRef(false)

  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(spawnPos)
  const [charRotation, setCharRotation] = useState(0)
  const [autoWalkTarget, setAutoWalkTarget] = useState<[number, number, number] | null>(null)
  const [pendingZone, setPendingZone] = useState<InteractiveZone | null>(null)


  // Sequence state
  const [pendingItemsToGive, setPendingItemsToGive] = useState<string[]>([])
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)

  const { obtainItem } = useInventoryStore()

  // Keep dialog/puzzle/item refs in sync
  useEffect(() => { activeDialogRef.current = activeDialog }, [activeDialog])
  useEffect(() => { activePuzzleZoneRef.current = activePuzzleZone }, [activePuzzleZone])
  useEffect(() => { pendingItemsRef.current = pendingItemsToGive }, [pendingItemsToGive])
  useEffect(() => { inventoryVisibleRef.current = inventoryVisible }, [inventoryVisible])
  // Keep close callback ref in sync whenever pending items change
  useEffect(() => {
    if (pendingItemsToGive.length > 0) {
      closeItemOverlayRef.current = () => {
        obtainItem(pendingItemsToGive[0])
        setPendingItemsToGive(prev => prev.slice(1))
      }
    } else {
      closeItemOverlayRef.current = null
    }
  }, [pendingItemsToGive, obtainItem])

  // Use a ref for charPos to prevent callback instability during movement
  const charPosRef = useRef<[number, number, number]>(spawnPos)

  // Reset character position state upon level change
  useEffect(() => {
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    setCharRotation(spawnRot * (Math.PI / 180))
  }, [currentLevelId, previousLevelId, spawnPos, spawnRot])

  // Sequence effect: trigger transition only after dialog and items are cleared
  useEffect(() => {
    if (!activeDialog && !activePuzzleZone && pendingItemsToGive.length === 0 && pendingTransition) {
      setLevelState({ id: pendingTransition, from: currentLevelId })
      setCurrentLevel(pendingTransition)
      setPendingTransition(null)
    }
  }, [activeDialog, activePuzzleZone, pendingItemsToGive.length, pendingTransition, currentLevelId, setCurrentLevel])

  // Post-dialog puzzle trigger
  useEffect(() => {
    if (!activeDialog && pendingPuzzleZone) {
      setActivePuzzleZone(pendingPuzzleZone)
      setPendingPuzzleZone(null)
    }
  }, [activeDialog, pendingPuzzleZone])

  // Trigger interaction sequence
  const processZoneInteraction = useCallback((zone: InteractiveZone) => {
    const state = useInventoryStore.getState()

    // Check requirements
    const hasRequirements = zone.requiredItems && zone.requiredItems.length > 0
    const requirementsMet = hasRequirements && zone.requiredItems!.every(id => state.hasItem(id))

    // Determine unobtained items
    const unobtainedItems = (zone.items || []).filter(id => ITEMS[id] && !state.hasItem(id))
    const itemsFullyObtained = (zone.items && zone.items.length > 0) && unobtainedItems.length === 0

    // Resolve dialog text
    let finalDialog = zone.dialog?.trim()

    if (itemsFullyObtained && zone.dialogAfterItemsObtained?.trim()) {
      // 1. Items fully obtained has highest priority
      finalDialog = zone.dialogAfterItemsObtained.trim()
    } else if (hasRequirements && requirementsMet && zone.dialogAfterRequiredItems?.trim()) {
      // 2. Requirements met but items not yet obtained
      finalDialog = zone.dialogAfterRequiredItems.trim()
    }

    const canSucceed = !hasRequirements || requirementsMet

    if (canSucceed && zone.puzzleId?.trim() && unobtainedItems.length > 0) {
      // It's a puzzle and we haven't obtained the items yet.
      // If there's a dialog to show first (e.g. requirements met), queue the puzzle.
      if (finalDialog) {
        setActiveDialog({ ...zone, dialog: finalDialog })
        setPendingPuzzleZone(zone)
      } else {
        setActivePuzzleZone(zone)
      }
      return
    }

    if (finalDialog) {
      // Clone zone with resolved dialog text to pass to DialogBox
      setActiveDialog({ ...zone, dialog: finalDialog })
    }

    // Process success state (giving items, transitioning)
    if (canSucceed) {
      if (unobtainedItems.length > 0) setPendingItemsToGive(unobtainedItems)
      if (zone.transitionTo?.trim()) setPendingTransition(zone.transitionTo.trim())
    }
  }, [])

  // Handlers
  const handleAnimChange = useCallback((anim: string) => {
    setCurrentAnim(anim)
  }, [])

  const handlePositionChange = useCallback((pos: [number, number, number]) => {
    setCharPos(pos)
    charPosRef.current = pos

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

    let cursorUrl = '/assets/icons/eye.svg'
    if (zoneId) {
      const zone = zones.find(z => z.id === zoneId)
      if (zone) {
        const state = useInventoryStore.getState()

        const hasRequirements = zone.requiredItems && zone.requiredItems.length > 0
        const requirementsMet = hasRequirements && zone.requiredItems!.every(id => state.hasItem(id))

        const hasItems = zone.items && zone.items.length > 0
        const unobtainedItems = (zone.items || []).filter(id => ITEMS[id] && !state.hasItem(id))
        const itemsFullyObtained = hasItems && unobtainedItems.length === 0

        if (hasRequirements && !requirementsMet) {
          cursorUrl = '/assets/icons/locked.svg'
        } else if (hasRequirements && requirementsMet && hasItems && !itemsFullyObtained) {
          cursorUrl = '/assets/icons/unlocked.svg'
        } else if (zone.transitionTo?.trim()) {
          cursorUrl = '/assets/icons/door.svg'
        } else {
          cursorUrl = '/assets/icons/eye.svg'
        }
      }
    }

    // Update cursor icon appropriately
    if (activeDialog || activePuzzleZone || inventoryVisible) {
      gameRootRef.current.style.cursor = 'default'
      return
    }

    gameRootRef.current.style.cursor = zoneId
      ? `url('${cursorUrl}') 16 16, crosshair`
      : 'default'
  }, [zones, activeDialog, activePuzzleZone, inventoryVisible])

  // Capture-phase global click guard — registered ONCE, reads from refs so it's always fresh
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (activeDialogRef.current) {
        setActiveDialog(null)
        e.stopPropagation()
        return
      }
      if (activePuzzleZoneRef.current) {
        // Allow clicks INSIDE the puzzle overlay through; only block outside clicks
        const target = e.target as Element
        if (!target.closest('.puzzle-overlay-container')) {
          e.stopPropagation()
        }
        return
      }
      if (pendingItemsRef.current.length > 0) {
        // Item overlay is showing — close it and block zone interactions behind it
        closeItemOverlayRef.current?.()
        e.stopPropagation()
        return
      }
      if (inventoryVisibleRef.current) {
        // Inventory is open — block zone clicks outside the inventory panel
        const target = e.target as Element
        if (!target.closest('.inventory-overlay-container')) {
          e.stopPropagation()
        }
      }
    }
    window.addEventListener('click', handleGlobalClick, true) // capture phase
    return () => window.removeEventListener('click', handleGlobalClick, true)
  }, []) // empty deps — stable forever, reads state via refs

  const handleZoneClick = useCallback((zone: InteractiveZone) => {

    const hasItems = zone.items && zone.items.length > 0
    const hasTransition = !!zone.transitionTo?.trim()
    const hasDialog = !!zone.dialog?.trim() || !!zone.dialogAfterItemsObtained?.trim() || !!zone.dialogAfterRequiredItems?.trim()

    if (!hasDialog && !hasTransition && !hasItems) return

    const currentPos = charPosRef.current
    const targetPos = zone.targetPos || [currentPos[0], currentPos[1], currentPos[2]]
    const dist = Math.sqrt(
      Math.pow(currentPos[0] - targetPos[0], 2) +
      Math.pow(currentPos[2] - targetPos[2], 2)
    )

    // Interaction distance threshold: 1.5 units
    if (dist < 1.5) {
      processZoneInteraction(zone)
      setAutoWalkTarget(null)
      setPendingZone(null)
    } else {
      setAutoWalkTarget(targetPos)
      setPendingZone(zone)
    }

    // Reset cursor icon immediately upon click/interaction start
    if (gameRootRef.current) {
      gameRootRef.current.style.cursor = 'default'
    }
  }, [currentLevelId, processZoneInteraction])

  const handleDestinationReached = useCallback(() => {
    if (pendingZone) {
      processZoneInteraction(pendingZone)
    }
    setAutoWalkTarget(null)
    setPendingZone(null)
  }, [pendingZone, processZoneInteraction])

  const handleCloseDialog = useCallback(() => {
    setActiveDialog(null)
  }, [])

  const [hintsEnabled, setHintsEnabled] = useState(() => {
    const saved = localStorage.getItem('scavender_hints_enabled')
    return saved === null ? false : saved === 'true'
  })

  // Perist hints setting
  useEffect(() => {
    localStorage.setItem('scavender_hints_enabled', hintsEnabled.toString())
  }, [hintsEnabled])

  const toggleHints = useCallback(() => setHintsEnabled(v => !v), [])

  const toggleBoundaryEditor = () => setBoundaryEditorVisible(v => !v)
  const toggleZoneEditor = () => setZoneEditorVisible(v => !v)

  const handleGameOver = useCallback(() => {
    navigate('/game-over', { state: { returnUrl: '/ghost-lab', levelId: currentLevelId } })
  }, [navigate, currentLevelId])

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
            imgW={level.imageW}
            imgH={level.imageH}
            initialPosition={spawnPos}
            initialRotation={spawnRot}
            autoWalkTarget={autoWalkTarget}
            onAnimChange={handleAnimChange}
            onPositionChange={handlePositionChange}
            onRotationChange={handleRotationChange}
            onDestinationReached={handleDestinationReached}
            cameraConfig={level.cameraConfig}
            charPos={charPos}
            onGameOver={handleGameOver}
            scientistSpawn={currentLevelId === 'level3.2' ? [-1.82, 0, 7.2] : undefined}
            scientistRotation={currentLevelId === 'level3.2' ? -Math.PI / 2 : undefined}
          />
        </Canvas>
      </div>

      {/* Interactive zone hover + click detection (always active) */}
      <InteractiveZoneOverlay
        zones={zones}
        imageRect={imageRect}
        onHoverChange={handleZoneHover}
        onZoneClick={handleZoneClick}
        editorOpen={zoneEditorVisible}
        hintsEnabled={hintsEnabled}
      />

      {/* Zone editor overlay */}
      <InteractiveZoneEditor
        zones={zones}
        imageRect={imageRect}
        onUpdateZone={updateZone}
        onAddZone={addZone}
        onRemoveZone={removeZone}
        visible={zoneEditorVisible}
      />

      {/* Boundary editor overlay */}
      <BoundaryEditor
        boundary={boundary}
        imageRect={imageRect}
        setBoundary={setBoundary}
        visible={boundaryEditorVisible}
      />

      {/* Dialog box — shown when player clicks an interactive zone */}
      {activeDialog && (
        <DialogBox zone={activeDialog} onClose={handleCloseDialog} />
      )}

      {/* Item Obtained Overlay — shown after dialog if there are items */}
      {!activeDialog && pendingItemsToGive.length > 0 && ITEMS[pendingItemsToGive[0]] && (
        <ItemObtainedOverlay
          item={ITEMS[pendingItemsToGive[0]]}
          onClose={() => {
            obtainItem(pendingItemsToGive[0])
            setPendingItemsToGive(prev => prev.slice(1))
          }}
        />
      )}

      {/* Puzzle Overlay */}
      {activePuzzleZone && activePuzzleZone.puzzleId && (
        <PuzzleOverlay
          puzzleId={activePuzzleZone.puzzleId}
          onComplete={() => {
            const state = useInventoryStore.getState()
            const unobtainedItems = (activePuzzleZone.items || []).filter(id => ITEMS[id] && !state.hasItem(id))

            setActivePuzzleZone(null)

            // Give items
            if (unobtainedItems.length > 0) setPendingItemsToGive(unobtainedItems)
            if (activePuzzleZone.transitionTo?.trim()) setPendingTransition(activePuzzleZone.transitionTo.trim())
          }}
        />
      )}

      {/* Inventory Overlay */}
      {inventoryVisible && (
        <InventoryOverlay onClose={() => setInventoryVisible(false)} />
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

      {/* HUD components */}
      <div id="hud">
        <div className="hud-badge">WASD / ↑↓←→ Move</div>
        <div className="hud-badge">Shift + Move = Run</div>
      </div>

      <button className="bag-button" onClick={() => setInventoryVisible(true)} title="Open Inventory">
        <img src="/assets/icons/backpack-icon.webp" alt="Inventory" />
      </button>

      <button
        className="hint-button"
        onClick={toggleHints}
        title={hintsEnabled ? 'Turn Hints Off' : 'Turn Hints On'}
      >
        <img
          src={hintsEnabled ? "/assets/icons/hint-on-icon.webp" : "/assets/icons/hint-off-icon.webp"}
          alt="Toggle Hints"
        />
      </button>
    </div>
  )
}
