"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, XCircle, Globe, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeakSlovak } from "@/hooks/use-speak-slovak"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import { CULTURE_LESSONS } from "@/data/slovak-culture"
import type { CultureLesson, CultureQuizItem } from "@/types/learning"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Quiz Item ────────────────────────────────────────────────────────────────

function CultureQuizCard({
  item,
  onAnswered,
}: {
  item: CultureQuizItem
  onAnswered: (correct: boolean) => void
}) {
  const [choices] = useState(() => shuffleArray([item.answer, ...item.distractors.slice(0, 2)]))
  const [selected, setSelected] = useState<string | null>(null)

  const handle = (choice: string) => {
    if (selected) return
    setSelected(choice)
    onAnswered(choice === item.answer)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold">{item.question}</p>
      <div className="space-y-2">
        {choices.map(choice => {
          const isSelected = selected === choice
          const isCorrect = choice === item.answer
          let style = "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
          if (isSelected && isCorrect)  style = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 cursor-default"
          if (isSelected && !isCorrect) style = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 cursor-default"
          if (!isSelected && selected && isCorrect) style = "border-green-500/50 bg-green-500/5 cursor-default"

          return (
            <button
              key={choice}
              onClick={() => handle(choice)}
              disabled={!!selected}
              className={cn("w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all", style)}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{choice}</span>
                {isSelected && isCorrect  && <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />}
                {isSelected && !isCorrect && <XCircle    className="w-4 h-4 shrink-0 text-red-500" />}
                {!isSelected && selected && isCorrect && <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />}
              </div>
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "rounded-xl border p-3 text-[12px] leading-relaxed",
              selected === item.answer
                ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-300"
                : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
            )}
          >
            {item.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Lesson Card (expanded) ───────────────────────────────────────────────────

function LessonPanel({ lesson }: { lesson: CultureLesson }) {
  const [open, setOpen] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const speak = useSpeakSlovak()
  const { addXP } = useSlovakStore()

  const handleAnswer = (correct: boolean) => {
    const next = answeredCount + 1
    setAnsweredCount(next)
    if (correct) setQuizScore(s => (s ?? 0) + 1)
    if (next === lesson.quiz.length) {
      addXP(10)
    }
  }

  return (
    <div className="border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-2xl shrink-0">{lesson.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate">{lesson.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{lesson.category} · {lesson.level}</p>
        </div>
        {quizScore !== null && (
          <span className="text-[10px] font-black text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 shrink-0">
            {quizScore}/{lesson.quiz.length}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 py-4 space-y-5">
              {/* Body text */}
              <p className="text-sm text-muted-foreground leading-relaxed">{lesson.body}</p>

              {/* Examples */}
              {lesson.examples.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Examples</p>
                  {lesson.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-baseline justify-between gap-4 py-2 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => speak(ex.slovak)}
                      title="Click to hear"
                    >
                      <span className="text-sm font-bold">{ex.slovak}</span>
                      <span className="text-[11px] text-muted-foreground text-right shrink-0">{ex.english}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quiz */}
              {lesson.quiz.length > 0 && (
                <div className="space-y-5 pt-2 border-t">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Quick Quiz</p>
                  {lesson.quiz.map((item, i) => (
                    <CultureQuizCard key={i} item={item} onAnswered={handleAnswer} />
                  ))}
                  {answeredCount === lesson.quiz.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2"
                    >
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {quizScore === lesson.quiz.length ? "🎉 Perfect! +10 XP" : `${quizScore}/${lesson.quiz.length} correct · +10 XP`}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORIES: Array<{ key: CultureLesson["category"]; label: string; icon: string }> = [
  { key: "social",    label: "Social",    icon: "🤝" },
  { key: "language",  label: "Language",  icon: "💬" },
  { key: "food",      label: "Food",      icon: "🍽️" },
  { key: "practical", label: "Practical", icon: "🗺️" },
  { key: "history",   label: "History",   icon: "🏰" },
]

type FilterKey = "all" | CultureLesson["category"]

export function CultureMode() {
  const [filter, setFilter] = useState<FilterKey>("all")

  const usedCategories = new Set(CULTURE_LESSONS.map(l => l.category))
  const filtered = filter === "all"
    ? CULTURE_LESSONS
    : CULTURE_LESSONS.filter(l => l.category === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Slovak Culture</h2>
          <p className="text-xs text-muted-foreground">Context that makes the language click.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
            filter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
          )}
        >
          All
        </button>
        {CATEGORIES.filter(c => usedCategories.has(c.key)).map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
              filter === cat.key ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Lesson list */}
      <div className="space-y-3">
        {filtered.map(lesson => (
          <LessonPanel key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  )
}
