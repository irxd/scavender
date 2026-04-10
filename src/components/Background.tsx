interface BackgroundProps {
  src: string
}

export function Background({ src }: BackgroundProps) {
  return (
    <div id="bg-layer">
      <img src={src} alt="background" draggable={false} />
    </div>
  )
}
