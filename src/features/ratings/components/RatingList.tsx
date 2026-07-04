import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { useDeleteRating, useRatings } from '../hooks/useRatings'

export function RatingList() {
  const { data: ratings, isLoading, isError } = useRatings()
  const deleteRating = useDeleteRating()
  const { displayNames } = useSettingsStore()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading ratings...</p>
  }

  if (isError) {
    return <p className="text-destructive">Couldn't load ratings.</p>
  }

  if (!ratings?.length) {
    return (
      <p className="text-muted-foreground">
        No ratings yet — add your first one above.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <Badge variant="outline" className="mb-2 capitalize">
                {rating.category}
              </Badge>
              <CardTitle className="text-xl">{rating.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete rating"
              onClick={() => deleteRating.mutate(rating.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                {displayNames.partner1}: {rating.myScore ?? '—'}
              </span>
              <span>
                {displayNames.partner2}: {rating.partnerScore ?? '—'}
              </span>
            </div>
            {rating.note && <p className="text-sm">{rating.note}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
