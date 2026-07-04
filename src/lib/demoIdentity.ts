// Local stand-in identity used only when no Supabase project is connected
// (demo mode). Real mode reads everything from the profiles/couples tables;
// this just keeps the app coherent and lightly editable offline.
import type { RelationshipStatus } from '@/features/couple/types'

export interface DemoIdentity {
  displayName: string
  username: string
  avatarUrl: string | null
  relationshipStatus: RelationshipStatus
}

const STORAGE_KEY = 'ourlife-demo-identity'

const defaults: DemoIdentity = {
  displayName: 'You',
  username: 'you',
  avatarUrl: null,
  relationshipStatus: 'dating',
}

export function readDemoIdentity(): DemoIdentity {
  if (typeof window === 'undefined') return defaults
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaults
  try {
    return { ...defaults, ...(JSON.parse(raw) as Partial<DemoIdentity>) }
  } catch {
    return defaults
  }
}

export function writeDemoIdentity(patch: Partial<DemoIdentity>): DemoIdentity {
  const next = { ...readDemoIdentity(), ...patch }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export const DEMO_ME_USER_ID = 'demo-me'
export const DEMO_PARTNER_USER_ID = 'demo-partner'
export const DEMO_PARTNER_NAME = 'Alex'
