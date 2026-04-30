import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InventoryState {
  obtainedItems: string[]
  obtainItem: (id: string) => void
  hasItem: (id: string) => boolean
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
      resetItems: () => set({ obtainedItems: [] }),
      reset: () => set({ obtainedItems: [] })
    }),
    {
      name: 'scavender-inventory-storage', // key in localStorage
    }
  )
)
