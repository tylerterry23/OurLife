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
import { WishlistForm } from '@/features/wishlist/components/WishlistForm'
import { WishlistList } from '@/features/wishlist/components/WishlistList'

export function WishlistRoute() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-parchment">
          Wishlist
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
              <DialogTitle>New wishlist item</DialogTitle>
            </DialogHeader>
            <WishlistForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <WishlistList />
    </div>
  )
}
