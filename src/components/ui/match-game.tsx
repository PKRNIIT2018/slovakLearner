"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Trophy, RotateCcw, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { calcXP } from "@/lib/xp"
import type { Word, WordCategory } from "@/types/learning"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchCard {
  id: string
  content: string
  language: "en" | "sk"
  pairId: string
  matched: boolean
  flipped: boolean
}

type GamePhase = "playing" | "success" | "timeout"

const ROUND_SIZE = 5     // 5 pairs = 10 cards
const FLIP_BACK_MS = 800
const TIMER_SECONDS = 60
const SPEED_BONUS_SECONDS = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sampleWords(words: Word[], n: number): Word[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function buildCards(words: Word[]): MatchCard[] {
  const cards: MatchCard[] = []
  for (const word of words) {
    const pairId = word.id ?? word.slovak
    cards.push({ id: `en-${pairId}`, content: word.english, language: "en", pairId, matched: false, flipped: false })
    cards.push({ id: `sk-${pairId}`, content: word.slovak,  language: "sk", pairId, matched: false, flipped: false })
  }
  return cards.sort(() => Math.random() - 0.5)
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

// ─── Card Component ───────────────────────────────────────────────────────────

function MatchCardTile({
  card,
  isSelected,
  onClick,
}: {
  card: MatchCard
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={card.matched || card.flipped}
      className={cn(
        "relative h-16 md:h-20 rounded-2xl border-2 font-bold text-sm transition-colors select-none",
        "flex items-center justify-center text-center px-2 leading-tight",
        card.matched
          ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
          : isSelected
          ? "border-primary bg-primary/10 text-primary"
          : card.flipped
          ? "border-primary/50 bg-primary/5 text-foreground"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground cursor-pointer"
      )}
      initial={{ scale: 1 }}
      animate={isSelected ? { scale: 1.04 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      {card.matched && (
        <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-green-500 opacity-70" />
      )}
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest absolute top-1.5 left-2",
        card.language === "en" ? "text-blue-500/60" : "text-emerald-500/60"
      )}>
        {card.language === "en" ? "EN" : "SK"}
      </span>
      <span className="mt-3 break-words hyphens-auto">{card.content}</span>
    </motion.button>
  )
}

// ─── Timer Ring ───────────────────────────────────────────────────────────────

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const urgent = seconds <= 10
  const critical = seconds <= 5

  return (
    <div className={cn(
      "relative flex items-center justify-center w-14 h-14",
      urgent && !critical && "animate-pulse",
      critical && "animate-heartbeat"
    )}>
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="3"
          className="text-border" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          className={urgent ? "text-red-500" : "text-primary"}
          style={{ transition: "stroke-dasharray 1s linear" }}
        />
      </svg>
      <span className={cn("text-sm font-black tabular-nums", urgent && "text-red-500")}>
        {formatTime(seconds)}
      </span>
    </div>
  )
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({
  phase,
  matchCount,
  xpEarned,
  timeLeft,
  onRetry,
  onBack,
}: {
  phase: GamePhase
  matchCount: number
  xpEarned: number
  timeLeft: number
  onRetry: () => void
  onBack: () => void
}) {
  const won = phase === "success"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center text-4xl",
        won ? "bg-green-500/10" : "bg-red-500/10"
      )}>
        {won ? "🎉" : "⏰"}
      </div>
      <div>
        <h2 className="text-2xl font-black">{won ? "Match Master!" : "Time's Up!"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {won
            ? timeLeft >= TIMER_SECONDS - SPEED_BONUS_SECONDS
              ? "Lightning fast! Speed bonus earned."
              : "All pairs matched!"
            : `${matchCount} pair${matchCount !== 1 ? "s" : ""} matched`}
        </p>
      </div>

      <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-lg font-black text-primary">+{xpEarned} XP</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-black"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </motion.div>
  )
}

// ─── Match Game ───────────────────────────────────────────────────────────────

