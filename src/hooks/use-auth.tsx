"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { _rawSlovakStore, DEFAULT_STORE } from "@/hooks/use-slovak-store"

interface AuthContextValue {
  user: User | null
  isAuthLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsAuthLoading(false)
    })
    return unsub
  }, [])

  async function signIn() {
    await signInWithPopup(auth, googleProvider)
    // onAuthStateChanged will update `user` automatically
  }

  async function signOut() {
    // Clear local state before sign-out so the next user's data loads cleanly
    localStorage.removeItem("ins-slovak-learning-v1")
    _rawSlovakStore.setState({ ...DEFAULT_STORE })
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
