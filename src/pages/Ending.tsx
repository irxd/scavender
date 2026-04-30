import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { GameEnding, type EndingSlide } from '../components/GameEnding'

const ENDING_1_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/ending1-1.webp',
    texts: [
      `Instead of turning off cleanly, the reactor's energy becomes uncontrollable.`,
      `Destroyed everything around me.`
    ],
  },
  {
    image: '/assets/images/ending/ending1-2.webp',
    texts: [
      `I woke up somewhere familiar yet strange.`,
    ],
  },
  {
    image: '/assets/images/ending/ending1-3.webp',
    texts: [
      `I have become him, repeating the cycle over again.`,
    ],
  },
]

const ENDING_2_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/ending2-1.webp',
    texts: [
      `The reactor stabilizes, humming with a controlled, steady rhythm.`,
      `But suddenly, it started shaking violently.`,
      `Sucking everything into the void.`
    ],
  },
  {
    image: '/assets/images/ending/ending2-2.webp',
    texts: [
      `The world resetted.`,
      `Came back to normal like nothing happened.`
    ],
  },
  {
    image: '/assets/images/ending/ending2-3.webp',
    texts: [
      `But I'm no longer exist in this world.`,
    ],
  },
]

const ENDING_3_SLIDES: EndingSlide[] = [
  {
    image: '/assets/images/ending/secret3-1.webp',
    texts: [
      `The worn watch pulses in sync with the reactor core. The signal matches perfectly.`,
      `The time static begins to unravel, reversing its grip on the world. The timeline merges.`
    ],
  },
  {
    image: '/assets/images/ending/secret3-2.webp',
    texts: [
      `He started merged with my body, my memories, and my consciousness.`,
    ],
  },
  {
    image: '/assets/images/ending/secret3-3.webp',
    texts: [
      `I woke up in a wide field.`,
      `The world feels quiet, serene, and empty.`,
      `But it feels... different.`,
    ],
  },
]

export default function Ending() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  let slides: EndingSlide[] = []
  if (location.pathname === '/truth') slides = ENDING_3_SLIDES
  else if (id === '1') slides = ENDING_1_SLIDES
  else if (id === '2') slides = ENDING_2_SLIDES
  else slides = ENDING_1_SLIDES // Default fallback

  return (
    <GameEnding
      slides={slides}
      onComplete={() => navigate('/')}
    />
  )
}
