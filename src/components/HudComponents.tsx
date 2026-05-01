interface HudComponentsProps {
  onOpenInventory: () => void
  hintsEnabled: boolean
  onToggleHints: () => void
}

export function HudComponents({ onOpenInventory, hintsEnabled, onToggleHints }: HudComponentsProps) {
  return (
    <>
      {/* HUD components */}
      <div id="hud">
        <div className="hud-badge desktop-only">MOVE: WASD / ↑↓←→ | RUN: + SHIFT</div>
        <div className="hud-badge">Click Objective to Auto Run to it</div>
      </div>

      <button className="bag-button" onClick={onOpenInventory} title="Open Inventory">
        <img src="/assets/icons/backpack-icon.webp" alt="Inventory" />
      </button>

      <button
        className="hint-button"
        onClick={onToggleHints}
        title={hintsEnabled ? 'Turn Hints Off' : 'Turn Hints On'}
      >
        <img
          src={hintsEnabled ? "/assets/icons/hint-on-icon.webp" : "/assets/icons/hint-off-icon.webp"}
          alt="Toggle Hints"
        />
      </button>
    </>
  )
}
