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

      // All items
      '/assets/images/item/rebar.webp',
      '/assets/images/item/wire.webp',
      '/assets/images/item/wrench.webp',
      '/assets/images/item/watch.webp',
      '/assets/images/item/battery.webp',
      '/assets/images/item/fuel.webp',
      '/assets/images/item/igniter.webp',
      '/assets/images/item/sulfate.webp',

      // Portrait assets
      '/assets/images/portrait/young-jace-portrait.webp',
      '/assets/images/portrait/old-jace-portrait.webp',
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

