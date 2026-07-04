import { ModuleShell } from '@/components/layout/ModuleShell'
import { PlaceForm } from '@/features/places/components/PlaceForm'
import { PlaceList } from '@/features/places/components/PlaceList'

export function PlacesRoute() {
  return (
    <ModuleShell
      title="Been & Going"
      addTitle="New place"
      renderForm={(done) => <PlaceForm onDone={done} />}
    >
      <PlaceList />
    </ModuleShell>
  )
}
