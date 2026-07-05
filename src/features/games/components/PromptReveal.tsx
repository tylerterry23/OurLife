import { Wine } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { categoryLabels, type Prompt } from '../types'

export function PromptReveal({
  prompt,
  turnLabel,
}: {
  prompt: Prompt
  turnLabel: string
}) {
  return (
    <Card className="border-gold/50 bg-ink-raised">
      <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gold">
          <Wine className="h-3.5 w-3.5" />
          {categoryLabels[prompt.category]}
          {prompt.custom && ' · yours'}
        </div>
        <p className="font-display text-2xl text-parchment">{turnLabel}</p>
        <p className="text-lg text-parchment/90">{prompt.text}</p>
      </CardContent>
    </Card>
  )
}
