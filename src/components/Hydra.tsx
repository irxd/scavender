import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import type { BoundaryPolygon } from '../hooks/useBoundary'
import { getImageRect, imageToViewport } from '../utils/imageSpace'

interface HydraProps {
  boundary: BoundaryPolygon
  imgW: number
  imgH: number
  spawnPos: [number, number, number]
  targetPos: [number, number, number]
  onGameOver: () => void
  speed?: number
}

export function Hydra({
  boundary,
  imgW,
  imgH,
  spawnPos,
  targetPos,
  onGameOver,
}: HydraProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/assets/glb/hydra.glb')
  const { actions, mixer } = useAnimations(animations, group)

  const velocity = useRef(new THREE.Vector3())
  const hasTriggeredGameOver = useRef(false)

  const { pauseHydra, showHydraHelper, hydraModelScale, hydraSpeed, hydraAnimSpeed, disableGameOver } = useControls('Hydra Debug', {
    pauseHydra: { value: false, label: '⏸️ Pause Movement' },
    showHydraHelper: { value: false, label: '🛠️ Show Pos Debug' },
    hydraModelScale: { value: 1500, min: 1, max: 10000, step: 10, label: '📏 Model Scale' },
    hydraSpeed: { value: 2, min: 0.1, max: 100, step: 0.1, label: '🏃 Hydra Speed' },
    hydraAnimSpeed: { value: 0.7, min: 0.1, max: 5.0, step: 0.1, label: '⏱️ Anim Speed' },
    disableGameOver: { value: true, label: '🛡️ Disable Game Over' },
  })

  // Enable shadows
  useEffect(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [scene])

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
    mixer.timeScale = hydraAnimSpeed
  }, [mixer, hydraAnimSpeed])

  useFrame(({ camera }, delta) => {
    if (hasTriggeredGameOver.current) return

    const viewW = window.innerWidth
    const viewH = window.innerHeight
    const imageRect = getImageRect(viewW, viewH, imgW, imgH)

    // Responsive scale
    const bgScale = (imageRect.renderH / viewH) * hydraModelScale
    group.current.scale.setScalar(bgScale)

    if (pauseHydra) return

    const charVec = new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2])
    const currentPos = group.current.position.clone()

    // Check distance for game over
    const dist = currentPos.distanceTo(charVec)
    if (dist < 1.0) {
      if (!disableGameOver) {
        hasTriggeredGameOver.current = true
        onGameOver()
        return
      }
    }

    // Direction to player
    const toTarget = charVec.clone().sub(currentPos)
    toTarget.y = 0
    if (toTarget.lengthSq() > 0.001) {
      toTarget.normalize()
    }

    // Smooth velocity
    velocity.current.lerp(toTarget.clone().multiplyScalar(hydraSpeed), 0.15)

    const pos = currentPos.clone().add(velocity.current.clone().multiplyScalar(delta))

    // Boundary logic
    const getIntersectY0 = (ndcX: number, ndcY: number) => {
      const v = new THREE.Vector3(ndcX, ndcY, 0.5)
      v.unproject(camera)
      v.sub(camera.position).normalize()
      if (Math.abs(v.y) < 0.0001) return new THREE.Vector3(0, 0, 0)
      const d = -camera.position.y / v.y
      return new THREE.Vector3(
        camera.position.x + v.x * d,
        0,
        camera.position.z + v.z * d
      )
    }

    const poly3D = (boundary || []).map(p => {
      if (!p) return new THREE.Vector3()
      const vp = imageToViewport(p.x, p.y, imageRect)
      const ndcX = (vp.x / viewW) * 2 - 1
      const ndcY = -((vp.y / viewH) * 2) + 1
      return getIntersectY0(ndcX, ndcY)
    })

    const nextPos = pos.clone()

    function isInside(p: THREE.Vector3, poly: THREE.Vector3[]) {
      let inside = false
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, zi = poly[i].z
        const xj = poly[j].x, zj = poly[j].z
        const intersect = ((zi > p.z) !== (zj > p.z))
          && (p.x < (xj - xi) * (p.z - zi) / (zj - zi) + xi)
        if (intersect) inside = !inside
      }
      return inside
    }

    if (poly3D.length >= 3) {
      if (isInside(nextPos, poly3D)) {
        pos.copy(nextPos)
      } else {
        // Clamp to closest edge
        let closestDist = Infinity
        let closestPoint = new THREE.Vector3()
        for (let i = 0, j = poly3D.length - 1; i < poly3D.length; j = i++) {
          const p1 = poly3D[i]
          const p2 = poly3D[j]
          const line = new THREE.Line3(p1, p2)
          const param = line.closestPointToPointParameter(nextPos, true)
          const pt = new THREE.Vector3()
          line.at(param, pt)
          const d = pt.distanceToSquared(nextPos)
          if (d < closestDist) {
            closestDist = d
            closestPoint.copy(pt)
          }
        }
        if (closestDist !== Infinity) {
          pos.copy(closestPoint)
        } else {
          pos.copy(nextPos)
        }
      }
    } else {
      pos.copy(nextPos)
    }

    group.current.position.copy(pos)

    // Face target
    if (toTarget.lengthSq() > 0.001) {
      const targetAngle = Math.atan2(toTarget.x, toTarget.z)
      // Smooth rotation
      let currentAngle = group.current.rotation.y
      // shortest path
      let diff = targetAngle - currentAngle
      while (diff < -Math.PI) diff += Math.PI * 2
      while (diff > Math.PI) diff -= Math.PI * 2
      group.current.rotation.y += diff * 0.15
    }
  })

  return (
    <group ref={group} position={spawnPos}>
      <primitive object={scene} />
      {showHydraHelper && (
        <>
          <axesHelper args={[2]} />
          <Html position={[0, 2.5, 0]} center>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#ff3333',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid #ff3333'
            }}>
              X: {group.current?.position.x.toFixed(2) ?? spawnPos[0].toFixed(2)}<br />
              Y: {group.current?.position.y.toFixed(2) ?? spawnPos[1].toFixed(2)}<br />
              Z: {group.current?.position.z.toFixed(2) ?? spawnPos[2].toFixed(2)}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

useGLTF.preload('/assets/glb/hydra.glb')
