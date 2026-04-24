import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InventoryState {
  obtainedItems: string[]
  currentLevelId: string
  obtainItem: (id: string) => void
  hasItem: (id: string) => boolean
  setCurrentLevel: (id: string) => void
  resetItems: () => void
  reset: () => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      obtainedItems: [],
      currentLevelId: 'level1.1',
      obtainItem: (id: string) => {
        if (!get().obtainedItems.includes(id)) {
          set((state) => ({ obtainedItems: [...state.obtainedItems, id] }))
        }
      },
      hasItem: (id: string) => get().obtainedItems.includes(id),
      setCurrentLevel: (id: string) => set({ currentLevelId: id }),
      resetItems: () => set({ obtainedItems: [] }),
      reset: () => set({ obtainedItems: [], currentLevelId: 'level1.1' })
    }),
    {
      name: 'scavender-inventory-storage', // key in localStorage
    }
  )
)
