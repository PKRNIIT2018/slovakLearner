import type { LearnedWeight } from "@/hooks/use-slovak-store"

type StoreWeights = Record<string, LearnedWeight>

/**
 * Builds a capped, priority-ordered Speed Mode pool.
 * Order: weak items first (accuracy < 50%), then unseen, then mastered.
 * Capped at `maxSize` (default 50) to keep rounds snappy.
 */
export function buildSessionPool<T extends { id?: string; slovak: string }>(
  allItems: T[],
  weights: StoreWeights,
  maxSize = 50
): T[] {
  const getId = (item: T) => item.id ?? item.slovak

  const weak   = allItems.filter(i => (weights[getId(i)]?.accuracy ?? 1) < 0.5)
  const unseen = allItems.filter(i => !weights[getId(i)])
  const rest   = allItems.filter(i => {
    const w = weights[getId(i)]
    return w !== undefined && w.accuracy >= 0.5
  })

  // Shuffle within each tier to avoid always seeing same items
  const shuffled = [
    ...weak.sort(() => Math.random() - 0.5),
    ...unseen.sort(() => Math.random() - 0.5),
    ...rest.sort(() => Math.random() - 0.5),
  ]

  return shuffled.slice(0, maxSize)
}
