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

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('focusin', onFocusIn)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('focusin', onFocusIn)
    }
  }, [])

  return keys
}
