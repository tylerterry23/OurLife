import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DisplayNames {
  partner1: string
  partner2: string
}

interface SettingsState {
  displayNames: DisplayNames
  setDisplayNames: (names: Partial<DisplayNames>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayNames: { partner1: 'Tyler', partner2: 'Lauren' },
      setDisplayNames: (names) =>
        set((state) => ({
          displayNames: { ...state.displayNames, ...names },
        })),
    }),
    { name: 'settings-storage' }
  )
)
