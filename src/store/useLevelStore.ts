import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LevelState {
  currentLevelId: string
  setCurrentLevel: (id: string) => void
  reset: () => void
}

export const useLevelStore = create<LevelState>()(
  persist(
    (set) => ({
      currentLevelId: 'level1.1',
      setCurrentLevel: (id: string) => set({ currentLevelId: id }),
      reset: () => set({ currentLevelId: 'level1.1' })
    }),
    {
      name: 'scavender-level-storage',
    }
  )
)
