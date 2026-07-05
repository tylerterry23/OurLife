import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'
import { useCreateWishlistItem, useUpdateWishlistItem } from '../hooks/useWishlist'
import type { WishlistItem } from '../types'

interface WishlistFormProps {
  existing?: WishlistItem
  onDone?: () => void
}

export function WishlistForm({ existing, onDone }: WishlistFormProps) {
  const { data: coupleProfiles } = useCoupleProfiles()
  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const createItem = useCreateWishlistItem()
  const updateItem = useUpdateWishlistItem()
  const pending = createItem.isPending || updateItem.isPending

  const [title, setTitle] = useState(existing?.title ?? '')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (existing) {
      await updateItem.mutateAsync({
        id: existing.id,
        payload: {
          title: title.trim(),
          url: url.trim() || null,
          notes: notes.trim() || null,
        },
      })
    } else {
      // Recorded as the logged-in user automatically.
      await createItem.mutateAsync({
        addedBy: meLabel,
        title: title.trim(),
        url: url.trim() || null,
        notes: notes.trim() || null,
        claimed: false,
      })
      setTitle('')
      setUrl('')
      setNotes('')
    }
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Item</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Weighted blanket"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Link</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Size, color, etc."
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Saving...' : existing ? 'Save changes' : 'Add to wishlist'}
      </Button>
    </form>
  )
}
