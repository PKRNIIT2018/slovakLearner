"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  BookOpen, Shuffle, Eye, EyeOff, CheckCircle, Trophy 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { calcXP } from "@/lib/xp"
import type { PhraseSection } from "@/types/learning"
import type { SlovakStore } from "@/hooks/use-slovak-store"
import { shuffleArray } from "@/lib/learning-utils"
import { SpeakButton } from "../shared/speak-button"

export function LearnMode({
  section,
  store,
  markItemLearned,
  unmarkItemLearned,
  updateStreak,
  addXP,
  itemFilter
}: {
  section: PhraseSection
  store: SlovakStore
  markItemLearned: (id: string) => void
  unmarkItemLearned: (id: string) => void
  updateStreak: () => void
  addXP: (n: number) => void
  itemFilter?: string[]
}) {
  const isSentencesSection = section.phrases.some(p => p.id?.startsWith("sent-from-"))

  const highlightLearnedWord = (slovak: string, phraseId: string | undefined): React.ReactNode => {
    if (!isSentencesSection || !phraseId?.startsWith("sent-from-")) {
      return slovak
    }
    const wordId = phraseId.replace("sent-from-", "")
    const isLearned = store.learnedItems.includes(wordId)
    if (isLearned) {
      return (
        <span className="bg-green-500/20 text-green-700 dark:text-green-400 px-1 rounded border border-green-500/30 font-bold underline decoration-green-500/50 decoration-2 underline-offset-2">
          {slovak}
        </span>
      )
    }
    return slovak
  }

  const [cards, setCards] = useState(() => {
    let list = section.phrases
    if (itemFilter && itemFilter.length > 0) {
      list = list.filter(p => itemFilter.includes(p.id ?? p.slovak))
    }
    return shuffleArray(list)
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"stack" | "grid">("stack")
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const [swipeHintDismissed, setSwipeHintDismissed] = useState(() => {
    if (typeof window === "undefined") return true
    return sessionStorage.getItem("ins-slovak-swipe-hint-dismissed") === "true"
  })

  const sectionLearnedCount = cards.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).length
  const progress = Math.round((sectionLearnedCount / cards.length) * 100)

  const restart = () => {
    setCards(shuffleArray(section.phrases))
    setCurrentIndex(0)
    setRevealed(new Set())
    setShowAll(false)
  }

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }, [currentIndex, cards.length])

  const prevCard = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1))
  }

  const toggleReveal = (idx: number) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(idx)) { next.delete(idx) } else { next.add(idx) }
      return next
    })
  }

  const toggleLearned = (phraseId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.()
    const wasLearned = store.learnedItems.includes(phraseId)
    if (wasLearned) {
      unmarkItemLearned(phraseId)
    } else {
      markItemLearned(phraseId)
      addXP(calcXP(2, section.level))
      updateStreak()
    }
    
    if (viewMode === "stack" && !wasLearned) {
      setTimeout(nextCard, 300)
    }
  }

  const toggleAll = () => {
    if (showAll) {
      setRevealed(new Set())
    } else {
      setRevealed(new Set(cards.map((_, i) => i)))
    }
    setShowAll(v => !v)
  }

  const dismissSwipeHint = () => {
    setSwipeHintDismissed(true)
    sessionStorage.setItem("ins-slovak-swipe-hint-dismissed", "true")
  }

  const currentPhrase = cards[currentIndex]

  if (!currentPhrase) return null

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden border">
            <div
              className={cn("h-full transition-all duration-500", progress === 100 ? "bg-green-500" : "bg-primary")}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {sectionLearnedCount}/{cards.length} mastered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted/50 rounded-xl border mr-2">
            <button
              onClick={() => setViewMode("stack")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === "stack" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Stack View"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === "grid" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
          {viewMode === "grid" && (
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            >
              {showAll ? <EyeOff className="w-3 h-3 text-primary" /> : <Eye className="w-3 h-3 text-primary" />}
              {showAll ? "Hide all" : "Reveal all"}
            </button>
          )}
          <button
            onClick={restart}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
          >
            <Shuffle className="w-3 h-3 text-primary" />
            Shuffle
          </button>
        </div>
      </div>

      {viewMode === "stack" ? (
        <div className="max-w-md mx-auto space-y-6 py-4">
          <div className="text-center">
            <span className="text-sm font-bold text-muted-foreground">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="relative min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhrase.slovak}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) {
                    toggleLearned(currentPhrase.id ?? currentPhrase.slovak)
                    dismissSwipeHint()
                  } else if (info.offset.x < -100) {
                    nextCard()
                    dismissSwipeHint()
                  }
                }}
                className="w-full"
              >
                <div
                  onClick={() => toggleReveal(currentIndex)}
                  className={cn(
                    "cursor-pointer rounded-3xl border-2 p-8 flex flex-col justify-between min-h-[260px] select-none transition-all duration-200 shadow-sm",
                    store.learnedItems.includes(currentPhrase.id ?? currentPhrase.slovak)
                      ? "border-green-500/20 bg-green-500/[0.02]"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="space-y-6 flex-1 flex flex-col justify-center text-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                        English
                      </p>
                      <p className="text-2xl font-black tracking-tight leading-tight">{currentPhrase.english}</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {revealed.has(currentIndex) ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="pt-6 border-t border-border/50"
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2">
                            Slovak
                          </p>
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-3xl font-black text-primary leading-tight">
                              {highlightLearnedWord(currentPhrase.slovak, currentPhrase.id)}
                            </p>
                            <SpeakButton text={currentPhrase.slovak} className="bg-primary/10 text-primary p-3 rounded-2xl" />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="pt-6 border-t border-border/50 flex flex-col items-center justify-center min-h-[100px]">
                           <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                            Tap to reveal
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {!swipeHintDismissed && currentIndex === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-12 left-0 right-0 flex justify-between px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none"
              >
                <span>← See Later</span>
                <span>Learned →</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={prevCard}
              className="flex-1 h-14 rounded-2xl border-2 border-border font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              Back
            </button>
            <button
              onClick={nextCard}
              className="flex-1 h-14 rounded-2xl border-2 border-border font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted transition-all"
            >
              See Later
            </button>
            <button
              onClick={() => toggleLearned(currentPhrase.id ?? currentPhrase.slovak)}
              className={cn(
                "flex-[1.5] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95",
                store.learnedItems.includes(currentPhrase.id ?? currentPhrase.slovak)
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : "bg-primary text-primary-foreground shadow-primary/20"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {store.learnedItems.includes(currentPhrase.id ?? currentPhrase.slovak) ? "Mastered" : "Got it"}
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((phrase, idx) => {
            const isRevealed = revealed.has(idx)
            const isLearned = store.learnedItems.includes(phrase.id ?? phrase.slovak)
            return (
              <motion.div
                layout
                key={phrase.slovak}
                onClick={() => toggleReveal(idx)}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-5 flex flex-col justify-between min-h-[140px] select-none transition-all duration-200",
                  isLearned
                    ? "border-green-500/20 bg-green-500/[0.02] dark:bg-green-500/[0.05]"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1.5">
                        English
                      </p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{phrase.english}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/30">
                      {idx + 1}/{cards.length}
                    </span>
                  </div>

                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-border/50 mt-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 mb-1.5">
                            Slovak
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-primary leading-tight flex-1">{phrase.slovak}</p>
                            <SpeakButton text={phrase.slovak} className="bg-primary/10 text-primary p-1.5 rounded-lg" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-border">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {isRevealed ? "Click to hide" : "Click to reveal"}
                  </span>
                  <button
                    onClick={(e) => toggleLearned(phrase.id ?? phrase.slovak, e)}
                    className={cn(
                      "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl transition-all shadow-xs",
                      isLearned
                        ? "bg-green-500 text-white shadow-green-500/20"
                        : "bg-muted text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
                    )}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isLearned ? "Mastered" : "Got it"}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {sectionLearnedCount === cards.length && cards.length > 0 && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-[2rem] border-2 border-green-500/20 bg-green-500/[0.03] p-8 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="font-black italic text-2xl uppercase tracking-tighter text-green-700 dark:text-green-400">
              Section Mastered!
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto mt-1">
              You&apos;ve mastered all {cards.length} phrases in this situation. Try the quiz to earn bonus XP!
            </p>
          </div>
          <button
            onClick={restart}
            className="text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-95"
          >
            Practice Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
