"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, BookOpen, Shuffle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { calcXP } from "@/lib/xp"
import type { WordCategory } from "@/types/learning"
import type { SlovakStore } from "@/hooks/use-slovak-store"
import { SpeakButton } from "../shared/speak-button"
import { BoxDot } from "../shared/box-dot"
import { TypeBadge } from "./type-badge"

type Direction = "en-sk" | "sk-en"

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function FlipCard({
  word,
  direction,
  isLearned,
  srsBox,
  onToggle,
  currentIndex,
  totalCards,
}: {
  word: import("@/types/learning").Word
  direction: Direction
  isLearned: boolean
  srsBox?: 1 | 2 | 3
  onToggle: () => void
  currentIndex?: number
  totalCards?: number
}) {
  const [flipped, setFlipped] = useState(false)
  const front = direction === "en-sk" ? word.english : word.slovak
  const back = direction === "en-sk" ? word.slovak : word.english
  const backLabel = direction === "en-sk" ? "Slovak" : "English"

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={cn(
        "cursor-pointer rounded-3xl border-2 p-6 flex flex-col justify-between min-h-[200px] select-none transition-all duration-200",
        isLearned
          ? "border-green-500/20 bg-green-500/[0.02]"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className="flex justify-between items-start">
        <TypeBadge type={word.type} />
        {srsBox && <BoxDot box={srsBox} />}
        {currentIndex !== undefined && totalCards && (
          <span className="text-[10px] font-bold text-muted-foreground/30">
            {currentIndex + 1}/{totalCards}
          </span>
        )}
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
          {flipped ? backLabel : direction === "en-sk" ? "English" : "Slovak"}
        </p>
        <p className="text-2xl font-black tracking-tight leading-tight">{flipped ? back : front}</p>
        {flipped && word.pronunciation && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">[{word.pronunciation}]</p>
        )}
        {flipped && (
          <div className="flex justify-center mt-2">
            <SpeakButton text={word.slovak} />
          </div>
        )}
        {flipped && word.memory_hook && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 px-2 leading-snug">
            💡 {word.memory_hook}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        {flipped ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className={cn(
              "flex items-center justify-center gap-2 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
              isLearned
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            {isLearned ? "Learned" : "Got it!"}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            Tap to flip
          </span>
        )}
      </div>
    </div>
  )
}

export function LearnMode({
  category,
  direction,
  learnedItems,
  learnedWeights,
  markItemLearned,
  unmarkItemLearned,
  addXP,
  updateStreak,
  itemFilter,
}: {
  category: WordCategory
  direction: Direction
  learnedItems: string[]
  learnedWeights: Record<string, import("@/hooks/use-slovak-store").LearnedWeight>
  markItemLearned: (id: string) => void
  unmarkItemLearned: (id: string) => void
  addXP: (n: number) => void
  updateStreak: () => void
  itemFilter?: string[]
}) {
  const [words, setWords] = useState(() => {
    let list = category.words
    if (itemFilter && itemFilter.length > 0) {
      list = list.filter(w => itemFilter.includes(w.id ?? w.slovak))
    }
    return shuffleArray(list)
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"stack" | "grid">("stack")
  const [swipeHintDismissed, setSwipeHintDismissed] = useState(() => {
    if (typeof window === "undefined") return true
    return sessionStorage.getItem("ins-slovak-swipe-hint-dismissed") === "true"
  })

  const learnedCount = words.filter(w => learnedItems.includes(w.id ?? w.slovak)).length
  const allDone = learnedCount === words.length

  const nextCard = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }, [currentIndex, words.length])

  const prevCard = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : words.length - 1))
  }

  const toggleLearned = (word: import("@/types/learning").Word, e?: React.MouseEvent) => {
    e?.stopPropagation?.()
    const itemId = word.id ?? word.slovak
    const wasLearned = learnedItems.includes(itemId)
    if (wasLearned) {
      unmarkItemLearned(itemId)
    } else {
      markItemLearned(itemId)
      addXP(calcXP(3, category.level))
      updateStreak()
    }

    if (viewMode === "stack" && !wasLearned) {
      setTimeout(nextCard, 300)
    }
  }

  const dismissSwipeHint = () => {
    setSwipeHintDismissed(true)
    sessionStorage.setItem("ins-slovak-swipe-hint-dismissed", "true")
  }

  const currentWord = words[currentIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden border">
            <div
              className={cn("h-full transition-all duration-500", allDone ? "bg-green-500" : "bg-primary")}
              style={{ width: `${(learnedCount / words.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{learnedCount}/{words.length} learned</span>
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
          <button
            onClick={() => {
              setWords(shuffleArray(category.words))
              setCurrentIndex(0)
            }}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-background hover:bg-muted transition-colors"
          >
            <Shuffle className="w-3 h-3 text-primary" /> Shuffle
          </button>
        </div>
      </div>

      {viewMode === "stack" ? (
        <div className="max-w-md mx-auto space-y-6 py-4">
          <div className="text-center">
            <span className="text-sm font-bold text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
          </div>

          <div className="relative min-h-[220px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWord.slovak}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) {
                    toggleLearned(currentWord)
                    dismissSwipeHint()
                  } else if (info.offset.x < -100) {
                    nextCard()
                    dismissSwipeHint()
                  }
                }}
                className="w-full"
              >
                <FlipCard
                  word={currentWord}
                  direction={direction}
                  isLearned={learnedItems.includes(currentWord.id ?? currentWord.slovak)}
                  srsBox={learnedWeights[currentWord.id ?? currentWord.slovak]?.box}
                  onToggle={() => toggleLearned(currentWord)}
                />
              </motion.div>
            </AnimatePresence>

            {!swipeHintDismissed && currentIndex === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-10 left-0 right-0 flex justify-between px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none"
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
              onClick={() => toggleLearned(currentWord)}
              className={cn(
                "flex-[1.5] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95",
                learnedItems.includes(currentWord.id ?? currentWord.slovak)
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : "bg-primary text-primary-foreground shadow-primary/20"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {learnedItems.includes(currentWord.id ?? currentWord.slovak) ? "Learned" : "Got it!"}
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {words.map((word, idx) => (
            <FlipCard
              key={word.slovak}
              word={word}
              direction={direction}
              isLearned={learnedItems.includes(word.id ?? word.slovak)}
              srsBox={learnedWeights[word.id ?? word.slovak]?.box}
              onToggle={() => toggleLearned(word)}
              currentIndex={idx}
              totalCards={words.length}
            />
          ))}
        </div>
      )}

      {allDone && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-[2rem] border-2 border-green-500/20 bg-green-500/[0.03] p-8 text-center space-y-3"
        >
          <Trophy className="w-10 h-10 text-green-600 mx-auto" />
          <h3 className="font-black italic text-2xl uppercase tracking-tighter text-green-700 dark:text-green-400">
            Category Complete!
          </h3>
          <p className="text-sm text-muted-foreground">You&apos;ve learned all {words.length} words. Try the quiz to test yourself!</p>
          <button
            onClick={() => {
              setWords(shuffleArray(category.words))
              setCurrentIndex(0)
            }}
            className="text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95"
          >
            Practice Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
