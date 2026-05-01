import { useEffect, useRef } from 'react'

export interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  run: boolean
}

const KEY_MAP: Record<string, keyof Omit<KeyState, 'run'>> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

export function useKeyboard(): React.MutableRefObject<KeyState> {
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't capture keys while the user is typing in any input/textarea
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((document.activeElement as HTMLElement)?.isContentEditable) return

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.run = true
        return
      }
      const action = KEY_MAP[e.code]
      if (action) {
        e.preventDefault()
        keys.current[action] = true
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      // Don't capture keys while the user is typing in any input/textarea
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((document.activeElement as HTMLElement)?.isContentEditable) return

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.run = false
        return
      }
      const action = KEY_MAP[e.code]
      if (action) {
        keys.current[action] = false
      }
    }

    function onFocusIn(e: FocusEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        // Release all movement keys so character stops when user starts typing
        keys.current.forward = false
        keys.current.backward = false
        keys.current.left = false
        keys.current.right = false
        keys.current.run = false
      }
    }

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    let manager: any = null
    let joystickDiv: HTMLDivElement | null = null

    if (isMobile && (window as any).nipplejs) {
      joystickDiv = document.createElement('div')
      joystickDiv.id = 'joystick-container'
      joystickDiv.style.position = 'fixed'
      joystickDiv.style.bottom = 'min(75px, 20vh)'
      joystickDiv.style.left = 'min(40px, 6vw)'
      joystickDiv.style.width = '80px'
      joystickDiv.style.height = '80px'
      joystickDiv.style.zIndex = '9999'
      joystickDiv.style.pointerEvents = 'auto'
      joystickDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
      joystickDiv.style.borderRadius = '50%'
      joystickDiv.style.backdropFilter = 'blur(4px)'
      joystickDiv.style.border = '1px solid rgba(255, 255, 255, 0.3)'
      document.body.appendChild(joystickDiv)

      manager = (window as any).nipplejs.create({
        zone: joystickDiv,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'rgba(255, 255, 255, 0.4)',
        size: 80,
      })

      manager.on('move', (_evt: any, data: any) => {
        if (!data.direction) return
        const { angle } = data
        const deg = angle.degree

        keys.current.forward = false
        keys.current.backward = false
        keys.current.left = false
        keys.current.right = false

        if (deg >= 22.5 && deg <= 157.5) keys.current.forward = true
        if (deg >= 202.5 && deg <= 337.5) keys.current.backward = true
        if (deg >= 112.5 && deg <= 247.5) keys.current.left = true
        if (deg >= 292.5 || deg <= 67.5) keys.current.right = true
      })

      manager.on('end', () => {
        keys.current.forward = false
        keys.current.backward = false
        keys.current.left = false
        keys.current.right = false
      })
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('focusin', onFocusIn)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('focusin', onFocusIn)
      if (manager) manager.destroy()
      if (joystickDiv) joystickDiv.remove()
    }
  }, [])

  return keys
}
