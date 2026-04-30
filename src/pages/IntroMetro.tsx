import { useNavigate } from 'react-router-dom'
import { StageIntro } from '../components/StageIntro'
import type { IntroSlide } from '../components/StageIntro'

const METRO_INTRO_SLIDES: IntroSlide[] = [
  {
    image: '/assets/images/intro/intro1.1.webp',
    texts: [
      `They told us the experiment would give us forever. Free energy. Unlimited time.`,
    ],
  },
  {
    image: '/assets/images/intro/intro1.2.webp',
    texts: [
      `Instead, forever happened all at once. The world didn't end with a bang...\nIt ended with a stutter.`,
      `Half of the world stuck in the past, frozen in time static. While the present decayed into rusted wasteland`,
    ],
  },
  {
    image: '/assets/images/intro/intro1.3.webp',
    texts: [
      `My name is Jace Miller. I don't live in the past, and I'm barely surviving the present. I just want to protect my village.`,
    ],
  },
]

export default function IntroMetro() {
  const navigate = useNavigate()

  return (
    <div className="intro-page">
      <StageIntro
        slides={METRO_INTRO_SLIDES}
        onComplete={() => navigate('/metro')}
      />
    </div>
  )
}
