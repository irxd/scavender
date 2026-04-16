import { useEffect, useState } from 'react'

interface BackgroundProps {
  src: string
}

export function Background({ src }: BackgroundProps) {
  // Switch object-fit based on viewport aspect ratio:
  // - Landscape (wider than portrait threshold): cover (fills, crops sides)
  // - Portrait (taller than wide, e.g. mobile): contain (full image visible with letterbox)
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 1
  )

  useEffect(() => {
    const onResize = () => {
      setIsPortrait(window.innerWidth / window.innerHeight < 1)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div id="bg-layer">
      <img
        src={src}
        alt="background"
        draggable={false}
        style={{
          objectFit: isPortrait ? 'contain' : 'cover',
        }}
      />
    </div>
  )
}
