import { cn } from "@/lib/utils"
import type { Word } from "@/types/learning"

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  noun:        { label: "noun",  color: "text-blue-500 bg-blue-500/10" },
  verb:        { label: "verb",  color: "text-green-500 bg-green-500/10" },
  adjective:   { label: "adj.",  color: "text-purple-500 bg-purple-500/10" },
  adverb:      { label: "adv.",  color: "text-amber-500 bg-amber-500/10" },
  expression:  { label: "expr.", color: "text-rose-500 bg-rose-500/10" },
  number:      { label: "num.",  color: "text-cyan-500 bg-cyan-500/10" },
  pronoun:     { label: "pron.", color: "text-violet-500 bg-violet-500/10" },
  preposition: { label: "prep.", color: "text-orange-500 bg-orange-500/10" },
}

export function TypeBadge({ type }: { type?: Word["type"] }) {
  if (!type || !TYPE_CONFIG[type]) return null
  const { label, color } = TYPE_CONFIG[type]
  return (
    <span className={cn("inline-block text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md mt-1.5", color)}>
      {label}
    </span>
  )
}
