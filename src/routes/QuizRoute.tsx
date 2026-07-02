import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QuizForm } from '@/features/quiz/components/QuizForm'
import { QuizList } from '@/features/quiz/components/QuizList'

export function QuizRoute() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-parchment">
          Ask Me Anything
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Ask
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New question</DialogTitle>
            </DialogHeader>
            <QuizForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <QuizList />
    </div>
  )
}
