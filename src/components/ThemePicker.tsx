import { useSyncExternalStore } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { themeOrder, themes, useThemeStore, type ThemeMode } from '@/lib/theme'

const modeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const darkMediaQuery = '(prefers-color-scheme: dark)'

function subscribeToSystemMode(onChange: () => void) {
  const mql = window.matchMedia(darkMediaQuery)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

// Tracks the OS light/dark preference reactively, so swatch previews update
// live if "System" is selected and the OS setting changes underneath it.
function useSystemPrefersDark() {
  return useSyncExternalStore(
    subscribeToSystemMode,
    () => window.matchMedia(darkMediaQuery).matches,
    () => false
  )
}

export function ThemePicker() {
  const themeName = useThemeStore((s) => s.themeName)
  const mode = useThemeStore((s) => s.mode)
  const setThemeName = useThemeStore((s) => s.setThemeName)
  const setMode = useThemeStore((s) => s.setMode)
  const systemPrefersDark = useSystemPrefersDark()

  const previewMode: 'light' | 'dark' =
    mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-parchment-dim">Mode</p>
        <div className="flex gap-1 rounded-full border border-line bg-ink p-1">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={cn(
                'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                mode === opt.value
                  ? 'bg-ink-raised text-gold'
                  : 'text-parchment-dim hover:text-parchment'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-parchment-dim">Theme</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themeOrder.map((key) => {
            const theme = themes[key]
            const swatch = theme[previewMode]
            const selected = themeName === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setThemeName(key)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-start gap-2.5 rounded-lg border-2 p-3 text-left transition-colors',
                  selected ? 'border-gold' : 'border-transparent'
                )}
                style={{ backgroundColor: swatch.bg }}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex gap-1.5">
                    <span
                      className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: swatch.primary }}
                    />
                    <span
                      className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: swatch.accent }}
                    />
                  </div>
                  {selected && (
                    <Check
                      className="h-4 w-4"
                      style={{ color: swatch.accent }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: swatch.fg }}
                >
                  {theme.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