export function MatchGame({
  category,
  addXP,
  onBack,
}: {
  category: WordCategory
  addXP: (n: number) => void
  onBack: () => void
}) {
  const words = category.words
  const level = category.level

  const [cards, setCards] = useState<MatchCard[]>(() => buildCards(sampleWords(words, ROUND_SIZE)))
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [phase, setPhase] = useState<GamePhase>("playing")
  const [xpEarned, setXpEarned] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false) // prevent clicks during flip-back

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  // Record start time on mount (useRef initializer cannot call Date.now() — impure)
  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (phase !== "playing") return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase("timeout")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [phase])

  const handleCardClick = useCallback((cardId: string) => {
    if (isLocked || phase !== "playing") return

    setCards(prev => {
      const card = prev.find(c => c.id === cardId)
      if (!card || card.matched || card.flipped) return prev
      return prev.map(c => c.id === cardId ? { ...c, flipped: true } : c)
    })

    if (!selected) {
      setSelected(cardId)
      return
    }

    // Second card clicked
    const first = cards.find(c => c.id === selected)
    const second = cards.find(c => c.id === cardId)

    if (!first || !second || first.id === second.id) {
      setSelected(null)
      return
    }

    if (first.pairId === second.pairId) {
      // Match!
      const baseXP = calcXP(2, level)
      setCards(prev => prev.map(c =>
        c.id === first.id || c.id === second.id
          ? { ...c, matched: true, flipped: false }
          : c
      ))
      setMatchCount(m => {
        const newCount = m + 1
        const totalPairs = Math.min(words.length, ROUND_SIZE)
        let earned = baseXP

        // Speed bonus if all cleared with enough time remaining
        if (newCount === totalPairs) {
          clearInterval(timerRef.current!)
          const elapsed = (Date.now() - startTimeRef.current) / 1000
          if (elapsed < SPEED_BONUS_SECONDS) {
            earned += calcXP(10, level)
          }
          setXpEarned(x => {
            const total = x + earned
            addXP(total)
            return total
          })
          setPhase("success")
        } else {
          setXpEarned(x => x + earned)
          addXP(earned)
        }
        return newCount
      })
      setSelected(null)
    } else {
      // Mismatch — flip both back after delay
      setIsLocked(true)
      setSelected(null)
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === first.id || c.id === second.id
            ? { ...c, flipped: false }
            : c
        ))
        setIsLocked(false)
      }, FLIP_BACK_MS)
    }
  }, [isLocked, phase, selected, cards, level, words.length, addXP])

  const handleRetry = () => {
    clearInterval(timerRef.current!)
    startTimeRef.current = Date.now()
    setCards(buildCards(sampleWords(words, ROUND_SIZE)))
    setSelected(null)
    setTimeLeft(TIMER_SECONDS)
    setPhase("playing")
    setXpEarned(0)
    setMatchCount(0)
    setIsLocked(false)
  }

  if (phase !== "playing") {
    return (
      <ResultScreen
        phase={phase}
        matchCount={matchCount}
        xpEarned={xpEarned}
        timeLeft={timeLeft}
        onRetry={handleRetry}
        onBack={onBack}
      />
    )
  }

  const totalPairs = Math.min(words.length, ROUND_SIZE)

  return (
    <div className="relative space-y-4">
      {/* Urgency vignette — appears at ≤5s */}
      {timeLeft <= 5 && (
        <div
          className="pointer-events-none fixed inset-0 z-10 animate-vignette-pulse"
          style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(239,68,68,0.18) 100%)" }}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Match the pairs
          </p>
          <p className="text-xs text-muted-foreground">
            {matchCount}/{totalPairs} pairs matched · +{xpEarned} XP
          </p>
        </div>
        <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(matchCount / totalPairs) * 100}%` }}
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <AnimatePresence>
          {cards.map(card => (
            <MatchCardTile
              key={card.id}
              card={card}
              isSelected={selected === card.id}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Mismatch hint */}
      {isLocked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-red-500 font-bold"
        >
          <XCircle className="inline w-3.5 h-3.5 mr-1" />
          Not a match — try again
        </motion.p>
      )}
    </div>
  )
}
