import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarHeart,
  Compass,
  Gift,
  HeartHandshake,
  MessageCircleQuestion,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react'

import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useDates } from '@/features/dates/hooks/useDates'
import type { ImportantDate } from '@/features/dates/types'
import { useQuizQuestions } from '@/features/quiz/hooks/useQuiz'
import { useWishlistItems } from '@/features/wishlist/hooks/useWishlist'
import { useRatings } from '@/features/ratings/hooks/useRatings'
import { usePlaces } from '@/features/places/hooks/usePlaces'
import { useCoupleProfiles } from '@/features/profile/hooks/useProfile'
import { useCoupleStatus } from '@/features/couple/hooks/useCouple'
import { profileLabel } from '@/features/profile/api/profileApi'
import { relationshipStatusLabels } from '@/features/couple/types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function nextOccurrence(date: ImportantDate, today: Date): Date {
  const occurrence = parseLocalDate(date.date)
  if (date.recurring) {
    occurrence.setFullYear(today.getFullYear())
    if (occurrence < today) occurrence.setFullYear(today.getFullYear() + 1)
  }
  return occurrence
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

function countdownLabel(days: number): string {
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 30) return `in ${days} days`
  if (days < 60) return 'in about a month'
  return `in ${Math.round(days / 30)} months`
}

// "412 days" for a young couple; "2 years, 3 months" once it's been a while.
function togetherLabel(days: number): string {
  if (days < 365) return `${days} day${days === 1 ? '' : 's'}`
  const years = Math.floor(days / 365.25)
  const months = Math.floor((days - years * 365.25) / 30.44)
  const y = `${years} year${years === 1 ? '' : 's'}`
  return months > 0 ? `${y}, ${months} month${months === 1 ? '' : 's'}` : y
}

function StatTile({
  to,
  icon: Icon,
  value,
  label,
}: {
  to: string
  icon: LucideIcon
  value: string | number
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-lg border border-line bg-card p-4 transition-colors hover:border-wine-bright/60"
    >
      <Icon className="h-5 w-5 text-gold" />
      <span className="font-display text-2xl text-parchment">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
  )
}

const quickActions: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/modules/dates', icon: CalendarHeart, label: 'Date' },
  { to: '/modules/ratings', icon: Star, label: 'Rating' },
  { to: '/modules/places', icon: Compass, label: 'Place' },
  { to: '/modules/wishlist', icon: Gift, label: 'Wish' },
]

export function HomeRoute() {
  const { data: coupleProfiles } = useCoupleProfiles()
  const { data: coupleStatus } = useCoupleStatus()
  const { data: dates } = useDates()
  const { data: questions } = useQuizQuestions()
  const { data: wishlistItems } = useWishlistItems()
  const { data: ratings } = useRatings()
  const { data: places } = usePlaces()

  const meLabel = profileLabel(coupleProfiles?.me, 'You')
  const partnerLabel = coupleProfiles?.partner
    ? profileLabel(coupleProfiles.partner, 'Partner')
    : null
  const inCouple = coupleStatus?.inCouple ?? false
  const status = coupleStatus?.relationshipStatus

  const today = startOfToday()

  const upcoming = dates
    ?.map((d) => ({ date: d, occurrence: nextOccurrence(d, today) }))
    .filter(({ occurrence }) => occurrence >= today)
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())
  const nextDate = upcoming?.[0]

  const anniversary = dates?.find(
    (d) => d.recurring && /anniversar/i.test(d.label)
  )
  const anniversaryBase = anniversary ? parseLocalDate(anniversary.date) : null
  const daysTogether =
    anniversaryBase && anniversaryBase <= today
      ? daysBetween(anniversaryBase, today)
      : null

  const openQuestions = questions?.filter((q) => !q.answer) ?? []
  const nextQuestion = openQuestions[0]

  const placesVisited = places?.filter((p) => p.status === 'visited').length ?? 0
  const ratingsCount = ratings?.length ?? 0
  const wishesOpen = wishlistItems?.filter((i) => !i.claimed).length ?? 0
  const answeredCount = questions?.filter((q) => q.answer).length ?? 0

  // --- Not connected: keep Home focused on the one thing to do next. ---
  if (!inCouple) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-4xl font-medium text-parchment">
          Welcome, {meLabel}
        </h1>
        <Card className="border-gold/40">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <HeartHandshake className="h-10 w-10 text-gold" />
            <div className="space-y-1">
              <p className="font-display text-xl text-parchment">
                Connect with your partner
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                OurLife is made for two. Invite your partner to unlock your
                shared dates, ratings, wishlist, and more.
              </p>
            </div>
            <Button asChild>
              <Link to="/connect">Get connected</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero — the emotional anchor */}
      <Card className="overflow-hidden border-line bg-gradient-to-br from-wine/25 via-card to-card">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex items-center">
            <Avatar
              url={coupleProfiles?.me?.avatarUrl}
              name={meLabel}
              size="lg"
            />
            <Avatar
              url={coupleProfiles?.partner?.avatarUrl}
              name={partnerLabel ?? 'Partner'}
              size="lg"
              className="-ml-4"
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-medium text-parchment">
              {meLabel} &amp; {partnerLabel ?? 'Partner'}
            </h1>
            {status && (
              <p className="text-sm text-gold">
                {relationshipStatusLabels[status]}
              </p>
            )}
          </div>
          {daysTogether !== null && (
            <div className="mt-1 flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-sm text-parchment">
                {togetherLabel(daysTogether)} together
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next up — anticipation with a countdown */}
      <Link to="/modules/dates" className="block">
        <Card className="transition-colors hover:border-wine-bright/60">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <CalendarHeart className="h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next up
                </p>
                {nextDate ? (
                  <p className="font-display text-lg text-parchment">
                    {nextDate.date.label}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add a date to look forward to
                  </p>
                )}
              </div>
            </div>
            {nextDate && (
              <span className="shrink-0 rounded-full bg-wine px-3 py-1 text-sm font-medium text-primary-foreground">
                {countdownLabel(daysBetween(today, nextDate.occurrence))}
              </span>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Waiting on you — only when there's something to answer */}
      {nextQuestion && (
        <Link to="/modules/quiz" className="block">
          <Card className="border-gold/30 transition-colors hover:border-gold/60">
            <CardContent className="flex items-start gap-3 py-4">
              <MessageCircleQuestion className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Waiting on you
                  {openQuestions.length > 1 && ` · ${openQuestions.length}`}
                </p>
                <p className="line-clamp-2 text-parchment">
                  {nextQuestion.question}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Everything you've built together */}
      <div>
        <h2 className="mb-3 font-display text-xl text-parchment">
          Your life so far
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            to="/modules/places"
            icon={Compass}
            value={placesVisited}
            label="places visited"
          />
          <StatTile
            to="/modules/ratings"
            icon={Star}
            value={ratingsCount}
            label="things rated"
          />
          <StatTile
            to="/modules/wishlist"
            icon={Gift}
            value={wishesOpen}
            label="wishes open"
          />
          <StatTile
            to="/modules/quiz"
            icon={MessageCircleQuestion}
            value={answeredCount}
            label="answers shared"
          />
        </div>
      </div>

      {/* Quick add — low-friction logging */}
      <div>
        <h2 className="mb-3 font-display text-xl text-parchment">Add something</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border border-line bg-card py-3',
                'transition-colors hover:border-wine-bright/60'
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5 text-gold" />
                <Plus className="absolute -right-2 -top-1.5 h-3 w-3 text-parchment-dim" />
              </span>
              <span className="text-xs text-parchment">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
