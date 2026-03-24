"use client"

import { useState } from "react"
import { X, ChevronDown, RotateCcw, BookOpen, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSlovakStore } from "@/hooks/use-slovak-store"
import { WORD_CATEGORIES } from "@/data/slovak-words"
import { SLOVAK_SECTIONS } from "@/data/slovak-phrases"
import { generateSentenceSections } from "@/lib/generate-sentence-sections"

const SENTENCE_SECTIONS = generateSentenceSections()

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MasteryGroup {
  id: string
  icon: string
  title: string
  total: number
  learnedIds: string[]
  items: { id: string; english: string; slovak: string }[]
  onReview?: () => void
}

// ─── Item Row ──────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  isLearned,
  onUnmark,
}: {
  item: { id: string; english: string; slovak: string }
  isLearned: boolean
  onUnmark: (id: string) => void
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-xl transition-colors",
      isLearned ? "bg-green-500/5" : "hover:bg-muted/50"
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{item.english}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.slovak}</p>
      </div>
      {isLearned ? (
        <button
          onClick={() => onUnmark(item.id)}
          title="Mark as not learned"
          className="ml-3 shrink-0 p-1.5 rounded-lg text-green-600 hover:bg-red-100 hover:text-red-600 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      ) : (
        <span className="ml-3 shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground/30">
          <CheckCircle2 className="w-4 h-4" />
        </span>
      )}
    </div>
  )
}

// ─── Group Panel ───────────────────────────────────────────────────────────────

