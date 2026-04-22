import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations, Html, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls, button } from 'leva'
import * as THREE from 'three'
import type { KeyState } from '../hooks/useKeyboard'
import type { BoundaryPolygon } from '../hooks/useBoundary'
import { getImageRect, imageToViewport } from '../utils/imageSpace'

// Animation name mapping (as provided by user):
//   "Idle_11"  → plays when character is WALKING
//   "Running"  → plays when character is IDLE (standing still)
//   "Walking"  → plays when character is RUNNING

const ANIM = {
  idle: 'Idle_11',
  walk: 'Walking',
  run: 'Running',
} as const

type AnimState = 'idle' | 'walk' | 'run'

interface CharacterProps {
  keys: React.MutableRefObject<KeyState>
  boundary: BoundaryPolygon
  imgW: number
  imgH: number
  initialPosition?: [number, number, number]
  initialRotation?: number
  walkSpeed?: number
  runSpeed?: number
  autoWalkTarget?: [number, number, number] | null
  onAnimChange?: (anim: AnimState) => void
  onPositionChange?: (pos: [number, number, number]) => void
  onRotationChange?: (rotation: number) => void
  onDestinationReached?: () => void
}

export function Character({
  keys,
  boundary,
  imgW,
  imgH,
  initialPosition = [3.29, 0, 9.7],
  initialRotation = 0,
  walkSpeed = 1.5,
  runSpeed = 5,
  autoWalkTarget = null,
  onAnimChange,
  onPositionChange,
  onRotationChange,
  onDestinationReached,
}: CharacterProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/assets/glb/jace.glb')
  const { actions, mixer } = useAnimations(animations, group)

  // Enable shadows for all meshes in the model
  useEffect(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [scene])

  const { showPositionHelper, modelScale } = useControls('Character', {
    showPositionHelper: { value: false, label: '🛠️ Show Pos Debug' },
    modelScale: { value: 1, min: 1, max: 10, step: 1, label: '📏 Model Scale' },
    'Teleport to Start': button(() => {
      if (group.current) {
        group.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2])
        group.current.rotation.y = initialRotation * (Math.PI / 180)
        onPositionChange?.(initialPosition)
        onRotationChange?.(initialRotation * (Math.PI / 180))
      }
    }),
  })

  const currentAnim = useRef<AnimState>('idle')
  const velocity = useRef(new THREE.Vector3())
  // Track whether the current auto-walk started far enough to run first
  const autoWalkIsRunning = useRef(false)
  const prevAutoWalkTarget = useRef<[number, number, number] | null>(null)

  // Play initial idle
  useEffect(() => {
    const action = actions[ANIM.idle]
    if (action) {
      action.reset().fadeIn(0.3).play()
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  function transitionTo(next: AnimState) {
    if (currentAnim.current === next) return
    const prev = actions[ANIM[currentAnim.current]]
    const nextAction = actions[ANIM[next]]
    if (!nextAction) return
    prev?.fadeOut(0.25)
    nextAction.reset().fadeIn(0.25).play()
    currentAnim.current = next
    onAnimChange?.(next)
  }

  useFrame(({ camera, viewport }, delta) => {
    // 1. Always update scale and imageRect (needed for boundary and responsiveness)
    const viewW = window.innerWidth
    const viewH = window.innerHeight
    const imageRect = getImageRect(viewW, viewH, imgW, imgH)

    // Responsive scale: makes character size match the background image zoom level.
    // modelScale from debug menu allows tweaking the size of the GLB model itself.
    const bgScale = (imageRect.renderH / viewH) * modelScale
    group.current.scale.setScalar(bgScale)

    const k = keys.current
    const isMoving = k.forward || k.backward || k.left || k.right
    const isRunning = isMoving && k.run

    // Build movement direction (XZ plane)
    let speed = isRunning ? runSpeed : walkSpeed
    const dir = new THREE.Vector3()

    if (isMoving) {
      if (k.forward) dir.z -= 1
      if (k.backward) dir.z += 1
      if (k.left) dir.x -= 1
      if (k.right) dir.x += 1
      dir.normalize()
    } else if (autoWalkTarget) {
      // Auto-walk logic
      const target = new THREE.Vector3(...autoWalkTarget)
      const toTarget = target.clone().sub(group.current.position)
      toTarget.y = 0 // ignore vertical
      const dist = toTarget.length()

      if (dist < 0.1) {
        // Reached destination
        velocity.current.set(0, 0, 0)
        autoWalkIsRunning.current = false
        prevAutoWalkTarget.current = null
        transitionTo('idle')
        onDestinationReached?.()
        return
      }

      // Detect new target → decide whether to start running
      const RUN_TO_WALK_THRESHOLD = 2.0 // units; switch from run to walk within this distance
      const targetChanged =
        !prevAutoWalkTarget.current ||
        prevAutoWalkTarget.current[0] !== autoWalkTarget[0] ||
        prevAutoWalkTarget.current[2] !== autoWalkTarget[2]

      if (targetChanged) {
        // If far enough, start in run mode
        autoWalkIsRunning.current = dist > RUN_TO_WALK_THRESHOLD
        prevAutoWalkTarget.current = autoWalkTarget
      }

      // Transition from run → walk once close enough
      if (autoWalkIsRunning.current && dist <= RUN_TO_WALK_THRESHOLD) {
        autoWalkIsRunning.current = false
      }

      dir.copy(toTarget.normalize())
      speed = autoWalkIsRunning.current ? runSpeed : walkSpeed
    } else {
      // No movement
      autoWalkIsRunning.current = false
      prevAutoWalkTarget.current = null
      transitionTo('idle')
      return
    }

    // Determine animation state
    if (isMoving) {
      if (isRunning) transitionTo('run')
      else transitionTo('walk')
    } else if (autoWalkTarget) {
      transitionTo(autoWalkIsRunning.current ? 'run' : 'walk')
    }

    // Smooth velocity
    velocity.current.lerp(dir.clone().multiplyScalar(speed), 0.15)

    const pos = group.current.position.clone().add(velocity.current.clone().multiplyScalar(delta))

    // Convert boundary (image-space 0–1 fractions) → world space:
    // 1. Image-space → viewport pixel (via cover/contain rect)
    // 2. Viewport pixel → NDC
    // 3. NDC → unproject onto Y=0 plane
    // (Note: viewW, viewH, imageRect were computed at top of useFrame)

    const getIntersectY0 = (ndcX: number, ndcY: number) => {
      const v = new THREE.Vector3(ndcX, ndcY, 0.5)
      v.unproject(camera)
      v.sub(camera.position).normalize()
      if (Math.abs(v.y) < 0.0001) return new THREE.Vector3(0, 0, 0)
      const dist = -camera.position.y / v.y
      return new THREE.Vector3(
        camera.position.x + v.x * dist,
        0,
        camera.position.z + v.z * dist
      )
    }

    // Unproject all boundary points to Y=0 plane to form 3D polygon
    const poly3D = (boundary || []).map(p => {
      if (!p) return new THREE.Vector3()
      // 1. image-space → viewport pixel
      const vp = imageToViewport(p.x, p.y, imageRect)
      // 2. viewport pixel → NDC
      const ndcX = (vp.x / viewW) * 2 - 1
      const ndcY = -((vp.y / viewH) * 2) + 1
      return getIntersectY0(ndcX, ndcY)
    })

    const nextPos = group.current.position.clone().add(velocity.current.clone().multiplyScalar(delta))

    // Point in polygon check (2D XZ)
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
        // Clamp to closest edge if moving outside
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

    // Face direction of movement
    if (dir.length() > 0) {
      const angle = Math.atan2(dir.x, dir.z)
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        angle,
        0.15
      )
    }

    onPositionChange?.([pos.x, pos.y, pos.z])
    onRotationChange?.(group.current.rotation.y)
  })

  return (
    <group
      ref={group}
      position={initialPosition}
      rotation={[0, initialRotation * (Math.PI / 180), 0]}
    >
      <primitive object={scene} scale={1} />

      {/* Soft character shadow that follows the model */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.75}
        scale={2.5}
        blur={2.5}
        far={2}
        resolution={256}
        color="#000000"
      />

      {showPositionHelper && (
        <>
          <axesHelper args={[2]} />
          <group rotation={[0, 0, 0]}>
            <mesh position={[0, 0.1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.2, 0.5, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
            <mesh position={[0, 0.1, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
          </group>
          <Html position={[0, 2.5, 0]} center>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#00ff00',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid #00ff00'
            }}>
              X: {group.current.position.x.toFixed(2)}<br />
              Y: {group.current.position.y.toFixed(2)}<br />
              Z: {group.current.position.z.toFixed(2)}<br />
              R: {(group.current.rotation.y * (180 / Math.PI)).toFixed(2)}°
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

useGLTF.preload('/assets/glb/jace.glb')
