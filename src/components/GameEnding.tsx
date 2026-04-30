import { useState, useEffect, useCallback } from 'react'

export type EndingSlide = {
  image: string
  texts: string[]
}

type Props = {
  slides: EndingSlide[]
  onComplete: () => void
}

export function GameEnding({ slides, onComplete }: Props) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [textIdx, setTextIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const finish = useCallback(() => {
    setExiting(true)
    setTimeout(() => onComplete(), 1500) // Longer fade out for ending
  }, [onComplete])

  const handleAdvance = useCallback(() => {
    if (exiting) return

    const currentSlide = slides[slideIdx]
    if (textIdx < currentSlide.texts.length - 1) {
      // More texts in this slide
      setTextIdx(t => t + 1)
    } else {
      // Advance to next slide
      if (slideIdx < slides.length - 1) {
        setVisible(false) // Fade out current slide
        setTimeout(() => {
          setSlideIdx(s => s + 1)
          setTextIdx(0)
          setVisible(true) // Fade in next slide
        }, 1000)
      } else {
        // End of slides
        finish()
      }
    }
  }, [slideIdx, textIdx, slides, finish, exiting])

  // Global click to advance
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      e.stopPropagation()
      handleAdvance()
    }
    window.addEventListener('click', handleGlobalClick, true)
    return () => window.removeEventListener('click', handleGlobalClick, true)
  }, [handleAdvance])

  if (!slides.length) return null

  const currentSlide = slides[slideIdx]

  return (
    <div 
      className="game-ending-page"
      style={{
        opacity: exiting ? 0 : 1,
        transition: 'opacity 1.5s ease-in-out'
      }}
    >
      <div className={`game-ending-content ${visible ? 'visible' : ''}`}>
        <img 
          src={currentSlide.image} 
          alt={`Ending Scene ${slideIdx + 1}`} 
          className="game-ending-image"
        />
        <div className="game-ending-text">
          {currentSlide.texts[textIdx]}
        </div>
      </div>
    </div>
  )
}
