import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Leva } from 'leva'
import Home from './pages/Home'
import Sandbox from './pages/Sandbox'
import Metro from './pages/Metro'
import IntroMetro from './pages/IntroMetro'
import Refinery from './pages/Refinery'
import IntroRefinery from './pages/IntroRefinery'
import GhostLab from './pages/GhostLab'
import IntroGhostLab from './pages/IntroGhostLab'
import Ending from './pages/Ending'
import GameOver from './pages/GameOver'
import './index.css'

export default function App() {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // Modern browsers require this to show the prompt
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <>
      <Leva hidden={import.meta.env.VITE_ENABLE_DEBUG !== 'true'} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/metro" element={<Metro />} />
        <Route path="/intro/metro" element={<IntroMetro />} />
        <Route path="/refinery" element={<Refinery />} />
        <Route path="/intro/refinery" element={<IntroRefinery />} />
        <Route path="/ghost-lab" element={<GhostLab />} />
        <Route path="/intro/ghost-lab" element={<IntroGhostLab />} />
        <Route path="/ending/:id" element={<Ending />} />
        <Route path="/truth" element={<Ending />} />
        <Route path="/game-over" element={<GameOver />} />
      </Routes>
    </>
  )
}
