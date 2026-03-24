import type { LearnedWeight } from "@/hooks/use-slovak-store"

type StoreWeights = Record<string, LearnedWeight>

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns `n` distractor items for a given `current` item.
 *
 * Priority tiers:
 *  1. Items the user has historically confused with `current` (from weights.confusedWith)
 *  2. Remaining items from the pool (random)
 *
 * Never includes `current` itself.
 */
export function buildDistractors<T extends { id?: string; slovak: string }>(
  current: T,
  allItems: T[],
  weights: StoreWeights,
  n = 3
): T[] {
  const getId = (item: T) => item.id ?? item.slovak
  const currentId = getId(current)

  const candidates = allItems.filter(i => getId(i) !== currentId)
  if (candidates.length <= n) return shuffleArray(candidates)

  // Tier 1: historically confused items
  const confusedIds = new Set(weights[currentId]?.confusedWith ?? [])
  const confused = shuffleArray(candidates.filter(i => confusedIds.has(getId(i))))

  // Tier 2: random remainder
  const rest = shuffleArray(candidates.filter(i => !confusedIds.has(getId(i))))

  return [...confused, ...rest].slice(0, n)
}
