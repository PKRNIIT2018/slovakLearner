"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, ChevronRight, RotateCcw, MessageSquare, Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeakSlovak } from "@/hooks/use-speak-slovak"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import { CONVERSATION_SCENARIOS } from "@/data/slovak-conversations"
import type { ConversationScenario, ConversationTurn } from "@/types/learning"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userAttemptMatches(attempt: string, turn: ConversationTurn): boolean {
  if (!turn.accept_keywords?.length) return true
  const lower = attempt.toLowerCase()
  return turn.accept_keywords.some(kw => lower.includes(kw.toLowerCase()))
}

// ─── Turn Bubble ──────────────────────────────────────────────────────────────

function ThemBubble({ turn, revealed }: { turn: ConversationTurn; revealed: boolean }) {
  const speak = useSpeakSlovak()
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="space-y-1 max-w-sm">
        {revealed ? (
          <>
            <div
              className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => turn.slovak && speak(turn.slovak)}
              title="Click to hear"
            >
              <p className="text-sm font-semibold">{turn.slovak}</p>
            </div>
            <p className="text-[11px] text-muted-foreground px-1">{turn.english}</p>
          </>
        ) : (
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function YouBubble({
  turn,
  attempt,
  revealed,
}: {
  turn: ConversationTurn
  attempt: string | null
  revealed: boolean
}) {
  const matched = attempt ? userAttemptMatches(attempt, turn) : false
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-black text-primary">You</span>
      </div>
      <div className="space-y-1 max-w-sm items-end flex flex-col">
        {attempt && (
          <div className={cn(
            "rounded-2xl rounded-tr-sm px-4 py-3",
            matched ? "bg-primary text-primary-foreground" : "bg-red-500/10 border border-red-500/30"
          )}>
            <p className="text-sm font-semibold">{attempt}</p>
          </div>
        )}
        {revealed && turn.suggested && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl rounded-tr-sm px-4 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700 dark:text-green-400 mb-0.5">
              {attempt ? (matched ? "✓ Good!" : "Try this instead:") : "Model answer:"}
            </p>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{turn.suggested}</p>
            <p className="text-[10px] text-green-700/70 dark:text-green-400/70 mt-0.5">{turn.english}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Input Row ────────────────────────────────────────────────────────────────

function YouInputRow({
  turn,
  onSubmit,
  onSkip,
}: {
  turn: ConversationTurn
  onSubmit: (val: string) => void
  onSkip: () => void
}) {
  const [val, setVal] = useState("")
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Your turn</p>
        <p className="text-sm text-foreground font-medium">{turn.prompt}</p>
        {turn.suggested && (
          <p className="text-[11px] text-muted-foreground italic">Hint: try saying "{turn.suggested}"</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) onSubmit(val.trim()) }}
          placeholder="Type in Slovak (or English)…"
          className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          autoFocus
        />
        <button
          onClick={() => val.trim() && onSubmit(val.trim())}
          disabled={!val.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={onSkip}
        className="text-[10px] font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        Show model answer →
      </button>
    </div>
  )
}

// ─── Cultural Note ────────────────────────────────────────────────────────────

function CulturalNote({ note }: { note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
    >
      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{note}</p>
    </motion.div>
  )
}

// ─── Scenario Player ──────────────────────────────────────────────────────────

function ScenarioPlayer({ scenario, onBack }: { scenario: ConversationScenario; onBack: () => void }) {
  const { addXP } = useSlovakStore()
  const [turnIndex, setTurnIndex] = useState(0)
  const [attempts, setAttempts] = useState<Record<number, string | null>>({})
  const [revealedTurns, setRevealedTurns] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)
  const [noteQueue, setNoteQueue] = useState<string[]>([])

  const revealTurn = (idx: number) => setRevealedTurns(prev => new Set([...prev, idx]))

  const advance = (fromIdx: number, attempt?: string) => {
    const turn = scenario.turns[fromIdx]
    if (attempt !== undefined) setAttempts(prev => ({ ...prev, [fromIdx]: attempt }))
    revealTurn(fromIdx)

    if (turn.cultural_note) {
      setNoteQueue(prev => [...prev, turn.cultural_note!])
    }

    const next = fromIdx + 1
    if (next >= scenario.turns.length) {
      addXP(15)
      setDone(true)
      return
    }

    // Auto-reveal "them" turns after a short delay
    const nextTurn = scenario.turns[next]
    setTurnIndex(next)
    if (nextTurn.speaker === "them") {
      setTimeout(() => {
        revealTurn(next)
        setTimeout(() => advance(next), 800)
      }, 500)
    }
  }

  // Auto-start: reveal first "them" turns on mount
  useEffect(() => {
    if (scenario.turns[0].speaker === "them") {
      const t1 = setTimeout(() => {
        revealTurn(0)
        const t2 = setTimeout(() => advance(0), 600)
        return () => clearTimeout(t2)
      }, 400)
      return () => clearTimeout(t1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleTurns = scenario.turns.slice(0, turnIndex + 1)

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center py-8 space-y-5"
      >
        <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Conversation Complete!</h3>
          <p className="text-sm text-muted-foreground">+15 XP earned</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setTurnIndex(0)
              setAttempts({})
              setRevealedTurns(new Set())
              setDone(false)
              setNoteQueue([])
              // restart auto-advance
              if (scenario.turns[0].speaker === "them") {
                setTimeout(() => { revealTurn(0); setTimeout(() => advance(0), 600) }, 400)
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-muted transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  const currentTurn = scenario.turns[turnIndex]
  const isWaitingForYou = currentTurn?.speaker === "you" && !revealedTurns.has(turnIndex)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </button>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(turnIndex / scenario.turns.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{turnIndex}/{scenario.turns.length}</span>
      </div>

      {/* Context */}
      <div className="rounded-2xl border bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Scene</p>
        <p className="text-sm text-foreground">{scenario.context}</p>
      </div>

      {/* Conversation */}
      <div className="space-y-4">
        {visibleTurns.map((turn, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {turn.speaker === "them" ? (
              <ThemBubble turn={turn} revealed={revealedTurns.has(idx)} />
            ) : (
              <YouBubble
                turn={turn}
                attempt={attempts[idx] ?? null}
                revealed={revealedTurns.has(idx)}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Cultural notes */}
      <AnimatePresence>
        {noteQueue.map((note, i) => (
          <CulturalNote key={i} note={note} />
        ))}
      </AnimatePresence>

      {/* Input for "you" turns */}
      {isWaitingForYou && currentTurn.prompt && (
        <YouInputRow
          turn={currentTurn}
          onSubmit={(val) => advance(turnIndex, val)}
          onSkip={() => advance(turnIndex, undefined)}
        />
      )}
    </div>
  )
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

const LEVEL_STYLE = {
  beginner:     "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  advanced:     "text-rose-600 bg-rose-500/10 border-rose-500/20",
}

function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: ConversationScenario
  onSelect: () => void
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="group text-left flex flex-col gap-3 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-150 cursor-pointer w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{scenario.icon}</span>
        <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", LEVEL_STYLE[scenario.level])}>
          {scenario.level}
        </span>
      </div>
      <div>
        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{scenario.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{scenario.context}</p>
      </div>
      <p className="text-[10px] font-bold text-muted-foreground">{scenario.turns.length} turns · +15 XP</p>
    </motion.button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConversationMode() {
  const [active, setActive] = useState<ConversationScenario | null>(null)

  if (active) {
    return <ScenarioPlayer scenario={active} onBack={() => setActive(null)} />
  }

  const byLevel = {
    beginner:     CONVERSATION_SCENARIOS.filter(s => s.level === "beginner"),
    intermediate: CONVERSATION_SCENARIOS.filter(s => s.level === "intermediate"),
    advanced:     CONVERSATION_SCENARIOS.filter(s => s.level === "advanced"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Conversations</h2>
          <p className="text-xs text-muted-foreground">Real-life Slovak dialogues with cultural notes.</p>
        </div>
      </div>

      {(["beginner", "intermediate", "advanced"] as const)
        .filter(level => byLevel[level].length > 0)
        .map(level => (
          <div key={level} className="space-y-3">
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block", LEVEL_STYLE[level])}>
              {level}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {byLevel[level].map(s => (
                <ScenarioCard key={s.id} scenario={s} onSelect={() => setActive(s)} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
