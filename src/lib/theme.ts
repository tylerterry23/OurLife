import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'ourlife' | 'hotpink' | 'monochrome' | 'ocean' | 'sunset'
export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'ourlife-theme'

export interface ThemeSwatch {
  label: string
  description: string
  // Representative colors per mode, for rendering a small preview card in
  // the theme picker without loading that theme's actual CSS.
  dark: { bg: string; fg: string; primary: string; accent: string }
  light: { bg: string; fg: string; primary: string; accent: string }
}

export const themes: Record<ThemeName, ThemeSwatch> = {
  ourlife: {
    label: 'OurLife',
    description: 'The original — wine, gold, and parchment.',
    dark: { bg: '#0f0d12', fg: '#efe7dd', primary: '#8a3b54', accent: '#c9a667' },
    light: { bg: '#faf6ef', fg: '#2b2430', primary: '#8a3b54', accent: '#96702f' },
  },
  hotpink: {
    label: 'Hot Pink',
    description: 'Bold pink with an electric cyan pop.',
    dark: { bg: '#120a10', fg: '#fbeaf3', primary: '#ff2d78', accent: '#22d3ee' },
    light: { bg: '#fff5fa', fg: '#2b0f1e', primary: '#e0155f', accent: '#0891b2' },
  },
  monochrome: {
    label: 'Monochrome',
    description: 'Black, gray, and white. Nothing else.',
    dark: { bg: '#0a0a0a', fg: '#f5f5f5', primary: '#e5e5e5', accent: '#a3a3a3' },
    light: { bg: '#fafafa', fg: '#171717', primary: '#171717', accent: '#525252' },
  },
  ocean: {
    label: 'Ocean',
    description: 'Calm teal and blue with a seafoam accent.',
    dark: { bg: '#0a1420', fg: '#e8f4f8', primary: '#1b7f9e', accent: '#5eead4' },
    light: { bg: '#f4fafc', fg: '#0d2733', primary: '#0e7490', accent: '#0d9488' },
  },
  sunset: {
    label: 'Sunset',
    description: 'Warm coral and peach with a rose pop.',
    dark: { bg: '#1a0f0d', fg: '#fdece3', primary: '#e2572f', accent: '#fb7185' },
    light: { bg: '#fff8f4', fg: '#3a1a10', primary: '#c8451f', accent: '#be123c' },
  },
}

export const themeOrder: ThemeName[] = [
  'ourlife',
  'hotpink',
  'monochrome',
  'ocean',
  'sunset',
]

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

export function applyTheme(themeName: ThemeName, mode: ThemeMode) {
  const resolved = resolveMode(mode)
  const root = document.documentElement
  root.setAttribute('data-theme', themeName)
  root.setAttribute('data-mode', resolved)

  // Keeps the browser/PWA chrome (status bar, task switcher card) in sync
  // with whatever theme is active, not just the page content.
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', themes[themeName][resolved].bg)
}

interface ThemeState {
  themeName: ThemeName
  mode: ThemeMode
  setThemeName: (themeName: ThemeName) => void
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeName: 'ourlife',
      mode: 'system',
      setThemeName: (themeName) => {
        set({ themeName })
        applyTheme(themeName, get().mode)
      },
      setMode: (mode) => {
        set({ mode })
        applyTheme(get().themeName, mode)
      },
    }),
    { name: THEME_STORAGE_KEY }
  )
)

// Re-resolve when the OS preference changes while "system" is selected.
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const { themeName, mode } = useThemeStore.getState()
      if (mode === 'system') applyTheme(themeName, mode)
    })

  // The inline script in index.html already applied attributes before
  // first paint using the raw localStorage value (avoiding a flash); this
  // re-applies from the now-rehydrated store to stay in sync.
  const initial = useThemeStore.getState()
  applyTheme(initial.themeName, initial.mode)
}
