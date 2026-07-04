import { ModuleShell } from '@/components/layout/ModuleShell'
import { QuizForm } from '@/features/quiz/components/QuizForm'
import { QuizList } from '@/features/quiz/components/QuizList'

export function QuizRoute() {
  return (
    <ModuleShell
      title="Ask Me Anything"
      addTitle="New question"
      addLabel="Ask"
      renderForm={(done) => <QuizForm onDone={done} />}
    >
      <QuizList />
    </ModuleShell>
  )
}
