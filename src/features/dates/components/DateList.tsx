import { Repeat, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDates, useDeleteDate } from '../hooks/useDates'

export function DateList() {
  const { data: dates, isLoading, isError } = useDates()
  const deleteDate = useDeleteDate()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading dates...</p>
  }

  if (isError) {
    return <p className="text-destructive">Couldn't load dates.</p>
  }

  if (!dates?.length) {
    return (
      <p className="text-muted-foreground">
        Nothing on the calendar yet — add your first important date.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {dates.map((d) => (
        <Card key={d.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl">{d.label}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete date"
              onClick={() => deleteDate.mutate(d.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {d.recurring && (
              <span className="flex items-center gap-1 text-gold">
                <Repeat className="h-3.5 w-3.5" />
                yearly
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
