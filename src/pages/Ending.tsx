import { useParams, useNavigate } from 'react-router-dom'
import { GameEnding, type EndingSlide } from '../components/GameEnding'

const ENDING_1_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/ending1-1.webp',
    texts: [
      `Instead of turning off cleanly, the reactor's energy becomes uncontrollable and explodes.`,
    ],
  },
  {
    image: '/assets/images/ending/ending1-2.webp',
    texts: [
      `The facility is destroyed, burying the source of the signal forever.`,
    ],
  },
  {
    image: '/assets/images/ending/ending1-3.webp',
    texts: [
      `But did shutting it down really fix the time static? Or did it just shatter the remaining timeline into pieces?`,
    ],
  },
]

const ENDING_2_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/ending2-1.webp',
    texts: [
      `The reactor stabilizes, humming with a controlled, steady rhythm.`,
    ],
  },
  {
    image: '/assets/images/ending/ending2-2.webp',
    texts: [
      `The time static stops spreading, but the past remains frozen. Our village survives for another day.`,
    ],
  },
  {
    image: '/assets/images/ending/ending2-3.webp',
    texts: [
      `We still live in the rusted wasteland of the present, but at least we have a future.`,
    ],
  },
]

const ENDING_3_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/secret3-1.webp',
    texts: [
      `The worn watch pulses in sync with the reactor core. The signal matches perfectly.`,
    ],
  },
  {
    image: '/assets/images/ending/secret3-2.webp',
    texts: [
      `The time static begins to unravel, reversing its grip on the world. The timeline merges.`,
    ],
  },
  {
    image: '/assets/images/ending/secret3-3.webp',
    texts: [
      `For the first time in decades, the past and present are one. We are free.`,
    ],
  },
]

export default function Ending() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  let slides: EndingSlide[] = []
  if (id === '1') slides = ENDING_1_SLIDES
  else if (id === '2') slides = ENDING_2_SLIDES
  else if (id === '3') slides = ENDING_3_SLIDES
  else slides = ENDING_1_SLIDES // Default fallback

  return (
    <GameEnding 
      slides={slides}
      onComplete={() => navigate('/')} 
    />
  )
}
