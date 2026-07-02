import { Gamepad2 } from 'lucide-react'

export function GamesRoute() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Gamepad2 className="h-10 w-10 text-gold" />
      <h1 className="font-display text-3xl font-medium text-parchment">
        Games
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Coming soon — this module is just a route stub for now.
      </p>
    </div>
  )
}
