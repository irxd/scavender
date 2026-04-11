import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls, button } from 'leva'
import * as THREE from 'three'
import type { KeyState } from '../hooks/useKeyboard'
import type { BoundaryPolygon } from '../hooks/useBoundary'

// Animation name mapping (as provided by user):
//   "Idle_11"  → plays when character is WALKING
//   "Running"  → plays when character is IDLE (standing still)
//   "Walking"  → plays when character is RUNNING

const ANIM = {
  idle: 'Running',
  walk: 'Idle_11',
  run: 'Walking',
} as const

type AnimState = 'idle' | 'walk' | 'run'

interface CharacterProps {
  keys: React.MutableRefObject<KeyState>
  boundary: BoundaryPolygon
  initialPosition?: [number, number, number]
  walkSpeed?: number
  runSpeed?: number
  onAnimChange?: (anim: AnimState) => void
  onPositionChange?: (pos: [number, number, number]) => void
}

export function Character({
  keys,
  boundary,
  initialPosition = [3.29, 0, 9.7],
  walkSpeed = 1.5,
  runSpeed = 5,
  onAnimChange,
  onPositionChange,
}: CharacterProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/assets/glb/jace-miller.glb')
  const { actions, mixer } = useAnimations(animations, group)

  const { showPositionHelper } = useControls('Character', {
    showPositionHelper: { value: false, label: '🛠️ Show Pos Debug' },
    'Teleport to Start': button(() => {
      if (group.current) {
        group.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2])
        onPositionChange?.(initialPosition)
      }
    }),
  })

  const currentAnim = useRef<AnimState>('idle')
  const velocity = useRef(new THREE.Vector3())

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

  useFrame(({ camera }, delta) => {
    const k = keys.current
    const isMoving = k.forward || k.backward || k.left || k.right
    const isRunning = isMoving && k.run

    // Determine animation state
    if (!isMoving) {
      transitionTo('idle')
    } else if (isRunning) {
      transitionTo('run')
    } else {
      transitionTo('walk')
    }

    if (!isMoving) return

    // Build movement direction (XZ plane)
    const speed = isRunning ? runSpeed : walkSpeed
    const dir = new THREE.Vector3()
    if (k.forward) dir.z -= 1
    if (k.backward) dir.z += 1
    if (k.left) dir.x -= 1
    if (k.right) dir.x += 1
    dir.normalize()

    // Smooth velocity
    velocity.current.lerp(dir.clone().multiplyScalar(speed), 0.15)

    const pos = group.current.position.clone().add(velocity.current.clone().multiplyScalar(delta))

    // Convert boundary (0–1 viewport fractions) → world space dynamically
    // Unproject 2D screen coordinates onto the Y=0 plane to exactly match the 2D bounding box
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
    const poly3D = boundary.map(p => {
      const ndcX = p.x * 2 - 1
      const ndcY = -(p.y * 2) + 1
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
  })

  return (
    <group ref={group} position={initialPosition}>
      <primitive object={scene} scale={1} />

      {showPositionHelper && (
        <>
          <axesHelper args={[2]} />
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
              Z: {group.current.position.z.toFixed(2)}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

useGLTF.preload('/assets/glb/jace-miller.glb')
