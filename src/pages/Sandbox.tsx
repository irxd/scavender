import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { Background } from '../components/Background'
import { BoundaryEditor } from '../components/BoundaryEditor'
import { Scene } from '../components/Scene'
import { useKeyboard } from '../hooks/useKeyboard'
import { useBoundary } from '../hooks/useBoundary'

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

  const [editorVisible, setEditorVisible] = useState(false)
  const [currentAnim, setCurrentAnim] = useState('idle')
  const [charPos, setCharPos] = useState<[number, number, number]>(SPAWN_POS)

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
