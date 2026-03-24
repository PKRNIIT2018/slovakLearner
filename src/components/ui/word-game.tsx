"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import {
  CheckCircle, XCircle, RotateCcw, BookOpen, Zap,
  ArrowLeft, Volume2, Shuffle, Trophy, Target, Timer, Flame, ChevronDown, Turtle, Puzzle, Lightbulb,
} from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
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
import { WordSearch } from "@/components/ui/word-search"
import { MasteryDashboard } from "@/components/ui/mastery-dashboard"
import { LearningPathPanel } from "@/components/ui/learning-path-panel"
import { MatchGame } from "@/components/ui/match-game"
import { LearnMode } from "@/components/ui/learning/word/learn-mode"
import { WORD_CATEGORIES } from "@/data/slovak-words"
import type { Word, WordCategory } from "@/types/learning"

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = "en-sk" | "sk-en"
type Mode = "learn" | "quiz" | "speed" | "match"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Word Type Badge ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  noun:        { label: "noun",  color: "text-blue-500 bg-blue-500/10" },
  verb:        { label: "verb",  color: "text-green-500 bg-green-500/10" },
  adjective:   { label: "adj.",  color: "text-purple-500 bg-purple-500/10" },
  adverb:      { label: "adv.",  color: "text-amber-500 bg-amber-500/10" },
  expression:  { label: "expr.", color: "text-rose-500 bg-rose-500/10" },
  number:      { label: "num.",  color: "text-cyan-500 bg-cyan-500/10" },
  pronoun:     { label: "pron.", color: "text-violet-500 bg-violet-500/10" },
  preposition: { label: "prep.", color: "text-orange-500 bg-orange-500/10" },
}

function TypeBadge({ type }: { type?: Word["type"] }) {
  if (!type || !TYPE_CONFIG[type]) return null
  const { label, color } = TYPE_CONFIG[type]
  return (
    <span className={cn("inline-block text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md mt-1.5", color)}>
      {label}
    </span>
  )
}

// ─── SRS Box Dot ──────────────────────────────────────────────────────────────

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

