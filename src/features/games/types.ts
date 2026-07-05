export type PromptCategory = 'light' | 'daring' | 'trivia' | 'spicy'

export interface Prompt {
  id: string
  category: PromptCategory
  text: string
  custom: boolean
}

export const categoryLabels: Record<PromptCategory, string> = {
  light: 'Light',
  daring: 'Daring',
  trivia: 'Trivia',
  spicy: 'Spicy',
}

export const categoryDescriptions: Record<PromptCategory, string> = {
  light: 'Silly and low-stakes',
  daring: 'A little bolder',
  trivia: 'How well do you know each other?',
  spicy: 'Flirty and romantic (18+)',
}

// Wheel slice colors keyed to CSS custom properties already in the theme
// system, so every category reads correctly across all 6 palettes.
export const categoryColors: Record<PromptCategory, string> = {
  light: 'hsl(var(--accent))',
  daring: 'hsl(var(--primary))',
  trivia: 'hsl(var(--muted-foreground))',
  spicy: 'hsl(var(--destructive))',
}

export const categoryOrder: PromptCategory[] = [
  'light',
  'daring',
  'trivia',
  'spicy',
]

// Whose turn the wheel landed on. "both" covers group prompts ("All
// players" in the reference) — with just two people that means both of you.
export type Turn = 'me' | 'partner' | 'both'

// Wheel slice order — six slices so no two identical labels sit next to
// each other, matching the density of the reference wheel.
export const turnSliceOrder: Turn[] = ['me', 'partner', 'both', 'me', 'partner', 'both']

export const turnColors: Record<Turn, string> = {
  me: 'hsl(var(--primary))',
  partner: 'hsl(var(--accent))',
  both: 'hsl(var(--muted-foreground))',
}
