import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useImageRect } from '../utils/imageSpace'
import { Canvas } from '@react-three/fiber'
import { Background } from '../components/Background'
import { BackgroundAudio } from '../components/BackgroundAudio'
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
import { HudComponents } from '../components/HudComponents'
import { GoalHud } from '../components/GoalHud'



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
      {
        "x": 0.3841634114583333,
        "y": 0.9190502025462963
      },
      {
        "x": 0.653619384765625,
        "y": 0.91845703125
      },
      {
        "x": 0.6062093098958333,
        "y": 0.7428457754629629
      },
      {
        "x": 0.6337198893229167,
        "y": 0.719603587962963
      },
      {
        "x": 0.6094930013020833,
        "y": 0.6660807291666667
      },
      {
        "x": 0.466619873046875,
        "y": 0.6635886863425926
      },
      {
        "x": 0.42795206705729166,
        "y": 0.6815791377314815
      },
      {
        "x": 0.4214111328125,
        "y": 0.7143916377314815
      },
      {
        "x": 0.4521891276041667,
        "y": 0.7376265914351852
      }
    ],
    zones: [
      {
        "id": "zone-1777212702497",
        "label": "level3.2",
        "polygon": [
          { "x": 0.45930379231770835, "y": 0.35517216435185184 },
          { "x": 0.6142191569010417, "y": 0.35406177662037036 },
          { "x": 0.6152730305989583, "y": 0.6710611979166666 },
          { "x": 0.4563090006510417, "y": 0.6668836805555556 }
        ],
        "targetPos": [-0.65, 0, -9],
        "transitionTo": "level3.2"
      },
      {
        "id": "zone-1777543685861",
        "label": "panel",
        "polygon": [
          { "x": 0.35159708658854166, "y": 0.38399522569444444 },
          { "x": 0.39835205078125, "y": 0.4061487268518518 },
          { "x": 0.39746500651041666, "y": 0.5577835648148147 },
          { "x": 0.34978434244791673, "y": 0.5743959780092592 }
        ],
        "targetPos": [-1.83, 0, -7.38],
        "dialog": "Someone already bypass this door control panel. Hope the door still works."
      },
      {
        "id": "zone-1777543685862",
        "label": "monitoring",
        "polygon": [
          { "x": 0.68212890625, "y": 0.42657335069444446 },
          { "x": 0.73924560546875, "y": 0.3946433738425926 },
          { "x": 0.73924560546875, "y": 0.5946433738425926 },
          { "x": 0.6816630045572917, "y": 0.5644603587962963 }
        ],
        "targetPos": [0.33, 0, -7.3],
        "dialog": "A monitoring station. The screens are cracked and the reels haven't moved in decades."
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
      {
        "x": 0.4744059244791667,
        "y": 0.9134223090277778
      },
      {
        "x": 0.749951171875,
        "y": 0.9185583043981481
      },
      {
        "x": 0.71033935546875,
        "y": 0.5977466724537037
      },
      {
        "x": 0.6421549479166667,
        "y": 0.5958405671296296
      }
    ],
    zones: [
      {
        "id": "zone-3",
        "label": "level3.1",
        "polygon": [
          { "x": 0.6147257486979166, "y": 0.37119140625 },
          { "x": 0.723211669921875, "y": 0.36569372106481485 },
          { "x": 0.7226582845052083, "y": 0.5905490451388888 },
          { "x": 0.61795654296875, "y": 0.5887333622685186 }
        ],
        "targetPos": [-1.33, 0, 2.95],
        "transitionTo": "level3.1"
      },
      {
        "id": "zone-4",
        "label": "level3.3",
        "polygon": [
          { "x": 0.45069986979166665, "y": 0.7670536747685185 },
          { "x": 0.7489583333333333, "y": 0.7914460358796296 },
          { "x": 0.7609110514322917, "y": 0.9107313368055556 },
          { "x": 0.4508585611979167, "y": 0.9107313368055555 }
        ],
        "targetPos": [-1, 0, 13.19],
        "transitionTo": "level3.3"
      },
      {
        "id": "zone-1777543685857",
        "label": "scientiest1",
        "polygon": [
          { "x": 0.596142578125, "y": 0.4098017939814815 },
          { "x": 0.6080729166666666, "y": 0.4199363425925926 },
          { "x": 0.611279296875, "y": 0.5106083622685185 },
          { "x": 0.61702880859375, "y": 0.6661747685185185 },
          { "x": 0.5859110514322917, "y": 0.6788375289351852 },
          { "x": 0.5904500325520833, "y": 0.5799153645833334 },
          { "x": 0.5904073079427083, "y": 0.5032732928240741 }
        ],
        "targetPos": [-1.51, 0, 7.26],
        "dialog": "They don’t even see me. They’re just echoes caught in the time static."
      },
      {
        "id": "zone-1777543685859",
        "label": "scientiest3",
        "polygon": [
          { "x": 0.3996805826822916, "y": 0.471603732638889 },
          { "x": 0.4306823730468749, "y": 0.4696289062500001 },
          { "x": 0.43703409830729156, "y": 0.5161458333333334 },
          { "x": 0.4506306966145833, "y": 0.5497359664351852 },
          { "x": 0.4629923502604167, "y": 0.625122974537037 },
          { "x": 0.453875732421875, "y": 0.8049732349537038 },
          { "x": 0.4635091145833333, "y": 0.9173068576388889 },
          { "x": 0.39872843424479165, "y": 0.9183521412037037 },
          { "x": 0.383056640625, "y": 0.8290581597222222 },
          { "x": 0.3996805826822916, "y": 0.671603732638889 }
        ],
        "targetPos": [-1.93, 0, 13.47],
        "dialog": "It’s like watching a recording of a memory."
      },
      {
        "id": "zone-1777543685860",
        "label": "scientiest4",
        "polygon": [
          { "x": 0.73046875, "y": 0.5126699942129629 },
          { "x": 0.7399739583333333, "y": 0.46088686342592583 },
          { "x": 0.7640604654947917, "y": 0.46504629629629624 },
          { "x": 0.7595357259114583, "y": 0.6695059317129629 },
          { "x": 0.7664143880208333, "y": 0.7912796585648147 },
          { "x": 0.7442911783854167, "y": 0.9146592881944443 },
          { "x": 0.7046122233072917, "y": 0.9132740162037036 },
          { "x": 0.7104146321614583, "y": 0.800708912037037 },
          { "x": 0.7220865885416666, "y": 0.6058883101851851 }
        ],
        "targetPos": [-0.51, 0, 13.15],
        "dialog": "Empty shells of the past."
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
      { "x": 0.7107767740885417, "y": 0.354173900462963 },
      { "x": 0.7767964680989583, "y": 0.4194878472222222 },
      { "x": 0.8084676106770833, "y": 0.5301070601851852 },
      { "x": 0.899554443359375, "y": 0.6428855613425926 },
      { "x": 0.9017069498697917, "y": 0.7203486689814815 },
      { "x": 0.866912841796875, "y": 0.8178240740740741 },
      { "x": 0.7351888020833334, "y": 0.8418438946759259 },
      { "x": 0.7182881673177083, "y": 0.8971571180555555 },
      { "x": 0.9025634765625, "y": 0.8974320023148148 },
      { "x": 0.9467427571614583, "y": 0.8104853877314815 },
      { "x": 1, "y": 0.6271665219907407 },
      { "x": 0.885345458984375, "y": 0.4056278935185185 },
      { "x": 0.7484293619791667, "y": 0.35294053819444443 }
    ],
    zones: [
      {
        "id": "zone-6",
        "label": "panel",
        "polygon": [
          { "x": 0.749566650390625, "y": 0.42298900462962963 },
          { "x": 0.7704610188802083, "y": 0.4254484953703704 },
          { "x": 0.8046101888020833, "y": 0.5433919270833334 },
          { "x": 0.8428426106770833, "y": 0.5931351273148149 },
          { "x": 0.8573811848958334, "y": 0.6907841435185186 },
          { "x": 0.8524149576822917, "y": 0.7986147280092593 },
          { "x": 0.751800537109375, "y": 0.79443359375 }
        ],
        "targetPos": [4.18, 0, -0.49],
        "transitionTo": "",
        "dialog": "The console is waiting. One keystroke to save them, one to change everything."
      },
      {
        "id": "zone-1777276114001",
        "label": "door",
        "polygon": [
          { "x": 0.7475260416666667, "y": 0.10996455439814815 },
          { "x": 0.8681070963541666, "y": 0.1323531539351852 },
          { "x": 0.8661397298177084, "y": 0.38670789930555555 },
          { "x": 0.7458150227864583, "y": 0.3420826099537037 }
        ],
        "targetPos": [4.77, 0, -6.36],
        "dialog": "No need to go back."
      },
      {
        "id": "zone-1777545047234",
        "label": "reactor",
        "polygon": [
          { "x": 0.45503133138020835, "y": 0.3789243344907407 },
          { "x": 0.5228129069010417, "y": 0.3330946180555555 },
          { "x": 0.5982035319010417, "y": 0.37251880787037034 },
          { "x": 0.6165018717447917, "y": 0.4682725694444444 },
          { "x": 0.5940348307291666, "y": 0.5575050636574074 },
          { "x": 0.5243021647135416, "y": 0.60869140625 },
          { "x": 0.450982666015625, "y": 0.5470341435185185 },
          { "x": 0.43830973307291665, "y": 0.47052951388888886 }
        ],
        "targetPos": [2.4, 0, 1],
        "dialog": "This is it! The source of the signal. I need pull the plug on this."
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

const INTRO_DIALOGS = [
  { text: "The elevator brought me here...", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "This place feels... colder. Like the air itself is holding its breath.", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "I can feel the signal's source nearby. It's close now.", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
]

const MILLER_DIALOGS = [
  { text: "The console is waiting. One keystroke to change everything.", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "Wait!", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "You again! Who are you really?", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "No need for introduction. Just listen to me.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "You have to stabilize the reactor.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "No! I need to make this off to save my people!", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "Why should I believe you?", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "I have been through this before.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "Many times.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "Just shut up, you're just an echo of the past. You're not real.", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
]

export default function GhostLab() {
  const navigate = useNavigate()
  const keys = useKeyboard()
  const { obtainItem, resetWithDefaults } = useInventoryStore()
  const hasWatch = useInventoryStore(state => state.hasItem('watch'))

  // Set default level if entering the stage for the first time
  // Always reset to starting level of this stage on fresh load/refresh
  const initLevelId = 'level3.1'

  const [levelState, setLevelState] = useState({ id: initLevelId, from: 'default' })
  const currentLevelId = levelState.id
  const previousLevelId = levelState.from

  // Reset inventory on mount (handles refresh)
  useEffect(() => {
    resetWithDefaults(['rebar', 'wrench', 'wire', 'battery', 'fuel', 'sulfate', 'igniter'])
  }, [resetWithDefaults])

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

  const [introDialogIndex, setIntroDialogIndex] = useState<number | null>(null)
  const introDialogIndexRef = useRef<number | null>(null)
  const [introCompleted, setIntroCompleted] = useState(false)

  const [millerSpawned, setMillerSpawned] = useState(false)
  const [millerDialogIndex, setMillerDialogIndex] = useState<number | null>(null)
  const millerDialogIndexRef = useRef<number | null>(null)
  const [showDecisionOverlay, setShowDecisionOverlay] = useState(false)

  // Sequence state
  const [pendingItemsToGive, setPendingItemsToGive] = useState<string[]>([])
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)

  // Keep dialog/puzzle/item refs in sync
  useEffect(() => { activeDialogRef.current = activeDialog }, [activeDialog])
  useEffect(() => { activePuzzleZoneRef.current = activePuzzleZone }, [activePuzzleZone])
  useEffect(() => { pendingItemsRef.current = pendingItemsToGive }, [pendingItemsToGive])
  useEffect(() => { inventoryVisibleRef.current = inventoryVisible }, [inventoryVisible])
  useEffect(() => { introDialogIndexRef.current = introDialogIndex }, [introDialogIndex])
  useEffect(() => { millerDialogIndexRef.current = millerDialogIndex }, [millerDialogIndex])

  // Spawn Miller when dialogue advances to his first line
  useEffect(() => {
    if (millerDialogIndex === 1) {
      setMillerSpawned(true)
    }
  }, [millerDialogIndex])

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

  // First load: Start intro dialog
  useEffect(() => {
    if (previousLevelId === 'default' && !introCompleted) {
      setIntroDialogIndex(0)
    }
  }, [currentLevelId, previousLevelId, introCompleted])

  // Sequence effect: trigger transition only after dialog and items are cleared
  useEffect(() => {
    if (!activeDialog && !activePuzzleZone && pendingItemsToGive.length === 0 && pendingTransition) {
      setLevelState({ id: pendingTransition, from: currentLevelId })
      setPendingTransition(null)
    }
  }, [activeDialog, activePuzzleZone, pendingItemsToGive.length, pendingTransition, currentLevelId])

  // Post-dialog puzzle trigger
  useEffect(() => {
    if (!activeDialog && pendingPuzzleZone) {
      setActivePuzzleZone(pendingPuzzleZone)
      setPendingPuzzleZone(null)
    }
  }, [activeDialog, pendingPuzzleZone])

  // Trigger interaction sequence
  const processZoneInteraction = useCallback((zone: InteractiveZone) => {
    // Special Miller sequence in level 3.3
    if (zone.label === 'panel' && currentLevelId === 'level3.3' && !millerSpawned) {
      setMillerDialogIndex(0)
      return
    }

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
  }, [currentLevelId, millerSpawned])

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
    if (activeDialog || activePuzzleZone || inventoryVisible || showDecisionOverlay) {
      gameRootRef.current.style.cursor = 'default'
      return
    }

    gameRootRef.current.style.cursor = zoneId
      ? `url('${cursorUrl}') 16 16, crosshair`
      : 'default'
  }, [zones, activeDialog, activePuzzleZone, inventoryVisible, showDecisionOverlay])

  // Capture-phase global click guard — registered ONCE, reads from refs so it's always fresh
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (introDialogIndexRef.current !== null) {
        setIntroDialogIndex(prev => {
          if (prev === null) return null
          if (prev < INTRO_DIALOGS.length - 1) return prev + 1
          setIntroCompleted(true)
          return null
        })
        e.stopPropagation()
        return
      }
      if (millerDialogIndexRef.current !== null) {
        setMillerDialogIndex(prev => {
          if (prev === null) return null
          if (prev < MILLER_DIALOGS.length - 1) return prev + 1
          setShowDecisionOverlay(true)
          return null
        })
        e.stopPropagation()
        return
      }
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
      <BackgroundAudio src="/assets/audio/ghost-lab.ogg" />
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
            scientists={currentLevelId === 'level3.2' ? [
              { id: 'Scientist1', position: [-1.82, 0, 7.2], rotation: -Math.PI / 2 },
              { id: 'Scientist2', position: [-0.5, 0, 7.2], rotation: 1.7 },
              { id: 'Scientist3', position: [-2, 0, 15], rotation: 4.6 },
              { id: 'Scientist4', position: [-0.1, 0, 14.1], rotation: 1.5 }
            ] : undefined}
            miller={currentLevelId === 'level3.3' && millerSpawned ? {
              position: [-3, 0, 0],
              rotation: 80,
              opacity: 0.7,
            } : undefined}
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

      {/* Intro Dialog */}
      {introDialogIndex !== null && (
        <DialogBox
          text={INTRO_DIALOGS[introDialogIndex].text}
          portrait={INTRO_DIALOGS[introDialogIndex].portrait}
          side={INTRO_DIALOGS[introDialogIndex].side}
          onClose={() => {
            setIntroDialogIndex(prev => {
              if (prev === null) return null
              if (prev < INTRO_DIALOGS.length - 1) return prev + 1
              setIntroCompleted(true)
              return null
            })
          }}
        />
      )}

      {/* Miller Dialog */}
      {millerDialogIndex !== null && (
        <DialogBox
          text={MILLER_DIALOGS[millerDialogIndex].text}
          portrait={MILLER_DIALOGS[millerDialogIndex].portrait}
          side={MILLER_DIALOGS[millerDialogIndex].side}
          onClose={() => {
            setMillerDialogIndex(prev => {
              if (prev === null) return null
              if (prev < MILLER_DIALOGS.length - 1) return prev + 1
              setShowDecisionOverlay(true)
              return null
            })
          }}
        />
      )}

      {/* Final Decision Overlay */}
      {showDecisionOverlay && (
        <div className="decision-overlay-container">
          <div className="decision-overlay-backdrop" />
          <div className="decision-overlay-menu">
            <button className="decision-btn" onClick={() => navigate('/ending/1')}>
              TURN OFF REACTOR
            </button>
            <button className="decision-btn" onClick={() => navigate('/ending/2')}>
              STABILIZE REACTOR
            </button>
            {hasWatch && (
              <button className="decision-btn" onClick={() => navigate('/truth')}>
                SYNC REACTOR WITH WATCH [SECRET]
              </button>
            )}
          </div>
        </div>
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
      {import.meta.env.VITE_ENABLE_DEBUG === 'true' && (
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
      )}

      <GoalHud
        mainGoalText="Find the source of the signal"
      />


      <HudComponents
        onOpenInventory={() => setInventoryVisible(true)}
        hintsEnabled={hintsEnabled}
        onToggleHints={toggleHints}
      />
    </div>
  )
}
