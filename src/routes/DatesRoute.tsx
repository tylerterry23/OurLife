import { ModuleShell } from '@/components/layout/ModuleShell'
import { DateForm } from '@/features/dates/components/DateForm'
import { DateList } from '@/features/dates/components/DateList'

export function DatesRoute() {
  return (
    <ModuleShell
      title="Important Dates"
      addTitle="New date"
      renderForm={(done) => <DateForm onDone={done} />}
    >
      <DateList />
    </ModuleShell>
  )
}
