"use client"

import { useState, useCallback } from "react"

let xpFloatId = 0

export function useXpFloats() {
  const [floats, setFloats] = useState<{ id: number; amount: number }[]>([])
  const emit = useCallback((amount: number) => {
    const id = ++xpFloatId
    setFloats(prev => [...prev, { id, amount }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 900)
  }, [])
  return { floats, emit }
}

export function XpFloats({ floats }: { floats: { id: number; amount: number }[] }) {
  return (
    <div className="relative pointer-events-none" aria-hidden>
      {floats.map(f => (
        <span
          key={f.id}
          className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-sm font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-xp-float z-50 select-none whitespace-nowrap"
        >
          +{f.amount} XP
        </span>
      ))}
    </div>
  )
}
