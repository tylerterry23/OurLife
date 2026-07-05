import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Settings2, Shuffle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConnectGate } from '@/features/couple/components/ConnectGate'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'
import { builtInPrompts } from '@/features/games/data/builtInPrompts'
import { PacksStep } from '@/features/games/components/PacksStep'
import { PromptReveal } from '@/features/games/components/PromptReveal'
import { Wheel, type WheelSlice } from '@/features/games/components/Wheel'
import { useCustomPrompts } from '@/features/games/hooks/useGames'
import { PromptBag } from '@/features/games/lib/promptBag'
import { nextRotation } from '@/features/games/lib/wheelMath'
import {
  categoryOrder,
  turnColors,
  turnSliceOrder,
  type Prompt,
  type PromptCategory,
  type Turn,
} from '@/features/games/types'

const SPIN_DURATION_MS = 3300
const READY_BEAT_MS = 1400
const SLICE_ANGLE = 360 / turnSliceOrder.length

type Phase = 'idle' | 'spinning' | 'ready' | 'revealed'

function SpinWheelGame() {
  const { data: coupleProfiles } = useCoupleProfiles()
  const { data: customPrompts } = useCustomPrompts()
  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const partnerLabel = profileLabel(coupleProfiles?.partner, 'Partner')

  const [step, setStep] = useState<'packs' | 'play'>('packs')
  const [active, setActive] = useState<Set<PromptCategory>>(
    new Set(['light', 'daring', 'trivia'])
  )

  const [phase, setPhase] = useState<Phase>('idle')
  const [rotation, setRotation] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [landedSliceKey, setLandedSliceKey] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<Prompt | null>(null)

  const bags = useRef<Map<PromptCategory, PromptBag>>(new Map())

  function toggleCategory(category: PromptCategory) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  function poolFor(category: PromptCategory): Prompt[] {
    const built = builtInPrompts[category].map((text, i) => ({
      id: `built-${category}-${i}`,
      category,
      text,
      custom: false,
    }))
    const custom = (customPrompts ?? []).filter((p) => p.category === category)
    return [...built, ...custom]
  }

  function drawPrompt(category: PromptCategory): Prompt | null {
    let bag = bags.current.get(category)
    if (!bag) {
      bag = new PromptBag(poolFor(category))
      bags.current.set(category, bag)
    } else {
      bag.setPool(poolFor(category))
    }
    return bag.draw()
  }

  function turnName(t: Turn): string {
    if (t === 'me') return meLabel
    if (t === 'partner') return partnerLabel
    return 'Both of you'
  }

  // "Both of you's turn" reads wrong — special-case the heading grammar.
  function turnHeading(t: Turn): string {
    return t === 'both' ? "Everyone's turn" : `${turnName(t)}'s turn`
  }

  const wheelSlices: WheelSlice[] = turnSliceOrder.map((t, i) => ({
    key: `${t}-${i}`,
    label: t === 'both' ? 'Both' : turnName(t),
    color: turnColors[t],
  }))

  function spin() {
    if (phase === 'spinning') return
    const activeCats = categoryOrder.filter((c) => active.has(c))
    if (activeCats.length === 0) return

    const sliceIndex = Math.floor(Math.random() * turnSliceOrder.length)
    const landedTurn = turnSliceOrder[sliceIndex]
    const sliceCenter = sliceIndex * SLICE_ANGLE + SLICE_ANGLE / 2
    const targetMod = (360 - sliceCenter) % 360
    const minSpins = 4 + Math.floor(Math.random() * 2)

    setPhase('spinning')
    setPrompt(null)
    setTurn(null)
    setLandedSliceKey(null)
    setRotation((prev) => nextRotation(prev, targetMod, minSpins))

    setTimeout(() => {
      setTurn(landedTurn)
      setLandedSliceKey(`${landedTurn}-${sliceIndex}`)
      setPhase('ready')

      setTimeout(() => {
        const category = activeCats[Math.floor(Math.random() * activeCats.length)]
        setPrompt(drawPrompt(category))
        setPhase('revealed')
      }, READY_BEAT_MS)
    }, SPIN_DURATION_MS)
  }

  function skip() {
    if (!turn) return
    const activeCats = categoryOrder.filter((c) => active.has(c))
    if (activeCats.length === 0) return
    const category = activeCats[Math.floor(Math.random() * activeCats.length)]
    setPrompt(drawPrompt(category))
  }

  function playAgain() {
    setPhase('idle')
    setTurn(null)
    setLandedSliceKey(null)
    setPrompt(null)
  }

  if (step === 'packs') {
    return (
      <PacksStep
        active={active}
        onToggle={toggleCategory}
        onStart={() => setStep('play')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep('packs')}
          className="flex items-center gap-1 text-sm text-parchment-dim transition-colors hover:text-parchment"
        >
          <Settings2 className="h-4 w-4" />
          Change packs
        </button>
      </div>

      {phase === 'ready' && turn ? (
        <p className="text-center font-display text-2xl text-gold">
          {turnName(turn)}, are you ready?
        </p>
      ) : (
        <p className="text-center font-display text-2xl text-parchment">
          {phase === 'idle' ? 'Spin to find out who' : ' '}
        </p>
      )}

      <Wheel
        rotation={rotation}
        slices={wheelSlices}
        highlightKey={
          phase === 'ready' || phase === 'revealed' ? landedSliceKey : null
        }
      />

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={spin}
          disabled={phase === 'spinning' || phase === 'ready'}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          {phase === 'spinning' ? 'Spinning...' : 'Spin'}
        </Button>
      </div>

      {phase === 'revealed' && prompt && turn && (
        <div className="space-y-3">
          <PromptReveal prompt={prompt} turnLabel={turnHeading(turn)} />
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={skip}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-parchment"
            >
              Skip
            </button>
            <Button onClick={playAgain}>Spin again</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SpinWheelRoute() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        <Link
          to="/modules/games"
          aria-label="Back to games"
          className="-ml-1.5 rounded-full p-1.5 text-parchment-dim transition-colors hover:text-parchment"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-medium text-parchment">
          Spin the Wheel
        </h1>
      </div>
      <ConnectGate what="Spin the Wheel">
        <SpinWheelGame />
      </ConnectGate>
    </div>
  )
}
