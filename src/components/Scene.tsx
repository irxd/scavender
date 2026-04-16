import { Suspense, useEffect } from 'react'
import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Character } from './Character'
import type { KeyState } from '../hooks/useKeyboard'
import type { BoundaryPolygon } from '../hooks/useBoundary'

interface SceneProps {
  keys: React.MutableRefObject<KeyState>
  boundary: BoundaryPolygon
  imgW: number
  imgH: number
  initialPosition?: [number, number, number]
  initialRotation?: number
  autoWalkTarget?: [number, number, number] | null
  onAnimChange: (anim: string) => void
  onPositionChange: (pos: [number, number, number]) => void
  onRotationChange?: (rotation: number) => void
  onDestinationReached?: () => void
  cameraConfig?: {
    camX?: number, camY?: number, camZ?: number,
    fov?: number,
    lookAtX?: number, lookAtY?: number, lookAtZ?: number
  }
}

function Lights() {
  const { ambientIntensity, dirIntensity, dirX, dirY, dirZ } = useControls('Lighting', {
    ambientIntensity: { value: 1.2, min: 0, max: 5, step: 0.1 },
    dirIntensity: { value: 2.0, min: 0, max: 10, step: 0.1 },
    dirX: { value: 5, min: -20, max: 20, step: 0.5 },
    dirY: { value: 10, min: 0, max: 30, step: 0.5 },
    dirZ: { value: 5, min: -20, max: 20, step: 0.5 },
  }, { collapsed: true })

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[dirX, dirY, dirZ]}
        intensity={dirIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  )
}

function Ground() {
  const { showGround, size } = useControls('Ground', {
    showGround: { value: false, label: 'Show White Grid' },
    size: { value: 40, min: 10, max: 200, step: 1 },
  }, { collapsed: true })

  return (
    <group>
      {/* Invisible plane to magically catch character shadows and blend them with the background image! */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <shadowMaterial transparent opacity={0.5} />
      </mesh>

      {/* The crisp white grid for aligning perspective */}
      {showGround && (
        <gridHelper 
          args={[size, size, '#ffffff', 'rgba(255, 255, 255, 0.4)']} 
          position={[0, -0.01, 0]} 
        />
      )}
    </group>
  )
}

// A camera rig that follows character Y position only (tracking removed — fixed cam)
function FixedCamera({ config }: { config?: SceneProps['cameraConfig'] }) {
  const [controls, set] = useControls('Camera', () => ({
    camX: { value: config?.camX ?? 0, min: -20, max: 20, step: 0.5 },
    camY: { value: config?.camY ?? 2.0, min: 0.1, max: 30, step: 0.5 },
    camZ: { value: config?.camZ ?? 15.0, min: 1, max: 40, step: 0.5 },
    fov: { value: config?.fov ?? 50, min: 10, max: 120, step: 1 },
    lookAtX: { value: config?.lookAtX ?? 0.0, min: -10, max: 10, step: 0.5 },
    lookAtY: { value: config?.lookAtY ?? 2.0, min: -10, max: 10, step: 0.5 },
    lookAtZ: { value: config?.lookAtZ ?? 0.0, min: -10, max: 10, step: 0.5 },
  }), { collapsed: true })

  useEffect(() => {
    if (config) {
      set({
        camX: config.camX ?? 0,
        camY: config.camY ?? 2.0,
        camZ: config.camZ ?? 15.0,
        fov: config.fov ?? 50,
        lookAtX: config.lookAtX ?? 0.0,
        lookAtY: config.lookAtY ?? 2.0,
        lookAtZ: config.lookAtZ ?? 0.0,
      })
    }
  }, [config, set])

  useFrame(({ camera }) => {
    camera.position.set(controls.camX, controls.camY, controls.camZ)
    camera.lookAt(controls.lookAtX, controls.lookAtY, controls.lookAtZ)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = controls.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

export function Scene({
  keys,
  boundary,
  imgW,
  imgH,
  initialPosition,
  initialRotation,
  autoWalkTarget,
  onAnimChange,
  onPositionChange,
  onRotationChange,
  onDestinationReached,
  cameraConfig,
}: SceneProps) {
  const { walkSpeed, runSpeed } = useControls('Character', {
    walkSpeed: { value: 1.5, min: 0.5, max: 10, step: 0.1 },
    runSpeed: { value: 5, min: 1, max: 20, step: 0.1 },
  })

  return (
    <>
      <FixedCamera config={cameraConfig} />
      <Lights />
      <Ground />
      <Suspense fallback={null}>
        <Character
          keys={keys}
          boundary={boundary}
          imgW={imgW}
          imgH={imgH}
          initialPosition={initialPosition}
          initialRotation={initialRotation}
          walkSpeed={walkSpeed}
          runSpeed={runSpeed}
          autoWalkTarget={autoWalkTarget}
          onAnimChange={onAnimChange}
          onPositionChange={onPositionChange}
          onRotationChange={onRotationChange}
          onDestinationReached={onDestinationReached}
        />
      </Suspense>
      <Environment preset="city" />
    </>
  )
}
