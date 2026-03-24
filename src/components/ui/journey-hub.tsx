"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { ArrowLeft, ChevronRight, Trophy, CheckCircle2 } from "lucide-react"
import { m, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { XpBar } from "@/components/ui/xp-bar"
import { StreakDisplay } from "@/components/ui/streak-display"
import { PhraseGameHub } from "@/components/ui/phrase-game"
import { WordGameHub } from "@/components/ui/word-game"
import { SLOVAK_SECTIONS } from "@/data/slovak-phrases"
import { generateSentenceSections } from "@/lib/generate-sentence-sections"
import { WORD_CATEGORIES } from "@/data/slovak-words"
import { getTodayBratislava } from "@/lib/date-utils"
import { ACHIEVEMENTS, generateDailyQuests, getNewAchievements } from "@/lib/achievements"
import type { DailyQuest } from "@/lib/achievements"

type Zone = "situations" | "vocabulary" | "sentences"

// ─── Zone config ────────────────────────────────────────────────────────────

const ZONES: {
  id: Zone
  label: string
  icon: string
  description: string
}[] = [
  { id: "vocabulary",  label: "Vocabulary",  icon: "📚", description: "Words & word types" },
  { id: "situations",  label: "Situations",  icon: "💬", description: "Real-life phrase sets" },
  { id: "sentences",   label: "Sentences",   icon: "✍️", description: "Full example sentences" },
]

// ─── Achievement Toast ───────────────────────────────────────────────────────

function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: { title: string; icon: string; description: string }
  onDismiss: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500 text-white shadow-xl"
    >
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Achievement unlocked</p>
        <p className="font-bold leading-tight">{achievement.title}</p>
        <p className="text-xs opacity-80">{achievement.description}</p>
      </div>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </m.div>
  )
}

// ─── Quest Card ──────────────────────────────────────────────────────────────

function QuestCard({ quest, progress, done }: { quest: DailyQuest; progress: number; done: boolean }) {
  const pct = Math.min(1, progress / quest.target)

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
      done ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-card border-border"
    )}>
      <span className="text-2xl shrink-0">{quest.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={cn("font-semibold text-sm", done && "line-through text-muted-foreground")}>
            {quest.description}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {Math.min(progress, quest.target)}/{quest.target}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <m.div
            className={cn("h-full rounded-full", done ? "bg-green-500" : "bg-primary")}
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      {done && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
    </div>
  )
}

// ─── Zone Card ───────────────────────────────────────────────────────────────

