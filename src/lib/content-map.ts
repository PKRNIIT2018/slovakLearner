/**
 * Content ID map — Step 0.3
 *
 * Builds flat lookup maps from item ID → Word/Phrase across all data sources.
 * Used by Phase 4 analytics, SRS, and wrong-answer deep linking.
 */

import { WORD_CATEGORIES } from "@/data/slovak-words"
import { SLOVAK_SECTIONS } from "@/data/slovak-phrases"
import { generateSentenceSections } from "@/lib/generate-sentence-sections"
import type { Word, Phrase } from "@/types/learning"

const SENTENCE_SECTIONS = generateSentenceSections()

// ─── Word map ───────────────────────────────────────────────────────────────

const _wordMap = new Map<string, Word & { categoryTitle: string; categoryIdx: number }>()

for (let ci = 0; ci < WORD_CATEGORIES.length; ci++) {
  const cat = WORD_CATEGORIES[ci]
  for (const word of cat.words) {
    if (word.id) {
      _wordMap.set(word.id, { ...word, categoryTitle: cat.title, categoryIdx: ci })
    }
  }
}

export function getWordById(id: string) {
  return _wordMap.get(id) ?? null
}

// ─── Phrase map (situations + sentences) ───────────────────────────────────

const _phraseMap = new Map<string, Phrase & { sectionTitle: string; sectionIdx: number; source: "situations" | "sentences" }>()

for (let si = 0; si < SLOVAK_SECTIONS.length; si++) {
  const sec = SLOVAK_SECTIONS[si]
  for (const phrase of sec.phrases) {
    if (phrase.id) {
      _phraseMap.set(phrase.id, { ...phrase, sectionTitle: sec.title, sectionIdx: si, source: "situations" })
    }
  }
}

for (let si = 0; si < SENTENCE_SECTIONS.length; si++) {
  const sec = SENTENCE_SECTIONS[si]
  for (const phrase of sec.phrases) {
    if (phrase.id) {
      _phraseMap.set(phrase.id, { ...phrase, sectionTitle: sec.title, sectionIdx: si, source: "sentences" })
    }
  }
}

export function getPhraseById(id: string) {
  return _phraseMap.get(id) ?? null
}

// ─── Generic lookup ─────────────────────────────────────────────────────────

export function getItemById(id: string) {
  return getWordById(id) ?? getPhraseById(id) ?? null
}

// ─── Slovak string → ID lookup (used by v1→v2 store migration) ──────────────

export function buildSlovakToIdLookup(): Record<string, string> {
  const lookup: Record<string, string> = {}
  for (const [id, word] of _wordMap) {
    if (word.slovak) lookup[word.slovak] = id
  }
  for (const [id, phrase] of _phraseMap) {
    if (phrase.slovak) lookup[phrase.slovak] = id
  }
  return lookup
}

// ─── Total counts (useful for progress stats) ───────────────────────────────

export const CONTENT_TOTALS = {
  words:      _wordMap.size,
  phrases:    [..._phraseMap.values()].filter(p => p.source === "situations").length,
  sentences:  [..._phraseMap.values()].filter(p => p.source === "sentences").length,
} as const
