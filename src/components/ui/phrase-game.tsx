"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  Shuffle, Trophy, CheckCircle, XCircle,
  RotateCcw, BookOpen, Zap, Eye, EyeOff, ArrowLeft, Volume2,
  Flame, Medal, Target, Share2, Timer, ChevronDown, Turtle
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { calcXP } from "@/lib/xp"
import { track } from "@/lib/analytics"
import { buildSessionPool } from "@/lib/build-session-pool"
import { buildDistractors } from "@/lib/build-distractors"
import { buildReviewQueue } from "@/lib/build-review-queue"
import { readCheckpoint, writeCheckpoint, clearCheckpoint, type SessionCheckpoint } from "@/lib/session-checkpoint"
import { ProgressRing } from "@/components/ui/progress-ring"
import { XpBar } from "@/components/ui/xp-bar"
import { StreakDisplay, MidnightWarning } from "@/components/ui/streak-display"
import { XpCapBanner } from "@/components/ui/xp-cap-banner"
import { useSlovakStore, type SlovakStore } from "@/hooks/use-slovak-store"
import { useSpeakSlovak, useTurtleMode } from "@/hooks/use-speak-slovak"
import { DailyChallenge } from "./daily-challenge"
import { MasteryDashboard } from "@/components/ui/mastery-dashboard"
import { LearningPathPanel } from "@/components/ui/learning-path-panel"
import { LearnMode } from "@/components/ui/learning/phrase/learn-mode"
import { WarmupScreen } from "@/components/ui/learning/shared/warmup-screen"
import { XpFloats, useXpFloats } from "@/components/ui/learning/shared/xp-floats"
import { AnimatedCounter } from "@/components/ui/learning/shared/animated-counter"
import type { Phrase, PhraseSection } from "@/types/learning"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Mode = "learn" | "quiz" | "speed"

const DIFFICULTY_CONFIG = {
  beginner: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Beginner" },
  intermediate: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Intermediate" },
  advanced: { color: "text-rose-500", bg: "bg-rose-500/10", label: "Advanced" }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


function SpeakButton({ text, className }: { text: string; className?: string }) {
  const speak = useSpeakSlovak()
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text) }}
      title="Hear pronunciation"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1 text-primary/50 hover:text-primary hover:bg-primary/10 transition-colors",
        className
      )}
    >
      <Volume2 className="w-3.5 h-3.5" />
    </button>
  )
}

// ─── UI Components ───────────────────────────────────────────────────────────

