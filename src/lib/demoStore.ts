// Local, per-browser data layer used while isSupabaseConfigured is false
// (see supabaseClient.ts). Each feature's api/ module keeps one of these
// collections seeded with example rows so the app is fully browsable
// without a backend. Swapped out automatically the moment real Supabase
// credentials are added — nothing else needs to change.
const STORAGE_PREFIX = 'ourlife-demo:'

function readCollection<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed
  const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
  if (!raw) return seed
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return seed
  }
}

function writeCollection<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items))
}

export function createDemoCollection<T extends { id: string }>(
  key: string,
  seed: T[]
) {
  let items = readCollection<T>(key, seed)

  return {
    list(): T[] {
      return items
    },
    get(id: string): T | undefined {
      return items.find((item) => item.id === id)
    },
    insert(item: T): T {
      items = [item, ...items]
      writeCollection(key, items)
      return item
    },
    update(id: string, patch: Partial<T>): T {
      items = items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
      writeCollection(key, items)
      const updated = items.find((item) => item.id === id)
      if (!updated) throw new Error(`Demo item "${id}" not found in "${key}"`)
      return updated
    },
    remove(id: string): void {
      items = items.filter((item) => item.id !== id)
      writeCollection(key, items)
    },
  }
}
