import { useEffect } from 'react'
import type { ItemData } from '../config/items'

export function ItemObtainedOverlay({
  item,
  onClose,
}: {
  item: ItemData
  onClose: () => void
}) {
  useEffect(() => {
    // Close on any click or keypress, but delay attaching listeners slightly
    // to avoid catching the same event that triggered this component's mount.
    let isActive = true
    const handler = () => {
      if (isActive) onClose()
    }

    const timeoutId = setTimeout(() => {
      window.addEventListener('keydown', handler)
      window.addEventListener('click', handler)
    }, 50)

    return () => {
      isActive = false
      clearTimeout(timeoutId)
      window.removeEventListener('keydown', handler)
      window.removeEventListener('click', handler)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 'min(500px, 90vw)',
          maxHeight: '90vh',
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 'min(24px, 4vh) min(32px, 5vw)',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          textAlign: 'center',
          fontSize: 'clamp(12px, 3vh, 16px)',
          fontWeight: 400,
          letterSpacing: '0.2em',
          color: '#fff',
          textTransform: 'uppercase',
          marginBottom: 'min(12px, 2vh)',
          fontFamily: "'Cinzel', serif",
        }}>
          Item Obtained
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: 'min(16px, 3vh)' }} />

        {/* Item Title */}
        <div style={{
          fontSize: 'clamp(18px, 4vh, 26px)',
          fontWeight: 400,
          letterSpacing: '0.05em',
          color: '#65bae1',
          textTransform: 'uppercase',
          marginBottom: 'min(16px, 3vh)',
          textAlign: 'center',
          fontFamily: "'Cinzel', serif",
        }}>
          {item.name}
        </div>

        {/* Item Image */}
        <div style={{
          width: '100%',
          height: 'min(140px, 30vh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'min(16px, 3vh)',
          filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.6))',
        }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            draggable="false"
          />
        </div>

        {/* Description */}
        <div style={{
          fontSize: 'clamp(13px, 3.5vh, 16px)',
          lineHeight: 1.4,
          color: '#fff',
          textAlign: 'center',
          fontFamily: "'Quattrocento', serif",
          opacity: 0.9,
        }}>
          {item.description}
        </div>
      </div>
    </div>
  )
}
