import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useInventoryStore } from '../store/useInventoryStore'

const chapters = [
  {
    id: 'metro',
    title: 'The Metro',
    image: '/assets/images/background/level1.1.webp',
    subtitle: null,
    path: '/intro/metro',
    levelId: 'level1.1',
    initialItems: []
  },
  {
    id: 'refinery',
    title: 'The Refinery',
    image: '/assets/images/background/level2.1.webp',
    subtitle: null,
    path: '/intro/refinery',
    levelId: 'level2.1',
    initialItems: ['rebar', 'wrench', 'wire', 'battery']
  },
  {
    id: 'ghost-lab',
    title: 'The Ghost Lab',
    image: '/assets/images/background/level3.2.webp',
    subtitle: null,
    path: '/intro/ghost-lab',
    levelId: 'level3.1',
    initialItems: ['rebar', 'wrench', 'wire', 'battery', 'fuel', 'sulfate', 'igniter']
  },
]

type Screen = 'prompt' | 'menu' | 'chapters'

export default function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setItems, resetItems } = useInventoryStore()
  const [screen, setScreen] = useState<Screen>('prompt')

  const [hintsEnabled, setHintsEnabled] = useState(() => {
    const saved = localStorage.getItem('scavender_hints_enabled')
    return saved === null ? false : saved === 'true'
  })

  const handleHintsToggle = () => {
    const newVal = !hintsEnabled
    setHintsEnabled(newVal)
    localStorage.setItem('scavender_hints_enabled', newVal.toString())
  }

  useEffect(() => {
    if (searchParams.get('portal') === 'true') {
      resetItems()
      navigate('/metro?portal=true', { replace: true })
    }
  }, [searchParams, navigate, resetItems])

  const [promptFading, setPromptFading] = useState(false)

  const handlePromptClick = () => {
    if (screen !== 'prompt') return
    setPromptFading(true)
    setTimeout(() => setScreen('menu'), 600)
  }

  const handleSelectChapter = () => {
    setScreen('chapters')
  }

  const handleBackToMenu = () => {
    setScreen('menu')
  }

  const handlePlay = () => {
    resetItems()
    navigate('/intro/metro')
  }

  return (
    <>
      {/* ── Main Start Screen ── */}
      {screen !== 'chapters' && (
        <div
          className="start-screen"
          onClick={screen === 'prompt' ? handlePromptClick : undefined}
          style={{ cursor: screen === 'prompt' ? 'pointer' : 'default' }}
        >
          {/* Logo */}
          <img
            src="/assets/images/logo.webp"
            alt="Scavender"
            className="start-screen__logo"
            draggable={false}
          />

          {/* Menu area */}
          <div className="start-screen__menu-area">
            {/* Click to start prompt — only render during prompt phase */}
            {screen === 'prompt' && (
              <span
                className={`start-screen__prompt${promptFading ? ' fade-out' : ''}`}
              >
                Click Anywhere to Start
              </span>
            )}

            {/* PLAY / SELECT CHAPTER buttons */}
            {screen === 'menu' && (
              <nav className="start-screen__nav visible">
                <button
                  className="start-screen__nav-btn"
                  id="btn-play"
                  type="button"
                  onClick={handlePlay}
                >
                  Play
                </button>
                <button
                  className="start-screen__nav-btn"
                  id="btn-select-chapter"
                  type="button"
                  onClick={handleSelectChapter}
                >
                  Select Chapter
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    id="hint-toggle"
                    checked={hintsEnabled}
                    onChange={handleHintsToggle}
                    style={{ cursor: 'pointer', width: '20px', height: '20px', accentColor: '#65bae1' }}
                  />
                  <label
                    htmlFor="hint-toggle"
                    className="start-screen__nav-btn"
                    style={{ cursor: 'pointer', margin: 0 }}
                  >
                    Enable Hints
                  </label>
                </div>
              </nav>
            )}
          </div>

          <a
            href="https://x.com/_irxd"
            target="_blank"
            rel="noopener noreferrer"
            className="start-screen__credits"
          >
            <img src="/assets/icons/x-logo.svg" alt="X logo" className="start-screen__credits-icon" />
          </a>
        </div>
      )}

      {/* ── Chapter Select Screen ── */}
      <div className={`chapter-select${screen === 'chapters' ? ' visible' : ''}`}>
        <button
          className="chapter-select__back"
          id="btn-back-to-menu"
          type="button"
          onClick={handleBackToMenu}
        >
          BACK
        </button>

        <div className="chapter-select__grid">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="chapter-card"
              id={`chapter-${ch.id}`}
              onClick={ch.path ? () => {
                if (ch.initialItems) setItems(ch.initialItems)
                navigate(ch.path as string)
              } : undefined}
            >
              <div
                className="chapter-card__bg"
                style={{ backgroundImage: `url(${ch.image})` }}
              />
              <div className="chapter-card__overlay" />
              <div className="chapter-card__content">
                <h2 className="chapter-card__title">{ch.title}</h2>
                {ch.subtitle && (
                  <span className="chapter-card__subtitle">{ch.subtitle}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
