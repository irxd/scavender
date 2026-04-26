import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'

const GHOST_LAB_INTRO_SLIDES: IntroSlide[] = [
  {
    image: '/assets/images/background/level3.1.webp',
    texts: [
      `The Ghost Lab...`,
      `I've heard rumors about this place. Let's see what's inside.`,
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
