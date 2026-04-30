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
  }
  spawns: Record<string, [number, number, number, number?]>
  boundary?: import('../hooks/useBoundary').BoundaryPolygon
  zones?: InteractiveZone[]
}

// All backgrounds are 1920×1080 (16:9)
const IMG_W = 1920
const IMG_H = 1080

const LEVELS: Record<string, LevelConfig> = {
  'level2.1': {
    background: '/assets/images/background/level2.1.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 15.0, camZ: 23.5, fov: 17, lookAtY: 0.5, lookAtX: -1.5 },
    spawns: {
      default: [3.40, 0, 5.37, -134],
      'level2.2': [4.38, 0, -2.9, -41],
      'level2.3': [-6.91, 0, -7.37, 32.5],
    },
    boundary: [
      { "x": 0.11764933268229166, "y": 0.2372974537037037 },
      { "x": 0.17993570963541666, "y": 0.19114583333333332 },
      { "x": 0.19558308919270834, "y": 0.1265625 },
      { "x": 0.25382893880208335, "y": 0.09578269675925925 },
      { "x": 0.3309855143229167, "y": 0.16288700810185186 },
      { "x": 0.35397135416666664, "y": 0.15226779513888888 },
      { "x": 0.6610188802083333, "y": 0.4740993923611111 },
      { "x": 0.6806783040364583, "y": 0.471875 },
      { "x": 0.8045735677083333, "y": 0.36336805555555557 },
      { "x": 0.8988138834635416, "y": 0.42285517939814815 },
      { "x": 0.7410807291666667, "y": 0.581322337962963 },
      { "x": 0.750396728515625, "y": 0.6708297164351852 },
      { "x": 0.9814473470052083, "y": 0.9430302372685185 },
      { "x": 0.707696533203125, "y": 0.9453522858796296 },
      { "x": 0.5781026204427083, "y": 0.7620949074074074 },
      { "x": 0.49253743489583335, "y": 0.8232494212962963 },
      { "x": 0.3340352376302083, "y": 0.5663519965277778 },
      { "x": 0.3313720703125, "y": 0.4900390625 },
      { "x": 0.32564900716145834, "y": 0.37387152777777777 },
      { "x": 0.30609334309895836, "y": 0.31149088541666664 },
      { "x": 0.2715677897135417, "y": 0.28922164351851853 },
      { "x": 0.18220011393229166, "y": 0.3331958912037037 }
    ],
    zones: [
      {
        "id": "zone-1777012021112",
        "label": "level2.2",
        "polygon": [
          { "x": 0.8033406575520833, "y": 0.20891565393518519 },
          { "x": 0.8265116373697917, "y": 0.1761646412037037 },
          { "x": 0.9021728515625, "y": 0.2058521412037037 },
          { "x": 0.9236063639322917, "y": 0.26351273148148147 },
          { "x": 0.9144816080729167, "y": 0.42507957175925926 },
          { "x": 0.800006103515625, "y": 0.3619176793981482 }
        ],
        "targetPos": [4.38, 0, -2.9],
        "transitionTo": "level2.2"
      },
      {
        "id": "zone-1777012021113",
        "label": "level2.3",
        "polygon": [
          { "x": 0.19256184895833334, "y": 0.060423900462962976 },
          { "x": 0.310174560546875, "y": 0.060478153935185186 },
          { "x": 0.3170064290364583, "y": 0.16051070601851852 },
          { "x": 0.19739990234375, "y": 0.21053240740740742 }
        ],
        "targetPos": [-6.91, 0, -7.37],
        "transitionTo": "level2.3"
      },
      {
        "id": "zone-1777012021114",
        "label": "sulfate",
        "polygon": [
          { "x": 0.218938003508316, "y": 0.3094975910405598 },
          { "x": 0.27755312215761435, "y": 0.28896825762060135 },
          { "x": 0.31543197155990127, "y": 0.322942887298356 },
          { "x": 0.32152355931652804, "y": 0.5165215320488759 },
          { "x": 0.265982074697895, "y": 0.5571311019553207 },
          { "x": 0.2270091606029106, "y": 0.5103494946268383 }
        ],
        "targetPos": [-4.25, 0, -1],
        "items": ["sulfate"],
        "dialogAfterItemsObtained": "Already scavenged.",
        "dialog": "I need this for the main blast."
      },
      {
        "id": "zone-1777019388026",
        "label": "cans",
        "polygon": [
          { "x": 0.399298095703125, "y": 0.743992332175926 },
          { "x": 0.4329345703125, "y": 0.7373914930555555 },
          { "x": 0.4543701171875, "y": 0.8010959201388889 },
          { "x": 0.48774617513020835, "y": 0.8525571469907407 },
          { "x": 0.44814860026041664, "y": 0.8857928240740741 },
          { "x": 0.3919047037760417, "y": 0.7940972222222222 }
        ],
        "targetPos": [-1.5, 0, 4],
        "dialog": "Rusted and hollow. Nothing here."
      }
    ],
  },
  'level2.2': {
    background: '/assets/images/background/level2.2.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 15.0, camZ: 23.5, fov: 17, lookAtY: 0.5, lookAtX: -1.5 },
    spawns: {
      default: [-6.17, 0, 5.66, 150],
      'level2.1': [-6.17, 0, 5.66, 150],
      'level2.3': [3.41, 0, -6.07, -37]
    },
    boundary: [
      { "x": 0.706201171875, "y": 0.21389973958333333 },
      { "x": 0.8286885579427083, "y": 0.2985279224537037 },
      { "x": 0.7426900227864583, "y": 0.3831199363425926 },
      { "x": 0.7013264973958333, "y": 0.3754484953703704 },
      { "x": 0.6424845377604167, "y": 0.43879846643518516 },
      { "x": 0.6395609537760417, "y": 0.5109338831018518 },
      { "x": 0.7284444173177084, "y": 0.742578125 },
      { "x": 0.7697245279947916, "y": 0.7786928530092593 },
      { "x": 0.7622477213541666, "y": 0.8687608506944444 },
      { "x": 0.7964314778645833, "y": 0.90634765625 },
      { "x": 0.77181396484375, "y": 0.9453522858796296 },
      { "x": 0.6536275227864583, "y": 0.8406901041666667 },
      { "x": 0.6549906412760417, "y": 0.7670536747685185 },
      { "x": 0.5518330891927083, "y": 0.5224645543981481 },
      { "x": 0.3705647786458333, "y": 0.6999204282407407 },
      { "x": 0.29200642903645835, "y": 0.7110170717592592 },
      { "x": 0.20065714518229166, "y": 0.9453522858796296 },
      { "x": 0.07850138346354167, "y": 0.8825557002314814 },
      { "x": 0.17575276692708333, "y": 0.6584201388888888 },
      { "x": 0.3095499674479167, "y": 0.5677879050925926 }
    ],
    zones: [
      {
        "id": "zone-1777016816127",
        "label": "level2.1",
        "polygon": [
          { "x": 0.07107340494791667, "y": 0.7845413773148148 },
          { "x": 0.2363037109375, "y": 0.8819697627314815 },
          { "x": 0.2066650390625, "y": 0.9453522858796296 },
          { "x": 0.047979736328125, "y": 0.9427155671296297 }
        ],
        "targetPos": [-6.17, 0, 5.66],
        "transitionTo": "level2.1"
      },
      {
        "id": "zone-1777016816128",
        "label": "level2.3",
        "polygon": [
          { "x": 0.727777099609375, "y": 0.06324869791666664 },
          { "x": 0.7571044921875, "y": 0.053479456018518494 },
          { "x": 0.784820556640625, "y": 0.05887586805555553 },
          { "x": 0.8171000162760417, "y": 0.06345124421296293 },
          { "x": 0.8300984700520834, "y": 0.09120370370370368 },
          { "x": 0.846807861328125, "y": 0.191040943287037 },
          { "x": 0.8300984700520834, "y": 0.29120370370370363 },
          { "x": 0.7215413411458333, "y": 0.23066044560185184 },
          { "x": 0.71490478515625, "y": 0.13969907407407406 }
        ],
        "targetPos": [3.41, 0, -6.07],
        "transitionTo": "level2.3"
      },
      {
        "id": "zone-1777017592916",
        "label": "fuel",
        "polygon": [
          { "x": 0.763531494140625, "y": 0.865625 },
          { "x": 0.7682149251302083, "y": 0.7681676793981481 },
          { "x": 0.8119893391927083, "y": 0.7276403356481481 },
          { "x": 0.8682454427083334, "y": 0.808326099537037 },
          { "x": 0.8705729166666667, "y": 0.9099537037037038 },
          { "x": 0.8205464680989584, "y": 0.9171802662037037 }
        ],
        "targetPos": [2.07, 0, 4.17],
        "requiredItems": [],
        "items": ["fuel"],
        "dialog": "This will make the blast much stronger.",
        "dialogAfterItemsObtained": "Already have the fuel."
      }
    ],
  },
  'level2.3': {
    background: '/assets/images/background/level2.3.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 30.0, camZ: 9.5, fov: 17, lookAtY: 1.5, lookAtX: 0.0 },
    spawns: {
      default: [-7.24, 0, -0.33, 90],
      'level2.1': [-7.24, 0, -0.33, 90],
      'level2.2': [7.57, 0, -0.35, -90],
    },
    boundary: [
      { "x": 0.11154988606770834, "y": 0.3867332175925926 },
      { "x": 0.3682657877604167, "y": 0.3923213252314815 },
      { "x": 0.383270263671875, "y": 0.4450882523148148 },
      { "x": 0.4257609049479167, "y": 0.4391203703703704 },
      { "x": 0.4386678059895833, "y": 0.48921440972222224 },
      { "x": 0.5691691080729167, "y": 0.4672381365740741 },
      { "x": 0.5845845540364583, "y": 0.43361906828703706 },
      { "x": 0.6728434244791667, "y": 0.4824363425925926 },
      { "x": 0.751220703125, "y": 0.4485966435185185 },
      { "x": 0.7744038899739584, "y": 0.39551866319444445 },
      { "x": 0.9020263671875, "y": 0.39900535300925927 },
      { "x": 0.9121805826822916, "y": 0.4406792534722222 },
      { "x": 0.9455118815104167, "y": 0.44708116319444446 },
      { "x": 0.95009765625, "y": 0.5961190682870371 },
      { "x": 0.9153666178385417, "y": 0.5723849826388889 },
      { "x": 0.8921000162760416, "y": 0.5354419849537037 },
      { "x": 0.86851806640625, "y": 0.5597945601851851 },
      { "x": 0.831024169921875, "y": 0.5618923611111111 },
      { "x": 0.8185892740885417, "y": 0.6091941550925926 },
      { "x": 0.79285888671875, "y": 0.6131980613425926 },
      { "x": 0.7767557779947917, "y": 0.6296296296296297 },
      { "x": 0.769891357421875, "y": 0.6745153356481481 },
      { "x": 0.71129150390625, "y": 0.6714265046296296 },
      { "x": 0.7068929036458333, "y": 0.6342990451388889 },
      { "x": 0.69307861328125, "y": 0.6171151620370371 },
      { "x": 0.11185302734375, "y": 0.6138346354166667 },
      { "x": 0.10762736002604166, "y": 0.5759150752314814 },
      { "x": 0.093829345703125, "y": 0.5494249131944444 },
      { "x": 0.09447224934895833, "y": 0.4507848668981482 },
      { "x": 0.10937296549479167, "y": 0.4322120949074074 }
    ],
    zones: [
      {
        "id": "zone-1777018202874",
        "label": "level2.1",
        "polygon": [
          { "x": 0.04195556640625, "y": 0.43758680555555557 },
          { "x": 0.06806640625, "y": 0.37451171875 },
          { "x": 0.09004109700520833, "y": 0.3744140625 },
          { "x": 0.11048583984375, "y": 0.42442129629629627 },
          { "x": 0.11108601888020833, "y": 0.5804108796296297 },
          { "x": 0.09666748046875, "y": 0.6233977141203704 },
          { "x": 0.07232462565104167, "y": 0.6275788483796296 },
          { "x": 0.04024454752604167, "y": 0.5568033854166666 }
        ],
        "targetPos": [-7.24, 0, -0.33],
        "transitionTo": "level2.1"
      },
      {
        "id": "zone-1777018202875",
        "label": "level2.2",
        "polygon": [
          { "x": 0.9093302408854167, "y": 0.41408781828703706 },
          { "x": 0.9337076822916667, "y": 0.3748408564814815 },
          { "x": 0.9590433756510417, "y": 0.38232421875 },
          { "x": 0.979443359375, "y": 0.43726128472222225 },
          { "x": 0.9781840006510417, "y": 0.5561921296296296 },
          { "x": 0.9533040364583333, "y": 0.6231879340277778 },
          { "x": 0.931573486328125, "y": 0.6295102719907407 },
          { "x": 0.90966796875, "y": 0.5937355324074074 }
        ],
        "targetPos": [7.57, 0, -0.35],
        "transitionTo": "level2.2"
      },
      {
        "id": "zone-1777018881255",
        "label": "igniter",
        "polygon": [
          { "x": 0.7023661295572917, "y": 0.7100368923611111 },
          { "x": 0.7813151041666667, "y": 0.7077076099537037 },
          { "x": 0.7817972819010417, "y": 0.7916485821759259 },
          { "x": 0.7039204915364583, "y": 0.7904730902777778 }
        ],
        "targetPos": [4.3, 0, 1.39],
        "items": ["igniter"],
        "dialog": "The trigger. Just what I need to set off the blast.",
        "dialogAfterItemsObtained": "Already have the igniter."
      },
      {
        "id": "zone-1777018881256",
        "label": "stone",
        "polygon": [
          { "x": 0.5676228841145833, "y": 0.32091290509259257 },
          { "x": 0.5816792805989583, "y": 0.2311306423611111 },
          { "x": 0.602392578125, "y": 0.17590784143518517 },
          { "x": 0.6576985677083333, "y": 0.13149233217592593 },
          { "x": 0.735357666015625, "y": 0.1692599826388889 },
          { "x": 0.768408203125, "y": 0.2537254050925926 },
          { "x": 0.7730631510416667, "y": 0.35877459490740743 },
          { "x": 0.7439595540364583, "y": 0.4469256365740741 },
          { "x": 0.6793233235677083, "y": 0.47658781828703706 },
          { "x": 0.59412841796875, "y": 0.4413375289351852 }
        ],
        "targetPos": [2.58, 0, -0.5],
        "dialog": "Can't get through, I need something to destroy this.",
        "requiredItems": ["igniter", "fuel", "sulfate"],
        "dialogAfterRequiredItems": "Let's make this kaboom!",
        "transitionTo": "/intro/ghost-lab"
      },
      {
        "id": "zone-1777018881257",
        "label": "piles",
        "polygon": [
          { "x": 0.43335164388020836, "y": 0.40232566550925924 },
          { "x": 0.47206013997395835, "y": 0.3912145543981482 },
          { "x": 0.48544921875, "y": 0.37494936342592594 },
          { "x": 0.520355224609375, "y": 0.36085069444444445 },
          { "x": 0.5360453287760417, "y": 0.3874312789351852 },
          { "x": 0.5547709147135417, "y": 0.4389503761574074 },
          { "x": 0.542010498046875, "y": 0.4714988425925926 },
          { "x": 0.5230082194010417, "y": 0.4847800925925926 },
          { "x": 0.518011474609375, "y": 0.5117223668981481 },
          { "x": 0.4969278971354167, "y": 0.5129231770833333 },
          { "x": 0.4777140299479167, "y": 0.4906322337962963 },
          { "x": 0.4326863606770833, "y": 0.48361183449074074 }
        ],
        "targetPos": [-0.72, 0, -0.33],
        "dialog": "Nothing but scrap and dust."
      }
    ],
  },
}

