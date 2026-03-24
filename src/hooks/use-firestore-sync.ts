"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { _rawSlovakStore } from "@/hooks/use-slovak-store"
import {
  loadRemoteProgress,
  saveRemoteProgress,
  mergeProgress,
  type SyncableState,
} from "@/lib/firestore-sync"

const DEBOUNCE_MS = 2000

function extractSyncable(state: ReturnType<typeof _rawSlovakStore.getState>): SyncableState {
  return {
    xp:                 state.xp,
    streak:             state.streak,
    learnedItems:       state.learnedItems,
    masteredSituations: state.masteredSituations,
    learnedWeights:     state.learnedWeights,
    achievements:       state.achievements,
    dailyChallenge:     state.dailyChallenge,
    stats:              state.stats,
  }
}

export function useFirestoreSync() {
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSyncingRef = useRef(false)

  // On sign-in: load remote, merge, write back
  useEffect(() => {
    if (!user) return

    let cancelled = false
    isSyncingRef.current = true
    setIsSyncing(true)
    setSyncError(null)

    ;(async () => {
      try {
        const remote = await loadRemoteProgress(user.uid)
        if (cancelled) return
        const local = extractSyncable(_rawSlovakStore.getState())
        const merged = mergeProgress(local, remote)
        _rawSlovakStore.setState(merged)
        await saveRemoteProgress(user.uid, merged)
      } catch (err) {
        if (!cancelled) setSyncError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) {
          isSyncingRef.current = false
          setIsSyncing(false)
        }
      }
    })()

    return () => { cancelled = true }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // While signed in: debounce-write store changes to Firestore
  useEffect(() => {
    if (!user) return

    const unsub = _rawSlovakStore.subscribe((state) => {
      if (isSyncingRef.current) return  // skip writes during initial load/merge
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          await saveRemoteProgress(user.uid, extractSyncable(state))
        } catch (err) {
          setSyncError(err instanceof Error ? err : new Error(String(err)))
        }
      }, DEBOUNCE_MS)
    })

    return () => {
      unsub()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isSyncing, syncError }
}
