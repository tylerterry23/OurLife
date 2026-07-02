import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreateDate } from '../hooks/useDates'

interface DateFormProps {
  onDone?: () => void
}

export function DateForm({ onDone }: DateFormProps) {
  const createDate = useCreateDate()

  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [recurring, setRecurring] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim() || !date) return

    await createDate.mutateAsync({ label: label.trim(), date, recurring })

    setLabel('')
    setDate('')
    setRecurring(false)
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

      <Button type="submit" disabled={createDate.isPending} className="w-full">
        {createDate.isPending ? 'Saving...' : 'Add date'}
      </Button>
    </form>
  )
}
