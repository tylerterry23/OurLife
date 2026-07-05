import { cn } from '@/lib/utils'
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  type PromptCategory,
} from '../types'

export function CategoryToggles({
  active,
  onToggle,
}: {
  active: Set<PromptCategory>
  onToggle: (category: PromptCategory) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categoryOrder.map((cat) => {
        const isOn = active.has(cat)
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left transition-colors',
              isOn
                ? 'border-gold bg-ink-raised'
                : 'border-line opacity-50 hover:opacity-75'
            )}
          >
            <p
              className={cn(
                'text-sm font-medium',
                isOn ? 'text-gold' : 'text-parchment'
              )}
            >
              {categoryLabels[cat]}
            </p>
            <p className="text-xs text-muted-foreground">
              {categoryDescriptions[cat]}
            </p>
          </button>
        )
      })}
    </div>
  )
}
