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
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '400px',
          background: 'radial-gradient(ellipse at center, rgba(30,30,35,0.95) 0%, rgba(15,15,18,0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '24px 32px',
          // Distinct modern cut-corner style via clip-path
          clipPath: 'polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
        }}
        onClick={e => e.stopPropagation()} // Stop propagation so it doesn't trigger global click close immediately, but actually we WANT global click close, so we can let it bubble or handle it locally. 
        // Wait, the global listener is on window, so we don't strictly need to stop propagation.
      >
        {/* Accents (mimicking the reference image's UI elements) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '15px', background: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '2px', background: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '15px', background: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '2px', background: 'rgba(255,255,255,0.4)' }} />

        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '18px', 
          fontWeight: 300, 
          letterSpacing: '0.1em',
          color: '#fff',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          Item Obtained
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '20px' }} />

        {/* Item Title */}
        <div style={{ 
          fontSize: '22px', 
          fontWeight: 700, 
          letterSpacing: '0.05em',
          color: '#d4b77f', // Gold/Bronze accent color
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          {item.name}
        </div>

        {/* Item Image */}
        <div style={{
          width: '100%',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
        }}>
          <img 
            src={item.image} 
            alt={item.name} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.6))',
            }} 
            draggable="false"
          />
        </div>

        {/* Description */}
        <div style={{ 
          fontSize: '13px', 
          lineHeight: 1.6, 
          color: '#ddd',
          fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}>
          {item.description}
        </div>
      </div>
    </div>
  )
}
