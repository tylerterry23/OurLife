import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Calendar, Gift, MessageCircleQuestion, Star } from 'lucide-react'

import { useDates } from '@/features/dates/hooks/useDates'
import { useQuizQuestions } from '@/features/quiz/hooks/useQuiz'
import { useRatings } from '@/features/ratings/hooks/useRatings'
import { useWishlistItems } from '@/features/wishlist/hooks/useWishlist'
import { categoryLabels, wantVerb } from '@/features/ratings/types'

export interface ActivityItem {
  id: string
  icon: LucideIcon
  text: string
  createdAt: string
  to: string
}

// A real cross-module timeline built from data that already exists —
// ratings, dates, quiz questions, and wishlist items all carry createdAt,
// so this just merges and sorts what's already there. No new storage.
export function useRecentActivity(limit = 8) {
  const { data: dates } = useDates()
  const { data: questions } = useQuizQuestions()
  const { data: ratings } = useRatings()
  const { data: wishlistItems } = useWishlistItems()

  const items = useMemo(() => {
    const all: ActivityItem[] = []

    dates?.forEach((d) =>
      all.push({
        id: `date-${d.id}`,
        icon: Calendar,
        text: `Added "${d.label}" to Important Dates`,
        createdAt: d.createdAt,
        to: '/modules/dates',
      })
    )

    questions?.forEach((q) => {
      all.push({
        id: `quiz-${q.id}`,
        icon: MessageCircleQuestion,
        text: `${q.askedBy} asked "${q.question}"`,
        createdAt: q.createdAt,
        to: '/modules/quiz',
      })
      if (q.answer && q.answeredAt) {
        all.push({
          id: `quiz-answer-${q.id}`,
          icon: MessageCircleQuestion,
          text: `Answered "${q.question}"`,
          createdAt: q.answeredAt,
          to: '/modules/quiz',
        })
      }
    })

    ratings?.forEach((r) => {
      const text =
        r.status === 'want'
          ? `Added "${r.title}" — ${wantVerb[r.category]}`
          : `Rated "${r.title}" (${categoryLabels[r.category]})`
      all.push({
        id: `rating-${r.id}`,
        icon: Star,
        text,
        createdAt: r.createdAt,
        to: '/modules/ratings',
      })
    })

    wishlistItems?.forEach((w) =>
      all.push({
        id: `wishlist-${w.id}`,
        icon: Gift,
        text: `${w.addedBy} added "${w.title}" to the wishlist`,
        createdAt: w.createdAt,
        to: '/modules/wishlist',
      })
    )

    return all
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
  }, [dates, questions, ratings, wishlistItems, limit])

  const isLoading =
    dates === undefined ||
    questions === undefined ||
    ratings === undefined ||
    wishlistItems === undefined

  return { items, isLoading }
}
