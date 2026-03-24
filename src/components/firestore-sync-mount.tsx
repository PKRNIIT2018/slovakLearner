"use client"

import { useFirestoreSync } from "@/hooks/use-firestore-sync"

// Mounts the Firestore sync subscription at the layout level.
// Renders nothing — exists only to activate the side-effect hook.
export function FirestoreSyncMount() {
  useFirestoreSync()
  return null
}
