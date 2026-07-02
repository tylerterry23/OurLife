import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DateForm } from '@/features/dates/components/DateForm'
import { DateList } from '@/features/dates/components/DateList'

export function DatesRoute() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-parchment">
          Important Dates
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New date</DialogTitle>
            </DialogHeader>
            <DateForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DateList />
    </div>
  )
}
