import { useEffect, useRef } from 'react'

export function BackgroundAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore playback errors (e.g. autoplay blocked)
        })
      }
    }

    startAudio()

    const handleInteraction = () => {
      startAudio()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [src])

  return <audio ref={audioRef} src={src} loop preload="auto" />
}
