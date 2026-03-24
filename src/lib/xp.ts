// ─── Level System ──────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 0, label: "Beginner",       minXP: 0,    icon: "🥚" },
  { level: 1, label: "Conversational", minXP: 200,  icon: "🗣️" },
  { level: 2, label: "Fluent",         minXP: 600,  icon: "🎓" },
  { level: 3, label: "Local",          minXP: 1200, icon: "🇸🇰" },
] as const

export interface LevelInfo {
  level: number
  label: string
  icon: string
  minXP: number
  nextThreshold: number | null
  /** 0–1 progress toward next level */
  progress: number
}

export function getLevel(xp: number): LevelInfo {
  let idx = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { idx = i; break }
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  return {
    level: current.level,
    label: current.label,
    icon:  current.icon,
    minXP: current.minXP,
    nextThreshold: next?.minXP ?? null,
    progress: next
      ? (xp - current.minXP) / (next.minXP - current.minXP)
      : 1,
  }
}

// ─── XP Multipliers ────────────────────────────────────────────────────────────

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  beginner:     1.0,
  intermediate: 1.5,
  advanced:     2.0,
}

/**
 * Calculate XP earned for an action, scaled by difficulty level.
 * @param base  Base XP value (e.g. 10 for quiz correct, 3 for flashcard)
 * @param level Category/section difficulty level
 */
export function calcXP(
  base: number,
  level: "beginner" | "intermediate" | "advanced" | undefined
): number {
  return Math.round(base * (DIFFICULTY_MULTIPLIER[level ?? "beginner"] ?? 1.0))
}
