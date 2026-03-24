/**
 * Game analytics — Step 4.1
 * Sends events to GA4 via the existing gtag global.
 * Falls back to console.log in development.
 */

type GameEvent =
  | { event: "session_start";             tab: string; mode: string }
  | { event: "card_result";               itemId: string; result: "learned" | "skipped" }
  | { event: "quiz_answer";               itemId: string; correct: boolean; timeMs: number; difficulty: string }
  | { event: "quiz_complete";             sectionTitle: string; score: number; total: number; xpEarned: number }
  | { event: "speed_complete";            tab: string; score: number; personalBest: boolean }
  | { event: "level_up";                  newLevel: number; totalXp: number }
  | { event: "streak_update";             count: number }
  | { event: "daily_challenge_complete";  xpEarned: number }
  | { event: "xp_cap_hit";               capAmount: number }
  | { event: "section_abandoned";         sectionTitle: string; atIndex: number; total: number }

export function track(e: GameEvent): void {
  if (typeof window !== "undefined" && typeof (window as { gtag?: unknown }).gtag === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gtag("event", e.event, e)
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[game]", e.event, e)
  }
}
