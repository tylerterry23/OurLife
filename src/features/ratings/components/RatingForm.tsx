import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'
import { useCreateRating, useUpdateRating } from '../hooks/useRatings'
import {
  categoriesWithLocation,
  categoryLabels,
  categoryOrder,
  type Rating,
  type RatingCategory,
  type RatingStatus,
} from '../types'

interface RatingFormProps {
  existing?: Rating
  // Initial mode for a new item (e.g. the "want" tab's add button).
  defaultStatus?: RatingStatus
  onDone?: () => void
}

export function RatingForm({ existing, defaultStatus, onDone }: RatingFormProps) {
  const { data: coupleProfiles } = useCoupleProfiles()
  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const partnerLabel = profileLabel(coupleProfiles?.partner, 'Partner')
  const createRating = useCreateRating()
  const updateRating = useUpdateRating()
  const pending = createRating.isPending || updateRating.isPending

  // defaultStatus wins when explicitly given (e.g. the "Rate it" action on a
  // want item opens straight into scoring), otherwise fall back to the
  // existing item's status, then to rating.
  const [status, setStatus] = useState<RatingStatus>(
    defaultStatus ?? existing?.status ?? 'rated'
  )
  const [category, setCategory] = useState<RatingCategory>(
    existing?.category ?? 'movie'
  )
  const [title, setTitle] = useState(existing?.title ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const [myScore, setMyScore] = useState(
    existing?.myScore != null ? String(existing.myScore) : ''
  )
  const [partnerScore, setPartnerScore] = useState(
    existing?.partnerScore != null ? String(existing.partnerScore) : ''
  )
  const [note, setNote] = useState(existing?.note ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      status,
      category,
      title: title.trim(),
      location: categoriesWithLocation.includes(category)
        ? location.trim() || null
        : null,
      note: note.trim() || null,
      myScore: status === 'rated' && myScore ? Number(myScore) : null,
      partnerScore:
        status === 'rated' && partnerScore ? Number(partnerScore) : null,
    }

    if (existing) {
      await updateRating.mutateAsync({ id: existing.id, payload })
    } else {
      await createRating.mutateAsync(payload)
    }
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-1 rounded-full border border-line bg-ink p-1">
        {(['rated', 'want'] as RatingStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              status === s
                ? 'bg-ink-raised text-gold'
                : 'text-parchment-dim hover:text-parchment'
            )}
          >
            {s === 'rated' ? 'Rate it' : 'Want to'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as RatingCategory)}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {categoryOrder.map((c) => (
            <option key={c} value={c} className="bg-card">
              {categoryLabels[c]}
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
          placeholder={
            category === 'place' ? 'e.g. Kyoto' : 'e.g. Past Lives'
          }
          required
        />
      </div>

      {categoriesWithLocation.includes(category) && (
        <div className="space-y-2">
          <Label htmlFor="location">
            {category === 'place' ? 'Region / country' : 'City'}
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Optional"
          />
        </div>
      )}

      {status === 'rated' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="myScore">{meLabel}'s score</Label>
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
            <Label htmlFor="partnerScore">{partnerLabel}'s score</Label>
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
      )}

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            status === 'want' ? 'Why do you want to?' : 'Optional thoughts...'
          }
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? 'Saving...'
          : existing
            ? 'Save changes'
            : status === 'want'
              ? 'Add to want list'
              : 'Add rating'}
      </Button>
    </form>
  )
}
