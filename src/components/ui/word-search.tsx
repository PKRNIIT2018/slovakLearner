"use client"

import { useState } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Word, WordCategory } from "@/types/learning"

// ─── Types ─────────────────────────────────────────────────────────────────────

type SearchResult = Word & {
  categoryTitle: string
  categoryIcon?: string
  categoryIdx: number
}

// ─── Search Logic ───────────────────────────────────────────────────────────────

function searchWords(query: string, categories: WordCategory[]): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  return categories.flatMap((cat, idx) =>
    cat.words
      .filter(w =>
        w.english.toLowerCase().includes(q) ||
        w.slovak.toLowerCase().includes(q) ||
        w.english_example?.toLowerCase().includes(q) ||
        w.slovak_example?.toLowerCase().includes(q)
      )
      .map(w => ({ ...w, categoryTitle: cat.title, categoryIcon: cat.icon, categoryIdx: idx }))
  )
}

// ─── Type Badge ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  noun:       "bg-blue-500/10 text-blue-600",
  verb:       "bg-green-500/10 text-green-600",
  adjective:  "bg-purple-500/10 text-purple-600",
  adverb:     "bg-amber-500/10 text-amber-600",
  expression: "bg-rose-500/10 text-rose-600",
  number:     "bg-cyan-500/10 text-cyan-600",
  pronoun:    "bg-indigo-500/10 text-indigo-600",
  preposition: "bg-orange-500/10 text-orange-600",
}

// ─── Word Search Component ──────────────────────────────────────────────────────

export function WordSearch({
  categories,
  onSelectCategory,
}: {
  categories: WordCategory[]
  onSelectCategory: (idx: number) => void
}) {
  const [query, setQuery] = useState("")
  const results = searchWords(query, categories)
  const hasQuery = query.trim().length >= 2

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Search words or translations…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-10 bg-card border border-border rounded-2xl text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {hasQuery && (
        results.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <div className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-sm">
            {/* Header */}
            <div className="px-4 py-2 bg-muted/40 border-b border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {results.length > 30 ? " · showing 30" : ""}
              </p>
            </div>

            {/* Result rows */}
            <div className="divide-y divide-border/40">
              {results.slice(0, 30).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{r.english}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="font-bold text-sm text-primary">{r.slovak}</span>
                      {r.pronunciation && (
                        <span className="text-[9px] font-mono text-muted-foreground/50">
                          [{r.pronunciation}]
                        </span>
                      )}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        TYPE_COLORS[r.type] ?? "bg-muted text-muted-foreground"
                      )}>
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {r.categoryIcon} {r.categoryTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => { onSelectCategory(r.categoryIdx); setQuery("") }}
                    className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors whitespace-nowrap"
                  >
                    Study <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {results.length > 30 && (
              <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40 text-center">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Refine your search to see more results
                </p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
