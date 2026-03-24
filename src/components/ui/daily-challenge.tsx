"use client"

import * as React from "react"
import { Target, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { getTodayBratislava } from "@/lib/date-utils"
import { type PhraseSection } from "@/types/learning"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashString(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function getCountdownToMidnight(): string {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

function useCountdown(): string {
  const [label, setLabel] = React.useState(getCountdownToMidnight)
  React.useEffect(() => {
    const id = setInterval(() => setLabel(getCountdownToMidnight()), 60_000)
    return () => clearInterval(id)
  }, [])
  return label
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function DailyChallenge({
  sections,
  onSelectSituation,
  learnedItems,
  dailyChallenge: dailyChallengeState,
  onComplete,
  onAddXP,
}: {
  sections: PhraseSection[]
  onSelectSituation: (title: string) => void
  learnedItems: string[]
  dailyChallenge: { completedDate: string | null; completedSeed: string | null }
  onComplete: (seed: string) => void
  onAddXP: (n: number) => void
}) {
  const [revealed, setRevealed] = React.useState(false)
  const [justCompleted, setJustCompleted] = React.useState(false)
  const countdown = useCountdown()

  const today = getTodayBratislava()

  // Deterministic daily selection based on date string
  const dailyIndex = Math.abs(hashString(today)) % (sections.length || 1)
  const currentSeed = String(dailyIndex)

  const dailySituation = sections[dailyIndex] || sections[0]

  const dailyPhrase = React.useMemo(() => {
    if (!dailySituation?.phrases.length) return null
    const index = Math.abs(hashString(today + "phrase")) % dailySituation.phrases.length
    return dailySituation.phrases[index]
  }, [dailySituation, today])

  // Completion check: same date AND same seed (prevents midnight edge case)
  const completedToday =
    dailyChallengeState.completedDate === today &&
    dailyChallengeState.completedSeed === currentSeed

  // Check if all daily situation phrases are learned
  const allCompleted = React.useMemo(() =>
    dailySituation?.phrases.every(p => learnedItems.includes(p.id ?? p.slovak)) ?? false,
    [dailySituation, learnedItems]
  )

  // Award +15 XP on first completion (deferred to avoid setState-in-effect lint)
  React.useEffect(() => {
    if (allCompleted && !completedToday) {
      const timer = setTimeout(() => {
        setJustCompleted(true)
        onComplete(currentSeed)
        onAddXP(15)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [allCompleted, completedToday, currentSeed, onComplete, onAddXP])

  if (!dailyPhrase) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
      {/* Phrase of the Day */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/[0.03] border-2 border-primary/10 rounded-[2rem] p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-24 h-24 rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 bg-primary/10 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Phrase of the Day</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter opacity-60">English</p>
              <p className="text-lg font-bold leading-tight">{dailyPhrase.english}</p>
            </div>

            <div className="pt-2 min-h-[60px]">
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Reveal Slovak
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter opacity-60">Slovak</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black italic text-primary">{dailyPhrase.slovak}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Situation Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "border-2 rounded-[2rem] p-6 relative overflow-hidden group transition-colors duration-500",
          completedToday || allCompleted
            ? "bg-green-500/[0.04] border-green-500/30"
            : "bg-emerald-500/[0.03] border-emerald-500/10"
        )}
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-24 h-24 -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className={cn(
                "p-1.5 rounded-lg",
                completedToday || allCompleted ? "bg-green-500/10" : "bg-emerald-500/10"
              )}>
                {completedToday || allCompleted
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 fill-green-500/20" />
                  : <Target className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                }
              </span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                completedToday || allCompleted ? "text-green-600" : "text-emerald-600"
              )}>
                {completedToday || allCompleted ? "Completed Today" : "Situation Challenge"}
              </span>
            </div>

            {(completedToday || allCompleted) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-500/20" />
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1">
              {dailySituation.icon} {dailySituation.title}
            </h4>

            {completedToday || allCompleted ? (
              <div className="space-y-1.5">
                {justCompleted && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-green-600"
                  >
                    +15 Bonus XP earned! 🎉
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground font-medium">
                  Next challenge in <span className="text-foreground font-bold">{countdown}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-medium mb-4">
                Master all phrases today for <span className="text-emerald-600 font-bold">+15 Bonus XP</span>
              </p>
            )}
          </div>

          {completedToday || allCompleted ? (
            <button
              onClick={() => onSelectSituation(dailySituation.title)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-all cursor-pointer"
            >
              Play Again <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onSelectSituation(dailySituation.title)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:gap-3 transition-all cursor-pointer"
            >
              Start Challenge <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
