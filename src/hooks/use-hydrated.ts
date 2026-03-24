"use client"

import { useState, useEffect } from "react"

/**
 * Returns true once the component has mounted on the client.
 * Use this to guard Zustand persist stores against SSR hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), [])
  return hydrated
}
