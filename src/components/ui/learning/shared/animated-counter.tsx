"use client"

import { useState, useEffect } from "react"

export function AnimatedCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)
  
  useEffect(() => {
    let current = displayed
    const diff = value - current
    if (diff === 0) return

    const step = Math.max(1, Math.ceil(Math.abs(diff) / 60))
    const timer = setInterval(() => {
      if (diff > 0) {
        current = Math.min(current + step, value)
      } else {
        current = Math.max(current - step, value)
      }
      setDisplayed(current)
      if (current === value) clearInterval(timer)
    }, 16)
    
    return () => clearInterval(timer)
  }, [value])

  return <span>{displayed}</span>
}
