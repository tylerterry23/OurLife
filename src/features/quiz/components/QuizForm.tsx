import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'
import { useCreateQuizQuestion } from '../hooks/useQuiz'

interface QuizFormProps {
  onDone?: () => void
}

export function QuizForm({ onDone }: QuizFormProps) {
  const { data: coupleProfiles } = useCoupleProfiles()
  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const createQuestion = useCreateQuizQuestion()

  const [question, setQuestion] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    // The author is whoever's logged in — recorded automatically, not picked.
    await createQuestion.mutateAsync({
      askedBy: meLabel,
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
