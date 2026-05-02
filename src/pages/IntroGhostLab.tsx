import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'
import { preloadImages } from '../utils/preload'

const GHOST_LAB_INTRO_SLIDES: IntroSlide[] = [
  {
    image: '/assets/images/intro/intro3.1.webp',
    texts: [
      `Kaboom!`,
      `Looks like hydra is injured too.`,
      `I need to hurry up!`,
    ],
  },
]

export default function IntroGhostLab() {
  const navigate = useNavigate()

  useEffect(() => {
    preloadImages([
      '/assets/images/background/level3.1.webp',
      '/assets/images/background/level3.2.webp',
      '/assets/images/background/level3.3.webp',

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
        slides={GHOST_LAB_INTRO_SLIDES}
        onComplete={() => navigate('/ghost-lab')}
      />
    </div>
  )
}

