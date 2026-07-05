import { Link } from 'react-router-dom'
import {
  Calendar,
  Gamepad2,
  Gift,
  MessageCircleQuestion,
  Star,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const modules = [
  {
    to: '/modules/dates',
    label: 'Important Dates',
    description: 'Anniversaries, birthdays, and days worth remembering.',
    icon: Calendar,
  },
  {
    to: '/modules/quiz',
    label: 'Ask Me Anything',
    description: 'Trade questions and get to know each other a little more.',
    icon: MessageCircleQuestion,
  },
  {
    to: '/modules/ratings',
    label: 'Ratings',
    description:
      'Rate movies, shows, restaurants, places, and books — and keep a shared want-to list.',
    icon: Star,
  },
  {
    to: '/modules/wishlist',
    label: 'Wishlist',
    description: 'Things you’re hoping for.',
    icon: Gift,
  },
  {
    to: '/modules/games',
    label: 'Games',
    description: 'Spin the wheel — do it, or drink.',
    icon: Gamepad2,
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
        {modules.map(({ to, label, description, icon: Icon }) => (
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
      </div>
    </div>
  )
}
