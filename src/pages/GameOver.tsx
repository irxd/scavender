import { useNavigate, useLocation } from 'react-router-dom'
import { useInventoryStore } from '../store/useInventoryStore'

export default function GameOver() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetItems } = useInventoryStore()

  const state = location.state as { returnUrl?: string; levelId?: string } | null
  const returnUrl = state?.returnUrl || '/'

  const handleRetry = () => {
    resetItems()
    navigate(returnUrl)
  }

  const handleExit = () => {
    navigate('/')
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        zIndex: 9999,
      }}
    >
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '4rem',
          letterSpacing: '0.2em',
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#ff3333',
          textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
        }}
      >
        TIMELINE SEVERED
      </h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <button
          onClick={handleRetry}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            color: '#fff',
            padding: '12px 32px',
            fontSize: '1.2rem',
            fontFamily: "'Cinzel', serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.1em',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = '#fff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
          }}
        >
          RETRY
        </button>
        <button
          onClick={handleExit}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            color: '#fff',
            padding: '12px 32px',
            fontSize: '1.2rem',
            fontFamily: "'Cinzel', serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.1em',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = '#fff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
          }}
        >
          EXIT
        </button>
      </div>
    </div>
  )
}
