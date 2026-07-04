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
import { RatingForm } from '@/features/ratings/components/RatingForm'
import { RatingList } from '@/features/ratings/components/RatingList'

export function RatingsRoute() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title="Ratings"
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
                <DialogTitle>New rating</DialogTitle>
              </DialogHeader>
              <RatingForm onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <RatingList />
    </div>
  )
}
