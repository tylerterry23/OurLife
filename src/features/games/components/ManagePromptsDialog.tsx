import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddCustomPrompt,
  useCustomPrompts,
  useDeleteCustomPrompt,
} from '../hooks/useGames'
import { categoryLabels, categoryOrder, type PromptCategory } from '../types'

export function ManagePromptsDialog() {
  const { data: customPrompts } = useCustomPrompts()
  const addPrompt = useAddCustomPrompt()
  const deletePrompt = useDeleteCustomPrompt()

  const [category, setCategory] = useState<PromptCategory>('light')
  const [text, setText] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addPrompt.mutateAsync({ category, text: text.trim() })
    setText('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add your own
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your custom prompts</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="promptCategory">Category</Label>
            <select
              id="promptCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value as PromptCategory)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categoryOrder.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptText">Prompt</Label>
            <Input
              id="promptText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="...or drink"
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={addPrompt.isPending}>
            Add to the pool
          </Button>
        </form>

        {customPrompts && customPrompts.length > 0 && (
          <div className="max-h-52 space-y-2 overflow-y-auto border-t border-line pt-3">
            {customPrompts.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div>
                  <span className="text-xs text-gold">
                    {categoryLabels[p.category]}
                  </span>
                  <p className="text-parchment">{p.text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete prompt"
                  onClick={() => deletePrompt.mutate(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