function LinguisticBadges({ word }: { word: Word }) {
  const badges = []
  
  if (word.gender) {
    const gColor = word.gender === "masculine" ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30" : 
                   word.gender === "feminine" ? "text-pink-600 bg-pink-100 dark:bg-pink-900/30" : 
                   "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
    badges.push({ label: word.gender.substring(0, 3), color: gColor })
  }
  
  if (word.animacy) {
    badges.push({ label: word.animacy === "animate" ? "anim" : "inan", color: "text-slate-600 bg-slate-100 dark:bg-slate-800" })
  }
  
  if (word.aspect) {
    const aColor = word.aspect === "perfective" ? "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" : "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"
    badges.push({ label: word.aspect === "perfective" ? "pf" : "impf", color: aColor })
  }

  if (word.declension_pattern) {
    badges.push({ label: `mod: ${word.declension_pattern}`, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {badges.map((b, i) => (
        <span key={i} className={cn("text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded", b.color)}>
          {b.label}
        </span>
      ))}
    </div>
  )
}

// ─── Direction Toggle ─────────────────────────────────────────────────────────

function DirectionToggle({ direction, onChange }: { direction: Direction; onChange: (d: Direction) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">Practice:</span>
      <div className="flex p-1 bg-muted/50 rounded-xl border border-border/60">
        {(["en-sk", "sk-en"] as const).map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              direction === d ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {d === "en-sk" ? "EN → SK" : "SK → EN"}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({
  store, learnedCount, totalCount,
}: {
  store: SlovakStore
  learnedCount: number
  totalCount: number
}) {
  const pct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
  return (
    <div className="bg-card border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <XpBar xp={store.xp} />
      <div className="flex items-center gap-6">
        <StreakDisplay count={store.streak.count} lastDate={store.streak.lastDate} />
        <div className="flex items-center gap-3">
          <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold">{learnedCount}/{totalCount} words</span>
        </div>
      </div>
    </div>
  )
}

// ─── Animated Counter ──────────────────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    if (value === 0) return
    let current = 0
    const step = Math.max(1, Math.ceil(value / 60))
    const timer = setInterval(() => {
      current = Math.min(current + step, value)
      setDisplayed(current)
      if (current >= value) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{displayed}</>
}

function getPersonalizedMessage(pct: number): string {
  if (pct === 100) return "Perfect score! You know every word!"
  if (pct >= 90)  return "Outstanding! Nearly flawless!"
  if (pct >= 80)  return "Great work! Keep building on this!"
  if (pct >= 60)  return "Good effort! A little more practice will do it."
  return "Keep going — every attempt builds your vocabulary."
}

// ─── Floating XP Indicator ─────────────────────────────────────────────────────

let xpFloatId = 0
function useXpFloats() {
  const [floats, setFloats] = useState<{ id: number; amount: number }[]>([])
  const emit = useCallback((amount: number) => {
    const id = ++xpFloatId
    setFloats(prev => [...prev, { id, amount }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 950)
  }, [])
  return { floats, emit }
}

function XpFloats({ floats }: { floats: { id: number; amount: number }[] }) {
  return (
    <div className="relative pointer-events-none" aria-hidden>
      {floats.map(f => (
        <span
          key={f.id}
          className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-sm font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-xp-float z-50 select-none whitespace-nowrap"
        >
          +{f.amount} XP
        </span>
      ))}
    </div>
  )
}

// ─── Warmup Screen ─────────────────────────────────────────────────────────────

function WarmupScreen({
  mode, title, icon, itemCount, onStart, onBack,
}: {
  mode: Mode; title: string; icon?: string; itemCount: number
  onStart: () => void; onBack: () => void
}) {
  const started = useRef(false)
  const handleStart = useCallback(() => {
    if (started.current) return
    started.current = true
    onStart()
  }, [onStart])

  useEffect(() => {
    const timer = setTimeout(handleStart, 2000)
    return () => clearTimeout(timer)
  }, [handleStart])

  const approxMin = Math.max(1, Math.ceil(itemCount / 8))
  const info = mode === "quiz"
    ? { label: "Quiz", desc: "4-choice questions · +10 XP each" }
    : { label: "Speed Round", desc: "60 seconds · all categories · +5 XP each" }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto text-center py-8 space-y-6"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
        {icon ? <span className="text-4xl">{icon}</span> : (mode === "quiz" ? <Zap className="w-10 h-10 text-primary" /> : <Timer className="w-10 h-10 text-primary" />)}
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{info.label}</p>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium">
          {itemCount} words · ~{approxMin} min · {info.desc}
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </div>
        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Auto-starting…</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-11 rounded-2xl border-2 border-border font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          Start →
        </button>
      </div>
    </motion.div>
  )
}

// ─── Category Selector ────────────────────────────────────────────────────────

const LEVEL_GROUPS = [
  { key: "beginner"     as const, label: "Beginner",     badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { key: "intermediate" as const, label: "Intermediate", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { key: "advanced"     as const, label: "Advanced",     badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
]

function CategoryCard({
  cat, idx, learnedItems, onSelect,
}: {
  cat: WordCategory; idx: number; learnedItems: string[]; onSelect: (idx: number) => void
}) {
  const learned = cat.words.filter(w => learnedItems.includes(w.id ?? w.slovak)).length
  const mastered = learned === cat.words.length && cat.words.length > 0
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(idx)}
      className={cn(
        "group relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all duration-150 cursor-pointer overflow-hidden h-full",
        mastered
          ? "border-amber-400/40 bg-amber-400/[0.03] hover:bg-amber-400/[0.06]"
          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
      )}
    >
      <div className="absolute top-2 right-2">
        {mastered ? (
          <CheckCircle className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        ) : learned > 0 ? (
          <ProgressRing
            value={learned / cat.words.length}
            size={22}
            strokeWidth={3}
            label={`${learned}/${cat.words.length}`}
          />
        ) : null}
      </div>
      <span className="text-3xl leading-none mt-1">{cat.icon}</span>
      <span className="text-[10px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors mt-1">
        {cat.title}
      </span>
      <div className="w-full mt-auto pt-2 space-y-1">
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", mastered ? "bg-amber-400" : "bg-primary")}
            initial={{ width: 0 }}
            animate={{ width: `${cat.words.length > 0 ? (learned / cat.words.length) * 100 : 0}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          />
        </div>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
          {learned}/{cat.words.length}
        </span>
      </div>
    </motion.button>
  )
}

type WordLevelFilter = "all" | "beginner" | "intermediate" | "advanced"

function CategorySelector({
  categories, onSelect, learnedItems,
}: {
  categories: WordCategory[]
  onSelect: (idx: number) => void
  learnedItems: string[]
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [levelFilter, setLevelFilter] = useState<WordLevelFilter>("all")

  const toggleGroup = (key: string) =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  // "Continue where you left off" — in-progress categories (started but not mastered)
  const inProgress = categories
    .map((cat, idx) => ({ cat, idx }))
    .filter(({ cat }) => {
      const learned = cat.words.filter(w => learnedItems.includes(w.id ?? w.slovak)).length
      return learned > 0 && learned < cat.words.length
    })
    .slice(0, 2)

  const filtered = levelFilter === "all"
    ? categories
    : categories.filter(c => c.level === levelFilter)

  const groups = LEVEL_GROUPS.map(g => ({
    ...g,
    items: filtered.map(cat => ({ cat, idx: categories.indexOf(cat) })).filter(({ cat }) => cat.level === g.key),
  }))
  const ungrouped = filtered
    .filter(c => !c.level)
    .map(cat => ({ cat, idx: categories.indexOf(cat) }))

  const renderGrid = (items: { cat: WordCategory; idx: number }[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map(({ cat, idx }) => (
        <CategoryCard key={idx} cat={cat} idx={idx} learnedItems={learnedItems} onSelect={onSelect} />
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
            {inProgress.map(({ cat, idx }) => {
              const learned = cat.words.filter(w => learnedItems.includes(w.id ?? w.slovak)).length
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                >
                  <span>{cat.icon}</span>
                  <span className="text-[10px] font-bold">{cat.title}</span>
                  <span className="text-[9px] text-muted-foreground">{learned}/{cat.words.length}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Level filter buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", "beginner", "intermediate", "advanced"] as WordLevelFilter[]).map(f => (
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
        <div className="text-center py-12">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm font-bold text-foreground mb-1">No {levelFilter} categories yet</p>
          <p className="text-xs text-muted-foreground mb-4">Try a different level or browse everything.</p>
          <button
            onClick={() => setLevelFilter("all")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-sm hover:opacity-90 transition-opacity"
          >
            Show all categories
          </button>
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
                <span className="text-[9px] font-bold text-muted-foreground/50">{g.items.length} categories</span>
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

// ─── Flip Card ────────────────────────────────────────────────────────────────

function FlipCard({
  word, direction, isLearned, srsBox, onToggle, onShowPair, currentIndex, totalCards
}: {
  word: Word
  direction: Direction
  isLearned: boolean
  srsBox?: 1 | 2 | 3
  onToggle: () => void
  onShowPair?: (pairSlovak: string) => void
  currentIndex?: number
  totalCards?: number
}) {
  const [flipped, setFlipped] = useState(false)
  const speak = useSpeakSlovak()
  const reducedMotion = useReducedMotion()
  const front = direction === "en-sk" ? word.english : word.slovak
  const back  = direction === "en-sk" ? word.slovak  : word.english
  const backIsSlovak = direction === "en-sk"

  // Reset flipped state when direction changes
  const [prevDirection, setPrevDirection] = useState(direction)
  if (direction !== prevDirection) {
    setPrevDirection(direction)
    setFlipped(false)
  }

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: "1000px", height: "180px" }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.45, type: "spring", stiffness: 280, damping: 28 }}
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
          className={cn(
            "rounded-2xl border-2 p-5 flex flex-col justify-between transition-colors",
            isLearned ? "border-green-500/20 bg-green-500/[0.02]" : "border-border bg-card hover:border-primary/20"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">
                {direction === "en-sk" ? "English" : "Slovak"}
              </p>
              <p className="text-xl font-black text-foreground leading-tight">{front}</p>
              <TypeBadge type={word.type} />
            </div>
            <div className="flex items-center gap-1.5">
              <BoxDot box={srsBox} />
              {currentIndex !== undefined && totalCards !== undefined && (
                <span className="text-[10px] font-bold text-muted-foreground/30">
                  {currentIndex + 1}/{totalCards}
                </span>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tap to flip →</p>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
          className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-5 flex flex-col justify-between"
        >
          <div className="overflow-hidden">
            <p className="text-[8px] font-black uppercase tracking-widest text-primary/50 mb-1">
              {direction === "en-sk" ? "Slovak" : "English"}
            </p>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-black text-primary leading-tight truncate">{back}</p>
                {backIsSlovak && word.pronunciation && (
                  <p className="text-[10px] font-medium text-primary/60 mt-0.5 font-mono">{word.pronunciation}</p>
                )}
                <LinguisticBadges word={word} />
              </div>
              {backIsSlovak && (
                <button
                  onClick={(e) => { e.stopPropagation(); speak(word.slovak) }}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {word.aspect_pair && onShowPair && (
              <button
                onClick={(e) => { e.stopPropagation(); onShowPair(word.aspect_pair!) }}
                className="mt-2 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-all border border-indigo-200/50"
              >
                Show {word.aspect === "perfective" ? "impf" : "pf"} pair: {word.aspect_pair}
              </button>
            )}

            {word.slovak_example && (
              <div className="mt-3 pt-2 border-t border-primary/10">
                <p className="text-[9px] font-bold text-primary/70 italic leading-snug line-clamp-2">
                  &ldquo;{word.slovak_example}&rdquo;
                </p>
                <p className="text-[8px] text-muted-foreground mt-1 line-clamp-1 italic">
                  {word.english_example}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className={cn(
              "self-end flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl transition-all shadow-xs mt-2",
              isLearned
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
            )}
          >
            <CheckCircle className="w-3 h-3" />
            {isLearned ? "Learned" : "Got it!"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quiz Feedback Panel (Point 3: level-aware feedback) ─────────────────────

function QuizFeedbackPanel({
  correct,
  word,
  level,
  correctAnswer,
  wrongStreak = 0,
}: {
  correct: boolean
  word: Word
  level?: "beginner" | "intermediate" | "advanced"
  correctAnswer: string
  wrongStreak?: number
}) {
  if (correct) {
    // On correct: show example sentence if available (all levels)
    if (!word.english_example && !word.slovak_example) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs text-green-700 dark:text-green-300 leading-relaxed"
      >
        {word.slovak_example && <p className="font-semibold italic">&ldquo;{word.slovak_example}&rdquo;</p>}
        {word.english_example && <p className="text-green-600/70 dark:text-green-400/70 mt-0.5">{word.english_example}</p>}
      </motion.div>
    )
  }

  // Wrong answer feedback — depth varies by level
  const lines: React.ReactNode[] = []

  // Near-miss encouragement — shown when on a wrong-answer streak
  const encouragement =
    wrongStreak >= 3 ? "💪 You're building muscle memory — this one's tricky!"
    : wrongStreak >= 2 ? "🌟 Keep going — you're closer than you think!"
    : level === "beginner" ? "🌈 Every expert started right here. You've got this!"
    : null
  if (encouragement) {
    lines.push(
      <p key="enc" className="text-amber-600 dark:text-amber-400 font-semibold">{encouragement}</p>
    )
  }

  if (level === "beginner") {
    lines.push(
      <p key="msg" className="font-semibold">The correct answer is <span className="text-red-700 dark:text-red-300 font-black">{correctAnswer}</span>. Don&apos;t worry — it takes practice!</p>
    )
    if (word.pronunciation) {
      lines.push(<p key="pron" className="font-mono text-[11px] opacity-70">[{word.pronunciation}]</p>)
    }
  } else if (level === "intermediate") {
    lines.push(
      <p key="ans" className="font-semibold">Correct: <span className="font-black">{correctAnswer}</span></p>
    )
    const meta: string[] = []
    if (word.type)   meta.push(`Type: ${word.type}`)
    if (word.gender) meta.push(`Gender: ${word.gender}`)
    if (word.aspect) meta.push(`Aspect: ${word.aspect}`)
    if (meta.length) lines.push(<p key="meta" className="opacity-70 text-[11px]">{meta.join(" · ")}</p>)
    if (word.slovak_example) lines.push(
      <p key="ex" className="italic opacity-80 text-[11px]">&ldquo;{word.slovak_example}&rdquo;</p>
    )
  } else {
    // Advanced — full linguistic breakdown
    lines.push(
      <p key="ans" className="font-black">{correctAnswer}</p>
    )
    if (word.pronunciation) lines.push(<p key="pron" className="font-mono text-[11px] opacity-60">[{word.pronunciation}]</p>)
    const details: string[] = []
    if (word.type)               details.push(word.type)
    if (word.gender)             details.push(word.gender)
    if (word.animacy)            details.push(word.animacy)
    if (word.aspect)             details.push(word.aspect)
    if (word.declension_pattern) details.push(`decl: ${word.declension_pattern}`)
    if (word.aspect_pair)        details.push(`pair: ${word.aspect_pair}`)
    if (details.length) lines.push(<p key="det" className="text-[11px] opacity-70">{details.join(" · ")}</p>)
    if (word.slovak_example) {
      lines.push(
        <div key="ex" className="mt-1 pt-1 border-t border-red-500/10">
          <p className="italic text-[11px]">&ldquo;{word.slovak_example}&rdquo;</p>
          {word.english_example && <p className="text-[10px] opacity-60">{word.english_example}</p>}
        </div>
      )
    }
    if (word.memory_hook) lines.push(
      <p key="hook" className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">💡 {word.memory_hook}</p>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-xs text-red-700 dark:text-red-300 space-y-0.5"
    >
      {lines}
    </motion.div>
  )
}

// ─── Quiz Mode ────────────────────────────────────────────────────────────────

function QuizMode({
  category, allWords, weights, direction, addXP, updateStreak, updateWeight, updateQuizBestScore, recordConfusion, recordQuestEvent, addAchievement, onBack, onSwitchToSpeed, onPracticeWrongAnswers, resumeData,
}: {
  category: WordCategory
  allWords?: Word[]
  weights?: Record<string, import("@/hooks/use-slovak-store").LearnedWeight>
  direction: Direction
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
  const speak = useSpeakSlovak()
  const [recentCache, setRecentCache] = useState<string[]>([])
  const [shuffled, setShuffled] = useState(() =>
    buildReviewQueue(category.words, weights ?? {}, { maxSize: category.words.length, recentCache: [] })
  )
  const [currentIdx, setCurrentIdx] = useState(() =>
    resumeData ? Math.min(resumeData.currentIndex, category.words.length - 1) : 0
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(() =>
    resumeData ? resumeData.currentIndex - resumeData.wrongAnswers.length : 0
  )
  const [xpSession, setXpSession] = useState(() => resumeData?.xpEarnedThisSession ?? 0)
  const [combo, setCombo] = useState(0)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [shakeWrong, setShakeWrong] = useState(false)
  const [finished, setFinished] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ id: string; question: string; yourAnswer: string; correct: string }[]>(
    () => (resumeData?.wrongAnswers ?? []).map(w => ({ id: w.id ?? w.question, ...w }))
  )
  const { floats, emit: emitXp } = useXpFloats()
  const questionStartRef = useRef<number>(Date.now())

  const current = shuffled[currentIdx]
  const prompt        = direction === "en-sk" ? current?.english : current?.slovak
  const correctAnswer = direction === "en-sk" ? current?.slovak  : current?.english

  // Point 4: Varied card types — fill_blank when word has an example sentence
  const cardType: "standard" | "fill_blank" = useMemo(() => {
    if (
      direction === "en-sk" &&
      current?.slovak_example &&
      current?.english_example &&
      Math.random() < 0.3
    ) return "fill_blank"
    return "standard"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, runKey])

  const fillBlankPrompt = useMemo(() => {
    if (cardType !== "fill_blank" || !current?.slovak_example || !current?.slovak) return null
    const blanked = current.slovak_example.replace(
      new RegExp(`\\b${current.slovak}\\b`, "i"),
      "___"
    )
    // If no replacement happened, use the English example as context instead
    return blanked !== current.slovak_example ? blanked : null
  }, [cardType, current, currentIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => {
    if (!current) return []
    const getAns = (w: Word) => direction === "en-sk" ? w.slovak : w.english
    const pool = allWords ?? category.words
    const wrong = buildDistractors(current, pool, weights ?? {})
    return shuffleArray([current, ...wrong]).map(getAns)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, direction, runKey])

  const handleAnswer = (answer: string) => {
    if (selected) return
    setSelected(answer)

    const isMainCorrect = answer === correctAnswer
    const isSynonymCorrect = direction === "en-sk" && (current?.synonyms?.includes(answer) ?? false)
    const correct = (isMainCorrect || isSynonymCorrect) ?? false

    if (current && direction === "en-sk") speak(current.slovak)

    const timeMs = Date.now() - questionStartRef.current
    track({
      event: "quiz_answer",
      itemId: current?.id ?? current?.slovak ?? answer,
      correct,
      timeMs,
      difficulty: category.level ?? "beginner",
    })

    const currentId = current?.id ?? current?.slovak ?? answer
    updateWeight?.(currentId, correct)
    if (!correct) {
      const pool = allWords ?? category.words
      const chosenWord = pool.find(w => (direction === "en-sk" ? w.slovak : w.english) === answer)
      const chosenId = chosenWord?.id ?? answer
      recordConfusion?.(currentId, chosenId)
    }

    let earnedThisAnswer = 0
    let nextWrongAnswers = wrongAnswers
    if (correct) {
      setScore(s => s + 1)
      setWrongStreak(0)
      const newCombo = combo + 1
      setCombo(newCombo)
      const multiplier = newCombo >= 5 ? 1.5 : 1
      earnedThisAnswer = Math.round(calcXP(10, category.level) * multiplier)
      setXpSession(x => x + earnedThisAnswer)
      emitXp(earnedThisAnswer)
    } else {
      setCombo(0)
      setWrongStreak(s => s + 1)
      setShakeWrong(true)
      setTimeout(() => setShakeWrong(false), 450)
      const newEntry = {
        id: current?.id ?? current?.slovak ?? answer,
        question: prompt ?? "",
        yourAnswer: answer,
        correct: correctAnswer ?? "",
      }
      nextWrongAnswers = [...wrongAnswers, newEntry]
      setWrongAnswers(nextWrongAnswers)
    }

    setRecentCache(prev => [...prev, currentId].slice(-10))

    const nextXpSession = xpSession + earnedThisAnswer
    setTimeout(() => {
      const nextIdx = currentIdx + 1
      if (nextIdx >= shuffled.length) {
        clearCheckpoint()
        setFinished(true)
        addXP(nextXpSession)
        updateStreak()
        const finalScore = score + (correct ? 1 : 0)
        updateQuizBestScore?.(finalScore)
        recordQuestEvent?.("quiz_complete", 1)
        if (finalScore >= 10) addAchievement?.("quiz_king")
        // 🎉 Perfect score confetti
        if (finalScore === shuffled.length) {
          confetti({ particleCount: 160, spread: 70, colors: ["#FFD700", "#FFA500", "#FF6B35", "#fff"], origin: { y: 0.55 } })
        }
        track({
          event: "quiz_complete",
          sectionTitle: category.title,
          score: finalScore,
          total: shuffled.length,
          xpEarned: nextXpSession,
        })
      } else {
        writeCheckpoint({
          tab: "vocabulary",
          sectionTitle: category.title,
          currentIndex: nextIdx,
          wrongAnswers: nextWrongAnswers,
          xpEarnedThisSession: nextXpSession,
        })
        setCurrentIdx(nextIdx)
        setSelected(null)
        questionStartRef.current = Date.now()
      }
    }, 600)
  }

  const restart = () => {
    clearCheckpoint()
    setShuffled(buildReviewQueue(category.words, weights ?? {}, { maxSize: category.words.length, recentCache }))
    setCurrentIdx(0); setScore(0); setXpSession(0)
    setCombo(0); setWrongStreak(0); setShakeWrong(false); setSelected(null)
    setFinished(false); setRunKey(k => k + 1); setWrongAnswers([])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished || selected) return
      const idx = ["1", "2", "3", "4"].indexOf(e.key)
      if (idx !== -1 && options[idx] !== undefined) handleAnswer(options[idx])
      if (e.key === "Escape") {
        track({ event: "section_abandoned", sectionTitle: category.title, atIndex: currentIdx, total: shuffled.length })
        onBack()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, selected, options])

  if (category.words.length < 4) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm font-medium">
        This category needs at least 4 words for a quiz.
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((score / shuffled.length) * 100)
    const isPass = pct >= 80
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-card border-2 rounded-[2.5rem] p-10 text-center shadow-xl space-y-6"
      >
        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto", isPass ? "bg-green-500/10" : "bg-amber-500/10")}>
          {isPass ? <Trophy className="w-10 h-10 text-green-600" /> : <Target className="w-10 h-10 text-amber-600" />}
        </div>
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">
            {pct === 100 ? "Perfect!" : isPass ? "Excellent!" : pct >= 60 ? "Good Effort!" : "Keep Practicing!"}
          </h3>
          <p className="text-muted-foreground font-medium mt-1">{getPersonalizedMessage(pct)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-3xl border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</p>
            <p className="text-2xl font-black italic">{score}/{shuffled.length}</p>
            <p className="text-[10px] font-bold text-primary">{pct}%</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">XP Gained</p>
            <p className="text-2xl font-black italic text-primary">+<AnimatedCounter value={xpSession} /></p>
          </div>
        </div>
        {wrongAnswers.length > 0 && (
          <div className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Review Mistakes · {wrongAnswers.length}
              </p>
              {onPracticeWrongAnswers && (
                <button
                  onClick={() => onPracticeWrongAnswers(wrongAnswers.map(w => w.id).filter(Boolean))}
                  className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Practice these {wrongAnswers.length} again →
                </button>
              )}
            </div>
            <div className="divide-y divide-border rounded-2xl border overflow-hidden max-h-44 overflow-y-auto">
              {wrongAnswers.map((w, i) => (
                <div key={i} className="px-4 py-2.5 bg-card">
                  <p className="text-[10px] font-medium text-muted-foreground">{w.question}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-bold flex-wrap">
                    <span className="text-red-500 line-through">{w.yourAnswer}</span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="text-green-600 dark:text-green-400">{w.correct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={restart} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
            <div className="flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Retry</div>
          </button>
          {onSwitchToSpeed && (
            <button
              onClick={onSwitchToSpeed}
              className="w-full h-10 rounded-2xl border-2 border-primary/30 text-primary font-black text-sm tracking-wide hover:bg-primary/5 transition-all"
            >
              Speed challenge →
            </button>
          )}
          <button onClick={onBack} className="w-full h-10 rounded-2xl border-2 font-bold text-sm text-muted-foreground hover:bg-muted transition-all">All Categories</button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Word <span className="text-foreground">{currentIdx + 1}</span> of {shuffled.length}
        </span>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {combo >= 3 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                animate={combo >= 10
                  ? { scale: [1, 1.25, 1], opacity: 1, rotate: [0, 4, -4, 0] }
                  : { scale: 1, opacity: 1, rotate: 0 }
                }
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "flex items-center gap-1 font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                  combo >= 10
                    ? "text-[11px] text-white bg-gradient-to-r from-red-500 to-orange-500 border-red-400 shadow-lg shadow-red-500/30"
                    : combo >= 5
                    ? "text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm"
                    : "text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"
                )}
              >
                <Flame className={cn("fill-current", combo >= 10 ? "w-3.5 h-3.5" : "w-3 h-3")} />
                {combo >= 10 ? `${combo}× INCREDIBLE!` : combo >= 5 ? `${combo}× 1.5× XP!` : `${combo}× Combo`}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Screen edge glow at 10× combo */}
          {combo >= 10 && (
            <div
              className="pointer-events-none fixed inset-0 z-10"
              style={{ boxShadow: "inset 0 0 80px rgba(249,115,22,0.25)" }}
            />
          )}
          <div className="relative">
            <span className="text-sm font-black italic text-primary">+{xpSession} XP</span>
            <XpFloats floats={floats} />
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentIdx / shuffled.length) * 100}%` }} />
      </div>

      <div className="rounded-[2.5rem] border-2 border-border bg-card p-10 text-center space-y-2 shadow-xs">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          {cardType === "fill_blank"
            ? "Fill in the blank"
            : direction === "en-sk" ? "Translate to Slovak" : "What does this mean?"}
        </p>
        {cardType === "fill_blank" && fillBlankPrompt ? (
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tight leading-tight">{fillBlankPrompt}</p>
            <p className="text-xs text-muted-foreground italic">{current?.english_example}</p>
          </div>
        ) : (
          <p className="text-4xl font-black tracking-tight">{prompt}</p>
        )}
        <TypeBadge type={current?.type} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isMainCorrect = opt === correctAnswer
          const isSynonymCorrect = direction === "en-sk" && current?.synonyms?.includes(opt)
          const isCorrect = isMainCorrect || isSynonymCorrect
          const isSelected = selected === opt
          
          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={`${runKey}-${i}`}
              disabled={!!selected}
              onClick={() => handleAnswer(opt)}
              className={cn(
                "w-full text-left px-6 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200",
                !selected && "bg-card border-border hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer",
                selected && isCorrect && "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 scale-[1.02]",
                selected && isSelected && !isCorrect && cn("bg-red-500/10 border-red-500 text-red-700 dark:text-red-300", shakeWrong && "animate-shake"),
                selected && !isCorrect && !isSelected && "opacity-35 grayscale"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[9px] font-black",
                    selected && isCorrect && (isSelected || isMainCorrect) ? "bg-green-500 border-green-500 text-white" :
                    selected && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" : "border-border text-muted-foreground/40"
                  )}>
                    {selected && isCorrect && (isSelected || isMainCorrect) && <CheckCircle className="w-3.5 h-3.5" />}
                    {selected && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5" />}
                    {!selected && (i + 1)}
                  </div>
                  <span className="flex-1">{opt}</span>
                </div>
                {selected && isSynonymCorrect && isSelected && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded italic">
                    Synonym
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
      {/* Point 3: Level-aware feedback panel */}
      <AnimatePresence>
        {selected && current && (
          <QuizFeedbackPanel
            correct={selected === correctAnswer || (direction === "en-sk" && (current.synonyms?.includes(selected) ?? false))}
            word={current}
            level={category.level}
            correctAnswer={correctAnswer ?? ""}
            wrongStreak={wrongStreak}
          />
        )}
      </AnimatePresence>

      <p className="hidden md:block text-center text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
        [1] [2] [3] [4] to select · [Esc] back
      </p>
    </div>
  )
}

// ─── Speed Mode ───────────────────────────────────────────────────────────────

function SpeedMode({
  categories, weights, blitzBest, updateBlitzBest, direction, addXP, updateStreak, recordQuestEvent, addAchievement, onBack,
}: {
  categories: WordCategory[]
  weights: Record<string, import("@/hooks/use-slovak-store").LearnedWeight>
  blitzBest: number
  updateBlitzBest: (tab: "phrases" | "words", score: number) => void
  direction: Direction
  addXP: (n: number) => void
  updateStreak: () => void
  recordQuestEvent?: (type: "quiz_complete" | "speed_streak", value: number) => void
  addAchievement?: (id: string) => void
  onBack: () => void
}) {
  const speak = useSpeakSlovak()
  const allWords = useMemo(() => categories.flatMap(c => c.words), [categories])
  const [words, setWords] = useState<Word[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [runKey, setRunKey] = useState(0)

  const start = () => {
    setWords(buildSessionPool(allWords, weights))
    setCurrentIdx(0); setScore(0); setTimeLeft(60)
    setIsActive(true); setFinished(false); setSelected(null)
    setIsNewBest(false); setRunKey(k => k + 1)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false); setFinished(true)
      addXP(score * 5); updateStreak()
      const newBest = score > blitzBest
      if (newBest) {
        setIsNewBest(true)
        updateBlitzBest("words", score)
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } })
      }
      track({ event: "speed_complete", tab: "words", score, personalBest: newBest })
      recordQuestEvent?.("speed_streak", score)
      if (score >= 15) addAchievement?.("speed_demon")
    }
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft, score, addXP, updateStreak, blitzBest, updateBlitzBest, recordQuestEvent])

  const current = words[currentIdx]
  const options = useMemo(() => {
    if (!current) return []
    const getAns = (w: Word) => direction === "en-sk" ? w.slovak : w.english
    const wrong = buildDistractors(current, allWords, weights)
    return shuffleArray([current, ...wrong]).map(getAns)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, direction, runKey])

  const handleAnswer = (answer: string) => {
    if (selected || !isActive || !current) return
    const correctAnswer = direction === "en-sk" ? current.slovak : current.english
    setSelected(answer)
    if (direction === "en-sk") speak(current.slovak)
    if (answer === correctAnswer) setScore(s => s + 1)
    setTimeout(() => { setCurrentIdx(i => i + 1); setSelected(null) }, 350)
  }

  if (!isActive && !finished) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
          <Timer className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Word Blitz</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Answer as many words as you can in 60 seconds. Pulls from all categories!
        </p>
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
            <p className="text-2xl font-black italic text-primary">+<AnimatedCounter value={xpEarned} /></p>
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
          <button onClick={onBack} className="w-full h-10 rounded-2xl border-2 font-bold text-sm text-muted-foreground hover:bg-muted transition-all">All Categories</button>
        </div>
      </motion.div>
    )
  }

  const correctAnswer = direction === "en-sk" ? current?.slovak : current?.english
  return (
    <div className="relative max-w-xl mx-auto space-y-6">
      {/* Urgency vignette — appears at ≤5s */}
      {timeLeft <= 5 && (
        <div
          className="pointer-events-none fixed inset-0 z-10 animate-vignette-pulse"
          style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(239,68,68,0.18) 100%)" }}
        />
      )}
      <div className="flex items-center justify-between font-black italic">
        <div className={cn(
          "flex items-center gap-2 text-xl",
          timeLeft > 10 ? "text-primary" : "text-red-500",
          timeLeft <= 10 && timeLeft > 5 && "animate-pulse",
          timeLeft <= 5 && "animate-heartbeat"
        )}>
          <Timer className="w-5 h-5" /> {timeLeft}s
        </div>
        <div className="text-xl">Score: {score}</div>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
        <motion.div
          className={cn(
            "h-full transition-colors duration-500",
            timeLeft > 20 ? "bg-green-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 60, ease: "linear" }}
        />
      </div>
      <div className="rounded-[2.5rem] border-2 border-border bg-card p-10 text-center shadow-xs space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          {direction === "en-sk" ? "Translate to Slovak" : "What does this mean?"}
        </p>
        <p className="text-4xl font-black tracking-tight">
          {direction === "en-sk" ? current?.english : current?.slovak}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrect  = opt === correctAnswer
          const isSelected = selected === opt
          return (
            <button
              key={`${runKey}-${i}`}
              disabled={!!selected}
              onClick={() => handleAnswer(opt)}
              className={cn(
                "w-full text-left px-6 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-100",
                !selected && "bg-card border-border hover:border-primary/50 cursor-pointer",
                selected && isCorrect && "bg-green-500 border-green-500 text-white",
                selected && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white",
                selected && !isCorrect && !isSelected && "opacity-35"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const WORD_MODES = [
  { id: "learn" as Mode, icon: BookOpen, label: "Learn", desc: "Flip cards at your own pace" },
  { id: "quiz"  as Mode, icon: Zap,      label: "Quiz",  desc: "4-choice questions · +10 XP each" },
  { id: "speed" as Mode, icon: Timer,    label: "Speed", desc: "60 seconds · all content · +5 XP each" },
  { id: "match" as Mode, icon: Puzzle,   label: "Match", desc: "Pair EN ↔ SK in 60s · +2 XP each" },
]

// ─── Resume Banner ────────────────────────────────────────────────────────────

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

// ─── Category View ────────────────────────────────────────────────────────────

function CategoryView({
  category, categories, direction, onBack, store, actions,
}: {
  category: WordCategory
  categories: WordCategory[]
  direction: Direction
  onBack: () => void
  store: ReturnType<typeof useSlovakStore>["store"]
  actions: {
    markItemLearned: (id: string) => void
    unmarkItemLearned: (id: string) => void
    addXP: (n: number) => void
    updateStreak: () => void
    updateBlitzBest: (tab: "phrases" | "words", score: number) => void
    updateQuizBestScore: (score: number) => void
    updateWeight: (id: string, correct: boolean) => void
    recordConfusion: (correctId: string, chosenId: string) => void
    recordQuestEvent?: (type: "quiz_complete" | "speed_streak", value: number) => void
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
    if (cp && cp.tab === "vocabulary" && cp.sectionTitle === category.title) {
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
    if (m === "learn" || m === "match") {
      switchMode(m)
    } else {
      setPendingMode(m)
    }
  }

  // Pre-session warmup screen
  if (pendingMode) {
    const totalWords = pendingMode === "speed"
      ? categories.reduce((n, c) => n + c.words.length, 0)
      : category.words.length
    return (
      <div className="space-y-6">
        <button
          onClick={() => setPendingMode(null)}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All categories
        </button>
        <WarmupScreen
          mode={pendingMode}
          title={pendingMode === "speed" ? "Word Blitz" : category.title}
          icon={pendingMode === "speed" ? "⚡" : category.icon}
          itemCount={totalWords}
          onStart={() => { clearCheckpoint(); setResumeData(null); switchMode(pendingMode); setPendingMode(null) }}
          onBack={() => setPendingMode(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All categories
        </button>
        <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/60">
          {WORD_MODES.map(m => {
            const disabled =
              (m.id === "quiz"  && category.words.length < 4) ||
              (m.id === "match" && category.words.length < 5)
            const disabledTitle =
              m.id === "quiz"  ? `Quiz requires at least 4 words. This category has ${category.words.length}.`
              : m.id === "match" ? `Match requires at least 5 words. This category has ${category.words.length}.`
              : undefined
            return (
              <button
                key={m.id}
                onClick={() => !disabled && handleModeClick(m.id)}
                disabled={disabled}
                title={disabled ? disabledTitle : undefined}
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
                  {disabled ? (m.id === "match" ? "Need 5+" : "Need 4+") : m.desc}
                </span>
                {disabled && (
                  <span className="sr-only">{disabledTitle}</span>
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
          total={category.words.length}
          onResume={handleResume}
          onStartOver={handleDismissResume}
        />
      )}

      <div className="flex items-center gap-4 py-4 px-6 border-2 border-border/50 rounded-[2rem] bg-card/50">
        {category.icon && <span className="text-4xl leading-none">{category.icon}</span>}
        <div className="flex-1 min-w-0">
          <h2 className="font-black italic text-xl uppercase tracking-tighter leading-tight">{category.title}</h2>
          <p className="text-xs text-muted-foreground opacity-70 truncate">{category.description}</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0">
          {category.words.length} words
        </span>
      </div>

      <div key={`${mode}-${modeKey}`}>
        {mode === "learn" && (
          <LearnMode
            category={category} direction={direction} learnedItems={store.learnedItems}
            markItemLearned={actions.markItemLearned} unmarkItemLearned={actions.unmarkItemLearned}
            addXP={actions.addXP} updateStreak={actions.updateStreak}
            itemFilter={itemFilter}
            learnedWeights={store.learnedWeights}
          />
        )}
        {mode === "quiz" && (
          <QuizMode
            category={category}
            allWords={categories.flatMap(c => c.words)}
            weights={store.learnedWeights}
            direction={direction}
            addXP={actions.addXP} updateStreak={actions.updateStreak}
            updateWeight={actions.updateWeight}
            updateQuizBestScore={actions.updateQuizBestScore}
            recordConfusion={actions.recordConfusion}
            recordQuestEvent={actions.recordQuestEvent}
            addAchievement={actions.addAchievement}
            onBack={onBack} onSwitchToSpeed={() => switchMode("speed")}
            onPracticeWrongAnswers={(ids) => switchMode("learn", ids)}
            resumeData={resumeData ?? undefined}
          />
        )}
        {mode === "speed" && (
          <SpeedMode
            categories={categories}
            weights={store.learnedWeights}
            blitzBest={store.stats.wordBlitzBest}
            updateBlitzBest={actions.updateBlitzBest}
            direction={direction}
            addXP={actions.addXP} updateStreak={actions.updateStreak}
            recordQuestEvent={actions.recordQuestEvent}
            addAchievement={actions.addAchievement}
            onBack={onBack}
          />
        )}
        {mode === "match" && (
          <MatchGame
            category={category}
            addXP={actions.addXP}
            onBack={() => switchMode("learn")}
          />
        )}
      </div>
    </div>
  )
}

// ─── Hub (public export) ──────────────────────────────────────────────────────

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

export function WordGameHub({ categories: propCategories }: { categories?: WordCategory[] }) {
  const categories = propCategories ?? WORD_CATEGORIES
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [direction, setDirection] = useState<Direction>("en-sk")
  const { store, isLoaded, xpCapReached, ...actions } = useSlovakStore()
  const { slow: turtleSlow, toggle: toggleTurtle } = useTurtleMode()

  const totalWords   = categories.reduce((n, c) => n + c.words.length, 0)
  const learnedCount = categories.reduce(
    (n, c) => n + c.words.filter(w => store.learnedItems.includes(w.id ?? w.slovak)).length, 0
  )

  if (!isLoaded) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selected = selectedIdx !== null ? categories[selectedIdx] : null

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selected === null ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <MidnightWarning streakCount={store.streak.count} lastDate={store.streak.lastDate} />
            {xpCapReached && <XpCapBanner capAmount={store.stats.xpCapDaily} />}
            <StatsBar store={store} learnedCount={learnedCount} totalCount={totalWords} />
            <LearningPathPanel onNavigate={(type, title) => {
              if (type === "vocabulary") {
                const idx = categories.findIndex(c => c.title === title)
                if (idx !== -1) setSelectedIdx(idx)
              }
            }} />
            <WordSearch categories={categories} onSelectCategory={setSelectedIdx} />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-black italic text-xl uppercase tracking-tighter">Choose a Category</h2>
              <div className="flex items-center gap-2">
                <TurtleToggle slow={turtleSlow} onToggle={toggleTurtle} />
                <MasteryDashboard />
                <DirectionToggle direction={direction} onChange={setDirection} />
              </div>
            </div>
            <CategorySelector
              categories={categories}
              onSelect={setSelectedIdx}
              learnedItems={store.learnedItems}
            />
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          >
            <CategoryView
              category={selected}
              categories={categories}
              direction={direction}
              onBack={() => setSelectedIdx(null)}
              store={store}
              actions={actions}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
