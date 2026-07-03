import { Link } from 'react-router-dom'
import {
  Calendar,
  Compass,
  Gamepad2,
  Gift,
  Lock,
  MessageCircleQuestion,
  Star,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const modules = [
  {
    to: '/dates',
    label: 'Important Dates',
    description: 'Anniversaries, birthdays, and days worth remembering.',
    icon: Calendar,
  },
  {
    to: '/quiz',
    label: 'Ask Me Anything',
    description: 'Trade questions and get to know each other a little more.',
    icon: MessageCircleQuestion,
  },
  {
    to: '/places',
    label: 'Been & Going',
    description: 'Places you’ve visited and places you want to.',
    icon: Compass,
  },
  {
    to: '/ratings',
    label: 'Ratings',
    description: 'Rate movies, shows, restaurants, and cities together.',
    icon: Star,
  },
  {
    to: '/wishlist',
    label: 'Wishlist',
    description: 'Things you’re hoping for.',
    icon: Gift,
  },
  {
    to: '/games',
    label: 'Games',
    description: 'Coming soon.',
    icon: Gamepad2,
    locked: true,
  },
]

export function ModulesRoute() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-medium text-parchment">
          Modules
        </h1>
        <p className="mt-1 text-muted-foreground">Pick one to jump in.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map(({ to, label, description, icon: Icon, locked }) => {
          const card = (
            <Card
              className={cn(
                'h-full transition-colors',
                !locked && 'hover:border-wine-bright/60'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Icon className="h-6 w-6 text-gold" />
                {locked && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    coming soon
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-1 text-xl">{label}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          )

          if (locked) {
            return (
              <div key={to} className="cursor-not-allowed opacity-60">
                {card}
              </div>
            )
          }

          return (
            <Link key={to} to={to}>
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
