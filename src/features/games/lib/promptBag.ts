import type { Prompt } from '../types'

// Draws prompts without repeating until the whole pool has been seen, then
// reshuffles — a lightweight stand-in for a big pre-shuffled deck.
export class PromptBag {
  private pool: Prompt[]
  private queue: Prompt[] = []
  private lastId: string | null = null

  constructor(pool: Prompt[]) {
    this.pool = pool
  }

  setPool(pool: Prompt[]) {
    this.pool = pool
    this.queue = []
  }

  private refill() {
    const shuffled = [...this.pool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    // Avoid the reshuffle immediately repeating the prompt that just ended.
    if (shuffled.length > 1 && shuffled[0].id === this.lastId) {
      ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    }
    this.queue = shuffled
  }

  draw(): Prompt | null {
    if (this.pool.length === 0) return null
    if (this.queue.length === 0) this.refill()
    const next = this.queue.shift()
    if (!next) return null
    this.lastId = next.id
    return next
  }
}
