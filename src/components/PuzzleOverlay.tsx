import { useState, useEffect, useRef } from 'react'

interface PuzzleOverlayProps {
  puzzleId: string
  onComplete: () => void
}

export function PuzzleOverlay({ puzzleId, onComplete }: PuzzleOverlayProps) {
  // Only handle 'metro-vending' for now
  if (puzzleId !== 'metro-vending') {
    return (
      <div className="puzzle-overlay-container">
        <div className="puzzle-overlay-backdrop" onClick={(e) => e.stopPropagation()} />
        <div className="puzzle-overlay">
          Unknown puzzle: {puzzleId}
        </div>
      </div>
    )
  }

  const [isOpen, setIsOpen] = useState(false)
  const [clickedCircles, setClickedCircles] = useState<Set<number>>(new Set())
  const circlesRef = useRef(new Set<number>())

  // Toggle open/closed state
  useEffect(() => {
    const duration = isOpen ? 1000 : 3000
    const timeoutId = window.setTimeout(() => {
      setIsOpen(!isOpen)
    }, duration)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

  const handleCircleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (!isOpen) return // Only clickable when opened

    const newSet = new Set(circlesRef.current)
    newSet.add(index)
    circlesRef.current = newSet
    setClickedCircles(newSet)

    if (newSet.size === 4) {
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }

  // The four click zones over the battery pins. Absolute positions relative to the image center.
  // We'll use percentage positioning over a relative container matching the image aspect ratio.
  const circles = [
    { id: 0, top: '48%', left: '30%' },
    { id: 1, top: '48%', left: '70%' },
    { id: 2, top: '65%', left: '30%' },
    { id: 3, top: '65%', left: '70%' },
  ]

  return (
    <div className="puzzle-overlay-container">
      <div className="puzzle-overlay-backdrop" onClick={(e) => e.stopPropagation()} />

      <div className="puzzle-content-wrapper">
        <img
          src={isOpen ? "/assets/images/puzzle/metro/panel-opened.webp" : "/assets/images/puzzle/metro/panel-closed.webp"}
          alt="Electrical Panel"
          className="puzzle-panel-image"
        />

        {isOpen && circles.map(circle => (
          !clickedCircles.has(circle.id) && (
            <div
              key={circle.id}
              className="puzzle-click-circle"
              style={{ top: circle.top, left: circle.left }}
              onClick={(e) => handleCircleClick(e, circle.id)}
            ></div>
          )
        ))}
      </div>
    </div>
  )
}
