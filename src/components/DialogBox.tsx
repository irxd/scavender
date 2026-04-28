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
  const portraitSrc = portrait || "/assets/images/portrait/young-jace-portrait.png"

  const isRight = side === 'right'

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
        userSelect: 'none',
      }}
    >
      {/* Dialog container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: isRight ? 'row-reverse' : 'row',
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
            width: '320px',
            marginBottom: '-48px',
            zIndex: 2,
            // Pull portrait up so it sticks above the box
            marginTop: '-120px',
            alignSelf: 'flex-end',
          }}
        >
          <img
            src={portraitSrc}
            alt="Character portrait"
            draggable="false"
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
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            padding: isRight ? '28px 180px 28px 32px' : '28px 32px 28px 180px',
            marginLeft: isRight ? '0' : '-160px',
            marginRight: isRight ? '-160px' : '0',
            zIndex: 1,
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
            textAlign: isRight ? 'right' : 'left',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              lineHeight: 1.6,
              color: '#ffffff',
              fontFamily: "'Quattrocento', serif",
              fontWeight: 400,
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}
