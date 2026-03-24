"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Timer, Zap } from "lucide-react"
import type { Mode } from "@/types/learning"

export function WarmupScreen({
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

  const info = mode === "quiz"
    ? { label: "Quiz", desc: "4-choice questions · +10 XP each", icon: Zap }
    : mode === "speed"
    ? { label: "Speed Round", desc: "60 seconds · all content · +5 XP each", icon: Timer }
    : mode === "match"
    ? { label: "Match Master", desc: "Find the pairs · fast XP", icon: Zap }
    : { label: "Learn", desc: "Flip cards at your own pace", icon: Zap }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-card border-2 rounded-[2.5rem] p-10 text-center shadow-xl space-y-8"
    >
      <div className="space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto">
          <info.icon className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Preparing Session</h3>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
            {info.label}: {title}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            {itemCount} items · {info.desc}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-full bg-primary"
          />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          Starting in 2 seconds...
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleStart}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          Start Now
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to selector
        </button>
      </div>
    </motion.div>
  )
}