function GroupPanel({ group, learnedItems, onUnmark }: {
  group: MasteryGroup
  learnedItems: string[]
  onUnmark: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const learnedCount = group.items.filter(i => learnedItems.includes(i.id)).length
  const pct = group.total > 0 ? Math.round((learnedCount / group.total) * 100) : 0

  return (
    <div className="border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-2xl shrink-0">{group.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate">{group.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              {learnedCount}/{group.total}
            </span>
          </div>
        </div>
        {group.onReview && learnedCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); group.onReview?.() }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Review
          </button>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-0.5 max-h-64 overflow-y-auto">
              {group.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isLearned={learnedItems.includes(item.id)}
                  onUnmark={onUnmark}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tough Words Panel ─────────────────────────────────────────────────────────

function ToughWordsPanel({ store }: { store: import("@/hooks/use-slovak-store").SlovakStore }) {
  const allItems = [
    ...WORD_CATEGORIES.flatMap(c => c.words.map(w => ({ id: w.id ?? w.slovak, english: w.english, slovak: w.slovak }))),
    ...SLOVAK_SECTIONS.flatMap(s => s.phrases.map(p => ({ id: p.id ?? p.slovak, english: p.english, slovak: p.slovak }))),
    ...SENTENCE_SECTIONS.flatMap(s => s.phrases.map(p => ({ id: p.id ?? p.slovak, english: p.english, slovak: p.slovak }))),
  ]

  const tough = Object.entries(store.learnedWeights)
    .filter(([, w]) => w.wrongCount >= 2)
    .sort(([, a], [, b]) => b.wrongCount - a.wrongCount)
    .slice(0, 20)
    .map(([id, w]) => ({
      item: allItems.find(i => i.id === id),
      wrongCount: w.wrongCount,
      accuracy: Math.round(w.accuracy * 100),
      box: w.box,
    }))
    .filter(e => !!e.item)

  if (tough.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-3xl mb-3">🎯</p>
        <p className="text-sm font-semibold">No troublemakers yet</p>
        <p className="text-xs mt-1">Complete quizzes and your hardest words will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground px-1">Words you&apos;ve missed 2+ times, sorted by error count.</p>
      {tough.map(({ item, wrongCount, accuracy, box }, i) => (
        <div key={item!.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-card">
          <span className="text-[10px] font-black text-muted-foreground/40 w-4 shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{item!.english}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item!.slovak}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
              ✗ {wrongCount}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground">
              {accuracy}%
            </span>
            <span className={cn(
              "w-2 h-2 rounded-full",
              box === 1 ? "bg-yellow-400" : box === 2 ? "bg-orange-400" : "bg-green-500"
            )} title={`SRS Box ${box}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Tab ───────────────────────────────────────────────────────────────────────

type DashTab = "vocabulary" | "situations" | "sentences" | "tough"

// ─── Mastery Dashboard Modal ───────────────────────────────────────────────────

export function MasteryDashboard({
  onNavigate,
}: {
  onNavigate?: (tab: "words" | "situations" | "sentences", title: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<DashTab>("vocabulary")
  const { store, unmarkItemLearned } = useSlovakStore()

  const totalLearned = store.learnedItems.length
  const allItems = [
    ...WORD_CATEGORIES.flatMap(c => c.words),
    ...SLOVAK_SECTIONS.flatMap(s => s.phrases),
    ...SENTENCE_SECTIONS.flatMap(s => s.phrases),
  ]
  const totalItems = allItems.length

  // Build groups for each tab
  const vocabGroups: MasteryGroup[] = WORD_CATEGORIES
    .filter(cat => cat.words.some(w => store.learnedItems.includes(w.id ?? w.slovak)))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(cat => ({
      id: cat.title,
      icon: cat.icon ?? "📚",
      title: cat.title,
      total: cat.words.length,
      learnedIds: cat.words.filter(w => store.learnedItems.includes(w.id ?? w.slovak)).map(w => w.id ?? w.slovak),
      items: cat.words.map(w => ({ id: w.id ?? w.slovak, english: w.english, slovak: w.slovak })),
      onReview: onNavigate ? () => { onNavigate("words", cat.title); setOpen(false) } : undefined,
    }))

  const situationGroups: MasteryGroup[] = SLOVAK_SECTIONS
    .filter(s => s.phrases.some(p => store.learnedItems.includes(p.id ?? p.slovak)))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(s => ({
      id: s.title,
      icon: s.icon ?? "💬",
      title: s.title,
      total: s.phrases.length,
      learnedIds: s.phrases.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).map(p => p.id ?? p.slovak),
      items: s.phrases.map(p => ({ id: p.id ?? p.slovak, english: p.english, slovak: p.slovak })),
      onReview: onNavigate ? () => { onNavigate("situations", s.title); setOpen(false) } : undefined,
    }))

  const sentenceGroups: MasteryGroup[] = SENTENCE_SECTIONS
    .filter(s => s.phrases.some(p => store.learnedItems.includes(p.id ?? p.slovak)))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(s => ({
      id: s.title,
      icon: s.icon ?? "✍️",
      title: s.title,
      total: s.phrases.length,
      learnedIds: s.phrases.filter(p => store.learnedItems.includes(p.id ?? p.slovak)).map(p => p.id ?? p.slovak),
      items: s.phrases.map(p => ({ id: p.id ?? p.slovak, english: p.english, slovak: p.slovak })),
    }))

  const activeGroups = activeTab === "vocabulary" ? vocabGroups : activeTab === "situations" ? situationGroups : activeTab === "sentences" ? sentenceGroups : []

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
        title="My Progress"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">My Progress</span>
        {totalLearned > 0 && (
          <span className="ml-0.5 text-primary font-black">{totalLearned}</span>
        )}
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl bg-card border rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">My Progress</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalLearned} learned · {totalItems - totalLearned} remaining
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 p-4 pb-0">
                {([
                  { id: "vocabulary" as const, label: "Vocabulary", icon: "📚", count: vocabGroups.reduce((n, g) => n + g.learnedIds.length, 0) },
                  { id: "situations" as const, label: "Situations", icon: "💬", count: situationGroups.reduce((n, g) => n + g.learnedIds.length, 0) },
                  { id: "sentences" as const, label: "Sentences", icon: "✍️", count: sentenceGroups.reduce((n, g) => n + g.learnedIds.length, 0) },
                  { id: "tough" as const, label: "Tough", icon: "🔥", count: Object.values(store.learnedWeights).filter(w => w.wrongCount >= 2).length },
                ]).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === t.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span>{t.icon}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className={cn(
                      "text-[9px] font-black",
                      activeTab === t.id ? "text-primary-foreground/70" : "text-muted-foreground/50"
                    )}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {activeTab === "tough" ? (
                  <ToughWordsPanel store={store} />
                ) : activeGroups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-3xl mb-3">📖</p>
                    <p className="text-sm font-semibold">No {activeTab} learned yet</p>
                    <p className="text-xs mt-1">Start a Learn session to begin building your vocabulary.</p>
                  </div>
                ) : (
                  activeGroups.map(group => (
                    <GroupPanel
                      key={group.id}
                      group={group}
                      learnedItems={store.learnedItems}
                      onUnmark={unmarkItemLearned}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Click ✓ on any item to unmark it as learned.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-bold hover:bg-muted/70 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
