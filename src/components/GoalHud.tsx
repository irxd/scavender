interface GoalHudProps {
  mainGoalText: string
  miniGoalsOrder?: string[]
  activeMiniGoals?: string[]
  miniGoalConfig?: Record<string, string>
  onGoalClick?: (goalId: string) => void
}

export function GoalHud({
  mainGoalText,
  miniGoalsOrder = [],
  activeMiniGoals = [],
  miniGoalConfig = {},
  onGoalClick,
}: GoalHudProps) {
  const hasSubGoals = miniGoalsOrder.some(id => activeMiniGoals.includes(id))

  return (
    <div id="goal-hud">
      <div className="goal-card">
        <span className="goal-text">{mainGoalText}</span>
        {hasSubGoals && (
          <div className="goal-sub-list">
            {miniGoalsOrder
              .filter(id => activeMiniGoals.includes(id))
              .map(id => (
                <div
                  key={id}
                  className={`goal-sub-item ${onGoalClick ? 'clickable' : ''}`}
                  onClick={onGoalClick ? () => onGoalClick(id) : undefined}
                >
                  {miniGoalConfig[id] || id}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
