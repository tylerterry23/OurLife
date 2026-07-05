import { useMemo, useState } from 'react'
import { Pencil, Star, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'
import { useDeleteRating, useRatings } from '../hooks/useRatings'
import { RatingForm } from './RatingForm'
import {
  agreement,
  categoryLabels,
  combinedScore,
  wantVerb,
  type Rating,
  type RatingCategory,
  type RatingStatus,
} from '../types'

const agreementLabels: Record<'aligned' | 'close' | 'split', string> = {
  aligned: 'In sync',
  close: 'Pretty close',
  split: 'Split call',
}

function fmt(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function ScoreBadge({ value }: { value: number }) {
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-gold/60">
      <span className="font-display text-xl leading-none text-gold">
        {fmt(value)}
      </span>
      <span className="text-[10px] text-parchment-dim">/ 10</span>
    </div>
  )
}

function RatedCard({
  rating,
  meLabel,
  partnerLabel,
  onEdit,
  onDelete,
}: {
  rating: Rating
  meLabel: string
  partnerLabel: string
  onEdit: () => void
  onDelete: () => void
}) {
  const combined = combinedScore(rating)
  const agree = agreement(rating)

  return (
    <Card>
      <CardContent className="flex gap-4 py-4">
        {combined != null && <ScoreBadge value={combined} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Badge variant="outline" className="mb-1.5">
                {categoryLabels[rating.category]}
              </Badge>
              <p className="truncate font-display text-lg text-parchment">
                {rating.title}
              </p>
              {rating.location && (
                <p className="text-xs text-muted-foreground">
                  {rating.location}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {meLabel}: {rating.myScore != null ? fmt(rating.myScore) : '—'}
            </span>
            <span>
              {partnerLabel}:{' '}
              {rating.partnerScore != null ? fmt(rating.partnerScore) : '—'}
            </span>
            {agree && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  agree === 'aligned' && 'text-gold',
                  agree === 'split' && 'text-wine-bright'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    agree === 'aligned' && 'bg-gold',
                    agree === 'close' && 'bg-parchment-dim',
                    agree === 'split' && 'bg-wine-bright'
                  )}
                />
                {agreementLabels[agree]}
              </span>
            )}
          </div>

          {rating.note && (
            <p className="mt-2 text-sm text-parchment/90">{rating.note}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WantCard({
  rating,
  onRate,
  onEdit,
  onDelete,
}: {
  rating: Rating
  onRate: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-1.5">
              {categoryLabels[rating.category]} · {wantVerb[rating.category]}
            </Badge>
            <p className="truncate font-display text-lg text-parchment">
              {rating.title}
            </p>
            {rating.location && (
              <p className="text-xs text-muted-foreground">
                {rating.location}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {rating.note && (
          <p className="mt-2 text-sm text-parchment/90">{rating.note}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-2"
          onClick={onRate}
        >
          <Star className="h-4 w-4" />
          Rate it
        </Button>
      </CardContent>
    </Card>
  )
}

export function RatingList() {
  const { data: ratings, isLoading, isError } = useRatings()
  const deleteRating = useDeleteRating()
  const { data: coupleProfiles } = useCoupleProfiles()
  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const partnerLabel = profileLabel(coupleProfiles?.partner, 'Partner')

  const [tab, setTab] = useState<RatingStatus>('rated')
  const [categoryFilter, setCategoryFilter] = useState<RatingCategory | 'all'>(
    'all'
  )
  // `editing` holds the item being edited; `rateMode` forces the form into
  // scoring mode (used by a want item's "Rate it").
  const [editing, setEditing] = useState<Rating | null>(null)
  const [rateMode, setRateMode] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const rated = ratings?.filter((r) => r.status === 'rated').length ?? 0
    const want = ratings?.filter((r) => r.status === 'want').length ?? 0
    return { rated, want }
  }, [ratings])

  // Categories present in the current tab, for the filter chips.
  const availableCategories = useMemo(() => {
    const set = new Set<RatingCategory>()
    ratings
      ?.filter((r) => r.status === tab)
      .forEach((r) => set.add(r.category))
    return [...set]
  }, [ratings, tab])

  const visible = useMemo(() => {
    const list =
      ratings?.filter(
        (r) =>
          r.status === tab &&
          (categoryFilter === 'all' || r.category === categoryFilter)
      ) ?? []
    if (tab === 'rated') {
      // Best-loved first; unscored fall to the bottom.
      return [...list].sort((a, b) => {
        const ca = combinedScore(a)
        const cb = combinedScore(b)
        if (ca == null) return 1
        if (cb == null) return -1
        return cb - ca
      })
    }
    return list // want: keep newest-first (already ordered by the query)
  }, [ratings, tab, categoryFilter])

  if (isLoading) {
    return <p className="text-muted-foreground">Loading ratings...</p>
  }
  if (isError) {
    return <p className="text-destructive">Couldn't load ratings.</p>
  }

  return (
    <div className="space-y-4">
      {/* Rated / Want tabs */}
      <div className="flex gap-1 rounded-full border border-line bg-ink p-1">
        {(['rated', 'want'] as RatingStatus[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t)
              setCategoryFilter('all')
            }}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t
                ? 'bg-ink-raised text-gold'
                : 'text-parchment-dim hover:text-parchment'
            )}
          >
            {t === 'rated' ? `Rated (${counts.rated})` : `Want to (${counts.want})`}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {(['all', ...availableCategories] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                categoryFilter === c
                  ? 'border-gold text-gold'
                  : 'border-line text-parchment-dim hover:text-parchment'
              )}
            >
              {c === 'all' ? 'All' : categoryLabels[c]}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {tab === 'rated'
            ? 'Nothing rated yet — add your first above.'
            : 'Nothing on your want list yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((rating) =>
            rating.status === 'rated' ? (
              <RatedCard
                key={rating.id}
                rating={rating}
                meLabel={meLabel}
                partnerLabel={partnerLabel}
                onEdit={() => {
                  setRateMode(false)
                  setEditing(rating)
                }}
                onDelete={() => setPendingDeleteId(rating.id)}
              />
            ) : (
              <WantCard
                key={rating.id}
                rating={rating}
                onRate={() => {
                  setRateMode(true)
                  setEditing(rating)
                }}
                onEdit={() => {
                  setRateMode(false)
                  setEditing(rating)
                }}
                onDelete={() => setPendingDeleteId(rating.id)}
              />
            )
          )}
        </div>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rateMode ? 'Rate it' : 'Edit rating'}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <RatingForm
              existing={editing}
              defaultStatus={rateMode ? 'rated' : undefined}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this rating?"
        description="This can't be undone."
        onConfirm={() => {
          if (pendingDeleteId) deleteRating.mutate(pendingDeleteId)
          setPendingDeleteId(null)
        }}
        isPending={deleteRating.isPending}
      />
    </div>
  )
}
