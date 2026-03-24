"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getLevel, LEVELS } from "@/lib/xp"
import confetti from "canvas-confetti"

// ─── XP Ring ───────────────────────────────────────────────────────────────────

function XpRing({
  progress,
  size = 52,
  label,
  isMaxLevel,
}: {
  progress: number
  size?: number
  label: string
  isMaxLevel: boolean
}) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(progress, 1))

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/60"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-700",
            isMaxLevel ? "text-amber-400" : "text-primary"
          )}
        />
      </svg>
      <span className="absolute text-[10px] font-black leading-none">{label}</span>
    </div>
  )
}

// ─── Level-Up Modal ────────────────────────────────────────────────────────────

export function LevelUpModal({
  level,
  label,
  icon,
  onDismiss,
}: {
  level: number
  label: string
  icon: string
  onDismiss: () => void
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const burst = () =>
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 35,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#3b82f6", "#10b981", "#f43f5e"],
      })

    burst()
    const t = setTimeout(burst, 350)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-12 text-center shadow-2xl max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">{icon}</div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">
          Level Up!
        </p>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-1">
          Level {level}
        </h2>
        <p className="text-xl font-bold text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60 mt-6">Tap anywhere to continue</p>
      </motion.div>
    </motion.div>
  )
}

// ─── XP Bar (main export) ──────────────────────────────────────────────────────

export function XpBar({ xp }: { xp: number }) {
  const info = getLevel(xp)
  const isMaxLevel = info.nextThreshold === null
  const prevLevelRef = useRef(info.level)
  const [levelUp, setLevelUp] = useState<{ level: number; label: string; icon: string } | null>(null)

  useEffect(() => {
    const prev = prevLevelRef.current
    if (info.level > prev) {
      setTimeout(() => {
        setLevelUp({ level: info.level, label: info.label, icon: info.icon })
      }, 0)
    }
    prevLevelRef.current = info.level
  }, [info.level, info.label, info.icon])

  return (
    <>
      <div className="flex items-center gap-3">
        <XpRing
          progress={info.progress}
          size={52}
          label={`L${info.level + 1}`}
          isMaxLevel={isMaxLevel}
        />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-foreground leading-none">
            {info.label}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
            {isMaxLevel
              ? `${xp} XP · Max Level`
              : `${xp} / ${info.nextThreshold} XP`}
          </p>
          {/* Mini level pip track */}
          <div className="flex gap-0.5 mt-1">
            {LEVELS.map(l => (
              <div
                key={l.level}
                className={cn(
                  "h-1 w-4 rounded-full transition-colors duration-500",
                  info.level >= l.level ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {levelUp && (
          <LevelUpModal
            level={levelUp.level + 1}
            label={levelUp.label}
            icon={levelUp.icon}
            onDismiss={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
