import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InventoryState {
  obtainedItems: string[]
  obtainItem: (id: string) => void
  hasItem: (id: string) => boolean
  setItems: (ids: string[]) => void
  resetWithDefaults: (defaultItems: string[]) => void
  resetItems: () => void
  reset: () => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      obtainedItems: [],
      obtainItem: (id: string) => {
        if (!get().obtainedItems.includes(id)) {
          set((state) => ({ obtainedItems: [...state.obtainedItems, id] }))
        }
      },
      hasItem: (id: string) => get().obtainedItems.includes(id),
      setItems: (ids: string[]) => set({ obtainedItems: ids }),
      resetWithDefaults: (defaultItems: string[]) => {
        const current = get().obtainedItems
        const hasWatch = current.includes('watch')
        const newItems = [...defaultItems]
        if (hasWatch && !newItems.includes('watch')) {
          newItems.push('watch')
        }
        set({ obtainedItems: newItems })
      },
      resetItems: () => set({ obtainedItems: [] }),
      reset: () => set({ obtainedItems: [] })
    }),
    {
      name: 'scavender-inventory-storage', // key in localStorage
    }
  )
)
