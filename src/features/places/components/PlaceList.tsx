import { MapPin, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeletePlace, usePlaces } from '../hooks/usePlaces'

export function PlaceList() {
  const { data: places, isLoading, isError } = usePlaces()
  const deletePlace = useDeletePlace()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading places...</p>
  }

  if (isError) {
    return <p className="text-destructive">Couldn't load places.</p>
  }

  if (!places?.length) {
    return (
      <p className="text-muted-foreground">
        Nowhere logged yet — add a place you've been or want to go.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {places.map((place) => (
        <Card key={place.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <Badge
                variant={place.status === 'visited' ? 'accent' : 'outline'}
                className="mb-2 capitalize"
              >
                {place.status}
              </Badge>
              <CardTitle className="text-xl">{place.name}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete place"
              onClick={() => deletePlace.mutate(place.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {place.city && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {place.city}
              </p>
            )}
            {place.notes && <p className="text-sm">{place.notes}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
