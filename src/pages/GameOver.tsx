import { useNavigate, useLocation } from 'react-router-dom'
import { useInventoryStore } from '../store/useInventoryStore'
import { useLevelStore } from '../store/useLevelStore'

export default function GameOver() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetItems } = useInventoryStore()
  const { setCurrentLevel } = useLevelStore()

  const state = location.state as { returnUrl?: string; levelId?: string } | null
  const returnUrl = state?.returnUrl || '/'

  const handleRetry = () => {
    resetItems()
    
    // Reset back to the start of the respective stage
    if (returnUrl.includes('refinery')) {
      setCurrentLevel('level2.1')
    } else if (returnUrl.includes('metro')) {
      setCurrentLevel('level1.1')
    }

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
      <div className="game-over-title">
        TIMELINE SEVERED
      </div>

      <div className="game-over-nav">
        <button
          onClick={handleRetry}
          className="game-over-nav-btn"
        >
          RETRY
        </button>
        <button
          onClick={handleExit}
          className="game-over-nav-btn"
        >
          EXIT
        </button>
      </div>
    </div>
  )
}
