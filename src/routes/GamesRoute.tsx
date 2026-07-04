import { Gamepad2 } from 'lucide-react'

import { ModulePageHeader } from '@/components/layout/ModulePageHeader'

export function GamesRoute() {
  return (
    <div className="space-y-6">
      <ModulePageHeader title="Games" />
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Gamepad2 className="h-10 w-10 text-gold" />
        <p className="max-w-sm text-muted-foreground">
          Coming soon — this module is just a route stub for now.
        </p>
      </div>
    </div>
  )
}
