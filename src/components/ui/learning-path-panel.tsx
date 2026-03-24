"use client"

import { useState } from "react"
import { ChevronDown, ArrowRight, CheckCircle2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import { LEARNING_PATH, type LearningStep } from "@/lib/learning-path"
import { WORD_CATEGORIES } from "@/data/slovak-words"
import { SLOVAK_SECTIONS } from "@/data/slovak-phrases"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isStepComplete(step: LearningStep, learnedItems: string[]): boolean {
  if (step.type === "vocabulary") {
    const cat = WORD_CATEGORIES.find(c => c.title === step.title)
    if (!cat) return false
    return cat.words.length > 0 && cat.words.every(w => learnedItems.includes(w.id ?? w.slovak))
  }
  const section = SLOVAK_SECTIONS.find(s => s.title === step.title)
  if (!section) return false
  return section.phrases.length > 0 && section.phrases.every(p => learnedItems.includes(p.id ?? p.slovak))
}

function isStepUnlocked(step: LearningStep, learnedItems: string[]): boolean {
  if (!step.prereqs || step.prereqs.length === 0) return true
  return step.prereqs.every(prereqTitle => {
    const prereqStep = LEARNING_PATH.find(s => s.title === prereqTitle)
    return prereqStep ? isStepComplete(prereqStep, learnedItems) : true
  })
}

function getStepProgress(step: LearningStep, learnedItems: string[]): { learned: number; total: number } {
  if (step.type === "vocabulary") {
    const cat = WORD_CATEGORIES.find(c => c.title === step.title)
    if (!cat) return { learned: 0, total: 0 }
    return {
      learned: cat.words.filter(w => learnedItems.includes(w.id ?? w.slovak)).length,
      total: cat.words.length,
    }
  }
  const section = SLOVAK_SECTIONS.find(s => s.title === step.title)
  if (!section) return { learned: 0, total: 0 }
  return {
    learned: section.phrases.filter(p => learnedItems.includes(p.id ?? p.slovak)).length,
    total: section.phrases.length,
  }
}

// ─── Step Card ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  learnedItems,
  onStart,
}: {
  step: LearningStep
  learnedItems: string[]
  onStart: (step: LearningStep) => void
}) {
  const complete = isStepComplete(step, learnedItems)
  const unlocked = isStepUnlocked(step, learnedItems)
  const { learned, total } = getStepProgress(step, learnedItems)
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-2xl border transition-all",
      complete
        ? "border-green-500/30 bg-green-500/5"
        : unlocked
        ? "border-primary/20 bg-primary/5"
        : "border-border bg-muted/30 opacity-60"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0",
        complete ? "bg-green-500/15" : unlocked ? "bg-primary/10" : "bg-muted"
      )}>
        {complete ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : unlocked ? <span>{step.icon}</span> : <Lock className="w-4 h-4 text-muted-foreground/50" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn("text-sm font-black truncate", complete ? "text-green-700 dark:text-green-400" : "text-foreground")}>
            {step.title}
          </p>
          <span className={cn(
            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
            step.type === "vocabulary"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-emerald-500/10 text-emerald-600"
          )}>
            {step.type === "vocabulary" ? "words" : "phrases"}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
        {total > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", complete ? "bg-green-500" : "bg-primary")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-bold shrink-0">{learned}/{total}</span>
          </div>
        )}
      </div>

      {!complete && unlocked && (
        <button
          onClick={() => onStart(step)}
          className="shrink-0 flex items-center gap-1 pl-3 pr-2.5 py-2 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
        >
          Start <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ─── Learning Path Panel ───────────────────────────────────────────────────────

export function LearningPathPanel({
  onNavigate,
}: {
  onNavigate: (type: "vocabulary" | "situations", title: string) => void
}) {
  const { store } = useSlovakStore()
  const [expanded, setExpanded] = useState(false)

  // Only show for Level 0 (xp < 200)
  if (store.xp >= 200) return null

  const learnedItems = store.learnedItems
  const completedCount = LEARNING_PATH.filter(s => isStepComplete(s, learnedItems)).length

  // Find the next 2 uncompleted, unlocked steps
  const nextSteps = LEARNING_PATH
    .filter(s => !isStepComplete(s, learnedItems) && isStepUnlocked(s, learnedItems))
    .slice(0, 2)

  // Locked steps to show when expanded
  const lockedSteps = LEARNING_PATH
    .filter(s => !isStepComplete(s, learnedItems) && !isStepUnlocked(s, learnedItems))

  const allUpcoming = expanded
    ? [...nextSteps, ...lockedSteps]
    : nextSteps

  const handleStart = (step: LearningStep) => {
    onNavigate(step.type, step.title)
  }

  return (
    <div className="border border-primary/20 rounded-2xl bg-primary/[0.02] p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <div>
            <p className="text-sm font-black">Learning Path</p>
            <p className="text-[10px] text-muted-foreground">
              {completedCount}/{LEARNING_PATH.length} steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${Math.round((completedCount / LEARNING_PATH.length) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {/* Completed steps (summary) */}
        {completedCount > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold py-1 px-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedCount} step{completedCount !== 1 ? "s" : ""} completed
          </div>
        )}

        {allUpcoming.map(step => (
          <StepCard
            key={step.id}
            step={step}
            learnedItems={learnedItems}
            onStart={handleStart}
          />
        ))}

        {!expanded && lockedSteps.length > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-center text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            + {lockedSteps.length} more steps
          </button>
        )}
      </div>

      {/* Collapse after graduating */}
      {completedCount === LEARNING_PATH.length && (
        <div className="text-center py-3">
          <p className="text-sm font-black text-green-600">🎉 Path complete! Keep exploring freely.</p>
        </div>
      )}
    </div>
  )
}
