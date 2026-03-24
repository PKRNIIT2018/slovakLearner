"use client"

import { useState, useCallback } from "react"

let xpFloatId = 0

export function useXpFloats() {
  const [floats, setFloats] = useState<{ id: number; amount: number }[]>([])
  const emit = useCallback((amount: number) => {
    const id = ++xpFloatId
    setFloats(prev => [...prev, { id, amount }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 950)
  }, [])
  return { floats, emit }
}

export function XpFloats({ floats }: { floats: { id: number; amount: number }[] }) {
  return (
    <div className="relative pointer-events-none" aria-hidden>
      {floats.map(f => (
        <span
          key={f.id}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 text-xs font-black text-amber-500 animate-xp-float z-50 select-none whitespace-nowrap"
        >
          +{f.amount} XP
        </span>
      ))}
    </div>
  )
}
