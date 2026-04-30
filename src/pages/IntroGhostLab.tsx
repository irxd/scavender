import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'

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

  return (
    <div className="intro-page">
      <StageIntro
        slides={GHOST_LAB_INTRO_SLIDES}
        onComplete={() => navigate('/ghost-lab')}
      />
    </div>
  )
}
