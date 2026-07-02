export interface QuizQuestion {
  id: string
  askedBy: string
  question: string
  answer?: string | null
  answeredAt?: string | null
  createdAt: string
}
