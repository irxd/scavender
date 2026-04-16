import { useState } from 'react'

const chapters = [
  {
    id: 'metro',
    title: 'The Metro',
    image: '/assets/images/background/level1.1.jpg',
    subtitle: null,
  },
  {
    id: 'refinery',
    title: 'The Refinery',
    image: '/assets/images/background/level2.jpg',
    subtitle: 'Coming Soon',
  },
  {
    id: 'ghost-lab',
    title: 'The Ghost Lab',
    image: '/assets/images/background/level3.jpg',
    subtitle: 'Coming Soon',
  },
  {
    id: 'reactor',
    title: 'The Reactor',
    image: '/assets/images/background/level4.jpg',
    subtitle: 'Coming Soon',
  },
]

type Screen = 'prompt' | 'menu' | 'chapters'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('prompt')
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
            src="/assets/images/scavender-logo.png"
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
              </nav>
            )}
          </div>
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
          ← Back
        </button>

        <div className="chapter-select__grid">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="chapter-card"
              id={`chapter-${ch.id}`}
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
