import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName =
  | 'ourlife'
  | 'bloom'
  | 'graphite'
  | 'rose'
  | 'midnight'
  | 'sage'
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

// Palettes: OurLife & Bloom & Graphite are original; Rosé, Midnight, and
// Sage adapt Rosé Pine, Tokyo Night, and Everforest. See src/index.css for
// the full CSS custom-property values behind each.
export const themes: Record<ThemeName, ThemeSwatch> = {
  ourlife: {
    label: 'OurLife',
    description: 'Candlelit wine and antique gold.',
    dark: { bg: '#0f0d12', fg: '#efe7dd', primary: '#8a3b54', accent: '#c9a667' },
    light: { bg: '#faf6ef', fg: '#2b2430', primary: '#8a3b54', accent: '#96702f' },
  },
  bloom: {
    label: 'Bloom',
    description: 'Bold fuchsia and gold on deep plum.',
    dark: { bg: '#18101a', fg: '#f4e6ef', primary: '#d6417e', accent: '#eab04d' },
    light: { bg: '#fdf2f8', fg: '#3a1228', primary: '#c41e6a', accent: '#b0791a' },
  },
  graphite: {
    label: 'Graphite',
    description: 'Warm black, gray, and bone.',
    dark: { bg: '#121110', fg: '#ece8e3', primary: '#e0dcd6', accent: '#b0a89e' },
    light: { bg: '#f7f5f2', fg: '#201e1b', primary: '#201e1b', accent: '#8a827a' },
  },
  rose: {
    label: 'Rosé',
    description: 'Dusky rose and iris — soho minimalist.',
    dark: { bg: '#191724', fg: '#e0def4', primary: '#eb6f92', accent: '#c4a7e7' },
    light: { bg: '#faf4ed', fg: '#464261', primary: '#b4637a', accent: '#907aa9' },
  },
  midnight: {
    label: 'Midnight',
    description: 'Deep indigo with soft blue and violet.',
    dark: { bg: '#1a1b26', fg: '#c0caf5', primary: '#7aa2f7', accent: '#bb9af7' },
    light: { bg: '#eceef4', fg: '#343b58', primary: '#34548a', accent: '#6c4bb0' },
  },
  sage: {
    label: 'Sage',
    description: 'Cozy forest green and terracotta.',
    dark: { bg: '#2d353b', fg: '#d3c6aa', primary: '#a7c080', accent: '#e69875' },
    light: { bg: '#fdf6e3', fg: '#5c6a72', primary: '#8da101', accent: '#dd6f1e' },
  },
}

export const themeOrder: ThemeName[] = [
  'ourlife',
  'bloom',
  'graphite',
  'rose',
  'midnight',
  'sage',
]

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && value in themes
}

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
  // re-applies from the now-rehydrated store to stay in sync. If a stale
  // theme name from a previous lineup is persisted, fall back to OurLife.
  const initial = useThemeStore.getState()
  if (!isThemeName(initial.themeName)) {
    initial.setThemeName('ourlife')
  } else {
    applyTheme(initial.themeName, initial.mode)
  }
}
