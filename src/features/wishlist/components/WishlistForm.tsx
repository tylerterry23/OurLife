import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsStore } from '@/store/settingsStore'
import { useCreateWishlistItem } from '../hooks/useWishlist'

interface WishlistFormProps {
  onDone?: () => void
}

export function WishlistForm({ onDone }: WishlistFormProps) {
  const { displayNames } = useSettingsStore()
  const createItem = useCreateWishlistItem()

  const [addedBy, setAddedBy] = useState(displayNames.partner1)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    await createItem.mutateAsync({
      addedBy,
      title: title.trim(),
      url: url.trim() || null,
      notes: notes.trim() || null,
      claimed: false,
    })

    setTitle('')
    setUrl('')
    setNotes('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addedBy">Added by</Label>
        <select
          id="addedBy"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value={displayNames.partner1} className="bg-card">
            {displayNames.partner1}
          </option>
          <option value={displayNames.partner2} className="bg-card">
            {displayNames.partner2}
          </option>
        </select>
      </div>

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

      <Button type="submit" disabled={createItem.isPending} className="w-full">
        {createItem.isPending ? 'Saving...' : 'Add to wishlist'}
      </Button>
    </form>
  )
}
