import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'
import { preloadImages } from '../utils/preload'

const REFINERY_INTRO_SLIDES: IntroSlide[] = [
  {
    image: '/assets/images/intro/intro2.1.webp',
    texts: [
      `Finally, the door is opening...`,
      `I don't know where this leads to, but the signal is getting stronger.`,
    ],
  },
]

export default function IntroRefinery() {
  const navigate = useNavigate()

  useEffect(() => {
    preloadImages([
      '/assets/images/background/level2.1.webp',
      '/assets/images/background/level2.2.webp',
      '/assets/images/background/level2.3.webp',
    ])
  }, [])

  return (
    <div className="intro-page">
      <StageIntro
        slides={REFINERY_INTRO_SLIDES}
        onComplete={() => navigate('/refinery')}
      />
    </div>
  )
}

