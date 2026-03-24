/**
 * Shared utility functions for the Slovak learning game
 */

export function shuffleArray<T>(array: T[]): T[] {
  const next = [...array]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function getPersonalizedMessage(pct: number, type: "phrase" | "word" = "phrase"): string {
  const itemLabel = type === "phrase" ? "phrase" : "word"
  if (pct === 100) return `Perfect score! You nailed every ${itemLabel}!`
  if (pct >= 90)  return "Outstanding! Nearly flawless performance!"
  if (pct >= 80)  return "Great work! Keep building on this!"
  if (pct >= 60)  return "Good effort! A little more practice will do it."
  return "Keep going — every attempt makes you more fluent."
}