const INTRO_DIALOGS = [
  { text: "Well, look who finally showed up. You're late, Jace.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "How do you know my name? Who are you exactly?", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
  { text: "Someone who knows more than you do. But we don't have time for pleasantries.", portrait: "/assets/images/portrait/old-jace-portrait.webp", side: 'right' as const },
  { text: "Wait! Where is he? He's just disappeared!", portrait: "/assets/images/portrait/young-jace-portrait.webp", side: 'left' as const },
]

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

export default function Refinery() {
  const navigate = useNavigate()
  const keys = useKeyboard()
  const { obtainItem, resetWithDefaults } = useInventoryStore()

  // Set default level if entering the stage for the first time
  // Always reset to starting level of this stage on fresh load/refresh
  const initLevelId = 'level2.1'

  const [levelState, setLevelState] = useState({ id: initLevelId, from: 'default' })
  const currentLevelId = levelState.id
  const previousLevelId = levelState.from

  // Reset inventory on mount (handles refresh)
  useEffect(() => {
    resetWithDefaults(['rebar', 'wrench', 'wire', 'battery'])
  }, [resetWithDefaults])

  const [hintsEnabled, setHintsEnabled] = useState(() => {
    const saved = localStorage.getItem('scavender_hints_enabled')
    return saved === null ? false : saved === 'true'
  })

  // Perist hints setting
  useEffect(() => {
    localStorage.setItem('scavender_hints_enabled', hintsEnabled.toString())
  }, [hintsEnabled])

  const MINI_GOAL_CONFIG: Record<string, string> = {
    stone: "Find components to make explosive to destroy the stone",
    sulfate: "Find sulfate box in first tunnel",
    fuel: "Find fuel in second tunnel",
    igniter: "Find igniter inside box at the junction",
  }
  const MINI_GOAL_ORDER = hintsEnabled ? ['sulfate', 'fuel', 'igniter'] : ['stone']
  const [activeMiniGoals, setActiveMiniGoals] = useState<string[]>([])

  const { obtainedItems } = useInventoryStore()
  useEffect(() => {
    const hasSulfate = obtainedItems.includes('sulfate')
    const hasFuel = obtainedItems.includes('fuel')
    const hasIgniter = obtainedItems.includes('igniter')

    setActiveMiniGoals(prev => prev.filter(id => {
      if (id === 'stone' && (hasSulfate && hasFuel && hasIgniter)) return false
      if (id === 'sulfate' && hasSulfate) return false
      if (id === 'fuel' && hasFuel) return false
      if (id === 'igniter' && hasIgniter) return false
      return true
    }))
  }, [obtainedItems])

  // Sync goals when hints toggled
  useEffect(() => {
    const hasSulfate = obtainedItems.includes('sulfate')
    const hasFuel = obtainedItems.includes('fuel')
    const hasIgniter = obtainedItems.includes('igniter')
    const allFound = hasSulfate && hasFuel && hasIgniter

    setActiveMiniGoals(prev => {
      if (prev.length === 0) return prev

      if (hintsEnabled) {
        // Convert 'stone' to individual goals if not all found
        if (prev.includes('stone') && !allFound) {
          const next = prev.filter(id => id !== 'stone')
          if (!hasSulfate) next.push('sulfate')
          if (!hasFuel) next.push('fuel')
          if (!hasIgniter) next.push('igniter')
          return next
        }
      } else {
        // Convert individual goals to 'stone'
        const hasIndividual = prev.includes('sulfate') || prev.includes('fuel') || prev.includes('igniter')
        if (hasIndividual && !allFound) {
          return ['stone']
        }
      }
      return prev
    })
  }, [hintsEnabled, obtainedItems])

  const level = LEVELS[currentLevelId] || LEVELS['level2.1']
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
  const introDialogIndexRef = useRef<number | null>(null)

  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(spawnPos)
  const [charRotation, setCharRotation] = useState(0)
  const [autoWalkTarget, setAutoWalkTarget] = useState<[number, number, number] | null>(null)
  const [pendingZone, setPendingZone] = useState<InteractiveZone | null>(null)

  const [activeHydraSpawn, setActiveHydraSpawn] = useState<[number, number, number] | null>(null)
  const [introDialogIndex, setIntroDialogIndex] = useState<number | null>(null)
  const [introCompleted, setIntroCompleted] = useState(false)

  // Manage dynamic hydra spawn
  useEffect(() => {
    if (previousLevelId === 'default') {
      // First load: Start intro dialog
      setIntroDialogIndex(0)
      setActiveHydraSpawn(null)
    } else {
      // Subsequent levels: wait 1 second, then spawn at character's spawn position
      setActiveHydraSpawn(null)
      const timer = setTimeout(() => {
        setActiveHydraSpawn(spawnPos)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentLevelId, previousLevelId, spawnPos])

  // Spawn hydra after intro completes
  useEffect(() => {
    if (previousLevelId === 'default' && introCompleted && !activeHydraSpawn) {
      setActiveHydraSpawn([-6.91, 0, -7.37])
    }
  }, [introCompleted, previousLevelId, activeHydraSpawn])

  // Sequence state
  const [pendingItemsToGive, setPendingItemsToGive] = useState<string[]>([])
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)

  // Keep dialog/puzzle/item refs in sync
  useEffect(() => { activeDialogRef.current = activeDialog }, [activeDialog])
  useEffect(() => { activePuzzleZoneRef.current = activePuzzleZone }, [activePuzzleZone])
  useEffect(() => { pendingItemsRef.current = pendingItemsToGive }, [pendingItemsToGive])
  useEffect(() => { inventoryVisibleRef.current = inventoryVisible }, [inventoryVisible])
  useEffect(() => { introDialogIndexRef.current = introDialogIndex }, [introDialogIndex])
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
  const charRotationRef = useRef<number>(spawnRot * (Math.PI / 180))

  useEffect(() => {
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    const initialRotRad = spawnRot * (Math.PI / 180)
    setCharRotation(initialRotRad)
    charRotationRef.current = initialRotRad
  }, [currentLevelId, previousLevelId, spawnPos, spawnRot])

  // Sequence effect: trigger transition only after dialog and items are cleared
  useEffect(() => {
    if (!activeDialog && !activePuzzleZone && pendingItemsToGive.length === 0 && pendingTransition) {
      if (pendingTransition.startsWith('/')) {
        navigate(pendingTransition)
      } else {
        setLevelState({ id: pendingTransition, from: currentLevelId })
      }
      setPendingTransition(null)
    }
  }, [activeDialog, activePuzzleZone, pendingItemsToGive.length, pendingTransition, currentLevelId, navigate])

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

    if (!canSucceed) {
      if (zone.label === 'stone') {
        if (hintsEnabled) {
          const goalsToAdd = ['sulfate', 'fuel', 'igniter'].filter(id => !obtainedItems.includes(id))
          setActiveMiniGoals(prev => {
            const next = [...prev]
            goalsToAdd.forEach(g => {
              if (!next.includes(g)) next.push(g)
            })
            return next
          })
        } else {
          if (!activeMiniGoals.includes('stone')) {
            setActiveMiniGoals(prev => [...prev, 'stone'])
          }
        }
      }
    }

    // Process success state (giving items, transitioning)
    if (canSucceed) {
      if (unobtainedItems.length > 0) setPendingItemsToGive(unobtainedItems)
      if (zone.transitionTo?.trim()) setPendingTransition(zone.transitionTo.trim())
    }
  }, [activeMiniGoals, hintsEnabled, obtainedItems])

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
    charRotationRef.current = rot
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

  const toggleHints = useCallback(() => setHintsEnabled(v => !v), [])

  const handleGoalClick = useCallback((goalId: string) => {
    // For now only stone is a goal, but we can expand this
    const zoneLabel = goalId
    const zone = zones.find(z => z.label === zoneLabel)
    if (zone) {
      handleZoneClick(zone)
    }
  }, [zones, handleZoneClick])

  const toggleBoundaryEditor = () => setBoundaryEditorVisible(v => !v)
  const toggleZoneEditor = () => setZoneEditorVisible(v => !v)

  const handleGameOver = useCallback(() => {
    navigate('/game-over', { state: { returnUrl: '/refinery', levelId: currentLevelId } })
  }, [navigate, currentLevelId])

  return (
    <div id="game-root" ref={gameRootRef}>
      <BackgroundAudio src="/assets/audio/refinery.ogg" />
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
            hydraSpawn={activeHydraSpawn || undefined}
            onGameOver={handleGameOver}
            miller={currentLevelId === 'level2.1' && !introCompleted ? {
              position: [-5.70, 0, -5.67],
              rotation: 45,
              shouldFade: introDialogIndex === 3
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

      {/* ─── HUD Layer ────────────────────────────────────────────────── */}
      <div id="goal-hud">
        <div className="goal-card">
          <span className="goal-text">Go after the mysterious man</span>
          {MINI_GOAL_ORDER.some(id => activeMiniGoals.includes(id)) && (
            <div className="goal-sub-list">
              {MINI_GOAL_ORDER
                .filter(id => activeMiniGoals.includes(id))
                .map(id => (
                  <div
                    key={id}
                    className="goal-sub-item clickable"
                    onClick={() => handleGoalClick(id)}
                  >
                    {MINI_GOAL_CONFIG[id]}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* HUD components */}
      <div id="hud">
        <div className="hud-badge">WASD / ↑↓←→ Move | Shift + Move = Run</div>
        <div className="hud-badge">Click Objective to Auto Run to it</div>
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
