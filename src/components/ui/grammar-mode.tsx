"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, BookOpen, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { calcXP } from "@/lib/xp"
import { GRAMMAR_TOPICS } from "@/data/slovak-grammar"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import type { GrammarTopic, GrammarExercise } from "@/types/learning"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildChoices(exercise: GrammarExercise): string[] {
  return shuffleArray([exercise.answer, ...exercise.distractors.slice(0, 2)])
}

// ─── Highlight helper ─────────────────────────────────────────────────────────

function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <span>{text}</span>
  const idx = text.indexOf(highlight)
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-amber-500 font-black underline decoration-dotted">{highlight}</span>
      {text.slice(idx + highlight.length)}
    </span>
  )
}

// ─── Phase 1: Discovery ───────────────────────────────────────────────────────

function DiscoveryPhase({ topic, onContinue }: { topic: GrammarTopic; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <span className="text-4xl">{topic.icon}</span>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{topic.title}</h2>
        <p className="text-sm text-muted-foreground">{topic.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{topic.discovery_prompt}</p>
        </div>
        {topic.examples.map((ex, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border/30 last:border-0">
            <span className="text-sm font-semibold">
              <HighlightedText text={ex.slovak} highlight={ex.highlight} />
            </span>
            <span className="text-[11px] text-muted-foreground text-right shrink-0">{ex.english}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        I see the pattern — show me the rule →
      </button>
    </motion.div>
  )
}

// ─── Phase 2: Rule Reveal ─────────────────────────────────────────────────────

function RulePhase({ topic, onContinue }: { topic: GrammarTopic; onContinue: () => void }) {
  // Render basic markdown: **bold** and \n newlines
  const renderRule = (rule: string) => {
    return rule.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g)
      return (
        <p key={i} className={cn("text-sm leading-relaxed", line.startsWith("•") ? "ml-2" : "")}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <strong key={j} className="font-black text-foreground">{part}</strong>
              : <span key={j} className="text-muted-foreground">{part}</span>
          )}
        </p>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">The Rule</p>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">{topic.title}</h2>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-2">
        {renderRule(topic.rule)}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Quick Review</p>
        <div className="grid grid-cols-2 gap-2">
          {topic.examples.slice(0, 4).map((ex, i) => (
            <div key={i} className="text-xs">
              <span className="font-bold">
                <HighlightedText text={ex.slovak} highlight={ex.highlight} />
              </span>
              <span className="text-muted-foreground ml-1">— {ex.english}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        Start Practice →
      </button>
    </motion.div>
  )
}

// ─── Phase 3: Exercises ───────────────────────────────────────────────────────

type AnswerState = "unanswered" | "correct" | "wrong"

function ExerciseCard({
  exercise,
  topicLevel,
  onAnswer,
}: {
  exercise: GrammarExercise
  topicLevel: GrammarTopic["level"]
  onAnswer: (correct: boolean) => void
}) {
  const [choices] = useState(() => buildChoices(exercise))
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState] = useState<AnswerState>("unanswered")

  const handleSelect = (choice: string) => {
    if (state !== "unanswered") return
    const correct = choice === exercise.answer
    setSelected(choice)
    setState(correct ? "correct" : "wrong")
    onAnswer(correct)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{exercise.prompt}</p>
        {exercise.slovak_context && (
          <p className="text-lg font-black text-foreground leading-snug">{exercise.slovak_context}</p>
        )}
        {exercise.english_context && !exercise.slovak_context && (
          <p className="text-lg font-black text-foreground leading-snug">{exercise.english_context}</p>
        )}
      </div>

      <div className="space-y-2">
        {choices.map((choice) => {
          const isSelected = selected === choice
          const isCorrect = choice === exercise.answer
          let bg = "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
          if (isSelected && state === "correct") bg = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
          else if (isSelected && state === "wrong")  bg = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
          else if (!isSelected && state !== "unanswered" && isCorrect) bg = "border-green-500/50 bg-green-500/5"

          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              disabled={state !== "unanswered"}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all",
                state === "unanswered" ? "cursor-pointer" : "cursor-default",
                bg
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{choice}</span>
                {isSelected && state === "correct" && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                {isSelected && state === "wrong"   && <XCircle    className="w-4 h-4 text-red-500 shrink-0" />}
                {!isSelected && state !== "unanswered" && isCorrect && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {state !== "unanswered" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "rounded-xl border p-3 text-[12px] leading-relaxed",
              state === "correct"
                ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-300"
                : "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
            )}
          >
            <span className="font-black mr-1">{state === "correct" ? "✓ Correct! " : "✗ Not quite. "}</span>
            {exercise.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Phase 4: Results ─────────────────────────────────────────────────────────

function ResultsPhase({
  topic,
  score,
  total,
  xpEarned,
  onRetry,
  onBack,
}: {
  topic: GrammarTopic
  score: number
  total: number
  xpEarned: number
  onRetry: () => void
  onBack: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const msg =
    pct === 100 ? "Flawless! You've mastered this rule." :
    pct >= 80   ? "Great work! Nearly there." :
    pct >= 60   ? "Good effort. Review the rule and try again." :
                  "Keep going — grammar takes practice."

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center space-y-6 py-4"
    >
      <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
      <div className="space-y-1">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{topic.title} — Done!</h3>
        <p className="text-4xl font-black text-primary">{score}/{total}</p>
        <p className="text-sm text-muted-foreground">{msg}</p>
      </div>
      {xpEarned > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="text-amber-500 font-black text-sm">+{xpEarned} XP earned</span>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-muted transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          More Topics <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Topic Card ───────────────────────────────────────────────────────────────

const LEVEL_STYLE = {
  beginner:     "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  advanced:     "text-rose-600 bg-rose-500/10 border-rose-500/20",
}

function TopicCard({
  topic,
  completedIds,
  onSelect,
}: {
  topic: GrammarTopic
  completedIds: Set<string>
  onSelect: (topic: GrammarTopic) => void
}) {
  const done = completedIds.has(topic.id)
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(topic)}
      className={cn(
        "group text-left flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer w-full",
        done
          ? "border-green-500/30 bg-green-500/[0.03]"
          : "border-border bg-card hover:border-primary/40 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{topic.icon}</span>
        <div className="flex items-center gap-1.5">
          {done && <CheckCircle className="w-4 h-4 text-green-500" />}
          <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", LEVEL_STYLE[topic.level])}>
            {topic.level}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-black text-foreground leading-tight group-hover:text-primary transition-colors">{topic.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{topic.subtitle}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-bold text-muted-foreground">{topic.exercises.length} exercises</span>
        <span className="text-[10px] font-black text-amber-600">+{topic.xp_reward} XP</span>
      </div>
    </motion.button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Phase = "list" | "discovery" | "rule" | "practice" | "results"

export function GrammarMode() {
  const { addXP, store } = useSlovakStore()

  const [phase, setPhase] = useState<Phase>("list")
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const startTopic = (topic: GrammarTopic) => {
    setActiveTopic(topic)
    setPhase("discovery")
    setExerciseIndex(0)
    setScore(0)
    setAnswered(false)
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore(s => s + 1)
    setAnswered(true)
  }

  const nextExercise = () => {
    if (!activeTopic) return
    if (exerciseIndex + 1 < activeTopic.exercises.length) {
      setExerciseIndex(i => i + 1)
      setAnswered(false)
    } else {
      // Complete — award XP proportional to score
      const earned = Math.round(
        calcXP(activeTopic.xp_reward, activeTopic.level) * (score + (answered ? 0 : 0)) / activeTopic.exercises.length
      )
      if (earned > 0) addXP(earned)
      setCompletedIds(prev => new Set([...prev, activeTopic.id]))
      setPhase("results")
    }
  }

  const reset = () => {
    setExerciseIndex(0)
    setScore(0)
    setAnswered(false)
    setPhase("discovery")
  }

  if (phase === "list" || !activeTopic) {
    const beginner     = GRAMMAR_TOPICS.filter(t => t.level === "beginner")
    const intermediate = GRAMMAR_TOPICS.filter(t => t.level === "intermediate")
    const advanced     = GRAMMAR_TOPICS.filter(t => t.level === "advanced")

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Grammar Lessons</h2>
            <p className="text-xs text-muted-foreground">Discover patterns, learn the rule, then practise.</p>
          </div>
        </div>

        {[
          { label: "Beginner", topics: beginner,     badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Intermediate", topics: intermediate, badge: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
          { label: "Advanced", topics: advanced,     badge: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
        ].filter(g => g.topics.length > 0).map(group => (
          <div key={group.label} className="space-y-3">
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block", group.badge)}>
              {group.label}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.topics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  completedIds={completedIds}
                  onSelect={startTopic}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const xpEarned = Math.round(
    calcXP(activeTopic.xp_reward, activeTopic.level) * score / activeTopic.exercises.length
  )

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPhase("list")}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        {phase === "practice" && (
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((exerciseIndex) / activeTopic.exercises.length) * 100}%` }}
            />
          </div>
        )}
        {phase === "practice" && (
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {exerciseIndex + 1}/{activeTopic.exercises.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "discovery" && (
          <motion.div key="discovery">
            <DiscoveryPhase topic={activeTopic} onContinue={() => setPhase("rule")} />
          </motion.div>
        )}
        {phase === "rule" && (
          <motion.div key="rule">
            <RulePhase topic={activeTopic} onContinue={() => setPhase("practice")} />
          </motion.div>
        )}
        {phase === "practice" && (
          <motion.div key={`ex-${exerciseIndex}`} className="space-y-5">
            <ExerciseCard
              exercise={activeTopic.exercises[exerciseIndex]}
              topicLevel={activeTopic.level}
              onAnswer={handleAnswer}
            />
            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextExercise}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {exerciseIndex + 1 < activeTopic.exercises.length ? "Next →" : "See Results →"}
              </motion.button>
            )}
          </motion.div>
        )}
        {phase === "results" && (
          <motion.div key="results">
            <ResultsPhase
              topic={activeTopic}
              score={score}
              total={activeTopic.exercises.length}
              xpEarned={xpEarned}
              onRetry={reset}
              onBack={() => setPhase("list")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
