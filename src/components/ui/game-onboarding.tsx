"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Config ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ins-slovak-onboarding-done"

const STEPS = [
  {
    icon: "💬",
    title: "Six ways to learn",
    body: "Vocabulary, Sentences, Situations, Grammar, Conversations, and Culture. Each tab is a different skill — pick any to start.",
  },
  {
    icon: "📖",
    title: "Choose a section",
    body: "Each tab has multiple topics. Tap any card to dive in — beginner topics are shown first.",
  },
  {
    icon: "🎮",
    title: "Four game modes",
    body: "Learn flips cards at your pace. Quiz tests with 4 choices. Speed is a 60-second blitz. Match pairs cards. Start with Learn.",
  },
  {
    icon: "☁️",
    title: "Sign in to sync progress",
    body: "Sign in with Google to save your XP, streak, and mastered items across devices. Or just play — progress saves locally too.",
  },
  {
    icon: "🔥",
    title: "Build your streak",
    body: "XP and streaks reset at midnight Bratislava time. Come back daily to keep your streak alive.",
  },
]

// ─── Onboarding Overlay ────────────────────────────────────────────────────────

export function GameOnboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the page content renders first
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-full max-w-sm bg-card border-2 border-border rounded-[2rem] p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Dismiss */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-muted"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={dismiss}
                className="text-muted-foreground/50 hover:text-foreground transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="space-y-3 mb-8"
              >
                <div className="text-5xl">{current.icon}</div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight">
                  {current.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {step < STEPS.length - 1 && (
                <button
                  onClick={dismiss}
                  className="min-h-[44px] min-w-[44px] px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {step < STEPS.length - 1 ? (
                  <>Next <ArrowRight className="w-3.5 h-3.5" /></>
                ) : (
                  "Start learning!"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
