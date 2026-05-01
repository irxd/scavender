import { useState, useMemo } from 'react'
import { useInventoryStore } from '../store/useInventoryStore'
import { ITEMS } from '../config/items'

interface Props {
  onClose: () => void
}

export function InventoryOverlay({ onClose }: Props) {
  const { obtainedItems } = useInventoryStore()
  const [filter, setFilter] = useState('')

  const displayedItems = useMemo(() => {
    return obtainedItems
      .map(id => ITEMS[id])
      .filter(item => {
        if (!item) return false
        if (!filter) return true
        const search = filter.toLowerCase()
        return item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search)
      })
  }, [obtainedItems, filter])

  return (
    <div
      className="inventory-overlay-container"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div
        className="inventory-overlay-backdrop"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      />
      <div
        className="inventory-overlay"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="inventory-header">
          <h2>COLLECTED ITEMS</h2>
          <input
            type="text"
            placeholder="Filter (by type, e.g., Tool)"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="inventory-grid">
          {displayedItems.map(item => (
            <div key={item.id} className="inventory-card">
              <img src={item.image} alt={item.name} className="inventory-card-image" />
              <div className="inventory-card-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
          {displayedItems.length === 0 && (
            <div className="inventory-empty">No items collected yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
