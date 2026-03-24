"use client"

import { useEffect, useState } from "react"
import { Flame, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getTodayBratislava } from "@/lib/date-utils"

// ─── Streak Display ────────────────────────────────────────────────────────────

export function StreakDisplay({
  count,
  lastDate,
}: {
  count: number
  lastDate: string | null
}) {
  const color =
    count === 0  ? "text-muted-foreground" :
    count < 7    ? "text-orange-400" :
    count < 30   ? "text-orange-500" :
                   "text-red-500"

  const pulse = count >= 7

  return (
    <div className={cn("flex items-center gap-1.5 font-black italic text-xl", color, pulse && "motion-safe:animate-pulse")}>
      <Flame className="w-5 h-5 fill-current" />
      <span>{count}</span>
      {count === 0 && (
        <span className="text-[10px] font-medium not-italic text-muted-foreground normal-case">
          Start your streak
        </span>
      )}
    </div>
  )
}

// ─── Midnight Warning Banner ───────────────────────────────────────────────────

function getHoursLeft(): number {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 3600000)
}

export function MidnightWarning({
  streakCount,
  lastDate,
}: {
  streakCount: number
  lastDate: string | null
}) {
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => {
      const playedToday = lastDate === getTodayBratislava()
      const hoursLeft = getHoursLeft()
      setShow(!playedToday && streakCount > 2 && hoursLeft <= 2)
    }
    check()
    // Re-evaluate when window gains focus
    window.addEventListener("focus", check)
    return () => window.removeEventListener("focus", check)
  }, [streakCount, lastDate])

  if (dismissed || !show) return null

  const hoursLeft = getHoursLeft()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center justify-between gap-3 px-4 py-3 mb-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-sm"
      >
        <span className="font-bold text-orange-700 dark:text-orange-300">
          ⚠️ Your {streakCount}-day streak expires in {hoursLeft}h. Play now to keep it!
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-orange-500/60 hover:text-orange-500 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
