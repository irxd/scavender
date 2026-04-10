import { useEffect } from 'react'
import type { InteractiveZone } from '../hooks/useInteractiveZones'

interface DialogBoxProps {
  zone: InteractiveZone
  onClose: () => void
}

export function DialogBox({ zone, onClose }: DialogBoxProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const text = zone.dialog?.trim() || '...'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '48px',
        cursor: 'default',
      }}
    >
      {/* Dialog container */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          width: 'min(860px, 90vw)',
          minHeight: '160px',
        }}
      >
        {/* Portrait — overlaps above the text box */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            width: '200px',
            marginBottom: 0,
            zIndex: 2,
            // Pull portrait up so it sticks above the box
            marginTop: '-80px',
            alignSelf: 'flex-end',
          }}
        >
          <img
            src="/assets/images/jace-miller-portrait.png"
            alt="Character portrait"
            style={{
              width: '100%',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'bottom',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))',
            }}
          />
        </div>

        {/* Text panel */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.50)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            padding: '28px 32px',
            marginLeft: '-12px',
            zIndex: 1,
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#1a1a1a',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 400,
            }}
          >
            {text}
          </p>

          {/* Click-to-close hint */}
          <span
            style={{
              marginTop: '16px',
              fontSize: '11px',
              color: 'rgba(0,0,0,0.4)',
              alignSelf: 'flex-end',
              letterSpacing: '0.05em',
            }}
          >
            Click anywhere or press Esc to close
          </span>
        </div>
      </div>
    </div>
  )
}
