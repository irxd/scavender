import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

interface ScientistProps {
  id: string
  position: [number, number, number]
  rotation?: number
}

export function Scientist({ id, position, rotation = 0 }: ScientistProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/assets/glb/scientist.glb')

  // Clone the scene to allow multiple instances
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const { actions, mixer } = useAnimations(animations, group)

  const { showScientistHelper, scientistModelScale, scientistAnimSpeed, scientistOpacity } = useControls(`Scientist ${id}`, {
    showScientistHelper: { value: false, label: '🛠️ Show Pos Debug' },
    scientistModelScale: { value: 1.2, min: 0.1, max: 10, step: 0.1, label: '📏 Model Scale' },
    scientistAnimSpeed: { value: 0.5, min: 0.1, max: 5.0, step: 0.1, label: '⏱️ Anim Speed' },
    scientistOpacity: { value: 0.7, min: 0.0, max: 1.0, step: 0.1, label: '👻 Opacity' },
  })

  // Enable shadows and semi-transparent
  useEffect(() => {
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true
        node.receiveShadow = true
        // Set material to semi-transparent
        const mesh = node as THREE.Mesh
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
              m.transparent = true
              m.opacity = scientistOpacity
              m.depthWrite = false
            })
          } else {
            mesh.material.transparent = true
            mesh.material.opacity = scientistOpacity
            mesh.material.depthWrite = false
          }
        }
      }
    })
  }, [clone, scientistOpacity])

  // Play default animation (first one available)
  useEffect(() => {
    const actionNames = Object.keys(actions)
    if (actionNames.length > 0) {
      const defaultAction = actions[actionNames[0]]
      defaultAction?.reset().fadeIn(0.3).play()
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  // Update animation speed
  useEffect(() => {
    mixer.timeScale = scientistAnimSpeed
  }, [mixer, scientistAnimSpeed])

  // Allow tweaking position and rotation in dev mode via Leva (using position and rotation as initial values)
  const { devPosX, devPosY, devPosZ, devRotY } = useControls(`Scientist ${id}`, {
    devPosX: { value: position[0], step: 0.1, label: '📍 Pos X' },
    devPosY: { value: position[1], step: 0.1, label: '📍 Pos Y' },
    devPosZ: { value: position[2], step: 0.1, label: '📍 Pos Z' },
    devRotY: { value: rotation, step: 0.1, label: '🔄 Rot Y' },
  })

  const currentPos = [devPosX, devPosY, devPosZ] as [number, number, number]

  return (
    <group ref={group} position={currentPos} rotation={[0, devRotY, 0]} scale={scientistModelScale}>
      <primitive object={clone} />
      {showScientistHelper && (
        <>
          <axesHelper args={[2]} />
          <Html position={[0, 2.5, 0]} center>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#33ff33',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid #33ff33'
            }}>
              X: {currentPos[0].toFixed(2)}<br />
              Y: {currentPos[1].toFixed(2)}<br />
              Z: {currentPos[2].toFixed(2)}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

useGLTF.preload('/assets/glb/scientist.glb')
