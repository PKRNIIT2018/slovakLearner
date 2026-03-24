"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getTodayBratislava, getYesterdayBratislava } from "@/lib/date-utils"
import { buildSlovakToIdLookup } from "@/lib/content-map"
import { useHydrated } from "@/hooks/use-hydrated"

// ─── v2 Schema ────────────────────────────────────────────────────────────────

export interface LearnedWeight {
  accuracy: number          // correct / totalAttempts (0–1)
  box: 1 | 2 | 3           // Leitner box (Phase 7)
  lastSeen: number          // ms timestamp
  dueDate: number           // ms timestamp
  totalAttempts: number
  wrongCount: number
  confusedWith: string[]    // IDs of top-3 items chosen instead of this one
}

export interface DailyQuestStats {
  date: string | null         // Bratislava date — resets when date changes
  newWordsLearned: number     // auto-tracked by markItemLearned
  quizzesCompleted: number    // recorded by game components
  speedStreakBest: number     // best consecutive correct in Speed mode
  completedQuests: string[]  // quest IDs awarded XP today
}

export interface SlovakStore {
  version: number
  learnedItems: string[]    // item IDs (replaces v1 learnedPhrases)
  xp: number
  streak: { count: number; lastDate: string | null }
  masteredSituations: string[]
  learnedWeights: Record<string, LearnedWeight>
  achievements: string[]
  dailyChallenge: { completedDate: string | null; completedSeed: string | null }
  stats: {
    sessionsPlayed: number
    correctAnswers: number
    totalTime: number
    xpCapDaily: number       // default 500
    xpCapDate: string | null // date of last XP cap reset
    xpEarnedToday: number
    phraseBlitzBest: number  // personal best score in Phrase Speed Blitz
    wordBlitzBest: number    // personal best score in Word Speed Blitz
    quizBestScore: number    // best score in a single quiz session
    dailyQuests: DailyQuestStats
  }
  activeDailySeed: string
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DAILY_QUESTS: DailyQuestStats = {
  date: null,
  newWordsLearned: 0,
  quizzesCompleted: 0,
  speedStreakBest: 0,
  completedQuests: [],
}

const DEFAULT_STORE: SlovakStore = {
  version: 2,
  learnedItems: [],
  xp: 0,
  streak: { count: 0, lastDate: null },
  masteredSituations: [],
  learnedWeights: {},
  achievements: [],
  dailyChallenge: { completedDate: null, completedSeed: null },
  stats: {
    sessionsPlayed: 0,
    correctAnswers: 0,
    totalTime: 0,
    xpCapDaily: 500,
    xpCapDate: null,
    xpEarnedToday: 0,
    phraseBlitzBest: 0,
    wordBlitzBest: 0,
    quizBestScore: 0,
    dailyQuests: DEFAULT_DAILY_QUESTS,
  },
  activeDailySeed: "",
}

// ─── Store actions interface ──────────────────────────────────────────────────

interface SlovakStoreActions {
  addXP: (amount: number) => void
  markItemLearned: (id: string) => void
  unmarkItemLearned: (id: string) => void
  markSituationMastered: (title: string) => void
  updateStreak: () => void
  completeDailyChallenge: (seed: string) => void
  getItemWeight: (id: string) => LearnedWeight | null
  updateWeight: (id: string, correct: boolean) => void
  recordConfusion: (correctId: string, chosenId: string) => void
  addAchievement: (id: string) => void
  recordSession: () => void
  updateBlitzBest: (tab: "phrases" | "words", score: number) => void
  updateQuizBestScore: (score: number) => void
  recordQuestEvent: (type: "quiz_complete" | "speed_streak", value: number) => void
  markQuestsCompleted: (ids: string[]) => void
}

type StoreState = SlovakStore & SlovakStoreActions

// ─── Zustand store with persist middleware ────────────────────────────────────

const _useSlovakStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STORE,

      addXP: (amount) => set(prev => {
        const today = getTodayBratislava()
        const earnedToday = prev.stats.xpCapDate === today ? prev.stats.xpEarnedToday : 0
        const allowable = Math.max(0, Math.min(amount, prev.stats.xpCapDaily - earnedToday))
        if (allowable === 0) return prev
        return {
          xp: prev.xp + allowable,
          stats: { ...prev.stats, xpCapDate: today, xpEarnedToday: earnedToday + allowable },
        }
      }),

