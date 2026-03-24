import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { SlovakStore, LearnedWeight, DailyQuestStats } from "@/hooks/use-slovak-store"

// ─── Syncable state subset ────────────────────────────────────────────────────
// `activeDailySeed` and `version` are excluded — device-local, not worth syncing.

export type SyncableState = Omit<SlovakStore, "version" | "activeDailySeed">

// ─── Firestore read / write ───────────────────────────────────────────────────

export async function loadRemoteProgress(uid: string): Promise<SyncableState | null> {
  const snap = await getDoc(doc(db, "users", uid))
  if (!snap.exists()) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { syncedAt, ...data } = snap.data()
  return data as SyncableState
}

export async function saveRemoteProgress(uid: string, state: SyncableState): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { ...state, syncedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function deleteRemoteProgress(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid))
}

// ─── Merge strategy ───────────────────────────────────────────────────────────
// Always "take the best" — never lose progress.
// remote === null means first-time login; return local unchanged.

export function mergeProgress(
  local: SyncableState,
  remote: SyncableState | null
): SyncableState {
  if (!remote) return local

  // Streak: keep whichever lastDate is more recent; tie → take max count
  const streak = (() => {
    const l = local.streak
    const r = remote.streak
    if (!l.lastDate && !r.lastDate) return l
    if (!l.lastDate) return r
    if (!r.lastDate) return l
    if (l.lastDate > r.lastDate) return l
    if (r.lastDate > l.lastDate) return r
    return { count: Math.max(l.count, r.count), lastDate: l.lastDate }
  })()

  // dailyChallenge: prefer the one with the later non-null completedDate
  const dailyChallenge = (() => {
    const l = local.dailyChallenge
    const r = remote.dailyChallenge
    if (!l.completedDate) return r
    if (!r.completedDate) return l
    return l.completedDate >= r.completedDate ? l : r
  })()

  // learnedWeights: per-item, keep the entry with more attempts; tie → later lastSeen
  const learnedWeights: Record<string, LearnedWeight> = { ...remote.learnedWeights }
  for (const [id, lw] of Object.entries(local.learnedWeights)) {
    const rw = remote.learnedWeights[id]
    if (!rw) {
      learnedWeights[id] = lw
    } else if (lw.totalAttempts > rw.totalAttempts) {
      learnedWeights[id] = lw
    } else if (lw.totalAttempts === rw.totalAttempts && lw.lastSeen > rw.lastSeen) {
      learnedWeights[id] = lw
    }
  }

  // stats: keep local for today-scoped fields; take max for all-time bests
  const localQ: DailyQuestStats = local.stats.dailyQuests
  const stats = {
    sessionsPlayed:  Math.max(local.stats.sessionsPlayed,  remote.stats.sessionsPlayed),
    correctAnswers:  Math.max(local.stats.correctAnswers,  remote.stats.correctAnswers),
    totalTime:       Math.max(local.stats.totalTime,       remote.stats.totalTime),
    xpCapDaily:      local.stats.xpCapDaily,   // user preference — keep local
    xpCapDate:       local.stats.xpCapDate,    // today-scoped — keep local
    xpEarnedToday:   local.stats.xpEarnedToday,
    phraseBlitzBest: Math.max(local.stats.phraseBlitzBest, remote.stats.phraseBlitzBest),
    wordBlitzBest:   Math.max(local.stats.wordBlitzBest,   remote.stats.wordBlitzBest),
    quizBestScore:   Math.max(local.stats.quizBestScore,   remote.stats.quizBestScore),
    dailyQuests:     localQ,                   // today-scoped — keep local
  }

  return {
    xp:                  Math.max(local.xp, remote.xp),
    streak,
    learnedItems:        [...new Set([...local.learnedItems, ...remote.learnedItems])],
    masteredSituations:  [...new Set([...local.masteredSituations, ...remote.masteredSituations])],
    achievements:        [...new Set([...local.achievements, ...remote.achievements])],
    dailyChallenge,
    learnedWeights,
    stats,
  }
}
