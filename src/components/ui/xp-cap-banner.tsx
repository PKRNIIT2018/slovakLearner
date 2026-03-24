"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, X } from "lucide-react"
import { track } from "@/lib/analytics"

const SESSION_KEY = "ins-xp-cap-notified"

/**
 * Non-blocking dismissible banner shown when the daily XP cap (500 XP) is reached.
 * Fires once per browser session via sessionStorage.
 */
export function XpCapBanner({ capAmount }: { capAmount: number }) {
  const [visible, setVisible] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, "1")
    setVisible(true)

    if (!firedRef.current) {
      firedRef.current = true
      track({ event: "xp_cap_hit", capAmount })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm">
      <Zap className="w-4 h-4 text-amber-500 fill-amber-500/30 shrink-0 mt-0.5" />
      <p className="flex-1 text-amber-700 dark:text-amber-400 font-medium leading-snug">
        Daily XP limit reached ({capAmount} XP).{" "}
        <span className="font-bold">Come back tomorrow</span> — your streak is safe and you can keep playing.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-500/60 hover:text-amber-500 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
