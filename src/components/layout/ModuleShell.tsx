import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { ConnectGate } from '@/features/couple/components/ConnectGate'
import { useCoupleStatus } from '@/features/couple/hooks/useCouple'

interface ModuleShellProps {
  title: string
  // Dialog title + trigger label for the "add" affordance.
  addTitle: string
  addLabel?: string
  // Renders the create form; call `done` to close the dialog on success.
  renderForm: (done: () => void) => ReactNode
  children: ReactNode
}

// Shared scaffold for every data module: back-to-modules header, an Add
// dialog that only appears once you're in a couple, and a connect gate that
// replaces the content for solo users instead of letting writes fail.
export function ModuleShell({
  title,
  addTitle,
  addLabel = 'Add',
  renderForm,
  children,
}: ModuleShellProps) {
  const [open, setOpen] = useState(false)
  const { data: coupleStatus } = useCoupleStatus()
  const inCouple = coupleStatus?.inCouple ?? false

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={title}
        action={
          inCouple ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  {addLabel}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{addTitle}</DialogTitle>
                </DialogHeader>
                {renderForm(() => setOpen(false))}
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <ConnectGate what={title}>{children}</ConnectGate>
    </div>
  )
}
