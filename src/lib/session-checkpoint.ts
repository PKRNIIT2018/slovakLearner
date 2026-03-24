export interface WrongAnswer {
  id?: string
  question: string
  yourAnswer: string
  correct: string
}

export interface SessionCheckpoint {
  tab: "situations" | "vocabulary"
  sectionTitle: string
  currentIndex: number
  wrongAnswers: WrongAnswer[]
  xpEarnedThisSession: number
  savedAt: number
}

const KEY = "ins-slovak-session"
const MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

export function readCheckpoint(): SessionCheckpoint | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const cp = JSON.parse(raw) as SessionCheckpoint
    if (Date.now() - cp.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY)
      return null
    }
    return cp
  } catch {
    return null
  }
}

export function writeCheckpoint(cp: Omit<SessionCheckpoint, "savedAt">): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...cp, savedAt: Date.now() }))
  } catch { /* quota exceeded, ignore */ }
}

export function clearCheckpoint(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(KEY)
}
