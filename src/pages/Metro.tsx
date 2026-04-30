import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { useLevelStore } from '../store/useLevelStore'
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
  'level1.1': {
    background: '/assets/images/background/level1.1.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 2.0, camZ: 9.5, fov: 50, lookAtY: 1.5, lookAtX: 0.0 },
    spawns: {
      default: [5.58, 0, -6, 8],
      'level1.2': [8.24, 0, -5, -62],
      'level1.3': [-0.6, 0, 0.11, 57],
      portal: [-6.89, 0, 0.17, 45],
    },
    boundary: [{ "x": 0.0035725911458333332, "y": 0.7931242766203703 }, { "x": 0.057725016276041666, "y": 0.73212890625 }, { "x": 0.05565592447916667, "y": 0.6397786458333333 }, { "x": 0.14862467447916666, "y": 0.6305410879629629 }, { "x": 0.19569091796875, "y": 0.6776439525462963 }, { "x": 0.22461751302083333, "y": 0.6930808738425925 }, { "x": 0.2505615234375, "y": 0.6937102141203704 }, { "x": 0.44749552408854165, "y": 0.6488534432870371 }, { "x": 0.47005818684895834, "y": 0.6314199942129629 }, { "x": 0.5108846028645834, "y": 0.6256293402777777 }, { "x": 0.6644673665364583, "y": 0.5900173611111111 }, { "x": 0.6895914713541667, "y": 0.5599681712962963 }, { "x": 0.7216878255208333, "y": 0.5663230613425926 }, { "x": 0.7752583821614584, "y": 0.56767578125 }, { "x": 0.8527099609375, "y": 0.5801938657407407 }, { "x": 0.917559814453125, "y": 0.582765480324074 }, { "x": 0.7836507161458334, "y": 0.6501302083333333 }, { "x": 0.11198527018229167, "y": 0.9260669849537037 }, { "x": 0.0026529947916666668, "y": 0.9277199074074074 }],
    zones: [
      {
        "id": "zone-1776438025104",
        "label": "level1.2",
        "polygon": [
          { "x": 0.7591145833333334, "y": 0.4593388310185185 },
          { "x": 0.8028889973958333, "y": 0.4311812789351852 },
          { "x": 0.849945068359375, "y": 0.4494574652777778 },
          { "x": 0.8525736490885417, "y": 0.5649920428240741 },
          { "x": 0.7587381998697916, "y": 0.5529477719907407 }
        ],
        "targetPos": [8.24, 0, -5],
        "transitionTo": "level1.2"
      },
      {
        "id": "zone-1776438025105",
        "label": "level1.3",
        "polygon": [
          { "x": 0.3397745768229167, "y": 0.32361834490740743 },
          { "x": 0.36549479166666665, "y": 0.32741608796296295 },
          { "x": 0.4755655924479167, "y": 0.6316370081018519 },
          { "x": 0.44482014973958334, "y": 0.6380099826388889 },
          { "x": 0.4406229654947917, "y": 0.5996636284722222 },
          { "x": 0.4345621744791667, "y": 0.5575122974537037 },
          { "x": 0.41049397786458336, "y": 0.5454861111111111 }
        ],
        "targetPos": [-0.6, 0, 0.11],
        "transitionTo": "level1.3"
      },
      {
        "id": "zone-1776485397071",
        "label": "chest",
        "polygon": [
          { "x": 0.35591227213541665, "y": 0.6024992766203704 },
          { "x": 0.40390421549479166, "y": 0.5922200520833333 },
          { "x": 0.42872721354166665, "y": 0.6019495081018519 },
          { "x": 0.42867838541666664, "y": 0.6589771412037037 },
          { "x": 0.378485107421875, "y": 0.6729817708333333 },
          { "x": 0.354669189453125, "y": 0.657837818287037 }
        ],
        "targetPos": [-1.59, 0, 1.46],
        "requiredItems": ["rebar"],
        "dialog": "I need something sturdy to pry this open.",
        "dialogAfterRequiredItems": "The rebar should do it. Time to pry.",
        "items": ["wrench", "wire"],
        "dialogAfterItemsObtained": "Nothing left but rust."
      },
      {
        "id": "zone-1776490943211",
        "label": "broken_elevator",
        "polygon": [
          { "x": 0.38996785481770835, "y": 0.33617983217592595 },
          { "x": 0.42076416015625, "y": 0.3429832175925926 },
          { "x": 0.536456298828125, "y": 0.6043004918981482 },
          { "x": 0.5016255696614583, "y": 0.6131618923611111 },
          { "x": 0.5010579427083334, "y": 0.5624312789351852 },
          { "x": 0.46725260416666664, "y": 0.5376772280092592 }
        ],
        "targetPos": [0.53, 0, -0.49],
        "dialog": "Looks dangerous, I'll go with the left one."
      },
      {
        "id": "zone-1776490943212",
        "label": "vending",
        "polygon": [
          { "x": 0.5986307779947917, "y": 0.42893156828703705 },
          { "x": 0.6352010091145833, "y": 0.4349754050925926 },
          { "x": 0.6362040201822917, "y": 0.5906647858796297 },
          { "x": 0.5997538248697918, "y": 0.5978407118055555 }
        ],
        "targetPos": [2.78, 0, -2.46],
        "dialog": "People used to stand here... choosing snack like it mattered."
      },
      {
        "id": "zone-1776490943213",
        "label": "rubble",
        "polygon": [
          { "x": 0.70299072265625, "y": 0.4322301793981482 },
          { "x": 0.7123514811197916, "y": 0.48603877314814814 },
          { "x": 0.6940388997395833, "y": 0.5506148726851852 },
          { "x": 0.6725911458333333, "y": 0.5411096643518518 },
          { "x": 0.6629414876302083, "y": 0.492994068287037 },
          { "x": 0.6624593098958333, "y": 0.43416883680555557 },
          { "x": 0.6833841959635417, "y": 0.41135344328703705 }
        ],
        "targetPos": [5.58, 0, -6],
        "items": ["rebar"],
        "dialog": "I can use this rebar for something.",
        "dialogAfterItemsObtained": "Nothing useful here anymore."
      },
      {
        "id": "zone-1776490943214",
        "label": "portal",
        "polygon": [
          { "x": 0.04599609375, "y": 0.3944842303240741 },
          { "x": 0.10525309244791667, "y": 0.35065104166666666 },
          { "x": 0.16197102864583332, "y": 0.3922055844907407 },
          { "x": 0.16807047526041666, "y": 0.4892361111111111 },
          { "x": 0.14954833984375, "y": 0.5615957754629629 },
          { "x": 0.11286417643229167, "y": 0.5991102430555556 },
          { "x": 0.07122802734375, "y": 0.5908817997685185 },
          { "x": 0.04590047200520833, "y": 0.5482385706018519 }
        ],
        "targetPos": [-6.89, 0, 0.17],
        "transitionTo": "https://vibej.am/portal/2026?ref=scavender.mhirsd.com",
        "items": [],
        "dialog": "A flicker in a shape of portal. I wonder where this leads to?"
      }
    ]
  },
  'level1.2': {
    background: '/assets/images/background/level1.2.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 1.5, camZ: 1.0, fov: 24, lookAtY: 1.5, lookAtX: -0.5 },
    spawns: {
      default: [-10.50, 0, -9.58, 58.52],
      'level1.1': [-10.50, 0, -9.58, 58.52],
      'level1.4': [-1.05, 0, -6.57, -14]
    },
    boundary: [{ "x": 0.09431966145833333, "y": 0.7247721354166666 }, { "x": 0.15298665364583333, "y": 0.6715205439814815 }, { "x": 0.18495279947916668, "y": 0.6668402777777778 }, { "x": 0.31815999348958335, "y": 0.7361328125 }, { "x": 0.375677490234375, "y": 0.7265407986111111 }, { "x": 0.4768575032552083, "y": 0.7397497106481481 }, { "x": 0.5302744547526042, "y": 0.7790183738425926 }, { "x": 0.988909912109375, "y": 0.92119140625 }, { "x": 0.34518636067708336, "y": 0.9282045717592593 }, { "x": 0.186541748046875, "y": 0.919921875 }, { "x": 0.15782267252604168, "y": 0.8189489293981481 }, { "x": 0.12866414388020833, "y": 0.7677734375 }],
    zones: [
      {
        "id": "zone-1775917962418",
        "label": "level1.1",
        "polygon": [
          { "x": 0.06154581705729167, "y": 0.2764576099537037 },
          { "x": 0.179583740234375, "y": 0.2811414930555556 },
          { "x": 0.17919921875, "y": 0.5404152199074074 },
          { "x": 0.176800537109375, "y": 0.6742693865740741 },
          { "x": 0.099969482421875, "y": 0.7162324584199584 },
          { "x": 0.05784912109375, "y": 0.7135037681912682 }
        ],
        "targetPos": [-10.5, 0, -9.58],
        "transitionTo": "level1.1"
      },
      {
        "id": "zone-1775989707645",
        "label": "level1.4",
        "polygon": [
          { "x": 0.8855794270833333, "y": 0.17397641782407403 },
          { "x": 0.9337280273437499, "y": 0.17397641782407403 },
          { "x": 0.9388631184895834, "y": 0.862084056712963 },
          { "x": 0.88563232421875, "y": 0.8557725694444444 }
        ],
        "targetPos": [-1.05, 0, -6.57],
        "transitionTo": "level1.4"
      },
      {
        "id": "zone-1776569979032",
        "label": "tires",
        "polygon": [
          { "x": 0.22962443033854166, "y": 0.6249457465277778 },
          { "x": 0.2565511067708333, "y": 0.6070855034722222 },
          { "x": 0.27176106770833336, "y": 0.62939453125 },
          { "x": 0.265545654296875, "y": 0.6663773148148148 },
          { "x": 0.2795328776041667, "y": 0.6700231481481481 },
          { "x": 0.29229736328125, "y": 0.6496383101851851 },
          { "x": 0.31628214518229164, "y": 0.648195167824074 },
          { "x": 0.3554768880208333, "y": 0.6940357349537037 },
          { "x": 0.34828287760416665, "y": 0.7301540798611111 },
          { "x": 0.24204915364583332, "y": 0.6999457465277777 },
          { "x": 0.21149495442708338, "y": 0.68720703125 }
        ],
        "targetPos": [-7.28, 0, -8.72],
        "dialog": "Tires? Down here? The surface must have leaked into the depths."
      },
      {
        "id": "zone-1776569979033",
        "label": "vending",
        "polygon": [
          { "x": 0.5383321126302083, "y": 0.3281105324074074 },
          { "x": 0.6745951334635417, "y": 0.30215928819444443 },
          { "x": 0.6767862955729167, "y": 0.7988570601851852 },
          { "x": 0.5386800130208333, "y": 0.7623987268518518 }
        ],
        "targetPos": [-3.71, 0, -7.2],
        "requiredItems": ["wire", "wrench"],
        "puzzleId": "metro-vending",
        "dialogAfterRequiredItems": "Wrench fits. Let's get that battery out.",
        "dialog": "There's a live battery inside, but the bolts are too tight. I need something to open the bolts.",
        "items": ["battery"],
        "dialogAfterItemsObtained": "Already scavenged the battery."
      },
      {
        "id": "zone-1776569979034",
        "label": "trash",
        "polygon": [
          { "x": 0.7014689127604167, "y": 0.6525716145833333 },
          { "x": 0.7279093424479167, "y": 0.5780309606481482 },
          { "x": 0.8035664876302083, "y": 0.5825484664351852 },
          { "x": 0.8067057291666667, "y": 0.8177191840277778 },
          { "x": 0.7773396809895833, "y": 0.846925636574074 },
          { "x": 0.7001953125, "y": 0.8290364583333333 }
        ],
        "targetPos": [-2, 0, -6.83],
        "dialog": "Empty junk."
      }
    ]
  },
  'level1.3': {
    background: '/assets/images/background/level1.3.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 2.5, camZ: 15.0, fov: 25, lookAtY: 1.0, lookAtX: 0.0 },
    spawns: {
      default: [-4.3, 0, 1.23, 44.73],
      'level1.1': [-4.3, 0, 1.23, 44.73],
    },
    boundary: [{ "x": 0, "y": 0.8072048611111111 }, { "x": 0.13159586588541666, "y": 0.7265769675925926 }, { "x": 0.1502685546875, "y": 0.6567672164351852 }, { "x": 0.19736328125, "y": 0.6413158275462963 }, { "x": 0.27847493489583336, "y": 0.6615523726851852 }, { "x": 0.33480224609375, "y": 0.6331307870370371 }, { "x": 0.38653157552083334, "y": 0.634400318287037 }, { "x": 0.435498046875, "y": 0.5979094328703703 }, { "x": 0.8338216145833334, "y": 0.73212890625 }, { "x": 0.8798624674479166, "y": 0.9252387152777778 }, { "x": 0, "y": 0.9247540509259259 }],
    zones: [
      {
        "id": "zone-1775989334539",
        "label": "level1.1",
        "polygon": [
          { "x": 0.09050903320312499, "y": 0.3094910836880845 },
          { "x": 0.15650227864583333, "y": 0.31940104166666666 },
          { "x": 0.15978800455729167, "y": 0.6127133969907408 },
          { "x": 0.09104817708333332, "y": 0.6554332350111275 }
        ],
        "targetPos": [-4.3, 0, 1.23],
        "transitionTo": "level1.1"
      },
      {
        "id": "zone-1775995600627",
        "label": "terminal",
        "polygon": [
          { "x": 0.3350911458333333, "y": 0.3778284143518518 },
          { "x": 0.3987955729166667, "y": 0.37595124421296294 },
          { "x": 0.40101521809895835, "y": 0.44818060851300584 },
          { "x": 0.413702392578125, "y": 0.4880316840277778 },
          { "x": 0.414678955078125, "y": 0.5182508680555555 },
          { "x": 0.37020874023437506, "y": 0.5305262534964679 },
          { "x": 0.3368876139322917, "y": 0.5162449690422231 }
        ],
        "targetPos": [-0.92, 0, 1.08],
        "requiredItems": ["wire", "battery"],
        "dialog": "I think I can still use this terminal, but got no access. If I have some battery and wire, maybe I can make a jumpstart kit.",
        "dialogAfterRequiredItems": "Let's see if this works.",
        "puzzleId": "metro-pipe",
        "transitionTo": "/intro/refinery"
      },
      {
        "id": "zone-1775995600628",
        "label": "door",
        "polygon": [
          { "x": 0.51805419921875, "y": 0.2704861111111111 },
          { "x": 0.8074361165364583, "y": 0.24500144675925925 },
          { "x": 0.8033162434895833, "y": 0.6994972511574075 },
          { "x": 0.5185384114583333, "y": 0.6160915798611111 }
        ],
        "targetPos": [1.32, 0, 2.47],
        "dialog": "Locked tight, need to use that terminal."
      }
    ]
  },
  'level1.4': {
    background: '/assets/images/background/level1.4.webp',
    imageW: IMG_W,
    imageH: IMG_H,
    cameraConfig: { camY: 1.5, camZ: 16.0, fov: 45, lookAtY: 1.0, lookAtX: 0.0 },
    spawns: {
      default: [-0.74, 0, 11.09, 39.34],
      'level1.2': [-0.74, 0, 11.09, 39.34],
    },
    boundary: [{ "x": 0, "y": 0.8072048611111111 }, { "x": 0.13159586588541666, "y": 0.7265769675925926 }, { "x": 0.1502685546875, "y": 0.6567672164351852 }, { "x": 0.19736328125, "y": 0.6413158275462963 }, { "x": 0.27847493489583336, "y": 0.6615523726851852 }, { "x": 0.33480224609375, "y": 0.6331307870370371 }, { "x": 0.38653157552083334, "y": 0.634400318287037 }, { "x": 0.435498046875, "y": 0.5979094328703703 }, { "x": 0.8338216145833334, "y": 0.73212890625 }, { "x": 0.8798624674479166, "y": 0.9252387152777778 }, { "x": 0, "y": 0.9247540509259259 }],
    zones: [
      {
        "id": "zone-1775989707646",
        "label": "level1.2",
        "polygon": [
          { "x": 0.36385498046875, "y": 0.7102651836347442 },
          { "x": 0.4821085611979167, "y": 0.7631653696876659 },
          { "x": 0.3688273111979167, "y": 0.8490985629070705 },
          { "x": 0.24287923177083331, "y": 0.770104454582925 }
        ],
        "targetPos": [-0.74, 0, 11.09],
        "transitionTo": "level1.2"
      },
      {
        "id": "zone-1775996700077",
        "label": "watch",
        "polygon": [
          { "x": 0.446630859375, "y": 0.4441752307796358 },
          { "x": 0.51475830078125, "y": 0.4459280904819512 },
          { "x": 0.51494140625, "y": 0.5360216337564825 },
          { "x": 0.4938028971354167, "y": 0.544876374660562 },
          { "x": 0.447064208984375, "y": 0.5334332586186656 }
        ],
        "targetPos": [-0.33, 0, 10.93],
        "dialog": "One of those frozen in time. There is some initial behind the watch, but the first word is too scratched: \"░M\" ",
        "items": ["watch"],
        "dialogAfterItemsObtained": "There's nothing here."
      },
      {
        "id": "zone-1776001247018",
        "label": "control_panel",
        "polygon": [
          { "x": 0.5434102376302083, "y": 0.28578197337962963 },
          { "x": 0.8027974446614583, "y": 0.22492971573333953 },
          { "x": 0.8068359375, "y": 0.41519097222222223 },
          { "x": 0.8069620768229167, "y": 0.49001374421296306 },
          { "x": 0.7810404459635416, "y": 0.582591869212963 },
          { "x": 0.527935791015625, "y": 0.5600188078703704 },
          { "x": 0.5522481282552083, "y": 0.47974898726851856 },
          { "x": 0.5569234212239582, "y": 0.3871925636574074 }
        ],
        "targetPos": [0.79, 0, 11],
        "dialog": "Lights are on, but there’s nothing here that helps me get upstairs."
      }
    ]
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
  { text: "A Flicker Storm is sweeping toward the village.", portrait: "/assets/images/portrait/young-jace-portrait.png", side: 'left' as const },
  { text: "The signal triggering it is coming from the high upper levels.", portrait: "/assets/images/portrait/young-jace-portrait.png", side: 'left' as const },
  { text: "I have to find a way up before my home is erased.", portrait: "/assets/images/portrait/young-jace-portrait.png", side: 'left' as const },
]

