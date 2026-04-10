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
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.run = false
        return
      }
      const action = KEY_MAP[e.code]
      if (action) {
        keys.current[action] = false
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return keys
}
