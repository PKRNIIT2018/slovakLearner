import type { SlovakStore } from "@/hooks/use-slovak-store"

// ─── Achievement Definitions ────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  check: (store: SlovakStore) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    title: "First Steps",
    description: "Learn your first word",
    icon: "👶",
    check: (s) => s.learnedItems.length >= 1,
  },
  {
    id: "streak_star",
    title: "Streak Star",
    description: "Reach a 7-day streak",
    icon: "⭐",
    check: (s) => s.streak.count >= 7,
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Master all items in any category",
    icon: "🏅",
    check: (s) => s.masteredSituations.length >= 1,
  },
  {
    id: "polyglot",
    title: "Polyglot",
    description: "Reach Level 2 (600 XP)",
    icon: "🎓",
    check: (s) => s.xp >= 600,
  },
  {
    id: "quiz_king",
    title: "Quiz King",
    description: "10 correct answers in one session",
    icon: "👑",
    check: (s) => (s.stats.quizBestScore ?? 0) >= 10,
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Score 15+ in Speed mode",
    icon: "⚡",
    check: (s) => Math.max(s.stats.wordBlitzBest ?? 0, s.stats.phraseBlitzBest ?? 0) >= 15,
  },
]

/** Returns achievement IDs that should now be unlocked but aren't yet. */
export function getNewAchievements(
  store: SlovakStore,
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(store)
  )
}

// ─── Daily Quest Generation ──────────────────────────────────────────────────

export interface DailyQuest {
  id: string
  title: string
  description: string
  icon: string
  target: number
  type: "words" | "quiz" | "speed"
}

const WORD_TARGETS  = [3, 5, 7]
const QUIZ_TARGETS  = [2, 3, 5]
const SPEED_TARGETS = [5, 8, 10]

export function generateDailyQuests(bratislavaDate: string): DailyQuest[] {
  // Deterministic seed from date string, e.g. "2026-03-17" → 20260317
  const seed = parseInt(bratislavaDate.replace(/-/g, ""), 10)

  const wordsTarget  = WORD_TARGETS[seed % 3]
  const quizTarget   = QUIZ_TARGETS[Math.floor(seed / 10) % 3]
  const speedTarget  = SPEED_TARGETS[Math.floor(seed / 100) % 3]

  return [
    {
      id: "q_words",
      title: "Word Learner",
      description: `Learn ${wordsTarget} new words`,
      icon: "📚",
      target: wordsTarget,
      type: "words",
    },
    {
      id: "q_quiz",
      title: "Quiz Taker",
      description: `Complete ${quizTarget} quizzes`,
      icon: "✅",
      target: quizTarget,
      type: "quiz",
    },
    {
      id: "q_speed",
      title: "Speed Runner",
      description: `Get ${speedTarget} correct in Speed mode`,
      icon: "⚡",
      target: speedTarget,
      type: "speed",
    },
  ]
}
