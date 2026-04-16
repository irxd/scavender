import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sandbox from './pages/Sandbox'
import Metro from './pages/Metro'
import IntroMetro from './pages/IntroMetro'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sandbox" element={<Sandbox />} />
      <Route path="/metro" element={<Metro />} />
      <Route path="/intro/metro" element={<IntroMetro />} />
    </Routes>
  )
}
