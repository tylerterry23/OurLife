import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Personal identity — separate from settingsStore's couple-wide
// displayNames (used to label shared content like Ratings/Quiz). Modeled
// as "my" profile now so it maps cleanly onto per-account rows once real
// multi-couple accounts exist — right now there's one demo identity.
export type RelationshipStatus =
  'dating' | 'engaged' | 'married' | 'situationship' | 'its_complicated'

export const relationshipStatusLabels: Record<RelationshipStatus, string> = {
  dating: 'Dating',
  engaged: 'Engaged',
  married: 'Married',
  situationship: 'Situationship',
  its_complicated: "It's complicated",
}

interface ProfileState {
  username: string
  status: RelationshipStatus
  setUsername: (username: string) => void
  setStatus: (status: RelationshipStatus) => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      username: 'tyler',
      status: 'dating',
      setUsername: (username) => set({ username }),
      setStatus: (status) => set({ status }),
    }),
    { name: 'profile-storage' }
  )
)
