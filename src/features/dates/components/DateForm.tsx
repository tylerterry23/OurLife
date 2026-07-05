import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreateDate, useUpdateDate } from '../hooks/useDates'
import type { ImportantDate } from '../types'

interface DateFormProps {
  existing?: ImportantDate
  onDone?: () => void
}

export function DateForm({ existing, onDone }: DateFormProps) {
  const createDate = useCreateDate()
  const updateDate = useUpdateDate()
  const pending = createDate.isPending || updateDate.isPending

  const [label, setLabel] = useState(existing?.label ?? '')
  const [date, setDate] = useState(existing?.date ?? '')
  const [recurring, setRecurring] = useState(existing?.recurring ?? false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim() || !date) return

    const payload = { label: label.trim(), date, recurring }

    if (existing) {
      await updateDate.mutateAsync({ id: existing.id, payload })
    } else {
      await createDate.mutateAsync(payload)
      setLabel('')
      setDate('')
      setRecurring(false)
    }
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Anniversary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-line px-3 py-2">
        <Label htmlFor="recurring">Repeats every year</Label>
        <Switch
          id="recurring"
          checked={recurring}
          onCheckedChange={setRecurring}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Saving...' : existing ? 'Save changes' : 'Add date'}
      </Button>
    </form>
  )
}
