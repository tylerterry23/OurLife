import { ModuleShell } from '@/components/layout/ModuleShell'
import { RatingForm } from '@/features/ratings/components/RatingForm'
import { RatingList } from '@/features/ratings/components/RatingList'

export function RatingsRoute() {
  return (
    <ModuleShell
      title="Ratings"
      addTitle="New rating"
      renderForm={(done) => <RatingForm onDone={done} />}
    >
      <RatingList />
    </ModuleShell>
  )
}
