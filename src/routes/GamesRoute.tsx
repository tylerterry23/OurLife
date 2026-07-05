import { Link } from 'react-router-dom'
import { Dices, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'

const games = [
  {
    to: '/modules/games/wheel',
    label: 'Spin the Wheel',
    description: 'Pick your packs, spin for who\'s up, do it or drink.',
    icon: Dices,
  },
]

export function GamesRoute() {
  return (
    <div className="space-y-6">
      <ModulePageHeader title="Games" />

      <div className="grid gap-4 sm:grid-cols-2">
        {games.map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-colors hover:border-wine-bright/60">
              <CardHeader>
                <Icon className="h-6 w-6 text-gold" />
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-1 text-xl">{label}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}

        <div className="opacity-60">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <Sparkles className="h-6 w-6 text-gold" />
              <Badge variant="outline">coming soon</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1 text-xl">More games</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is just the first one.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
