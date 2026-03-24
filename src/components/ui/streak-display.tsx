"use client"

import { useEffect, useState } from "react"
import { Flame, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getTodayBratislava, getYesterdayBratislava, getBratislavaHour } from "@/lib/date-utils"

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

// ─── Streak-at-Risk Banner ─────────────────────────────────────────────────────

function getBratislavaHoursToMidnight(): number {
  const hour = getBratislavaHour()
  const now = new Date()
  const minuteOfHour = now.getMinutes()
  return Math.floor((24 * 60 - (hour * 60 + minuteOfHour)) / 60)
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
      const playedYesterday = lastDate === getYesterdayBratislava()
      const isEvening = getBratislavaHour() >= 22
      // Show only when streak is alive (played yesterday) but not yet played today, after 10pm
      setShow(!playedToday && playedYesterday && streakCount > 0 && isEvening)
    }
    check()
    const id = setInterval(check, 60_000) // re-check every minute
    window.addEventListener("focus", check)
    return () => { clearInterval(id); window.removeEventListener("focus", check) }
  }, [streakCount, lastDate])

  if (dismissed || !show) return null

  const hoursLeft = getBratislavaHoursToMidnight()
  const timeLabel = hoursLeft <= 0 ? "less than an hour" : `${hoursLeft}h`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center justify-between gap-3 px-4 py-3 mb-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-sm"
      >
        <span className="font-bold text-orange-700 dark:text-orange-300">
          🔥 Your {streakCount}-day streak is at risk! Play within {timeLabel} to keep it alive.
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-orange-500/60 hover:text-orange-500 transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
