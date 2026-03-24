import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase uses browser APIs — only initialize on the client.
// During Next.js SSR/static generation, all hooks that import these are
// "use client" components guarded by useEffect, so null values are never accessed.
const isClient = typeof window !== "undefined"

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = isClient ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig)) : null as any

export const auth = isClient ? getAuth(app) : null as any
export const db   = isClient ? getFirestore(app) : null as any

export const googleProvider = isClient ? (() => {
  const p = new GoogleAuthProvider()
  p.addScope("profile")
  p.addScope("email")
  return p
})() : null as any
