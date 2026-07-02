import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  useDeleteQuizQuestion,
  useQuizQuestions,
  useUpdateQuizQuestion,
} from '../hooks/useQuiz'

function AnswerBox({ id }: { id: string }) {
  const [answer, setAnswer] = useState('')
  const updateQuestion = useUpdateQuizQuestion()

  async function submitAnswer() {
    if (!answer.trim()) return
    await updateQuestion.mutateAsync({
      id,
      payload: { answer: answer.trim(), answeredAt: new Date().toISOString() },
    })
    setAnswer('')
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer..."
      />
      <Button
        size="sm"
        disabled={updateQuestion.isPending}
        onClick={submitAnswer}
      >
        {updateQuestion.isPending ? 'Saving...' : 'Answer'}
      </Button>
    </div>
  )
}

export function QuizList() {
  const { data: questions, isLoading, isError } = useQuizQuestions()
  const deleteQuestion = useDeleteQuizQuestion()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading questions...</p>
  }

  if (isError) {
    return <p className="text-destructive">Couldn't load questions.</p>
  }

  if (!questions?.length) {
    return (
      <p className="text-muted-foreground">
        No questions yet — ask each other something above.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <Badge variant="outline" className="mb-2">
                asked by {q.askedBy}
              </Badge>
              <CardTitle className="text-xl">{q.question}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete question"
              onClick={() => deleteQuestion.mutate(q.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {q.answer ? (
              <p className="text-sm">{q.answer}</p>
            ) : (
              <AnswerBox id={q.id} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