function ZoneCard({
  zone,
  itemCount,
  learnedCount,
  dueCount,
  onClick,
}: {
  zone: typeof ZONES[number]
  itemCount: number
  learnedCount: number
  dueCount: number
  onClick: () => void
}) {
  const pct = itemCount > 0 ? learnedCount / itemCount : 0

  return (
    <m.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full text-left flex flex-col gap-3 p-5 rounded-2xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{zone.icon}</span>
          <div>
            <p className="font-bold text-base">{zone.label}</p>
            <p className="text-xs text-muted-foreground">{zone.description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{learnedCount} / {itemCount} learned</span>
          {dueCount > 0 && (
            <span className="text-amber-500 font-medium">{dueCount} due for review</span>
          )}
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <m.div
            className={cn("h-full rounded-full", pct >= 1 ? "bg-amber-400" : "bg-primary")}
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <span>Play</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </m.button>
  )
}

// ─── Main Journey Hub ────────────────────────────────────────────────────────

export function JourneyHub() {
  const { store, isLoaded, addAchievement } = useSlovakStore()
  const hydrated = useHydrated()
  const sentenceSections = useMemo(() => generateSentenceSections(), [])

  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  const [toastQueue, setToastQueue] = useState<{ id: string; title: string; icon: string; description: string }[]>([])
  const prevAchievements = useRef<string[]>([])

  // ── Achievement checks ──────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    const newOnes = getNewAchievements(store, store.achievements)
    for (const a of newOnes) {
      addAchievement(a.id)
      setToastQueue(q => [...q, { id: a.id, title: a.title, icon: a.icon, description: a.description }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.xp, store.learnedItems.length, store.masteredSituations.length, store.streak.count, hydrated])

  // Detect newly added achievements for toast (e.g., quiz_king from game components)
  useEffect(() => {
    if (!hydrated) return
    const prev = prevAchievements.current
    const added = store.achievements.filter(id => !prev.includes(id))
    for (const id of added) {
      const def = ACHIEVEMENTS.find(a => a.id === id)
      if (def) setToastQueue(q => [...q, { id, title: def.title, icon: def.icon, description: def.description }])
    }
    prevAchievements.current = store.achievements
  }, [store.achievements, hydrated])

  // ── Daily quest data ────────────────────────────────────────────────────
  const today = getTodayBratislava()
  const quests = useMemo(() => generateDailyQuests(today), [today])
  const questStats = store.stats.dailyQuests ?? {
    date: null, newWordsLearned: 0, quizzesCompleted: 0, speedStreakBest: 0, completedQuests: [],
  }
  const isToday = questStats.date === today

  function questProgress(q: DailyQuest) {
    if (!isToday) return 0
    if (q.type === "words") return questStats.newWordsLearned
    if (q.type === "quiz")  return questStats.quizzesCompleted
    if (q.type === "speed") return questStats.speedStreakBest
    return 0
  }

  // Award +25 XP per newly completed quest, +100 XP for completing all three
  const completedQuestIds = useMemo(() => {
    if (!isToday) return []
    return quests.filter(q => questProgress(q) >= q.target).map(q => q.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests, questStats])

  const prevCompletedRef = useRef<string[]>([])
  const { addXP, markQuestsCompleted } = useSlovakStore()
  useEffect(() => {
    if (!hydrated) return
    const prev = prevCompletedRef.current
    const stored = questStats.completedQuests ?? []
    const newlyDone = completedQuestIds.filter(id => !stored.includes(id) && !prev.includes(id))
    if (newlyDone.length > 0) {
      const xpBonus = newlyDone.length * 25 + (completedQuestIds.length === 3 && prev.length < 3 ? 100 : 0)
      addXP(xpBonus)
      markQuestsCompleted(newlyDone)
    }
    prevCompletedRef.current = completedQuestIds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedQuestIds, hydrated])

  // ── Zone stats ──────────────────────────────────────────────────────────
  const now = Date.now()

  const zoneStats = useMemo(() => {
    const wordItems = WORD_CATEGORIES.flatMap(c => c.words)
    const phraseItems = SLOVAK_SECTIONS.flatMap(s => s.phrases)
    const sentenceItems = sentenceSections.flatMap(s => s.phrases)

    function dueCount(ids: string[]) {
      return ids.filter(id => {
        const w = store.learnedWeights[id]
        return w && w.dueDate <= now
      }).length
    }

    return {
      vocabulary: {
        total: wordItems.length,
        learned: wordItems.filter(w => store.learnedItems.includes(w.id ?? w.slovak)).length,
        due: dueCount(wordItems.map(w => w.id ?? w.slovak)),
      },
      situations: {
        total: phraseItems.length,
        learned: phraseItems.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length,
        due: dueCount(phraseItems.map(p => p.id ?? p.slovak)),
      },
      sentences: {
        total: sentenceItems.length,
        learned: sentenceItems.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length,
        due: dueCount(sentenceItems.map(p => p.id ?? p.slovak)),
      },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.learnedItems, store.learnedWeights])

  // ── Render active zone ──────────────────────────────────────────────────
  if (activeZone) {
    return (
      <div>
        <button
          onClick={() => setActiveZone(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journey Hub
        </button>
        {activeZone === "vocabulary"  && <WordGameHub />}
        {activeZone === "situations"  && <PhraseGameHub sections={SLOVAK_SECTIONS} />}
        {activeZone === "sentences"   && <PhraseGameHub sections={sentenceSections} />}
      </div>
    )
  }

  // ── Hub view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Central Dashboard (11.2) ── */}
      <div className="rounded-2xl border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        {isLoaded ? (
          <>
            <div className="flex items-center gap-4 flex-1">
              <XpBar xp={store.xp} />
              <div className="flex flex-col gap-1.5">
                <StreakDisplay count={store.streak.count} lastDate={store.streak.lastDate} />
              </div>
            </div>
            <div className="flex items-center gap-6 text-center sm:border-l sm:pl-6 border-border">
              <div>
                <p className="text-2xl font-black">{store.learnedItems.length}</p>
                <p className="text-xs text-muted-foreground">Items learned</p>
              </div>
              <div>
                <p className="text-2xl font-black">{store.streak.count}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
              <div>
                <p className="text-2xl font-black">{store.achievements.length}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
        )}
      </div>

      {/* ── Mission Map (11.3) ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Practice Zones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ZONES.map(zone => {
            const s = zoneStats[zone.id]
            return (
              <ZoneCard
                key={zone.id}
                zone={zone}
                itemCount={s.total}
                learnedCount={s.learned}
                dueCount={s.due}
                onClick={() => setActiveZone(zone.id)}
              />
            )
          })}
        </div>
      </div>

      {/* ── Daily Quests (11.4) ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Today&apos;s Quests
        </h2>
        <div className="space-y-3">
          {quests.map(q => (
            <QuestCard
              key={q.id}
              quest={q}
              progress={questProgress(q)}
              done={questProgress(q) >= q.target}
            />
          ))}
        </div>
        {completedQuestIds.length === 3 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            All quests complete! +{3 * 25 + 100} XP bonus earned today.
          </div>
        )}
      </div>

      {/* ── Achievements (11.5) ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = store.achievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors",
                  unlocked
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    : "bg-card border-border opacity-50"
                )}
              >
                <span className="text-2xl">{unlocked ? a.icon : "🔒"}</span>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{a.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Achievement Toasts ── */}
      <AnimatePresence>
        {toastQueue.length > 0 && (
          <AchievementToast
            key={toastQueue[0].id}
            achievement={toastQueue[0]}
            onDismiss={() => setToastQueue(q => q.slice(1))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