function StatsHeader({ store }: { store: SlovakStore }) {
  const totalPhrases = 253
  const progress = Math.round((store.learnedItems.length / totalPhrases) * 100)

  return (
    <div className="bg-card border rounded-3xl p-6 mb-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <XpBar xp={store.xp} />
        <div className="flex items-center gap-6">
          <StreakDisplay count={store.streak.count} lastDate={store.streak.lastDate} />
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-bold text-sm">{store.learnedItems.length}/{totalPhrases}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mt-1 text-right">Overall Mastery</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section Selector ──────────────────────────────────────────────────────────

const SECTION_LEVEL_GROUPS = [
  { key: "beginner"     as const, label: "Beginner",     badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { key: "intermediate" as const, label: "Intermediate", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { key: "advanced"     as const, label: "Advanced",     badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
]

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced"

function SectionCard({
  section, idx, learnedItems, onSelect,
}: {
  section: PhraseSection; idx: number; learnedItems: string[]; onSelect: (idx: number) => void
}) {
  const sectionLearnedCount = section.phrases.filter(p => learnedItems.includes(p.id ?? p.slovak)).length
  const isMastered = sectionLearnedCount === section.phrases.length && section.phrases.length > 0
  const diff = section.level ? DIFFICULTY_CONFIG[section.level] : null

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(idx)}
      className={cn(
        "group relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all duration-150 cursor-pointer overflow-hidden h-full",
        isMastered
          ? "border-amber-400/40 bg-amber-400/[0.03] hover:bg-amber-400/[0.06]"
          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
      )}
    >
      <div className="absolute top-2 right-2">
        {isMastered ? (
          <CheckCircle className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        ) : sectionLearnedCount > 0 ? (
          <ProgressRing value={sectionLearnedCount / section.phrases.length} size={22} strokeWidth={3} label={`${sectionLearnedCount}/${section.phrases.length}`} />
        ) : null}
      </div>
      <span className="text-3xl leading-none mt-1">{section.icon}</span>
      <span className="text-[10px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors mt-1">
        {section.title}
      </span>
      {diff && (
        <div className={cn("text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md", diff.bg, diff.color)}>
          {diff.label}
        </div>
      )}
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-auto pt-1">
        {sectionLearnedCount}/{section.phrases.length} items
      </span>
    </motion.button>
  )
}

function SectionSelector({
  sections,
  onSelect,
  store,
}: {
  sections: PhraseSection[]
  onSelect: (idx: number) => void
  store: SlovakStore
}) {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all")
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (key: string) =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  // "Continue where you left off" — in-progress sections (started but not mastered)
  const inProgress = sections
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => {
      const learned = s.phrases.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length
      return learned > 0 && learned < s.phrases.length
    })
    .slice(0, 2)

  const filtered = levelFilter === "all"
    ? sections
    : sections.filter(s => s.level === levelFilter)

  const groups = SECTION_LEVEL_GROUPS.map(g => ({
    ...g,
    items: filtered.map(s => ({ s, idx: sections.indexOf(s) })).filter(({ s }) => s.level === g.key),
  }))
  const ungrouped = filtered
    .filter(s => !s.level)
    .map(s => ({ s, idx: sections.indexOf(s) }))

  const renderGrid = (items: { s: PhraseSection; idx: number }[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map(({ s, idx }) => (
        <SectionCard key={idx} section={s} idx={idx} learnedItems={store.learnedItems} onSelect={onSelect} />
      ))}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Continue where you left off */}
      {inProgress.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
            Continue where you left off
          </p>
          <div className="flex flex-wrap gap-2">
            {inProgress.map(({ s, idx }) => {
              const learned = s.phrases.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                >
                  <span>{s.icon}</span>
                  <span className="text-[10px] font-bold">{s.title}</span>
                  <span className="text-[9px] text-muted-foreground">{learned}/{s.phrases.length}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Level filter buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", "beginner", "intermediate", "advanced"] as LevelFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setLevelFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
              levelFilter === f
                ? f === "all" ? "bg-primary text-primary-foreground border-primary"
                  : f === "beginner" ? "bg-emerald-500 text-white border-emerald-500"
                  : f === "intermediate" ? "bg-amber-500 text-white border-amber-500"
                  : "bg-rose-500 text-white border-rose-500"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {f === "all" ? "All Levels" : f}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-semibold">No {levelFilter} situations yet</p>
          <p className="text-xs mt-1">Check back soon — more content is being added.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(g => g.items.length > 0 && (
            <div key={g.key}>
              <button
                onClick={() => toggleGroup(g.key)}
                className="flex items-center gap-2 mb-3 group w-full text-left"
              >
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", g.badge)}>
                  {g.label}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground/50">{g.items.length} situations</span>
                <ChevronDown className={cn(
                  "w-3 h-3 text-muted-foreground/40 ml-auto transition-transform duration-200",
                  collapsed[g.key] && "-rotate-180"
                )} />
              </button>
              {!collapsed[g.key] && renderGrid(g.items)}
            </div>
          ))}
          {ungrouped.length > 0 && renderGrid(ungrouped)}
        </div>
      )}
    </div>
  )
}

// ─── SRS Box Dot ───────────────────────────────────────────────────────────────

const BOX_DOT: Record<1 | 2 | 3, { color: string; title: string }> = {
  1: { color: "bg-yellow-400",  title: "Box 1 — review every session" },
  2: { color: "bg-orange-400",  title: "Box 2 — review every 3 days" },
  3: { color: "bg-green-500",   title: "Box 3 — review every 7 days" },
}

function BoxDot({ box }: { box?: 1 | 2 | 3 }) {
  if (!box) return null
  const { color, title } = BOX_DOT[box]
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", color)} title={title} />
}

// ─── Quiz Result Screen ────────────────────────────────────────────────────────

function QuizResult({ 
  score, 
  total, 
  xpGained, 
  wrongAnswers,
  onRetry, 
  onBack,
  onSwitchToSpeed,
  onPracticeWrongAnswers,
}: { 
  score: number
  total: number
  xpGained: number
  wrongAnswers?: { question: string; yourAnswer: string; correct: string; id?: string }[]
  onRetry: () => void
  onBack: () => void
  onSwitchToSpeed?: () => void
  onPracticeWrongAnswers?: (ids: string[]) => void
}) {
  const pct = Math.round((score / total) * 100)
  const isPass = pct >= 80

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-card border-2 rounded-[2.5rem] p-10 text-center shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Medal className="w-32 h-32 rotate-12" />
      </div>

      <div className={cn(
        "w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner",
        isPass ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
      )}>
        {isPass ? <Trophy className="w-12 h-12" /> : <Target className="w-12 h-12" />}
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">
          {isPass ? "Outstanding!" : "Nice Effort!"}
        </h3>
        <p className="text-muted-foreground font-medium">You finished the situation quiz.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-muted/50 rounded-3xl border border-border/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Score</p>
          <p className="text-2xl font-black italic">{score}/{total}</p>
          <p className="text-[10px] font-bold text-primary">{pct}%</p>
        </div>
        <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">XP Gained</p>
          <AnimatedCounter value={xpGained} />
          <p className="text-[10px] font-bold text-muted-foreground">Total XP</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full h-14 rounded-[1.25rem] bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Retry Quiz
          </div>
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-[1.25rem] border-2 border-border font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
          >
            All Situations
          </button>
          {onPracticeWrongAnswers && wrongAnswers && wrongAnswers.length > 0 && (
            <button
              onClick={() => onPracticeWrongAnswers(wrongAnswers.map(w => w.correct))}
              className="flex-1 h-12 rounded-[1.25rem] bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all"
            >
              Practice {wrongAnswers.length} Wrong
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Quiz Mode ─────────────────────────────────────────────────────────────────

function QuizMode({
  section,
  allPhrases,
  weights,
  addXP,
  updateStreak,
  updateWeight,
  updateQuizBestScore,
  recordConfusion,
  recordQuestEvent,
  addAchievement,
  onBack,
  onSwitchToSpeed,
  onPracticeWrongAnswers,
  resumeData,
}: {
  section: PhraseSection
  allPhrases?: Phrase[]
  weights?: Record<string, import("@/hooks/use-slovak-store").LearnedWeight>
  addXP: (n: number) => void
  updateStreak: () => void
  updateWeight?: (id: string, correct: boolean) => void
  updateQuizBestScore?: (score: number) => void
  recordConfusion?: (correctId: string, chosenId: string) => void
  recordQuestEvent?: (type: "quiz_complete" | "speed_streak", value: number) => void
  addAchievement?: (id: string) => void
  onBack: () => void
  onSwitchToSpeed?: () => void
  onPracticeWrongAnswers?: (ids: string[]) => void
  resumeData?: SessionCheckpoint
}) {
  const [recentCache, setRecentCache] = useState<string[]>([])
  const [shuffled, setShuffled] = useState(() =>
    buildReviewQueue(section.phrases, weights ?? {}, { maxSize: section.phrases.length, recentCache: [] })
  )
  const [currentIdx, setCurrentIdx] = useState(() =>
    resumeData ? Math.min(resumeData.currentIndex, section.phrases.length - 1) : 0
  )
  const [score, setScore] = useState(() =>
    resumeData ? resumeData.currentIndex - resumeData.wrongAnswers.length : 0
  )
  const [combo, setCombo] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [shakeWrong, setShakeWrong] = useState(false)
  const [finished, setFinished] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [xpSession, setXpSession] = useState(() => resumeData?.xpEarnedThisSession ?? 0)
  const [wrongAnswers, setWrongAnswers] = useState<{ question: string; yourAnswer: string; correct: string; id?: string }[]>(
    () => resumeData?.wrongAnswers ?? []
  )
  const { floats, emit: emitXp } = useXpFloats()
  const speak = useSpeakSlovak()
  const questionStartRef = useRef<number>(Date.now())

  const current = shuffled[currentIdx]

  const options = useMemo(() => {
    if (!current) return []
    const pool = allPhrases ?? section.phrases
    const wrong = buildDistractors(current, pool, weights ?? {})
    return shuffleArray([current, ...wrong])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, runKey])

  const handleAnswer = (slovak: string) => {
    if (selected) return
    setSelected(slovak)
    speak(current.slovak)

    const timeMs = Date.now() - questionStartRef.current
    const correct = slovak === current.slovak
    track({
      event: "quiz_answer",
      itemId: current.id ?? current.slovak,
      correct,
      timeMs,
      difficulty: section.level ?? "beginner",
    })

    const currentId = current.id ?? current.slovak
    updateWeight?.(currentId, correct)
    if (!correct) {
      const chosenId = options.find(o => o.slovak === slovak)?.id ?? slovak
      recordConfusion?.(currentId, chosenId)
    }

    let earnedThisAnswer = 0
    let nextWrongAnswers = wrongAnswers
    if (correct) {
      setScore(s => s + 1)
      const newCombo = combo + 1
      setCombo(newCombo)
      const multiplier = newCombo >= 5 ? 1.5 : 1
      earnedThisAnswer = Math.round(calcXP(10, section.level) * multiplier)
      setXpSession(x => x + earnedThisAnswer)
      emitXp(earnedThisAnswer)
    } else {
      setCombo(0)
      setShakeWrong(true)
      setTimeout(() => setShakeWrong(false), 450)
      const newEntry = {
        id: current.id ?? current.slovak,
        question: current.english,
        yourAnswer: slovak,
        correct: current.slovak,
      }
      nextWrongAnswers = [...wrongAnswers, newEntry]
      setWrongAnswers(nextWrongAnswers)
    }

    setRecentCache(prev => [...prev, currentId].slice(-10))

    const nextXpSession = xpSession + earnedThisAnswer
    setTimeout(() => {
      if (currentIdx + 1 >= shuffled.length) {
        clearCheckpoint()
        setFinished(true)
        addXP(nextXpSession)
        updateStreak()
        recordQuestEvent?.("quiz_complete", 1)
        if (score + (correct ? 1 : 0) >= 10) addAchievement?.("quiz_king")
        track({
          event: "quiz_complete",
          sectionTitle: section.title,
          score: score + (correct ? 1 : 0),
          total: shuffled.length,
          xpEarned: nextXpSession,
        })
      } else {
        const nextIdx = currentIdx + 1
        writeCheckpoint({
          tab: "situations",
          sectionTitle: section.title,
          currentIndex: nextIdx,
          wrongAnswers: nextWrongAnswers,
          xpEarnedThisSession: nextXpSession,
        })
        setCurrentIdx(nextIdx)
        setSelected(null)
        questionStartRef.current = Date.now()
      }
    }, 950)
  }

  const restart = () => {
    clearCheckpoint()
    setShuffled(buildReviewQueue(section.phrases, weights ?? {}, { maxSize: section.phrases.length, recentCache }))
    setCurrentIdx(0)
    setScore(0)
    setCombo(0)
    setSelected(null)
    setShakeWrong(false)
    setFinished(false)
    setRunKey(k => k + 1)
    setXpSession(0)
    setWrongAnswers([])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished || selected) return
      const idx = ["1", "2", "3", "4"].indexOf(e.key)
      if (idx !== -1 && options[idx]) handleAnswer(options[idx].slovak)
      if (e.key === "Escape") {
        track({ event: "section_abandoned", sectionTitle: section.title, atIndex: currentIdx, total: shuffled.length })
        onBack()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, selected, options])

  if (section.phrases.length < 4) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm font-medium">
        This situation needs at least 4 phrases for a quiz.
      </div>
    )
  }

  if (finished) {
    return (
      <QuizResult
        score={score}
        total={shuffled.length}
        xpGained={xpSession}
        wrongAnswers={wrongAnswers}
        onRetry={restart}
        onBack={onBack}
        onSwitchToSpeed={onSwitchToSpeed}
        onPracticeWrongAnswers={onPracticeWrongAnswers}
      />
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Step <span className="text-foreground">{currentIdx + 1}</span> of {shuffled.length}
        </span>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {combo >= 3 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                  combo >= 5
                    ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700"
                    : "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"
                )}
              >
                <Flame className="w-3 h-3 fill-current" /> {combo}× {combo >= 5 ? "1.5× XP!" : "Combo"}
              </motion.span>
            )}
          </AnimatePresence>
          <div className="relative">
            <span className="text-sm font-black italic text-primary">+{xpSession} XP</span>
            <XpFloats floats={floats} />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentIdx / shuffled.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-[2.5rem] border-2 border-border bg-card p-10 text-center space-y-3 shadow-xs">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Translate to Slovak
        </p>
        <p className="text-3xl font-black tracking-tight leading-tight">{current.english}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt.slovak === current.slovak
          const isSelected = selected === opt.slovak

          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={`${runKey}-${i}`}
              disabled={!!selected}
              onClick={() => handleAnswer(opt.slovak)}
              className={cn(
                "w-full text-left px-6 py-4.5 rounded-2xl border-2 text-sm font-bold transition-all duration-200",
                !selected && "bg-card border-border hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer",
                selected && isCorrect && "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 scale-[1.02]",
                selected && isSelected && !isCorrect && cn("bg-red-500/10 border-red-500 text-red-700 dark:text-red-300", shakeWrong && "animate-shake"),
                selected && !isCorrect && !isSelected && "opacity-35 grayscale"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-black",
                  selected && isCorrect && "bg-green-500 border-green-500 text-white",
                  selected && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white",
                  !selected && "border-border text-muted-foreground/40"
                )}>
                  {selected && isCorrect && <CheckCircle className="w-4 h-4" />}
                  {selected && isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                  {!selected && (i + 1)}
                </div>
                <span className="flex-1">{opt.slovak}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {selected && current && (
          <QuizFeedbackPanel
            correct={selected === current.slovak}
            phrase={current}
            level={section.level}
            correctAnswer={current.slovak}
          />
        )}
      </AnimatePresence>
      <p className="hidden md:block text-center text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
        [1] [2] [3] [4] to select · [Esc] back
      </p>
    </div>
  )
}

// ─── Quiz Feedback Panel ──────────────────────────────────────────────────────

function QuizFeedbackPanel({
  correct,
  phrase,
  level,
  correctAnswer,
}: {
  correct: boolean
  phrase: Phrase
  level?: "beginner" | "intermediate" | "advanced"
  correctAnswer: string
}) {
  if (correct) {
    if (!phrase.grammar_focus) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs text-green-700 dark:text-green-300 leading-relaxed"
      >
        <p className="font-semibold">Grammar: <span className="capitalize">{phrase.grammar_focus.replace("_", " ")}</span></p>
      </motion.div>
    )
  }

  const lines: React.ReactNode[] = []
  if (level === "beginner") {
    lines.push(
      <p key="msg" className="font-semibold">
        The correct answer is <span className="text-red-700 dark:text-red-300 font-black">{correctAnswer}</span>. Don&apos;t worry — it takes practice!
      </p>
    )
  } else {
    lines.push(<p key="ans" className="font-semibold">Correct: <span className="font-black">{correctAnswer}</span></p>)
    if (phrase.grammar_focus) {
      lines.push(
        <p key="gf" className="text-[11px] opacity-70 capitalize">Grammar focus: {phrase.grammar_focus.replace("_", " ")}</p>
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-700 dark:text-red-300 space-y-1 leading-relaxed"
    >
      {lines}
    </motion.div>
  )
}

// ─── Speed Round Mode ─────────────────────────────────────────────────────────

function SpeedRound({
  sections,
  weights,
  blitzBest,
  updateBlitzBest,
  addXP,
  updateStreak,
  recordQuestEvent,
  addAchievement,
  onBack
}: {
  sections: PhraseSection[]
  weights: Record<string, import("@/hooks/use-slovak-store").LearnedWeight>
  blitzBest: number
  updateBlitzBest: (tab: "phrases" | "words", score: number) => void
  addXP: (n: number) => void
  updateStreak: () => void
  recordQuestEvent?: (type: "quiz_complete" | "speed_streak", value: number) => void
  addAchievement?: (id: string) => void
  onBack: () => void
}) {
  const allPhrases = useMemo(() => sections.flatMap(s => s.phrases), [sections])
  const [currentPhrases, setCurrentPhrases] = useState<Phrase[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const speak = useSpeakSlovak()

  const start = () => {
    setCurrentPhrases(buildSessionPool(allPhrases, weights))
    setCurrentIdx(0)
    setScore(0)
    setTimeLeft(60)
    setIsActive(true)
    setFinished(false)
    setSelected(null)
    setIsNewBest(false)
    setRunKey(prev => prev + 1)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      setFinished(true)
      addXP(score * 5)
      updateStreak()
      const newBest = score > blitzBest
      if (newBest) {
        setIsNewBest(true)
        updateBlitzBest("phrases", score)
      }
      recordQuestEvent?.("speed_streak", score)
      if (score >= 15) addAchievement?.("speed_demon")
      track({ event: "speed_complete", tab: "situations", score, personalBest: newBest })
    }
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft, score, addXP, updateStreak, blitzBest, updateBlitzBest])

  const current = currentPhrases[currentIdx]
  const options = useMemo(() => {
    if (!current) return []
    const wrong = buildDistractors(current, allPhrases, weights)
    return shuffleArray([current, ...wrong])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, runKey])

  const handleAnswer = (slovak: string) => {
    if (selected || !isActive) return
    setSelected(slovak)
    speak(current.slovak)

    if (slovak === current.slovak) {
      setScore(s => s + 1)
    }

    setTimeout(() => {
      setCurrentIdx(i => i + 1)
      setSelected(null)
    }, 400)
  }

  if (!isActive && !finished) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
          <Timer className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Speed Blitz</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Answer as many as you can in 60 seconds. Pulls phrases from all 18 situations!
          </p>
        </div>
        <button
          onClick={start}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          Start Blitz
        </button>
      </div>
    )
  }

  if (finished) {
    const xpEarned = score * 5
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-card border-2 rounded-[2.5rem] p-10 text-center shadow-xl space-y-6"
      >
        <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Time&apos;s Up!</h3>
          <p className="text-muted-foreground font-medium mt-1">
            {score >= 20 ? "Blazing fast! You're on fire!" : score >= 10 ? "Nice speed! Keep it up!" : "Good practice! Try again to beat your score."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-3xl border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</p>
            <p className="text-2xl font-black italic">{score} correct</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">XP Gained</p>
            <p className="text-2xl font-black italic text-primary">+{xpEarned}</p>
          </div>
        </div>
        {isNewBest ? (
          <p className="text-sm font-bold text-amber-500">New personal best! 🎉</p>
        ) : blitzBest > 0 ? (
          <p className="text-xs text-muted-foreground font-medium">Your best: <span className="font-bold text-foreground">{blitzBest}</span></p>
        ) : null}
        <div className="flex flex-col gap-3">
          <button onClick={start} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">
            <div className="flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Try Again</div>
          </button>
          <button onClick={onBack} className="w-full h-10 rounded-2xl border-2 font-bold text-sm text-muted-foreground hover:bg-muted transition-all">All Situations</button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between font-black italic">
        <div className={cn(
          "flex items-center gap-2 text-xl",
          timeLeft > 20 ? "text-primary" : timeLeft > 10 ? "text-amber-500" : "text-red-500"
        )}>
          <Timer className="w-6 h-6" /> {timeLeft}s
        </div>
        <div className="text-2xl text-foreground">Score: {score}</div>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
        <motion.div
          className={cn(
            "h-full transition-colors duration-500",
            timeLeft > 20 ? "bg-green-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 60, ease: "linear" }}
        />
      </div>

      <div className="rounded-[2.5rem] border-2 border-border bg-card p-10 text-center space-y-3 shadow-xs">
        <p className="text-3xl font-black tracking-tight leading-tight">{current?.english}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt.slovak === current?.slovak
          const isSelected = selected === opt.slovak

          return (
            <button
              key={`${runKey}-${i}`}
              disabled={!!selected}
              onClick={() => handleAnswer(opt.slovak)}
              className={cn(
                "w-full text-left px-6 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-100",
                !selected && "bg-card border-border hover:border-primary/50 cursor-pointer",
                selected && isCorrect && "bg-green-500 border-green-500 text-white",
                selected && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white",
                selected && !isCorrect && !isSelected && "opacity-35"
              )}
            >
              {opt.slovak}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Resume Banner ─────────────────────────────────────────────────────────────

function ResumeBanner({
  currentIndex, total, onResume, onStartOver,
}: {
  currentIndex: number
  total: number
  onResume: () => void
  onStartOver: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20">
      <RotateCcw className="w-4 h-4 text-primary shrink-0" />
      <p className="flex-1 text-xs font-medium leading-snug">
        Resume your quiz session?{" "}
        <span className="text-muted-foreground">(Question {currentIndex + 1}/{total})</span>
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onResume}
          className="px-3 py-1 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest"
        >
          Resume
        </button>
        <button
          onClick={onStartOver}
          className="px-3 py-1 rounded-xl border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}

// ─── Section View ──────────────────────────────────────────────────────────────

const PHRASE_MODES = [
  { id: "learn" as Mode, icon: BookOpen, label: "Learn", desc: "Flip cards at your own pace" },
  { id: "quiz"  as Mode, icon: Zap,      label: "Quiz",  desc: "4-choice questions · +10 XP each" },
  { id: "speed" as Mode, icon: Timer,    label: "Speed", desc: "60 seconds · all content · +5 XP each" },
]

function SectionView({
  section,
  sections,
  onBack,
  store,
  actions,
}: {
  section: PhraseSection
  sections: PhraseSection[]
  onBack: () => void
  store: SlovakStore
  actions: {
    markItemLearned: (id: string) => void
    unmarkItemLearned: (id: string) => void
    addXP: (n: number) => void
    updateStreak: () => void
    updateBlitzBest: (tab: "phrases" | "words", score: number) => void
    updateQuizBestScore: (score: number) => void
    updateWeight: (id: string, correct: boolean) => void
    recordConfusion: (correctId: string, chosenId: string) => void
    recordQuestEvent: (type: "quiz_complete" | "speed_streak", value: number) => void
    addAchievement?: (id: string) => void
  }
}) {
  const [mode, setMode] = useState<Mode>("learn")
  const [modeKey, setModeKey] = useState(0)
  const [pendingMode, setPendingMode] = useState<Mode | null>(null)
  const [itemFilter, setItemFilter] = useState<string[] | undefined>(undefined)
  const [resumeData, setResumeData] = useState<SessionCheckpoint | null>(null)
  const [showResumeBanner, setShowResumeBanner] = useState(false)

  // Check for a saved quiz session on mount
  useEffect(() => {
    const cp = readCheckpoint()
    if (cp && cp.tab === "situations" && cp.sectionTitle === section.title) {
      setResumeData(cp)
      setShowResumeBanner(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchMode = (m: Mode, filter?: string[]) => {
    setMode(m)
    setItemFilter(filter)
    setModeKey(k => k + 1)
  }

  const handleResume = () => {
    setShowResumeBanner(false)
    switchMode("quiz")
  }

  const handleDismissResume = () => {
    clearCheckpoint()
    setResumeData(null)
    setShowResumeBanner(false)
  }

  const handleModeClick = (m: Mode) => {
    if (m === "learn") {
      switchMode("learn")
    } else {
      setPendingMode(m)
    }
  }

  // Pre-session warmup screen
  if (pendingMode) {
    const totalPhrases = pendingMode === "speed"
      ? sections.reduce((n, s) => n + s.phrases.length, 0)
      : section.phrases.length
    return (
      <div className="space-y-6">
        <button
          onClick={() => setPendingMode(null)}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All situations
        </button>
        <WarmupScreen
          mode={pendingMode}
          title={pendingMode === "speed" ? "Speed Blitz" : section.title}
          icon={pendingMode === "speed" ? "⚡" : section.icon}
          itemCount={totalPhrases}
          onStart={() => { clearCheckpoint(); setResumeData(null); switchMode(pendingMode); setPendingMode(null) }}
          onBack={() => setPendingMode(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + mode selector row */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All situations
        </button>

        <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/60">
          {PHRASE_MODES.map(m => {
            const disabled = m.id === "quiz" && section.phrases.length < 4
            return (
              <button
                key={m.id}
                onClick={() => !disabled && handleModeClick(m.id)}
                disabled={disabled}
                title={disabled
                  ? `Quiz requires at least 4 phrases. This section has ${section.phrases.length}.`
                  : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[62px]",
                  mode === m.id && !pendingMode
                    ? "bg-background text-primary shadow-sm"
                    : disabled
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                  <m.icon className="w-3.5 h-3.5" />
                  {m.label}
                </div>
                <span className={cn(
                  "text-[9px] font-medium leading-tight text-center normal-case tracking-normal",
                  mode === m.id && !pendingMode ? "text-primary/60" : "text-muted-foreground/40"
                )}>
                  {disabled ? "Need 4+" : m.desc}
                </span>
                {disabled && (
                  <span className="sr-only">
                    Quiz requires at least 4 phrases. This section has {section.phrases.length}.
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resume banner */}
      {showResumeBanner && resumeData && (
        <ResumeBanner
          currentIndex={resumeData.currentIndex}
          total={section.phrases.length}
          onResume={handleResume}
          onStartOver={handleDismissResume}
        />
      )}

      {/* Section badge */}
      <div className="flex items-center gap-4 py-4 px-6 border-2 border-border/50 rounded-[2rem] bg-card/50">
        {section.icon && <span className="text-4xl leading-none">{section.icon}</span>}
        <div className="flex-1 min-w-0">
          <h2 className="font-black italic text-xl uppercase tracking-tighter leading-tight truncate">{section.title}</h2>
          <p className="text-xs text-muted-foreground font-medium truncate opacity-70">{section.subtitle}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            {section.phrases.length} Phrases
          </span>
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${(section.phrases.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length / section.phrases.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode content — key forces remount + reshuffle on switch */}
      <div key={`${mode}-${modeKey}`}>
        {mode === "learn" && (
          <LearnMode 
            section={section} 
            store={store}
            markItemLearned={actions.markItemLearned}
            unmarkItemLearned={actions.unmarkItemLearned}
            addXP={actions.addXP}
            updateStreak={actions.updateStreak}
            itemFilter={itemFilter}
          />
        )}
        {mode === "quiz" && (
          <QuizMode
            section={section}
            allPhrases={sections.flatMap(s => s.phrases)}
            weights={store.learnedWeights}
            addXP={actions.addXP}
            updateStreak={actions.updateStreak}
            updateWeight={actions.updateWeight}
            updateQuizBestScore={actions.updateQuizBestScore}
            recordConfusion={actions.recordConfusion}
            recordQuestEvent={actions.recordQuestEvent}
            addAchievement={actions.addAchievement}
            onBack={onBack}
            onSwitchToSpeed={() => switchMode("speed")}
            onPracticeWrongAnswers={(ids) => switchMode("learn", ids)}
            resumeData={resumeData ?? undefined}
          />
        )}
        {mode === "speed" && (
          <SpeedRound
            sections={sections}
            weights={store.learnedWeights}
            blitzBest={store.stats.phraseBlitzBest}
            updateBlitzBest={actions.updateBlitzBest}
            addXP={actions.addXP}
            updateStreak={actions.updateStreak}
            recordQuestEvent={actions.recordQuestEvent}
            addAchievement={actions.addAchievement}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  )
}

// ─── Hub ────────────────────────────────────────────────────────────────────────

function TurtleToggle({ slow, onToggle }: { slow: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={slow ? "Turtle mode on — speech is slow" : "Turtle mode off — click to slow speech"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
        slow
          ? "bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-400"
          : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
      )}
    >
      <Turtle className="w-3.5 h-3.5" />
      Slow
    </button>
  )
}

export function PhraseGameHub({ sections }: { sections: PhraseSection[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const { store, isLoaded, xpCapReached, ...actions } = useSlovakStore()
  const { slow: turtleSlow, toggle: toggleTurtle } = useTurtleMode()
  
  const selected = selectedIdx !== null ? sections[selectedIdx] : null

  const onSelectByTitle = (title: string) => {
    const idx = sections.findIndex(s => s.title === title)
    if (idx !== -1) setSelectedIdx(idx)
  }

  if (!isLoaded) return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selected === null ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <MidnightWarning streakCount={store.streak.count} lastDate={store.streak.lastDate} />
            {xpCapReached && <XpCapBanner capAmount={store.stats.xpCapDaily} />}
            <StatsHeader store={store} />
            <DailyChallenge
              sections={sections}
              onSelectSituation={onSelectByTitle}
              learnedItems={store.learnedItems}
              dailyChallenge={store.dailyChallenge}
              onComplete={actions.completeDailyChallenge}
              onAddXP={actions.addXP}
            />
            <LearningPathPanel onNavigate={(type, title) => {
              if (type === "situations") {
                const idx = sections.findIndex(s => s.title === title)
                if (idx !== -1) setSelectedIdx(idx)
              }
            }} />
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-black italic text-xl uppercase tracking-tighter">Choose a Situation</h2>
              <div className="flex items-center gap-2">
                <TurtleToggle slow={turtleSlow} onToggle={toggleTurtle} />
                <MasteryDashboard />
              </div>
            </div>
            <SectionSelector sections={sections} onSelect={setSelectedIdx} store={store} />
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SectionView
              key={selectedIdx}
              section={selected}
              sections={sections}
              store={store}
              actions={actions}
              onBack={() => setSelectedIdx(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Backward-compatible single section wrapper
export function PhraseGame(props: PhraseSection) {
  return (
    <div className="my-8 rounded-[2.5rem] border-2 border-border bg-background p-8 shadow-sm">
      <PhraseGameHub sections={[props]} />
    </div>
  )
}
