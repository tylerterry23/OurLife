import { ModuleShell } from '@/components/layout/ModuleShell'
import { WishlistForm } from '@/features/wishlist/components/WishlistForm'
import { WishlistList } from '@/features/wishlist/components/WishlistList'

export function WishlistRoute() {
  return (
    <ModuleShell
      title="Wishlist"
      addTitle="New wishlist item"
      renderForm={(done) => <WishlistForm onDone={done} />}
    >
      <WishlistList />
    </ModuleShell>
  )
}
