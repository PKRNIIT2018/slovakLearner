type WeightEntry = { accuracy: number; dueDate: number; totalAttempts: number }

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds an adaptive quiz queue ordered by learning priority.
 *
 * Tiers (in order):
 *  1. SRS overdue  — dueDate has passed
 *  2. Weak         — accuracy < 0.6 and seen at least twice
 *  3. New/unseen   — never attempted
 *  4. Refresh      — everything else (due for spaced review)
 *
 * Items in the recentCache (last N seen) are excluded to avoid
 * immediate repetition when restarting.
 */
export function buildReviewQueue<T extends { id?: string; slovak: string }>(
  items: T[],
  weights: Record<string, WeightEntry>,
  options: { maxSize: number; recentCache: string[] }
): T[] {
  const now = Date.now()
  const getId = (item: T) => item.id ?? item.slovak
  const recentSet = new Set(options.recentCache)

  const overdue = items.filter(i => {
    const w = weights[getId(i)]
    return w != null && w.dueDate <= now
  })

  const overdueSet = new Set(overdue.map(getId))

  const weak = items.filter(i => {
    if (overdueSet.has(getId(i))) return false
    const w = weights[getId(i)]
    return w != null && w.totalAttempts >= 2 && w.accuracy < 0.6
  })

  const weakSet = new Set(weak.map(getId))

  const unseen = items.filter(i => !weights[getId(i)])

  const unseenSet = new Set(unseen.map(getId))

  const refresh = items.filter(i => {
    const id = getId(i)
    return !overdueSet.has(id) && !weakSet.has(id) && !unseenSet.has(id)
  })

  return [
    ...shuffleArray(overdue),
    ...shuffleArray(weak),
    ...shuffleArray(unseen),
    ...shuffleArray(refresh),
  ]
    .filter(i => !recentSet.has(getId(i)))
    .slice(0, options.maxSize)
}
