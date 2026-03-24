"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { SLOVAK_SECTIONS } from "@/data/slovak-phrases"
import { generateSentenceSections } from "@/lib/generate-sentence-sections"
import { PhraseGameHub } from "@/components/ui/phrase-game"
import { WordGameHub } from "@/components/ui/word-game"
import { GameOnboarding } from "@/components/ui/game-onboarding"
import { GameSettings } from "@/components/ui/game-settings"
import { JourneyHub } from "@/components/ui/journey-hub"
import { InfoBox } from "@/components/ui/info-box"
import { GrammarMode } from "@/components/ui/grammar-mode"
import { ConversationMode } from "@/components/ui/conversation-mode"
import { CultureMode } from "@/components/ui/culture-mode"

type Tab = "situations" | "words" | "sentences" | "grammar" | "conversation" | "culture"

const TABS: { id: Tab; label: string; icon: string; subtitle?: string }[] = [
  { id: "words",        label: "Vocabulary",    icon: "📚" },
  { id: "sentences",    label: "Sentences",     icon: "✍️", subtitle: "Full sentences built from your vocabulary" },
  { id: "situations",   label: "Situations",    icon: "💬", subtitle: "Real-life scenarios with key phrases" },
  { id: "grammar",      label: "Grammar",       icon: "🔤", subtitle: "Discover patterns, learn rules, practise" },
  { id: "conversation", label: "Conversations", icon: "🗣️", subtitle: "Real dialogues with cultural notes" },
  { id: "culture",      label: "Culture",       icon: "🌍", subtitle: "Context that makes the language click" },
]

export function LearnSlovakTabs() {
  const searchParams = useSearchParams()
  const isJourneyUI = searchParams.get("ui") === "journey"

  const [tab, setTab] = useState<Tab>("words")
  const SENTENCE_SECTIONS = useMemo(() => generateSentenceSections(), [])

  // Mount-on-first-click: once mounted, stays mounted to preserve in-session state
  const [mounted, setMounted] = useState<Record<Tab, boolean>>({
    words: true,       // first visible tab mounts immediately
    sentences: false,
    situations: false,
    grammar: false,
    conversation: false,
    culture: false,
  })

  if (isJourneyUI) return <JourneyHub />

  const selectTab = (t: Tab) => {
    setTab(t)
    setMounted(prev => prev[t] ? prev : { ...prev, [t]: true })
  }

  return (
    <div>
      <GameOnboarding />
      {/* Tab selector + settings */}
      <div className="flex items-center gap-2 mb-8 min-w-0">
        <div className="flex-1 overflow-x-auto scrollbar-none -mx-1 px-1">
          <div className="flex gap-1 bg-muted/60 p-1 rounded-2xl w-max border border-border/50 min-w-full sm:min-w-0 sm:w-fit">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={cn(
                  "flex flex-col items-start gap-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
                  tab === t.id
                    ? "bg-background text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span>{t.icon}</span>
                  <span className="hidden xs:inline sm:inline">{t.label}</span>
                </div>
                {t.subtitle && tab === t.id && (
                  <span className="hidden sm:block text-xs text-muted-foreground font-normal mt-0.5">
                    {t.subtitle}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <GameSettings />
      </div>

      {/* Game panels — lazy mount, then keep alive to preserve state */}
      {mounted.situations && (
        <div className={tab === "situations" ? "block" : "hidden"}>
          <PhraseGameHub sections={SLOVAK_SECTIONS} />
        </div>
      )}
      {mounted.words && (
        <div className={tab === "words" ? "block" : "hidden"}>
          <WordGameHub />
        </div>
      )}
      {mounted.sentences && (
        <div className={tab === "sentences" ? "block" : "hidden"}>
          <InfoBox variant="tip" className="mb-6">
            These are complete sentences built from your Vocabulary words. Practice them after learning the words in the Vocabulary tab.
          </InfoBox>
          <PhraseGameHub sections={SENTENCE_SECTIONS} />
        </div>
      )}
      {mounted.grammar && (
        <div className={tab === "grammar" ? "block" : "hidden"}>
          <GrammarMode />
        </div>
      )}
      {mounted.conversation && (
        <div className={tab === "conversation" ? "block" : "hidden"}>
          <ConversationMode />
        </div>
      )}
      {mounted.culture && (
        <div className={tab === "culture" ? "block" : "hidden"}>
          <CultureMode />
        </div>
      )}
    </div>
  )
}
