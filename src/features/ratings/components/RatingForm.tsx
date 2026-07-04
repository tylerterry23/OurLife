import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsStore } from '@/store/settingsStore'
import { useCreateRating } from '../hooks/useRatings'
import type { RatingCategory } from '../types'

const categories: RatingCategory[] = ['movie', 'show', 'restaurant', 'city']

interface RatingFormProps {
  onDone?: () => void
}

export function RatingForm({ onDone }: RatingFormProps) {
  const { displayNames } = useSettingsStore()
  const createRating = useCreateRating()

  const [category, setCategory] = useState<RatingCategory>('movie')
  const [title, setTitle] = useState('')
  const [myScore, setMyScore] = useState('')
  const [partnerScore, setPartnerScore] = useState('')
  const [note, setNote] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    await createRating.mutateAsync({
      category,
      title: title.trim(),
      myScore: myScore ? Number(myScore) : null,
      partnerScore: partnerScore ? Number(partnerScore) : null,
      note: note.trim() || null,
    })

    setTitle('')
    setMyScore('')
    setPartnerScore('')
    setNote('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as RatingCategory)}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-card">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Everything Everywhere All at Once"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="myScore">{displayNames.partner1}'s score</Label>
          <Input
            id="myScore"
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={myScore}
            onChange={(e) => setMyScore(e.target.value)}
            placeholder="0-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partnerScore">{displayNames.partner2}'s score</Label>
          <Input
            id="partnerScore"
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={partnerScore}
            onChange={(e) => setPartnerScore(e.target.value)}
            placeholder="0-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional thoughts..."
        />
      </div>

      <Button
        type="submit"
        disabled={createRating.isPending}
        className="w-full"
      >
        {createRating.isPending ? 'Saving...' : 'Add rating'}
      </Button>
    </form>
  )
}
