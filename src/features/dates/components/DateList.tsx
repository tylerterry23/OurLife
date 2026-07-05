import { useState } from 'react'
import { Pencil, Repeat, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDates, useDeleteDate } from '../hooks/useDates'
import { DateForm } from './DateForm'
import type { ImportantDate } from '../types'

export function DateList() {
  const { data: dates, isLoading, isError } = useDates()
  const deleteDate = useDeleteDate()
  const [editing, setEditing] = useState<ImportantDate | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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
            <div className="flex gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit date"
                onClick={() => setEditing(d)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete date"
                onClick={() => setPendingDeleteId(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit date</DialogTitle>
          </DialogHeader>
          {editing && (
            <DateForm existing={editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this date?"
        description="This can't be undone."
        onConfirm={() => {
          if (pendingDeleteId) deleteDate.mutate(pendingDeleteId)
          setPendingDeleteId(null)
        }}
        isPending={deleteDate.isPending}
      />
    </div>
  )
}