      markItemLearned: (id) => set(prev => {
        if (prev.learnedItems.includes(id)) return prev
        // Enter SRS Box 1 on first learn (dueDate = now → appears every session)
        const existingWeight = prev.learnedWeights[id]
        const learnedWeights = existingWeight ? prev.learnedWeights : {
          ...prev.learnedWeights,
          [id]: {
            accuracy: 1,
            box: 1 as const,
            lastSeen: Date.now(),
            dueDate: Date.now(),
            totalAttempts: 0,
            wrongCount: 0,
            confusedWith: [],
          },
        }
        // Auto-track daily quest: new words learned
        const today = getTodayBratislava()
        const q = prev.stats.dailyQuests ?? DEFAULT_DAILY_QUESTS
        const dailyQuests: DailyQuestStats = {
          ...q,
          date: today,
          newWordsLearned: q.date === today ? q.newWordsLearned + 1 : 1,
        }
        return {
          learnedItems: [...prev.learnedItems, id],
          learnedWeights,
          stats: { ...prev.stats, dailyQuests },
        }
      }),

      unmarkItemLearned: (id) => set(prev => ({
        learnedItems: prev.learnedItems.filter(i => i !== id),
      })),

      markSituationMastered: (title) => set(prev => {
        if (prev.masteredSituations.includes(title)) return prev
        return { masteredSituations: [...prev.masteredSituations, title] }
      }),

      updateStreak: () => set(prev => {
        const today = getTodayBratislava()
        if (prev.streak.lastDate === today) return prev

        let newCount = prev.streak.count
        if (prev.streak.lastDate) {
          newCount = prev.streak.lastDate === getYesterdayBratislava()
            ? newCount + 1
            : 1
        } else {
          newCount = 1
        }

        return { streak: { count: newCount, lastDate: today } }
      }),

      completeDailyChallenge: (seed) => set({
        dailyChallenge: { completedDate: getTodayBratislava(), completedSeed: seed },
      }),

      getItemWeight: (id) => get().learnedWeights[id] ?? null,

      updateWeight: (id, correct) => set(prev => {
        const existing = prev.learnedWeights[id] ?? {
          accuracy: 1,
          box: 1 as const,
          lastSeen: Date.now(),
          dueDate: Date.now(),
          totalAttempts: 0,
          wrongCount: 0,
          confusedWith: [],
        }
        const totalAttempts = existing.totalAttempts + 1
        const wrongCount = existing.wrongCount + (correct ? 0 : 1)
        const accuracy = (totalAttempts - wrongCount) / totalAttempts
        // Leitner: correct → advance box (max 3), wrong → reset to 1
        const box = (correct
          ? Math.min(existing.box + 1, 3)
          : 1) as 1 | 2 | 3
        // Due dates: box 1 = now (every session), box 2 = 3 days, box 3 = 7 days
        const dueDays = [0, 3, 7][box - 1]
        const dueDate = Date.now() + dueDays * 86_400_000

        return {
          learnedWeights: {
            ...prev.learnedWeights,
            [id]: { ...existing, accuracy, box, totalAttempts, wrongCount, lastSeen: Date.now(), dueDate },
          },
        }
      }),

      recordConfusion: (correctId, chosenId) => set(prev => {
        const existing = prev.learnedWeights[correctId]
        if (!existing) return prev
        const confusedWith = [
          chosenId,
          ...existing.confusedWith.filter(id => id !== chosenId),
        ].slice(0, 3)
        return {
          learnedWeights: {
            ...prev.learnedWeights,
            [correctId]: { ...existing, confusedWith },
          },
        }
      }),

      addAchievement: (id) => set(prev => {
        if (prev.achievements.includes(id)) return prev
        return { achievements: [...prev.achievements, id] }
      }),

      recordSession: () => set(prev => ({
        stats: { ...prev.stats, sessionsPlayed: prev.stats.sessionsPlayed + 1 },
      })),

      updateBlitzBest: (tab, score) => set(prev => {
        const key = tab === "phrases" ? "phraseBlitzBest" : "wordBlitzBest"
        if (score <= prev.stats[key]) return prev
        return { stats: { ...prev.stats, [key]: score } }
      }),

      updateQuizBestScore: (score) => set(prev => {
        if (score <= (prev.stats.quizBestScore ?? 0)) return prev
        return { stats: { ...prev.stats, quizBestScore: score } }
      }),