export default function Metro() {
  const keys = useKeyboard()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentLevelId: savedLevelId, setCurrentLevel } = useLevelStore()
  const { obtainItem, resetWithDefaults } = useInventoryStore()

  // Detect portal entry from another game
  const isPortalEntry = useMemo(() => searchParams.get('portal') === 'true', [searchParams])
  // Always reset to level 1.1 on fresh load/refresh
  const initialLevelId = 'level1.1'
  const initialFrom = isPortalEntry ? 'portal' : 'default'

  const [levelState, setLevelState] = useState({ id: initialLevelId, from: initialFrom })
  const currentLevelId = levelState.id
  const previousLevelId = levelState.from

  // Reset store to level 1.1 on mount (handles refresh)
  useEffect(() => {
    setCurrentLevel('level1.1')
    resetWithDefaults([])
  }, [setCurrentLevel, resetWithDefaults]) // Empty dependency array ensures this only runs once on mount

  // Handle portal entry store update
  useEffect(() => {
    if (isPortalEntry) {
      setCurrentLevel('level1.1')
    }
  }, [isPortalEntry, setCurrentLevel])

  // Sync level state if store changes externally (e.g. reset)
  useEffect(() => {
    // Only sync from store if the saved level is different AND belongs to this stage
    // AND we are not on the very first mount (to allow the forced reset to win)
    if (savedLevelId !== levelState.id && savedLevelId.startsWith('level1.') && !isPortalEntry) {
      setLevelState({ id: savedLevelId, from: 'default' })
    }
  }, [savedLevelId, levelState.id, isPortalEntry])

  const [hintsEnabled, setHintsEnabled] = useState(() => {
    const saved = localStorage.getItem('scavender_hints_enabled')
    return saved === null ? false : saved === 'true'
  })

  // Perist hints setting
  useEffect(() => {
    localStorage.setItem('scavender_hints_enabled', hintsEnabled.toString())
  }, [hintsEnabled])

  const MINI_GOAL_CONFIG: Record<string, string> = {
    terminal: hintsEnabled 
      ? "Find battery inside vending and wire inside chest to jumpstart terminal" 
      : "Find battery and wire to jumpstart terminal",
    vending: hintsEnabled 
      ? "Find wrench inside chest to open vending machine bolts" 
      : "Find wrench to open vending machine bolts",
    chest: hintsEnabled 
      ? "Find rebar in rubble near vending to open chest" 
      : "Find rebar to open chest"
  }
  const MINI_GOAL_ORDER = ['terminal', 'vending', 'chest']
  const [activeMiniGoals, setActiveMiniGoals] = useState<string[]>([])

  const { obtainedItems } = useInventoryStore()
  useEffect(() => {
    const hasBattery = obtainedItems.includes('battery')
    const hasWire = obtainedItems.includes('wire')
    const hasWrench = obtainedItems.includes('wrench')
    const hasRebar = obtainedItems.includes('rebar')

    setActiveMiniGoals(prev => prev.filter(id => {
      if (id === 'terminal' && (hasBattery && hasWire)) return false
      if (id === 'vending' && hasWrench) return false
      if (id === 'chest' && hasRebar) return false
      return true
    }))
  }, [obtainedItems])


  const level = LEVELS[currentLevelId] || LEVELS['level1.1']
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

  const [introDialogIndex, setIntroDialogIndex] = useState<number | null>(null)
  const introDialogIndexRef = useRef<number | null>(null)
  const [introCompleted, setIntroCompleted] = useState(false)

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

  // First load: Start intro dialog
  useEffect(() => {
    if (previousLevelId === 'default' && !introCompleted) {
      setIntroDialogIndex(0)
    }
  }, [currentLevelId, previousLevelId, introCompleted])

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
      if (pendingTransition.startsWith('http')) {
        window.location.href = pendingTransition
      } else if (pendingTransition.startsWith('/')) {
        navigate(pendingTransition)
      } else {
        setLevelState({ id: pendingTransition, from: currentLevelId })
        setCurrentLevel(pendingTransition)
      }
      setPendingTransition(null)
    }
  }, [activeDialog, activePuzzleZone, pendingItemsToGive.length, pendingTransition, currentLevelId, setCurrentLevel, navigate])

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

    const isPuzzle = !!zone.puzzleId?.trim()
    const hasItems = zone.items && zone.items.length > 0
    const needsPuzzle = isPuzzle && (!hasItems || unobtainedItems.length > 0)

    if (canSucceed && needsPuzzle) {
      // It's a puzzle and we haven't solved it yet (either no items, or still need to obtain them)
      if (finalDialog) {
        setActiveDialog({ ...zone, dialog: finalDialog })
        setPendingPuzzleZone(zone)
      } else {
        setActivePuzzleZone(zone)
      }
      return
    }

    if (finalDialog) {
      setActiveDialog({ ...zone, dialog: finalDialog })
    }

    if (!canSucceed) {
      if (zone.label === 'terminal' || zone.label === 'vending' || zone.label === 'chest') {
        if (!activeMiniGoals.includes(zone.label)) {
          setActiveMiniGoals(prev => [...prev, zone.label])
        }
      }
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

  // Perist hints setting

  const toggleHints = useCallback(() => setHintsEnabled(v => !v), [])

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

      {/* ─── HUD Layer ────────────────────────────────────────────────── */}
      <div id="goal-hud">
        <div className="goal-card">
          <span className="goal-text">Go to upper level</span>
          {MINI_GOAL_ORDER.some(id => activeMiniGoals.includes(id)) && (
            <div className="goal-sub-list">
              {MINI_GOAL_ORDER
                .filter(id => activeMiniGoals.includes(id))
                .map(id => (
                  <div key={id} className="goal-sub-item">
                    {MINI_GOAL_CONFIG[id]}
                  </div>
                ))}
            </div>
          )}
        </div>
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
