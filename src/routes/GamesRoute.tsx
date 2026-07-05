import { useRef, useState } from 'react'
import { Shuffle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { ConnectGate } from '@/features/couple/components/ConnectGate'
import { builtInPrompts } from '@/features/games/data/builtInPrompts'
import { CategoryToggles } from '@/features/games/components/CategoryToggles'
import { ManagePromptsDialog } from '@/features/games/components/ManagePromptsDialog'
import { PromptReveal } from '@/features/games/components/PromptReveal'
import { Wheel } from '@/features/games/components/Wheel'
import { useCustomPrompts } from '@/features/games/hooks/useGames'
import {
  categoryOrder,
  type Prompt,
  type PromptCategory,
} from '@/features/games/types'

const SLICE_ANGLE = 360 / categoryOrder.length
const SPIN_DURATION_MS = 3300

function nextRotation(
  current: number,
  targetMod: number,
  minSpins: number
): number {
  const currentMod = ((current % 360) + 360) % 360
  let delta = targetMod - currentMod
  if (delta <= 0) delta += 360
  return current + minSpins * 360 + delta
}

function GamesWheel() {
  const { data: customPrompts } = useCustomPrompts()

  const [active, setActive] = useState<Set<PromptCategory>>(
    new Set(['light', 'daring', 'trivia'])
  )
  const [spicyConfirmOpen, setSpicyConfirmOpen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [revealed, setRevealed] = useState<Prompt | null>(null)
  const lastPromptId = useRef<string | null>(null)

  function toggleCategory(category: PromptCategory) {
    if (category === 'spicy' && !active.has('spicy')) {
      setSpicyConfirmOpen(true)
      return
    }
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  function confirmSpicy() {
    setActive((prev) => new Set(prev).add('spicy'))
    setSpicyConfirmOpen(false)
  }

  function poolFor(category: PromptCategory): Prompt[] {
    const built = builtInPrompts[category].map((text, i) => ({
      id: `built-${category}-${i}`,
      category,
      text,
      custom: false,
    }))
    const custom = (customPrompts ?? []).filter(
      (p) => p.category === category
    )
    return [...built, ...custom]
  }

  function spin() {
    if (spinning) return
    const activeCats = categoryOrder.filter((c) => active.has(c))
    if (activeCats.length === 0) return

    const targetCategory =
      activeCats[Math.floor(Math.random() * activeCats.length)]
    const pool = poolFor(targetCategory)

    let choice = pool[Math.floor(Math.random() * pool.length)]
    if (pool.length > 1 && choice.id === lastPromptId.current) {
      choice = pool[Math.floor(Math.random() * pool.length)]
    }

    const sliceIndex = categoryOrder.indexOf(targetCategory)
    const sliceCenterAngle = sliceIndex * SLICE_ANGLE + SLICE_ANGLE / 2
    const targetMod = (360 - sliceCenterAngle) % 360
    const minSpins = 4 + Math.floor(Math.random() * 2)

    setSpinning(true)
    setRevealed(null)
    setRotation((prev) => nextRotation(prev, targetMod, minSpins))

    setTimeout(() => {
      setSpinning(false)
      setRevealed(choice)
      lastPromptId.current = choice.id
    }, SPIN_DURATION_MS)
  }

  return (
    <div className="space-y-6">
      <CategoryToggles active={active} onToggle={toggleCategory} />

      <Wheel rotation={rotation} />

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={spin}
          disabled={spinning || active.size === 0}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          {spinning ? 'Spinning...' : 'Spin'}
        </Button>
      </div>

      {revealed && <PromptReveal prompt={revealed} />}

      <div className="flex justify-center">
        <ManagePromptsDialog />
      </div>

      <Dialog open={spicyConfirmOpen} onOpenChange={setSpicyConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn on Spicy?</DialogTitle>
            <DialogDescription>
              This category is flirty and romantic — 18+ and just for the two
              of you. Make sure you're somewhere private before you spin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpicyConfirmOpen(false)}>
              Not now
            </Button>
            <Button onClick={confirmSpicy}>Turn it on</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function GamesRoute() {
  return (
    <div className="space-y-6">
      <ModulePageHeader title="Games" />
      <ConnectGate what="Games">
        <GamesWheel />
      </ConnectGate>
    </div>
  )
}
