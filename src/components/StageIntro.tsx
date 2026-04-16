import { useState, useCallback, useEffect } from 'react'

export type IntroSlide = {
  image: string
  texts: string[]
}

type Props = {
  slides: IntroSlide[]
  onComplete: () => void
}

export function StageIntro({ slides, onComplete }: Props) {
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
    setTimeout(() => onComplete(), 700)
  }, [onComplete])

  const handleAdvance = useCallback(() => {
    const currentSlide = slides[slideIdx]
    if (textIdx < currentSlide.texts.length - 1) {
      // More texts in this slide
      setTextIdx(t => t + 1)
    } else if (slideIdx < slides.length - 1) {
      // Next slide
      setSlideIdx(s => s + 1)
      setTextIdx(0)
    } else {
      // Done
      finish()
    }
  }, [slideIdx, textIdx, slides, finish])

  const currentSlide = slides[slideIdx]
  const currentText = currentSlide.texts[textIdx]
  const isLastText = textIdx === currentSlide.texts.length - 1
  const isLastSlide = slideIdx === slides.length - 1

  return (
    <div
      className={`stage-intro${visible ? ' stage-intro--visible' : ''}${exiting ? ' stage-intro--exiting' : ''}`}
      onClick={handleAdvance}
    >
      {/* Skip button — top right */}
      <button
        className="stage-intro__skip"
        onClick={e => { e.stopPropagation(); finish() }}
        type="button"
      >
        SKIP STORY
      </button>

      {/* Slide image */}
      <div className="stage-intro__image-wrap">
        {slides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            draggable={false}
            className={`stage-intro__image${i === slideIdx ? ' stage-intro__image--active' : ''}`}
          />
        ))}
      </div>

      {/* Centered text bar over image */}
      <div className="stage-intro__textbar">
        <p
          key={`${slideIdx}-${textIdx}`}
          className="stage-intro__text"
        >
          {currentText}
        </p>
      </div>

      {/* Hint — strictly bottom right */}
      <span className={`stage-intro__hint${isLastText && isLastSlide ? ' stage-intro__hint--pulse' : ''}`}>
        CLICK ANYWHERE TO CONTINUE
      </span>
    </div>
  )
}
