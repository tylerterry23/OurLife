import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePlace } from '../hooks/usePlaces'
import type { PlaceStatus } from '../types'

interface PlaceFormProps {
  onDone?: () => void
}

export function PlaceForm({ onDone }: PlaceFormProps) {
  const createPlace = useCreatePlace()

  const [name, setName] = useState('')
  const [status, setStatus] = useState<PlaceStatus>('planned')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    await createPlace.mutateAsync({
      name: name.trim(),
      status,
      city: city.trim() || null,
      notes: notes.trim() || null,
    })

    setName('')
    setCity('')
    setNotes('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Place</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kyoto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PlaceStatus)}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="planned" className="bg-card">
            planned
          </option>
          <option value="visited" className="bg-card">
            visited
          </option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City / region</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <Button type="submit" disabled={createPlace.isPending} className="w-full">
        {createPlace.isPending ? 'Saving...' : 'Add place'}
      </Button>
    </form>
  )
}
