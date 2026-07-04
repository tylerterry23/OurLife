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
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { DateForm } from '@/features/dates/components/DateForm'
import { DateList } from '@/features/dates/components/DateList'

export function DatesRoute() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="Important Dates"
        action={
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
        }
      />

      <DateList />
    </div>
  )
}
