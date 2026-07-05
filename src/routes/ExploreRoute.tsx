import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Calendar, Gamepad2, Gift, MessageCircleQuestion, Star } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDates } from '@/features/dates/hooks/useDates'
import {
  countdownLabel,
  daysBetween,
  findNextUpcoming,
  startOfToday,
} from '@/features/dates/lib/dateMath'
import { useQuizQuestions } from '@/features/quiz/hooks/useQuiz'
import { useRatings } from '@/features/ratings/hooks/useRatings'
import { useWishlistItems } from '@/features/wishlist/hooks/useWishlist'

interface ExploreCard {
  to: string
  label: string
  description: string
  icon: LucideIcon
  teaser?: string
}

function useExploreCards(): ExploreCard[] {
  const { data: dates } = useDates()
  const { data: questions } = useQuizQuestions()
  const { data: ratings } = useRatings()
  const { data: wishlistItems } = useWishlistItems()

  const today = startOfToday()
  const nextDate = findNextUpcoming(dates, today)
  const datesTeaser = nextDate
    ? `Next: ${nextDate.date.label} · ${countdownLabel(daysBetween(today, nextDate.occurrence))}`
    : dates?.length === 0
      ? 'Add one to look forward to'
      : undefined

  const openQuestions = questions?.filter((q) => !q.answer).length ?? 0
  const quizTeaser =
    questions === undefined
      ? undefined
      : openQuestions > 0
        ? `${openQuestions} open question${openQuestions === 1 ? '' : 's'}`
        : questions.length > 0
          ? 'All caught up'
          : undefined

  const ratedCount = ratings?.filter((r) => r.status === 'rated').length ?? 0
  const wantCount = ratings?.filter((r) => r.status === 'want').length ?? 0
  const ratingsTeaser =
    ratings === undefined
      ? undefined
      : ratedCount > 0 || wantCount > 0
        ? `${ratedCount} rated · ${wantCount} on the want list`
        : undefined

  const wishesOpen = wishlistItems?.filter((i) => !i.claimed).length ?? 0
  const wishlistTeaser =
    wishlistItems === undefined
      ? undefined
      : wishesOpen > 0
        ? `${wishesOpen} item${wishesOpen === 1 ? '' : 's'} still open`
        : wishlistItems.length > 0
          ? 'Everything claimed'
          : undefined

  return [
    {
      to: '/modules/dates',
      label: 'Important Dates',
      description: 'Anniversaries, birthdays, and days worth remembering.',
      icon: Calendar,
      teaser: datesTeaser,
    },
    {
      to: '/modules/quiz',
      label: 'Ask Me Anything',
      description: 'Trade questions and get to know each other a little more.',
      icon: MessageCircleQuestion,
      teaser: quizTeaser,
    },
    {
      to: '/modules/ratings',
      label: 'Ratings',
      description:
        'Rate movies, shows, restaurants, places, and books — and keep a shared want-to list.',
      icon: Star,
      teaser: ratingsTeaser,
    },
    {
      to: '/modules/wishlist',
      label: 'Wishlist',
      description: 'Things you’re hoping for.',
      icon: Gift,
      teaser: wishlistTeaser,
    },
    {
      to: '/modules/games',
      label: 'Games',
      description: 'Spin the wheel — do it, or drink.',
      icon: Gamepad2,
    },
  ]
}

export function ExploreRoute() {
  const cards = useExploreCards()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-medium text-parchment">
          Explore
        </h1>
        <p className="mt-1 text-muted-foreground">
          Everything you do together, in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, label, description, icon: Icon, teaser }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-colors hover:border-wine-bright/60">
              <CardHeader>
                <Icon className="h-6 w-6 text-gold" />
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-1 text-xl">{label}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
                {teaser && (
                  <p className="mt-2 text-sm font-medium text-gold">
                    {teaser}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
