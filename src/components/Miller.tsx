import { useRef, useEffect, useMemo, useState } from 'react'
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { getImageRect } from '../utils/imageSpace'

interface MillerProps {
  position: [number, number, number]
  rotation?: number
  shouldFade?: boolean
  imgW: number
  imgH: number
  scale?: number
  opacity?: number
}

export function Miller({ position, rotation = 0, shouldFade = false, imgW, imgH, scale = 1, opacity: targetOpacity = 1.0 }: MillerProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/assets/glb/miller.glb')

  // Clone the scene to allow multiple instances or clean state
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions, mixer } = useAnimations(animations, group)

  const [currentOpacity, setCurrentOpacity] = useState(targetOpacity)
  
  // Sync state if prop changes (e.g. between levels)
  useEffect(() => {
    setCurrentOpacity(targetOpacity)
  }, [targetOpacity])

  // Apply opacity to all materials and clone them to ensure uniqueness
  useEffect(() => {
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh
        mesh.castShadow = currentOpacity > 0.1
        mesh.receiveShadow = true
        
        if (mesh.material) {
          // Clone materials so they don't share state between instances or cache
          if (!mesh.userData.materialsCloned) {
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(m => m.clone())
            } else {
              mesh.material = mesh.material.clone()
            }
            mesh.userData.materialsCloned = true
          }

          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materials.forEach(m => {
            m.transparent = true
            m.opacity = currentOpacity
            m.depthWrite = currentOpacity >= 1.0
            
            // If it's a ghost, we might want to tone down emissive if it has any
            if (currentOpacity < 1.0 && (m as any).emissive) {
              (m as any).emissive.setScalar(0.5)
            }
          })
        }
      }
    })
  }, [clone, currentOpacity])

  // Play default animation (Idle)
  useEffect(() => {
    const actionNames = Object.keys(actions)
    if (actionNames.length > 0) {
      // Common idle names in these models
      const idleAction = actions['Idle'] || actions['Idle_11'] || actions['Standing'] || actions[actionNames[0]]
      if (idleAction) {
        idleAction.reset().fadeIn(0.5).play()
      }
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  // Smooth opacity scaling logic
  useFrame((_state, delta) => {
    // Responsive scale
    const viewW = window.innerWidth
    const viewH = window.innerHeight
    const imageRect = getImageRect(viewW, viewH, imgW, imgH)
    const bgScale = (imageRect.renderH / viewH) * scale
    group.current.scale.setScalar(bgScale)

    // Handle fading or resetting opacity
    if (shouldFade && currentOpacity > 0) {
      setCurrentOpacity(prev => Math.max(0, prev - delta * 0.5)) // Fade out over ~2 seconds
    } else if (!shouldFade && Math.abs(currentOpacity - targetOpacity) > 0.001) {
      // Lerp towards target (0.7 or 1.0)
      setCurrentOpacity(prev => THREE.MathUtils.lerp(prev, targetOpacity, delta * 4))
    }
  })

  // Completely remove from scene once fully transparent
  if (currentOpacity <= 0) return null

  return (
    <group
      ref={group}
      position={position}
      rotation={[0, rotation * (Math.PI / 180), 0]}
    >
      <primitive object={clone} />

      {/* Soft shadow that also fades */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.75 * currentOpacity}
        scale={2.5}
        blur={2.5}
        far={2}
        resolution={256}
        color="#000000"
      />
    </group>
  )
}

useGLTF.preload('/assets/glb/miller.glb')