      recordQuestEvent: (type, value) => set(prev => {
        const today = getTodayBratislava()
        const q = prev.stats.dailyQuests ?? DEFAULT_DAILY_QUESTS
        const base: DailyQuestStats = q.date === today ? q : { ...DEFAULT_DAILY_QUESTS, date: today }
        const updated: DailyQuestStats = { ...base, date: today }
        if (type === "quiz_complete")  updated.quizzesCompleted = base.quizzesCompleted + value
        if (type === "speed_streak")   updated.speedStreakBest  = Math.max(base.speedStreakBest, value)
        return { stats: { ...prev.stats, dailyQuests: updated } }
      }),

      markQuestsCompleted: (ids) => set(prev => {
        const today = getTodayBratislava()
        const q = prev.stats.dailyQuests ?? DEFAULT_DAILY_QUESTS
        const base: DailyQuestStats = q.date === today ? q : { ...DEFAULT_DAILY_QUESTS, date: today }
        const existing = base.completedQuests ?? []
        const merged = [...new Set([...existing, ...ids])]
        return { stats: { ...prev.stats, dailyQuests: { ...base, completedQuests: merged } } }
      }),
    }),
    {
      name: "ins-slovak-learning-v1",              // same key — avoids key-not-found on v1 devices
      storage: createJSONStorage(() => localStorage),
      version: 2,
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn("[SlovakStore] Corrupted localStorage — resetting to defaults:", error)
          _useSlovakStore.setState({ ...DEFAULT_STORE })
        }
      },
      migrate: (persisted: unknown, fromVersion: number): SlovakStore => {
        if (fromVersion < 2) {
          const v1 = persisted as Record<string, unknown>
          const lookup = buildSlovakToIdLookup()
          const phrases = (v1.learnedPhrases as string[]) ?? []
          const matched: string[] = []
          const unmatched: string[] = []
          for (const sk of phrases) {
            const id = lookup[sk]
            if (id) {
              matched.push(id)
            } else {
              unmatched.push(sk)
            }
          }
          if (unmatched.length > 0) {
            console.warn(
              `[store v1→v2] ${unmatched.length} learned item(s) could not be migrated (no ID match). ` +
              `These entries have been dropped. Unmatched Slovak text: ${JSON.stringify(unmatched)}`
            )
          }
          return {
            ...DEFAULT_STORE,
            learnedItems: matched,
            xp: (v1.xp as number) ?? 0,
            streak: (v1.streak as SlovakStore["streak"]) ?? DEFAULT_STORE.streak,
            masteredSituations: (v1.masteredSituations as string[]) ?? [],
            dailyChallenge: (v1.dailyChallenge as SlovakStore["dailyChallenge"]) ?? DEFAULT_STORE.dailyChallenge,
          }
        }
        return persisted as SlovakStore
      },
    }
  )
)

// Exported for Firestore sync hook only — do not use directly in components.
export { _useSlovakStore as _rawSlovakStore }
export { DEFAULT_STORE }

// ─── Public hook (compatible wrapper) ────────────────────────────────────────
//
// Returns the same `{ store, isLoaded, ...actions }` shape as the v1 hook
// so call sites need only minimal updates (learnedPhrases → learnedItems,
// markPhraseLearned → markItemLearned, etc.).

export function useSlovakStore() {
  const state = _useSlovakStore()
  const isLoaded = useHydrated()

  const store: SlovakStore = {
    version:            state.version,
    learnedItems:       state.learnedItems,
    xp:                 state.xp,
    streak:             state.streak,
    masteredSituations: state.masteredSituations,
    learnedWeights:     state.learnedWeights,
    achievements:       state.achievements,
    dailyChallenge:     state.dailyChallenge,
    stats:              state.stats,
    activeDailySeed:    state.activeDailySeed,
  }

  const today = getTodayBratislava()
  const xpCapReached =
    state.stats.xpCapDate === today &&
    state.stats.xpEarnedToday >= state.stats.xpCapDaily

  return {
    store,
    isLoaded,
    xpCapReached,
    addXP:                state.addXP,
    markItemLearned:      state.markItemLearned,
    unmarkItemLearned:    state.unmarkItemLearned,
    markSituationMastered: state.markSituationMastered,
    updateStreak:         state.updateStreak,
    completeDailyChallenge: state.completeDailyChallenge,
    getItemWeight:        state.getItemWeight,
    updateWeight:         state.updateWeight,
    recordConfusion:      state.recordConfusion,
    addAchievement:       state.addAchievement,
    recordSession:        state.recordSession,
    updateBlitzBest:      state.updateBlitzBest,
    updateQuizBestScore:  state.updateQuizBestScore,
    recordQuestEvent:     state.recordQuestEvent,
    markQuestsCompleted:  state.markQuestsCompleted,
  }
}
