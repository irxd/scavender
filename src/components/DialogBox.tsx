import { useEffect } from 'react'
import type { InteractiveZone } from '../hooks/useInteractiveZones'

interface DialogBoxProps {
  zone?: InteractiveZone
  text?: string
  portrait?: string
  side?: 'left' | 'right'
  onClose: () => void
}

export function DialogBox({ zone, text: manualText, portrait, side = 'left', onClose }: DialogBoxProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const text = manualText || zone?.dialog?.trim() || '...'
  const portraitSrc = portrait || "/assets/images/portrait/young-jace-portrait.webp"

  const isRight = side === 'right'

  return (
    <div onClick={onClose} className="dialog-container">
      {/* Dialog container */}
      <div className={`dialog-content ${isRight ? 'is-right' : ''}`}>
        {/* Portrait — overlaps above the text box */}
        <div className="dialog-portrait">
          <img
            src={portraitSrc}
            alt="Character portrait"
            draggable="false"
          />
        </div>

        {/* Text panel */}
        <div className="dialog-text-panel">
          <p className="dialog-text-content">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}
