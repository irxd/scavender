import { useState, useEffect, useRef } from 'react'

interface PuzzleOverlayProps {
  puzzleId: string
  onComplete: () => void
}

// --- VENDING PUZZLE ---
function VendingPuzzle({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'closed' | 'flickering_open' | 'open' | 'flickering_closed'>('closed')
  const [clickedCircles, setClickedCircles] = useState<Set<number>>(new Set())
  const circlesRef = useRef(new Set<number>())

  const isOpen = phase === 'open' || phase === 'flickering_closed'

  // Cycle: closed -> flickering_open -> open -> flickering_closed -> closed
  useEffect(() => {
    let timer: number
    if (phase === 'closed') {
      timer = window.setTimeout(() => setPhase('flickering_open'), 1000)
    } else if (phase === 'flickering_open') {
      timer = window.setTimeout(() => setPhase('open'), 1200)
    } else if (phase === 'open') {
      timer = window.setTimeout(() => setPhase('flickering_closed'), 1500)
    } else if (phase === 'flickering_closed') {
      timer = window.setTimeout(() => setPhase('closed'), 1200)
    }

    return () => window.clearTimeout(timer)
  }, [phase])

  const handleCircleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (!isOpen) return // Only clickable when opened

    const newSet = new Set(circlesRef.current)
    newSet.add(index)
    circlesRef.current = newSet
    setClickedCircles(newSet)

    if (newSet.size === 4) {
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }

  const circles = [
    { id: 0, top: '48%', left: '30%' },
    { id: 1, top: '48%', left: '70%' },
    { id: 2, top: '65%', left: '30%' },
    { id: 3, top: '65%', left: '70%' },
  ]

  const isFlickering = phase === 'flickering_open' || phase === 'flickering_closed'

  return (
    <div className={`puzzle-content-wrapper ${phase}`}>
      <div className={`puzzle-image-container ${isFlickering ? 'flicker-transition' : ''}`}>
        <img
          src={isOpen ? "/assets/images/puzzle/metro/panel-opened.webp" : "/assets/images/puzzle/metro/panel-closed.webp"}
          alt="Electrical Panel"
          className="puzzle-panel-image"
        />

        {/* Sparks appear during flickering or just before opening */}
        {isFlickering && (
          <>
            <div className="puzzle-spark spark-1"></div>
            <div className="puzzle-spark spark-2"></div>
            <div className="puzzle-spark spark-3"></div>
            <div className="puzzle-spark spark-4"></div>
            <div className="puzzle-spark spark-5"></div>
          </>
        )}
      </div>

      {phase === 'open' && circles.map(circle => (
        !clickedCircles.has(circle.id) && (
          <div
            key={circle.id}
            className="puzzle-click-circle"
            style={{ top: circle.top, left: circle.left }}
            onClick={(e) => handleCircleClick(e, circle.id)}
          ></div>
        )
      ))}
    </div>
  )
}

// --- PIPE PUZZLE ---
type PipeType = 'straight' | 'corner' | 't' | 'cross' | 'empty'

interface PipeTile {
  type: PipeType
  rotation: number
}

const DEFAULT_PIPE_GRID: PipeTile[] = [
  { type: 'corner', rotation: 90 }, // 0
  { type: 'corner', rotation: 180 }, // 1
  { type: 'straight', rotation: 90 }, // 2
  { type: 't', rotation: 0 }, // 3

  { type: 'straight', rotation: 0 }, // 4
  { type: 'straight', rotation: 90 }, // 5
  { type: 'corner', rotation: 270 }, // 6
  { type: 'corner', rotation: 0 }, // 7

  { type: 'corner', rotation: 180 }, // 8
  { type: 'corner', rotation: 90 }, // 9
  { type: 'corner', rotation: 0 }, // 10
  { type: 'corner', rotation: 270 }, // 11

  { type: 't', rotation: 90 }, // 12
  { type: 'corner', rotation: 180 }, // 13
  { type: 'straight', rotation: 0 }, // 14
  { type: 'straight', rotation: 90 }, // 15
]

function getConnections(type: PipeType, rotation: number): boolean[] {
  const base = {
    straight: [true, false, true, false],
    corner: [true, true, false, false],
    t: [true, true, true, false],
    cross: [true, true, true, true],
    empty: [false, false, false, false]
  }[type]

  const shifts = ((rotation % 360) / 90) % 4
  const result = [...base]
  for (let i = 0; i < shifts; i++) {
    result.unshift(result.pop()!)
  }
  return result
}

function PipePuzzleVisual({ type, powered }: { type: PipeType, powered: boolean }) {
  const strokeColor = powered ? '#3f3' : '#333'
  const filter = powered ? 'url(#glow)' : 'none'

  return (
    <div className="pipe-svg-container">
      <svg viewBox="0 0 100 100" className="pipe-svg" style={{ filter }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {type === 'straight' && (
          <line x1="50" y1="0" x2="50" y2="100" stroke={strokeColor} strokeWidth="16" strokeLinecap="butt" />
        )}
        {type === 'corner' && (
          <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={strokeColor} strokeWidth="16" strokeLinecap="butt" />
        )}
        {type === 't' && (
          <>
            <line x1="50" y1="0" x2="50" y2="100" stroke={strokeColor} strokeWidth="16" strokeLinecap="butt" />
            <line x1="50" y1="50" x2="100" y2="50" stroke={strokeColor} strokeWidth="16" strokeLinecap="butt" />
          </>
        )}
        {type !== 'empty' && (
          <circle cx="50" cy="50" r="8" fill={strokeColor} />
        )}
      </svg>
    </div>
  )
}

function PipePuzzle({ onComplete }: { onComplete: () => void }) {
  // Randomize initial rotations
  const [tiles, setTiles] = useState<PipeTile[]>(() =>
    DEFAULT_PIPE_GRID.map(t => ({
      ...t,
      rotation: t.rotation + (Math.floor(Math.random() * 4) * 90)
    }))
  )
  const [poweredSet, setPoweredSet] = useState<Set<number>>(new Set())
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const powered = new Set<number>()
    const queue: number[] = []

    // Check source: West of cell 8
    const startConns = getConnections(tiles[8].type, tiles[8].rotation)
    if (startConns[3]) {
      powered.add(8)
      queue.push(8)
    }

    while (queue.length > 0) {
      const curr = queue.shift()!
      const r = Math.floor(curr / 4)
      const c = curr % 4
      const conns = getConnections(tiles[curr].type, tiles[curr].rotation)

      // N
      if (conns[0] && r > 0) {
        const neighbor = curr - 4
        const nConns = getConnections(tiles[neighbor].type, tiles[neighbor].rotation)
        if (nConns[2] && !powered.has(neighbor)) {
          powered.add(neighbor)
          queue.push(neighbor)
        }
      }
      // E
      if (conns[1] && c < 3) {
        const neighbor = curr + 1
        const nConns = getConnections(tiles[neighbor].type, tiles[neighbor].rotation)
        if (nConns[3] && !powered.has(neighbor)) {
          powered.add(neighbor)
          queue.push(neighbor)
        }
      }
      // S
      if (conns[2] && r < 3) {
        const neighbor = curr + 4
        const nConns = getConnections(tiles[neighbor].type, tiles[neighbor].rotation)
        if (nConns[0] && !powered.has(neighbor)) {
          powered.add(neighbor)
          queue.push(neighbor)
        }
      }
      // W
      if (conns[3] && c > 0) {
        const neighbor = curr - 1
        const nConns = getConnections(tiles[neighbor].type, tiles[neighbor].rotation)
        if (nConns[1] && !powered.has(neighbor)) {
          powered.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    setPoweredSet(powered)

    // Check win condition
    const endConns = getConnections(tiles[11].type, tiles[11].rotation)
    if (powered.has(11) && endConns[1]) {
      setIsComplete(true)
      setTimeout(onComplete, 1000)
    }
  }, [tiles, onComplete])

  const handleTileClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (isComplete) return
    setTiles(prev => {
      const newTiles = [...prev]
      newTiles[index] = {
        ...newTiles[index],
        rotation: newTiles[index].rotation + 90
      }
      return newTiles
    })
  }

  return (
    <div className="puzzle-content-wrapper" onClick={(e) => e.stopPropagation()}>
      <img
        src="/assets/images/puzzle/metro/monitor-display.webp"
        alt="Monitor Display"
        className="puzzle-panel-image pipe-monitor-image"
      />
      <div className="pipe-puzzle-container">
        {/* Source point on the left of row 2 (index 8) */}
        <div className="pipe-source" />

        {tiles.map((tile, i) => (
          <div
            key={i}
            className="pipe-tile"
            onClick={(e) => handleTileClick(e, i)}
            style={{ transform: `rotate(${tile.rotation}deg)` }}
          >
            <PipePuzzleVisual type={tile.type} powered={poweredSet.has(i)} />
          </div>
        ))}

        {/* Dest point on the right of row 2 (index 11) */}
        <div className={`pipe-dest ${isComplete ? 'powered' : ''}`} />
      </div>
    </div>
  )
}

// --- OVERLAY CONTAINER ---
export function PuzzleOverlay({ puzzleId, onComplete }: PuzzleOverlayProps) {
  return (
    <div className="puzzle-overlay-container">
      <div className="puzzle-overlay-backdrop" onClick={(e) => e.stopPropagation()} />

      {puzzleId === 'metro-vending' && <VendingPuzzle onComplete={onComplete} />}
      {puzzleId === 'metro-pipe' && <PipePuzzle onComplete={onComplete} />}

      {puzzleId !== 'metro-vending' && puzzleId !== 'metro-pipe' && (
        <div className="puzzle-overlay">
          Unknown puzzle: {puzzleId}
        </div>
      )}
    </div>
  )
}
