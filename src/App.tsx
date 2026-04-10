import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { Background } from './components/Background'
import { BoundaryEditor } from './components/BoundaryEditor'
import { Scene } from './components/Scene'
import { useKeyboard } from './hooks/useKeyboard'
import { useBoundary } from './hooks/useBoundary'
import './index.css'

function DebugOverlay({
  anim,
  pos,
}: {
  anim: string
  pos: [number, number, number]
}) {
  useControls('Debug (Read-only)', {
    animation: { value: anim, editable: false },
    posX: { value: parseFloat(pos[0].toFixed(2)), editable: false },
    posY: { value: parseFloat(pos[1].toFixed(2)), editable: false },
    posZ: { value: parseFloat(pos[2].toFixed(2)), editable: false },
  }, [anim, pos])

  return null
}

export default function App() {
  const keys = useKeyboard()
  const { boundary, setBoundary, reset } = useBoundary()

  const [editorVisible, setEditorVisible] = useState(false)
  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>([0, 0, 0])

  useControls('Boundary Editor', {
    showBoundaryEditor: {
      value: false,
      label: 'Show Editor',
      onChange: (v: boolean) => setEditorVisible(v),
    },
  })

  const handleAnimChange = useCallback((anim: string) => {
    setCurrentAnim(anim)
  }, [])

  const handlePositionChange = useCallback((pos: [number, number, number]) => {
    setCharPos(pos)
  }, [])

  const toggleEditor = () => setEditorVisible(v => !v)

  return (
    <div id="game-root">
      {/* Leva panel — always rendered, positioned top-right by default */}
      <Leva collapsed={false} titleBar={{ title: '🎮 Sandbox Debug' }} />

      {/* Static background */}
      <Background src="/assets/images/sandbox-background.png" />

      {/* R3F Canvas */}
      <div id="canvas-layer">
        <Canvas
          shadows
          style={{ background: 'transparent' }}
          camera={{ position: [0, 8, 12], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <DebugOverlay anim={currentAnim} pos={charPos} />
          <Scene
            keys={keys}
            boundary={boundary}
            onAnimChange={handleAnimChange}
            onPositionChange={handlePositionChange}
          />
        </Canvas>
      </div>

      {/* Boundary editor overlay */}
      <BoundaryEditor
        boundary={boundary}
        setBoundary={setBoundary}
        visible={editorVisible}
      />

      {/* Toolbar */}
      <div id="toolbar">
        <button
          className={`toolbar-btn ${editorVisible ? 'active' : ''}`}
          onClick={toggleEditor}
          title="Toggle boundary editor"
        >
          ✏️ Boundary Editor
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
