"use client"

import { useState, useCallback } from "react"

const TURTLE_KEY = "ins-slovak-turtle-mode"

// ─── Turtle Mode ──────────────────────────────────────────────────────────────
// Per-session toggle (sessionStorage). Off by default. Slows TTS to 0.5× rate.

export function useTurtleMode() {
  const [slow, setSlow] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(TURTLE_KEY) === "1"
  )

  const toggle = useCallback(() => {
    setSlow(prev => {
      const next = !prev
      if (typeof window !== "undefined") sessionStorage.setItem(TURTLE_KEY, next ? "1" : "0")
      return next
    })
  }, [])

  return { slow, toggle }
}

// ─── TTS hook ─────────────────────────────────────────────────────────────────
// Reads turtle mode from sessionStorage at call time — no prop drilling needed.
// Voice priority: sk-SK → sk → browser default (fails silently if unavailable).

export function useSpeakSlovak() {
  return useCallback((text: string, slow?: boolean) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "sk-SK"
    const isSlow = slow ?? sessionStorage.getItem(TURTLE_KEY) === "1"
    utt.rate = isSlow ? 0.5 : 0.9
    utt.pitch = 1.05
    utt.volume = 1

    const voices = window.speechSynthesis.getVoices()
    const slovak =
      voices.find(v => v.lang === "sk-SK") ??
      voices.find(v => v.lang.startsWith("sk"))
    if (slovak) utt.voice = slovak

    window.speechSynthesis.speak(utt)
  }, [])
}
