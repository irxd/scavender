import { useState, useEffect } from 'react'

export function OrientationGuard({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const mobile = window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches
      setIsMobile(mobile)
      if (mobile) {
        setIsPortrait(window.innerHeight > window.innerWidth)
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (isMobile && isPortrait) {
    return (
      <div className="orientation-guard">
        <div className="orientation-guard__content">
          <div className="orientation-guard__icon">
            {/* Phone icon with rotation arrow */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="orientation-guard__phone">
              <rect x="18" y="4" width="28" height="48" rx="4" stroke="currentColor" strokeWidth="3" fill="none" />
              <circle cx="32" cy="46" r="2.5" fill="currentColor" />
              <rect x="26" y="8" width="12" height="2" rx="1" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="orientation-guard__arrow">
              <path d="M4 16 Q4 4 16 4 Q24 4 28 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <polyline points="24,6 28,10 32,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <p className="orientation-guard__title">Rotate to Play</p>
          <p className="orientation-guard__subtitle">This game requires landscape orientation</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
