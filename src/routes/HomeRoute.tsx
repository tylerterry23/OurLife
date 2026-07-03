import { Link } from 'react-router-dom'
import { Calendar, Gift, LayoutGrid, MessageCircleQuestion } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDates } from '@/features/dates/hooks/useDates'
import type { ImportantDate } from '@/features/dates/types'
import { useQuizQuestions } from '@/features/quiz/hooks/useQuiz'
import { useWishlistItems } from '@/features/wishlist/hooks/useWishlist'
import { useSettingsStore } from '@/store/settingsStore'

function nextOccurrence(date: ImportantDate): Date {
  const [year, month, day] = date.date.split('-').map(Number)
  const occurrence = new Date(year, month - 1, day)

  if (date.recurring) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    occurrence.setFullYear(today.getFullYear())
    if (occurrence < today) occurrence.setFullYear(today.getFullYear() + 1)
  }

  return occurrence
}

export function HomeRoute() {
  const { displayNames } = useSettingsStore()
  const { data: dates } = useDates()
  const { data: questions } = useQuizQuestions()
  const { data: wishlistItems } = useWishlistItems()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextDate = dates
    ?.map((d) => ({ date: d, occurrence: nextOccurrence(d) }))
    .filter(({ occurrence }) => occurrence >= today)
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())[0]

  const openQuestion = questions?.find((q) => !q.answer)
  const unclaimedCount = wishlistItems?.filter((i) => !i.claimed).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-medium text-parchment">
          Welcome back
        </h1>
        <p className="mt-1 text-muted-foreground">
          {displayNames.partner1} &amp; {displayNames.partner2}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/dates">
          <Card className="h-full transition-colors hover:border-wine-bright/60">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Calendar className="h-5 w-5 text-gold" />
              <CardTitle className="text-base">Coming up</CardTitle>
            </CardHeader>
            <CardContent>
              {nextDate ? (
                <>
                  <p className="font-display text-xl text-parchment">
                    {nextDate.date.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nextDate.occurrence.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No dates on the calendar yet.
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/quiz">
          <Card className="h-full transition-colors hover:border-wine-bright/60">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <MessageCircleQuestion className="h-5 w-5 text-gold" />
              <CardTitle className="text-base">Waiting on you</CardTitle>
            </CardHeader>
            <CardContent>
              {openQuestion ? (
                <p className="line-clamp-2 text-sm text-parchment">
                  {openQuestion.question}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All caught up — no open questions.
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/wishlist">
          <Card className="h-full transition-colors hover:border-wine-bright/60">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Gift className="h-5 w-5 text-gold" />
              <CardTitle className="text-base">Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {unclaimedCount > 0
                  ? `${unclaimedCount} item${unclaimedCount === 1 ? '' : 's'} still up for grabs.`
                  : 'Nothing unclaimed right now.'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/modules">
          <Card className="h-full transition-colors hover:border-wine-bright/60">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <LayoutGrid className="h-5 w-5 text-gold" />
              <CardTitle className="text-base">All modules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ratings, Been &amp; Going, Games, and more.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
