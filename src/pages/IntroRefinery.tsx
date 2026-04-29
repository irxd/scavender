import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'

const REFINERY_INTRO_SLIDES: IntroSlide[] = [
  {
    image: '/assets/images/intro/intro2.1.webp',
    texts: [
      `The Refinery... It's been abandoned for years.`,
      `But there might still be some useful scraps inside.`,
    ],
  },
]

export default function IntroRefinery() {
  const navigate = useNavigate()

  return (
    <div className="intro-page">
      <StageIntro
        slides={REFINERY_INTRO_SLIDES}
        onComplete={() => navigate('/refinery')}
      />
    </div>
  )
}
