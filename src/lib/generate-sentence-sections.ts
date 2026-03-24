import { WORD_CATEGORIES } from "@/data/slovak-words"
import type { PhraseSection } from "@/types/learning"

export function generateSentenceSections(): PhraseSection[] {
  const seenSlovak = new Set<string>()

  return WORD_CATEGORIES
    .filter(cat => cat.words.some(w => !!w.english_example && !!w.slovak_example))
    .map(cat => ({
      icon: cat.icon,
      title: cat.title,
      subtitle: `Example sentences: ${cat.title}`,
      level: cat.level,
      phrases: cat.words
        .filter(w => !!w.english_example && !!w.slovak_example)
        .filter(w => {
          if (seenSlovak.has(w.slovak_example!)) return false
          seenSlovak.add(w.slovak_example!)
          return true
        })
        .map(w => ({
          id: `sent-from-${w.id}`,
          english: w.english_example!,
          slovak: w.slovak_example!,
        }))
    }))
    .filter(section => section.phrases.length >= 4)
}
