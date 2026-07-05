import { useState } from 'react'
import { Brain, Check, Feather, Flame, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ManagePromptsDialog } from './ManagePromptsDialog'
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  type PromptCategory,
} from '../types'

const packIcons: Record<PromptCategory, LucideIcon> = {
  light: Feather,
  daring: Flame,
  trivia: Brain,
  spicy: Heart,
}

export function PacksStep({
  active,
  onToggle,
  onStart,
}: {
  active: Set<PromptCategory>
  onToggle: (category: PromptCategory) => void
  onStart: () => void
}) {
  const [spicyConfirmOpen, setSpicyConfirmOpen] = useState(false)

  function handleTap(category: PromptCategory) {
    if (category === 'spicy' && !active.has('spicy')) {
      setSpicyConfirmOpen(true)
      return
    }
    onToggle(category)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium text-parchment">
          Choose your packs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick as many as you like — the wheel draws from all of them.
        </p>
      </div>

      <div className="space-y-3">
        {categoryOrder.map((cat) => {
          const Icon = packIcons[cat]
          const isOn = active.has(cat)
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleTap(cat)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors',
                isOn
                  ? 'border-gold bg-ink-raised'
                  : 'border-line bg-card opacity-60 hover:opacity-90'
              )}
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  isOn ? 'bg-wine' : 'bg-ink'
                )}
              >
                <Icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-parchment">
                  {categoryLabels[cat]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryDescriptions[cat]}
                </p>
              </div>
              {isOn && <Check className="h-5 w-5 shrink-0 text-gold" />}
            </button>
          )
        })}
      </div>

      <div className="flex justify-center">
        <ManagePromptsDialog />
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={active.size === 0}
        onClick={onStart}
      >
        Let's go!
      </Button>

      <Dialog open={spicyConfirmOpen} onOpenChange={setSpicyConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn on Spicy?</DialogTitle>
            <DialogDescription>
              This pack is flirty and romantic — 18+ and just for the two of
              you. Make sure you're somewhere private before you spin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSpicyConfirmOpen(false)}
            >
              Not now
            </Button>
            <Button
              onClick={() => {
                onToggle('spicy')
                setSpicyConfirmOpen(false)
              }}
            >
              Turn it on
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
