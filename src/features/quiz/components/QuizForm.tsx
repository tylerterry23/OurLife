import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsStore } from '@/store/settingsStore'
import { useCreateQuizQuestion } from '../hooks/useQuiz'

interface QuizFormProps {
  onDone?: () => void
}

export function QuizForm({ onDone }: QuizFormProps) {
  const { displayNames } = useSettingsStore()
  const createQuestion = useCreateQuizQuestion()

  const [askedBy, setAskedBy] = useState(displayNames.partner1)
  const [question, setQuestion] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    await createQuestion.mutateAsync({
      askedBy,
      question: question.trim(),
      answer: null,
      answeredAt: null,
    })

    setQuestion('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="askedBy">Asked by</Label>
        <select
          id="askedBy"
          value={askedBy}
          onChange={(e) => setAskedBy(e.target.value)}
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
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's something you've never told me?"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={createQuestion.isPending}
        className="w-full"
      >
        {createQuestion.isPending ? 'Asking...' : 'Ask'}
      </Button>
    </form>
  )
}
